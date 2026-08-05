import React, { lazy, Suspense, useState, useEffect, useMemo, useRef } from 'react';
import type { MenuItem, Category, DietaryPreference, Allergen, CustomizationState, BasketItem } from './types/cafe';
import { MENU_ITEMS } from './data/items';
import { calculateMacrosAndAllergens } from './utils/macroCalculator';
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
import { Coffee, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';

const PAGE_SIZE = 24;

const CustomizerModal = lazy(() => import('./components/CustomizerModal').then(module => ({ default: module.CustomizerModal })));
const AllergenSettingsModal = lazy(() => import('./components/AllergenSettingsModal').then(module => ({ default: module.AllergenSettingsModal })));
const CompareModal = lazy(() => import('./components/CompareModal').then(module => ({ default: module.CompareModal })));
const DailyBasketDrawer = lazy(() => import('./components/DailyBasketDrawer').then(module => ({ default: module.DailyBasketDrawer })));
const SmartSwapModal = lazy(() => import('./components/SmartSwapModal').then(module => ({ default: module.SmartSwapModal })));
const NutritionLabelModal = lazy(() => import('./components/NutritionLabelModal').then(module => ({ default: module.NutritionLabelModal })));
const MacroTargetCalculatorModal = lazy(() => import('./components/MacroTargetCalculatorModal').then(module => ({ default: module.MacroTargetCalculatorModal })));
const CustomRecipeBuilderModal = lazy(() => import('./components/CustomRecipeBuilderModal').then(module => ({ default: module.CustomRecipeBuilderModal })));
const MobileSearchModal = lazy(() => import('./components/MobileSearchModal').then(module => ({ default: module.MobileSearchModal })));

export const App: React.FC = () => {
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

  // Dynamic Menu Items State (includes base items + user custom recipes)
  const [customRecipes, setCustomRecipes] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('kalori_cafe_custom_recipes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kalori_cafe_custom_recipes', JSON.stringify(customRecipes));
    } catch {
      // fallback
    }
  }, [customRecipes]);

  const allMenuItems = useMemo(() => {
    return [...customRecipes, ...MENU_ITEMS];
  }, [customRecipes]);

  // User Personal Macro Goals
  const [userGoals, setUserGoals] = useState<UserMacroGoals>(() => {
    try {
      const saved = localStorage.getItem('kalori_cafe_goals');
      return saved ? JSON.parse(saved) : {
        calorieGoal: 2000,
        proteinGoal: 70,
        carbGoal: 250,
        fatGoal: 65,
        maxCaffeine: 400
      };
    } catch {
      return { calorieGoal: 2000, proteinGoal: 70, carbGoal: 250, fatGoal: 65, maxCaffeine: 400 };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kalori_cafe_goals', JSON.stringify(userGoals));
    } catch {
      // fallback
    }
  }, [userGoals]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<DietaryPreference[]>([]);
  const [isOnlyDrinks, setIsOnlyDrinks] = useState<boolean>(false);
  const [isOnlyFood, setIsOnlyFood] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kalori_cafe_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kalori_cafe_favorites', JSON.stringify(favorites));
    } catch {
      // fallback
    }
  }, [favorites]);

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  // User Allergen Profile State
  const [userAllergens, setUserAllergens] = useState<Allergen[]>(() => {
    try {
      const saved = localStorage.getItem('kalori_cafe_allergens');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hideAllergens, setHideAllergens] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('kalori_cafe_allergens', JSON.stringify(userAllergens));
    } catch {
      // fallback
    }
  }, [userAllergens]);

  // Modals & Drawers
  const [isAllergenModalOpen, setIsAllergenModalOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isBasketDrawerOpen, setIsBasketDrawerOpen] = useState<boolean>(false);
  const [isSmartSwapModalOpen, setIsSmartSwapModalOpen] = useState<boolean>(false);
  const [isMacroCalculatorOpen, setIsMacroCalculatorOpen] = useState<boolean>(false);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);
  const [nutritionLabelItem, setNutritionLabelItem] = useState<MenuItem | null>(null);

  // Compare & Daily Basket States
  const [compareItems, setCompareItems] = useState<MenuItem[]>([]);
  const [basket, setBasket] = useState<BasketItem[]>(() => {
    try {
      const saved = localStorage.getItem('kalori_cafe_basket');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kalori_cafe_basket', JSON.stringify(basket));
    } catch {
      // fallback
    }
  }, [basket]);

  const [activeCustomizerItem, setActiveCustomizerItem] = useState<MenuItem | null>(null);

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
    setCompareItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      if (prev.length >= 4) {
        alert('En fazla 4 ürünü aynı anda karşılaştırabilirsiniz.');
        return prev;
      }
      return [...prev, item];
    });
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
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
  };

  const handleQuickAddToBasket = (item: MenuItem) => {
    const defaultCustomization: CustomizationState = {
      sizeId: item.defaultSizeId || 'tall',
      milkId: item.defaultMilkId || 'whole_milk',
      syrupPumps: item.defaultSyrupPumps || 0,
      hasWhippedCream: false,
      hasColdFoam: false,
      extraEspressoShots: 0
    };
    handleAddToBasket(item, defaultCustomization);
  };

  const handleSaveCustomRecipe = (customItem: MenuItem, customization: CustomizationState) => {
    setCustomRecipes(prev => [customItem, ...prev]);
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
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
  };

  const handleRemoveBasketItem = (id: string) => {
    setBasket(prev => prev.filter(b => b.id !== id));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  // Toggle Dietary Tag
  const handleToggleDietaryTag = (tag: DietaryPreference) => {
    setSelectedDietaryTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedChainId(null);
    setSelectedCategory('all');
    setSelectedDietaryTags([]);
    setIsOnlyDrinks(false);
    setIsOnlyFood(false);
    setSortBy('default');
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
      resultsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSelectSuggestion = (item: MenuItem) => {
    setSearchQuery(item.name);
    setIsMobileSearchOpen(false);
    scrollToResults();
  };

  const handleSubmitQuery = () => {
    scrollToResults();
  };

  // Chain counts map
  const chainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allMenuItems.forEach(i => {
      counts[i.chainId] = (counts[i.chainId] || 0) + 1;
    });
    return counts;
  }, [allMenuItems]);

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
        onOpenAllergenModal={() => setIsAllergenModalOpen(true)}
        compareCount={compareItems.length}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        basketCount={basket.length}
        totalBasketCalories={totalBasketCalories}
        onOpenBasketDrawer={() => setIsBasketDrawerOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Banner Hero */}
        <Hero
          itemCount={allMenuItems.length}
          onSelectQuickFilter={(filterStr) => {
            if (filterStr === 'Starbucks') setSelectedChainId('starbucks');
            else if (filterStr === 'Espressolab') setSelectedChainId('espressolab');
            else if (filterStr === 'Kahve Dünyası') setSelectedChainId('kahve_dunyasi');
            else if (filterStr === 'Nero') setSelectedChainId('caffe_nero');
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
            onSelectChain={setSelectedChainId}
            chainCounts={chainCounts}
            totalCount={allMenuItems.length}
          />

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
            onOpenSmartSwapModal={() => setIsSmartSwapModalOpen(true)}
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
                    userAllergens={userAllergens}
                    isComparing={compareItems.some(i => i.id === item.id)}
                    onToggleCompare={handleToggleCompare}
                    onOpenCustomizer={(selectedItem) => setActiveCustomizerItem(selectedItem)}
                    onQuickAddToBasket={handleQuickAddToBasket}
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenNutritionLabel={(selectedItem) => setNutritionLabelItem(selectedItem)}
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
        onOpenSearch={() => setIsMobileSearchOpen(true)}
        onOpenCustomBuilder={() => setIsCustomBuilderOpen(true)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        compareCount={compareItems.length}
        onOpenBasket={() => setIsBasketDrawerOpen(true)}
        basketCount={basket.length}
        totalCalories={totalBasketCalories}
      />

      {/* Modals & drawers load only when the corresponding interaction opens them. */}
      <Suspense fallback={null}>
        {activeCustomizerItem && <CustomizerModal item={activeCustomizerItem} onClose={() => setActiveCustomizerItem(null)} onAddToBasket={handleAddToBasket} />}
        {isAllergenModalOpen && <AllergenSettingsModal isOpen onClose={() => setIsAllergenModalOpen(false)} userAllergens={userAllergens} onToggleUserAllergen={handleToggleUserAllergen} hideAllergens={hideAllergens} setHideAllergens={setHideAllergens} clearAllUserAllergens={handleClearAllUserAllergens} />}
        {isCompareModalOpen && <CompareModal isOpen onClose={() => setIsCompareModalOpen(false)} items={compareItems} onRemoveItem={(id) => setCompareItems(prev => prev.filter(i => i.id !== id))} onClearAll={() => setCompareItems([])} />}
        {isBasketDrawerOpen && <DailyBasketDrawer isOpen onClose={() => setIsBasketDrawerOpen(false)} basket={basket} onRemoveItem={handleRemoveBasketItem} onClearBasket={handleClearBasket} userGoals={userGoals} onOpenMacroCalculator={() => setIsMacroCalculatorOpen(true)} />}
        {isSmartSwapModalOpen && <SmartSwapModal isOpen onClose={() => setIsSmartSwapModalOpen(false)} />}
        {nutritionLabelItem && <NutritionLabelModal item={nutritionLabelItem} onClose={() => setNutritionLabelItem(null)} />}
        {isMacroCalculatorOpen && <MacroTargetCalculatorModal isOpen onClose={() => setIsMacroCalculatorOpen(false)} userGoals={userGoals} onSaveGoals={(newGoals) => setUserGoals(newGoals)} />}
        {isCustomBuilderOpen && <CustomRecipeBuilderModal isOpen onClose={() => setIsCustomBuilderOpen(false)} onSaveCustomRecipe={handleSaveCustomRecipe} />}
        {isMobileSearchOpen && <MobileSearchModal isOpen onClose={() => setIsMobileSearchOpen(false)} searchQuery={searchQuery} setSearchQuery={setSearchQuery} suggestions={searchSuggestions} resultCount={filteredItems.length} onSelectSuggestion={handleSelectSuggestion} onSubmitQuery={handleSubmitQuery} />}
      </Suspense>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200 dark:border-[var(--dark-border)] bg-white/50 dark:bg-[var(--dark-surface)]/50 py-8 mt-16 text-center text-xs text-stone-500 dark:text-[var(--dark-text-muted)] space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-600 dark:text-amber-400">Kalori Cafe</span>
            <span>© 2026 - Tüm Zincir Kafelerin Ortak Makro & Alerjen Platformu</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-stone-400">
            <span>Starbucks</span>
            <span>•</span>
            <span>Kahve Dünyası</span>
            <span>•</span>
            <span>Espressolab</span>
            <span>•</span>
            <span>Gloria Jean's</span>
            <span>•</span>
            <span>Tchibo</span>
            <span>•</span>
            <span>Arabica</span>
            <span>•</span>
            <span>Caribou</span>
            <span>•</span>
            <span>Kronotrop</span>
          </div>
        </div>
        <p className="mx-auto max-w-3xl px-4 text-[11px] leading-relaxed text-stone-400">
          Besin değerleri referans amaçlıdır. Kaynak ve doğrulama kaydı bulunmayan ürünlerde resmi güncellik veya porsiyon eşleşmesi garanti edilmez.
        </p>
      </footer>

    </div>
  );
};

export default App;
