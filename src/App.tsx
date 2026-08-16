import React, { lazy, Suspense, useState, useEffect, useMemo, useRef } from 'react';
import type { MenuItem, Category, DietaryPreference, Allergen, CustomizationState, BasketItem, CustomRecipeItem } from './types/cafe';
import { calculateMacrosAndAllergens, getDefaultCustomization } from './utils/macroCalculator';
import { filterAndSortMenu } from './utils/menuFilter';
import { rankSearchMatches } from './utils/searchNormalize';
import { MAX_SUGGESTIONS } from './utils/searchInteraction';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ChainSelector } from './components/ChainSelector';
import { DietaryFilterBar } from './components/DietaryFilterBar';
import { SortAndAnalyticsBar, type SortOption } from './components/SortAndAnalyticsBar';
import { ItemCard } from './components/ItemCard';
import type { UserMacroGoals } from './components/MacroTargetCalculatorModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CHAINS } from './data/chains';
import { appStorage } from './utils/persistentStorage';
import { prefersReducedMotion } from './utils/motionPreferences';
import { trackEvent } from './utils/analytics';
import { Coffee, Filter, NotebookPen, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { chainSlug, createProductSlugMap, productPath } from './utils/slugs';
import { setDocumentMetadata } from './utils/documentMetadata';

const PAGE_SIZE = 24;
const CATEGORIES = new Set<Category>(['espresso_hot', 'espresso_iced', 'cold_brew', 'frappe_blended', 'tea_herbal', 'smoothie_juice', 'bakery_dessert', 'sandwich_savory', 'fit_healthy']);
const DIETARY_TAGS = new Set<DietaryPreference>(['vegan', 'vegetarian', 'gluten_free', 'lactose_free', 'sugar_free', 'high_protein', 'low_calorie']);
const SORT_OPTIONS = new Set<SortOption>(['default', 'cal_asc', 'protein_desc', 'sugar_asc', 'fat_asc', 'caffeine_desc']);

const CustomizerModal = lazy(() => import('./components/CustomizerModal').then(module => ({ default: module.CustomizerModal })));
const AllergenSettingsModal = lazy(() => import('./components/AllergenSettingsModal').then(module => ({ default: module.AllergenSettingsModal })));
const CompareModal = lazy(() => import('./components/CompareModal').then(module => ({ default: module.CompareModal })));
const DailyBasketDrawer = lazy(() => import('./components/DailyBasketDrawer').then(module => ({ default: module.DailyBasketDrawer })));
const SmartSwapModal = lazy(() => import('./components/SmartSwapModal').then(module => ({ default: module.SmartSwapModal })));
const NutritionLabelModal = lazy(() => import('./components/NutritionLabelModal').then(module => ({ default: module.NutritionLabelModal })));
const MacroTargetCalculatorModal = lazy(() => import('./components/MacroTargetCalculatorModal').then(module => ({ default: module.MacroTargetCalculatorModal })));
const CustomRecipeBuilderModal = lazy(() => import('./components/CustomRecipeBuilderModal').then(module => ({ default: module.CustomRecipeBuilderModal })));
const MobileSearchModal = lazy(() => import('./components/MobileSearchModal').then(module => ({ default: module.MobileSearchModal })));

interface AppProps {
  catalogItems: readonly MenuItem[];
  initialChainId?: string | null;
}

type OverlayState =
  | { kind: 'customizer'; item: MenuItem }
  | { kind: 'nutrition'; item: MenuItem }
  | { kind: 'custom-recipe'; item?: MenuItem }
  | { kind: 'allergens' | 'compare' | 'basket' | 'smart-swap' | 'macro-calculator' | 'mobile-search' }
  | null;

const celebrate = async (): Promise<void> => {
  if (prefersReducedMotion()) return;
  const { default: confetti } = await import('canvas-confetti');
  confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
};

export const App: React.FC<AppProps> = ({ catalogItems, initialChainId = null }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Theme State — persisted under `kalori_cafe_theme` (light | dark).
    // A saved choice wins over the system preference; the inline script in
    // index.html applies the class before first paint to avoid a flash.
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
      try {
        const saved = localStorage.getItem('kalori_cafe_theme');
        if (saved === 'dark') return true;
        if (saved === 'light') return false;
      } catch {
        // fall through to system preference
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
      document.documentElement.classList.toggle('dark', isDarkMode);
      try {
        localStorage.setItem('kalori_cafe_theme', isDarkMode ? 'dark' : 'light');
      } catch {
        // storage unavailable
      }
    }, [isDarkMode]);

  // User recipes are intentionally separate from the public catalog. They do
  // not alter chain counts, search results, or canonical product URLs.
  const [customRecipes, setCustomRecipes] = useState<MenuItem[]>(() => appStorage.customRecipes.load());

  useEffect(() => {
    appStorage.customRecipes.save(customRecipes);
  }, [customRecipes]);

  const allMenuItems = catalogItems;
  const productSlugs = useMemo(() => createProductSlugMap(catalogItems), [catalogItems]);

  // User Personal Macro Goals (normalized: legacy numeric records are
    // migrated in place — values preserved, default profile attached).
    const [userGoals, setUserGoals] = useState<UserMacroGoals>(() => appStorage.userGoals.load());

  useEffect(() => {
    appStorage.userGoals.save(userGoals);
  }, [userGoals]);

  // Public discovery state lives in the URL, so reload/back/forward/share all
  // reproduce the same result set. Sensitive profile choices stay local.
  const selectedChainId = initialChainId;
  const searchQuery = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('category');
  const selectedCategory: Category | 'all' = categoryParam && CATEGORIES.has(categoryParam as Category)
    ? categoryParam as Category
    : 'all';
  const dietaryParam = searchParams.get('diet') ?? '';
  const selectedDietaryTags = useMemo(() => dietaryParam
    .split(',')
    .filter((tag): tag is DietaryPreference => DIETARY_TAGS.has(tag as DietaryPreference)), [dietaryParam]);
  const productType = searchParams.get('type');
  const isOnlyDrinks = productType === 'drink';
  const isOnlyFood = productType === 'food';
  const sortParam = searchParams.get('sort');
  const sortBy: SortOption = sortParam && SORT_OPTIONS.has(sortParam as SortOption) ? sortParam as SortOption : 'default';
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const updateParam = (key: string, value: string | null, replace = false) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace });
  };

  const setSearchQuery = (value: string) => updateParam('q', value.trimStart() || null, true);
  const setSelectedCategory = (value: Category | 'all') => updateParam('category', value === 'all' ? null : value);
  const setSelectedDietaryTags = (values: DietaryPreference[]) => updateParam('diet', values.length > 0 ? [...new Set(values)].sort().join(',') : null);
  const setIsOnlyDrinks = (value: boolean) => updateParam('type', value ? 'drink' : null);
  const setIsOnlyFood = (value: boolean) => updateParam('type', value ? 'food' : null);
  const setSortBy = (value: SortOption) => updateParam('sort', value === 'default' ? null : value);

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => appStorage.favorites.load());

  useEffect(() => {
    appStorage.favorites.save(favorites);
  }, [favorites]);

  const handleToggleFavorite = (id: string) => {
    const isRemoving = favorites.includes(id);
    setFavorites(isRemoving ? favorites.filter(favoriteId => favoriteId !== id) : [...favorites, id]);
    const itemName = catalogItems.find(item => item.id === id)?.name ?? 'Ürün';
    announce(`${itemName} ${isRemoving ? 'favorilerden çıkarıldı' : 'favorilere eklendi'}.`);
    trackEvent('favorite_toggle', { action: isRemoving ? 'remove' : 'add' });
  };

  // User Allergen Profile State
  const [userAllergens, setUserAllergens] = useState<Allergen[]>(() => appStorage.userAllergens.load());

  const [hideAllergens, setHideAllergens] = useState<boolean>(() => appStorage.hideAllergens.load());

  useEffect(() => {
    appStorage.userAllergens.save(userAllergens);
  }, [userAllergens]);

  useEffect(() => {
    appStorage.hideAllergens.save(hideAllergens);
  }, [hideAllergens]);

  // One overlay state prevents two aria-modal surfaces and stale scroll locks.
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const chainName = CHAINS.find(chain => chain.id === selectedChainId)?.name;
    setDocumentMetadata({
      title: chainName
        ? `${chainName} Kalori ve Alerjen Rehberi | Kalori Cafe`
        : 'Kalori Cafe | Kafe Kalori, Makro ve Alerjen Rehberi',
      description: chainName
        ? `${chainName} ürünlerini kalori, makro, kafein, alerjen ve veri kaynağıyla karşılaştırın.`
        : 'Türkiye’deki zincir kafe ürünlerini kalori, makro, kafein, alerjen ve veri güven düzeyiyle karşılaştırın.',
      path: selectedChainId ? `/zincir/${chainSlug(selectedChainId)}/` : '/',
    });
  }, [selectedChainId]);

  // Compare & Daily Basket States
  const [compareItems, setCompareItems] = useState<MenuItem[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>(() => appStorage.basket.load());

  useEffect(() => {
    appStorage.basket.save(basket);
  }, [basket]);

  const announce = (message: string) => setStatusMessage(message);
  const openCompare = () => {
    trackEvent('compare_open', { count: compareItems.length });
    setOverlay({ kind: 'compare' });
  };

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = window.setTimeout(() => setStatusMessage(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  // Handlers for Allergens
  const handleToggleUserAllergen = (allergen: Allergen) => {
    setUserAllergens(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };

  const handleClearAllUserAllergens = () => {
    setUserAllergens([]);
  };

  // Handlers for Compare
  const handleToggleCompare = (item: MenuItem) => {
    const exists = compareItems.some(candidate => candidate.id === item.id);
    if (!exists && compareItems.length >= 4) {
      announce('En fazla 4 ürünü aynı anda karşılaştırabilirsiniz.');
      return;
    }
    setCompareItems(exists
      ? compareItems.filter(candidate => candidate.id !== item.id)
      : [...compareItems, item]);
    announce(`${item.name} ${exists ? 'karşılaştırmadan çıkarıldı' : 'karşılaştırmaya eklendi'}.`);
    trackEvent('compare_toggle', { action: exists ? 'remove' : 'add', chain: item.chainId });
  };

  // Handlers for Basket
  const handleAddToBasket = (item: MenuItem, customization: CustomizationState) => {
    const { calculatedMacros, calculatedAllergens } = calculateMacrosAndAllergens(item, customization);
    const newBasketItem: BasketItem = {
      id: Math.random().toString(36).substring(2, 9),
      item,
      customization,
      calculatedMacros,
      calculatedAllergens,
      addedAt: new Date()
    };

    setBasket(prev => [newBasketItem, ...prev]);
    announce(`${item.name} sepete eklendi.`);
    trackEvent('basket_add', { chain: item.chainId, category: item.category });
    void celebrate();
  };

  const handleQuickAddToBasket = (item: MenuItem) => {
    handleAddToBasket(item, getDefaultCustomization(item));
  };

  const handleSaveCustomRecipe = (customItem: CustomRecipeItem, customization: CustomizationState) => {
    const isEditing = customRecipes.some(recipe => recipe.id === customItem.id);
    setCustomRecipes(previous => isEditing
      ? previous.map(recipe => recipe.id === customItem.id ? customItem : recipe)
      : [customItem, ...previous]);
    if (isEditing) {
      announce(`${customItem.name} tarifi güncellendi.`);
      trackEvent('custom_recipe_save', { action: 'edit' });
      return;
    }
    // The custom recipe builder already computed macros/allergens and baked
    // them into `customItem.baseMacros`/`allergens`. Reuse those values
    // verbatim — never re-run the engine on an already-computed recipe.
    const newBasketItem: BasketItem = {
      id: Math.random().toString(36).substring(2, 9),
      item: customItem,
      customization,
      calculatedMacros: customItem.baseMacros,
      calculatedAllergens: customItem.allergens,
      addedAt: new Date()
    };
    setBasket(prev => [newBasketItem, ...prev]);
    announce(`${customItem.name} tarifi kaydedildi ve sepete eklendi.`);
    trackEvent('custom_recipe_save', { action: 'create' });
    void celebrate();
  };

  const handleRemoveCustomRecipe = (id: string) => {
    const recipeName = customRecipes.find(recipe => recipe.id === id)?.name ?? 'Tarif';
    setCustomRecipes(previous => previous.filter(recipe => recipe.id !== id));
    announce(`${recipeName} silindi.`);
    trackEvent('custom_recipe_delete');
  };

  const handleRemoveBasketItem = (id: string) => {
    setBasket(prev => prev.filter(b => b.id !== id));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  // Toggle Dietary Tag
  const handleToggleDietaryTag = (tag: DietaryPreference) => {
    setSelectedDietaryTags(
      selectedDietaryTags.includes(tag)
        ? selectedDietaryTags.filter(selected => selected !== tag)
        : [...selectedDietaryTags, tag],
    );
    // Dietary selections may reveal health-related preferences. Measure only
    // feature use, never the selected tag.
    trackEvent('filter_apply', { action: 'dietary' });
  };

  const handleSelectChain = (chainId: string | null) => {
    trackEvent('chain_select', { chain: chainId ?? 'all' });
    const query = searchParams.toString();
    navigate(`${chainId ? `/zincir/${chainSlug(chainId)}/` : '/'}${query ? `?${query}` : ''}`);
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery('');
    if (selectedChainId) navigate('/');
    else setSearchParams(new URLSearchParams());
    setShowOnlyFavorites(false);
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedChainId !== null || 
    selectedCategory !== 'all' || 
    selectedDietaryTags.length > 0 || 
    isOnlyDrinks || 
    isOnlyFood ||
    sortBy !== 'default' ||
    showOnlyFavorites;

  // Filtered and Sorted Menu Items Logic (shared with the test suites via src/utils/menuFilter.ts)
  const filteredItems = useMemo(() => {
    return filterAndSortMenu(allMenuItems, {
      searchQuery,
      selectedChainId,
      selectedCategory,
      selectedDietaryTags,
      isOnlyDrinks,
      isOnlyFood,
      hideAllergens,
      userAllergens,
      sortBy,
      showOnlyFavorites,
      favorites
    });
  }, [allMenuItems, searchQuery, selectedChainId, selectedCategory, selectedDietaryTags, isOnlyDrinks, isOnlyFood, hideAllergens, userAllergens, sortBy, showOnlyFavorites, favorites]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [allMenuItems, searchQuery, selectedChainId, selectedCategory, selectedDietaryTags, isOnlyDrinks, isOnlyFood, hideAllergens, userAllergens, sortBy, showOnlyFavorites, favorites]);

  const visibleItems = filteredItems.slice(0, visibleCount);

  // Search suggestions — one shared ranker for desktop and mobile surfaces.
  const searchSuggestions = useMemo(() => {
    return rankSearchMatches(allMenuItems, searchQuery, MAX_SUGGESTIONS);
  }, [allMenuItems, searchQuery]);

  // Stable scroll target for search navigation (desktop + mobile).
  const resultsGridRef = useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    window.requestAnimationFrame(() => {
      resultsGridRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const handleSelectSuggestion = (item: MenuItem) => {
    setSearchQuery(item.name);
    if (overlay?.kind === 'mobile-search') setOverlay(null);
    scrollToResults();
  };

  const handleSubmitQuery = () => {
    scrollToResults();
  };

  // Chain counts map
  const chainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    catalogItems.forEach(i => {
      counts[i.chainId] = (counts[i.chainId] || 0) + 1;
    });
    return counts;
  }, [catalogItems]);

  const totalBasketCalories = basket.reduce((acc, b) => acc + b.calculatedMacros.calories, 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-[var(--dark-bg)] text-stone-900 dark:text-[var(--dark-text)] transition-colors duration-300 pb-20 md:pb-0">
      
      {/* Header Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        suggestions={searchSuggestions}
        resultCount={filteredItems.length}
        onSelectSuggestion={handleSelectSuggestion}
        onSubmitQuery={handleSubmitQuery}
        userAllergens={userAllergens}
        hideAllergens={hideAllergens}
        onOpenAllergenModal={() => setOverlay({ kind: 'allergens' })}
        compareCount={compareItems.length}
        onOpenCompareModal={openCompare}
        basketCount={basket.length}
        totalBasketCalories={totalBasketCalories}
        onOpenBasketDrawer={() => setOverlay({ kind: 'basket' })}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Banner Hero */}
        <Hero
          itemCount={catalogItems.length}
          onSelectQuickFilter={(filterStr) => {
            if (filterStr === 'Starbucks') handleSelectChain('starbucks');
            else if (filterStr === 'Espressolab') handleSelectChain('espressolab');
            else if (filterStr === 'Kahve Dünyası') handleSelectChain('kahve_dunyasi');
            else if (filterStr === 'Nero') handleSelectChain('caffe_nero');
            else if (filterStr === 'Glutensiz') setSelectedDietaryTags(['gluten_free']);
            else if (filterStr === 'Soğuk Kahve') setSelectedCategory('espresso_iced');
            else if (filterStr === 'High Protein') setSelectedDietaryTags(['high_protein']);
            else if (filterStr === 'Türk Kahvesi') setSearchQuery('Türk Kahvesi');
          }}
        />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Chain Selector */}
          <ChainSelector
            selectedChainId={selectedChainId}
            onSelectChain={handleSelectChain}
            chainCounts={chainCounts}
            totalCount={catalogItems.length}
          />

          <section aria-labelledby="my-recipes-title" className="rounded-2xl border border-stone-200 bg-white/80 p-4 dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="my-recipes-title" className="flex items-center gap-2 text-sm font-black">
                  <NotebookPen className="h-4 w-4 text-amber-600" /> Tariflerim
                </h2>
                <p className="mt-1 text-xs text-stone-500 dark:text-[var(--dark-text-muted)]">
                  Yalnız bu cihazda saklanır; kafe ürün sayılarına eklenmez.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOverlay({ kind: 'custom-recipe' })}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2C221E] px-4 py-2 text-xs font-black text-white dark:bg-[#FAF8F5] dark:text-[#2C221E]"
              >
                <Plus className="h-4 w-4" /> Yeni tarif
              </button>
            </div>
            {customRecipes.length > 0 && (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {customRecipes.map(recipe => (
                  <li key={recipe.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3 text-xs dark:border-[var(--dark-border)]">
                    <div className="min-w-0">
                      <div className="truncate font-black">{recipe.name}</div>
                      <div className="text-stone-500 dark:text-[var(--dark-text-muted)]">{recipe.baseMacros.calories} kcal · {recipe.baseMacros.protein} g protein</div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => handleQuickAddToBasket(recipe)} className="min-h-11 min-w-11 rounded-lg bg-amber-500 text-white" aria-label={`${recipe.name} tarifini sepete ekle`}>
                        <Plus className="mx-auto h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setOverlay({ kind: 'custom-recipe', item: recipe })} className="min-h-11 min-w-11 rounded-lg border border-stone-200 text-amber-700 dark:border-[var(--dark-border)] dark:text-amber-300" aria-label={`${recipe.name} tarifini düzenle`}>
                        <Pencil className="mx-auto h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleRemoveCustomRecipe(recipe.id)} className="min-h-11 min-w-11 rounded-lg border border-stone-200 text-red-600 dark:border-[var(--dark-border)]" aria-label={`${recipe.name} tarifini sil`}>
                        <Trash2 className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Category & Dietary Filter Bar */}
          <DietaryFilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedDietaryTags={selectedDietaryTags}
            onToggleDietaryTag={handleToggleDietaryTag}
            isOnlyDrinks={isOnlyDrinks}
            setIsOnlyDrinks={setIsOnlyDrinks}
            isOnlyFood={isOnlyFood}
            setIsOnlyFood={setIsOnlyFood}
            resetAllFilters={resetAllFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Sort & Favorites Bar */}
          <SortAndAnalyticsBar
            sortBy={sortBy}
            setSortBy={setSortBy}
            showOnlyFavorites={showOnlyFavorites}
            setShowOnlyFavorites={setShowOnlyFavorites}
            favoriteCount={favorites.length}
            onOpenSmartSwapModal={() => setOverlay({ kind: 'smart-swap' })}
          />

          {/* Active Filter Summary Banner */}
          {hasActiveFilters && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-500" />
                <span>
                  Filtrelenen sonuç: <strong>{filteredItems.length}</strong> ürün listeleniyor.
                </span>
              </div>
              <button
                onClick={resetAllFilters}
                className="hover:underline font-bold"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          )}

          {/* Product Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center space-y-3 glass-panel rounded-3xl border border-stone-200 dark:border-[var(--dark-border)]">
              <Coffee className="w-12 h-12 mx-auto text-amber-500/50 stroke-1" />
              <h3 className="text-lg font-bold text-stone-800 dark:text-[var(--dark-text)]">
                Aradığınız kriterlere uygun ürün bulunamadı.
              </h3>
              <p className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)] max-w-sm mx-auto">
                Arama kelimenizi değiştirebilir veya diyet filtrelerini temizleyerek tüm menüyü görüntüleyebilirsiniz.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-md"
              >
                Tüm Filtreleri Sıfırla
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div id="menu-results" ref={resultsGridRef} className="scroll-mt-28">
                <div
                  aria-live="polite"
                  className="sr-only"
                >
                  {searchQuery.trim() !== '' && `${filteredItems.length} ürün bulundu`}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    detailsPath={productPath(item, productSlugs)}
                    userAllergens={userAllergens}
                    isComparing={compareItems.some(i => i.id === item.id)}
                    onToggleCompare={handleToggleCompare}
                    onOpenCustomizer={(selectedItem) => {
                      trackEvent('customizer_open', { chain: selectedItem.chainId, category: selectedItem.category });
                      setOverlay({ kind: 'customizer', item: selectedItem });
                    }}
                    onQuickAddToBasket={handleQuickAddToBasket}
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenNutritionLabel={(selectedItem) => {
                      trackEvent('product_view', { chain: selectedItem.chainId, category: selectedItem.category, surface: 'nutrition' });
                      setOverlay({ kind: 'nutrition', item: selectedItem });
                    }}
                  />
                ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-3" aria-live="polite">
                <p className="text-xs font-bold text-stone-500 dark:text-[var(--dark-text-muted)]">
                  {visibleItems.length} / {filteredItems.length} ürün gösteriliyor
                </p>
                {visibleItems.length < filteredItems.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(count => Math.min(count + PAGE_SIZE, filteredItems.length))}
                    className="rounded-2xl bg-[#2C221E] px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#3D2B1F] dark:bg-[#FAF8F5] dark:text-[#2C221E]"
                  >
                    Daha fazla göster
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Mobile Bottom Floating Action Bar */}
      <MobileBottomNav
        onOpenSearch={() => setOverlay({ kind: 'mobile-search' })}
        onOpenCustomBuilder={() => setOverlay({ kind: 'custom-recipe' })}
        onOpenCompare={openCompare}
        compareCount={compareItems.length}
        onOpenBasket={() => setOverlay({ kind: 'basket' })}
        basketCount={basket.length}
        totalCalories={totalBasketCalories}
      />

      {/* Modals & drawers load only when the corresponding interaction opens them. */}
      <Suspense fallback={<div className="sr-only" role="status">Pencere yükleniyor…</div>}>
        {overlay?.kind === 'customizer' && <CustomizerModal item={overlay.item} onClose={() => setOverlay(null)} onAddToBasket={handleAddToBasket} />}
        {overlay?.kind === 'allergens' && <AllergenSettingsModal isOpen onClose={() => setOverlay(null)} userAllergens={userAllergens} onToggleUserAllergen={handleToggleUserAllergen} hideAllergens={hideAllergens} setHideAllergens={setHideAllergens} clearAllUserAllergens={handleClearAllUserAllergens} />}
        {overlay?.kind === 'compare' && <CompareModal isOpen onClose={() => setOverlay(null)} items={compareItems} onRemoveItem={(id) => setCompareItems(prev => prev.filter(i => i.id !== id))} onClearAll={() => setCompareItems([])} />}
        {overlay?.kind === 'basket' && <DailyBasketDrawer isOpen onClose={() => setOverlay(null)} basket={basket} onRemoveItem={handleRemoveBasketItem} onClearBasket={handleClearBasket} userGoals={userGoals} onOpenMacroCalculator={() => setOverlay({ kind: 'macro-calculator' })} />}
        {overlay?.kind === 'smart-swap' && <SmartSwapModal isOpen onClose={() => setOverlay(null)} items={filteredItems.filter(item => item.chainId !== 'custom')} detailsPath={(item) => productPath(item, productSlugs)} />}
        {overlay?.kind === 'nutrition' && <NutritionLabelModal item={overlay.item} onClose={() => setOverlay(null)} />}
        {overlay?.kind === 'macro-calculator' && <MacroTargetCalculatorModal isOpen onClose={() => setOverlay(null)} userGoals={userGoals} onSaveGoals={(newGoals) => setUserGoals(newGoals)} />}
        {overlay?.kind === 'custom-recipe' && <CustomRecipeBuilderModal isOpen initialRecipe={overlay.item} onClose={() => setOverlay(null)} onSaveCustomRecipe={handleSaveCustomRecipe} />}
        {overlay?.kind === 'mobile-search' && <MobileSearchModal isOpen onClose={() => setOverlay(null)} searchQuery={searchQuery} setSearchQuery={setSearchQuery} suggestions={searchSuggestions} resultCount={filteredItems.length} onSelectSuggestion={handleSelectSuggestion} onSubmitQuery={handleSubmitQuery} />}
      </Suspense>

      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-4 bottom-24 z-[70] flex justify-center md:bottom-6">
        {statusMessage && <div role="status" className="rounded-xl bg-[#2C221E] px-4 py-3 text-sm font-bold text-white shadow-xl dark:bg-[#FAF8F5] dark:text-[#2C221E]">{statusMessage}</div>}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200 dark:border-[var(--dark-border)] bg-white/50 dark:bg-[var(--dark-surface)]/50 py-8 mt-16 text-center text-xs text-stone-500 dark:text-[var(--dark-text-muted)] space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-800 dark:text-amber-300">Kalori Cafe</span>
            <span className="text-stone-600 dark:text-stone-400 font-medium">© 2026 - Tüm Zincir Kafelerin Ortak Makro & Alerjen Platformu</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-stone-600 dark:text-stone-400 font-medium">
            {CHAINS.map((chain, index) => (
              <React.Fragment key={chain.id}>
                {index > 0 && <span className="text-stone-400 dark:text-[var(--dark-border)]">•</span>}
                <Link to={`/zincir/${chainSlug(chain.id)}/`} className="min-h-11 content-center hover:underline hover:text-stone-900 dark:hover:text-stone-200">{chain.name}</Link>
              </React.Fragment>
            ))}
          </div>
        </div>
        <p className="mx-auto max-w-3xl px-4 text-[11px] leading-relaxed text-stone-600 dark:text-stone-400 font-medium">
          Her kartta resmî, karma veya tahmini veri durumu gösterilir. Porsiyonlar değişebilir; alerjenler için markadan teyit alın.{' '}
          <Link to="/metodoloji/" className="underline hover:text-stone-900 dark:hover:text-stone-200">Metodoloji</Link> · <Link to="/gizlilik/" className="underline hover:text-stone-900 dark:hover:text-stone-200">Gizlilik</Link>
        </p>
      </footer>

    </div>
  );
};

export default App;
