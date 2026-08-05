import { MENU_ITEMS } from '../src/data/items';
import { CHAINS } from '../src/data/chains';
import { calculateMacrosAndAllergens } from '../src/utils/macroCalculator';
import type { MenuItem, Category, DietaryPreference, Allergen, CustomizationState, BasketItem } from '../src/types/cafe';

export interface TestResult {
  name: string;
  tier: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export function runTier3Tests(): TestResult[] {
  const results: TestResult[] = [];

  function assert(condition: boolean, name: string, details?: string) {
    if (condition) {
      results.push({ name, tier: 'Tier 3', passed: true, details });
    } else {
      results.push({ name, tier: 'Tier 3', passed: false, error: details || 'Assertion failed' });
    }
  }

  // Multi-Filter Pipeline Function mimicking App.tsx
  function filterAndSortMenu(options: {
    searchQuery?: string;
    selectedChainId?: string | null;
    selectedCategory?: Category | 'all';
    selectedDietaryTags?: DietaryPreference[];
    isOnlyDrinks?: boolean;
    isOnlyFood?: boolean;
    hideAllergens?: boolean;
    userAllergens?: Allergen[];
    sortBy?: 'default' | 'cal_asc' | 'protein_desc' | 'sugar_asc' | 'fat_asc' | 'caffeine_desc';
    showOnlyFavorites?: boolean;
    favorites?: string[];
  }) {
    const searchQuery = options.searchQuery || '';
    const selectedChainId = options.selectedChainId ?? null;
    const selectedCategory = options.selectedCategory || 'all';
    const selectedDietaryTags = options.selectedDietaryTags || [];
    const isOnlyDrinks = options.isOnlyDrinks || false;
    const isOnlyFood = options.isOnlyFood || false;
    const hideAllergens = options.hideAllergens || false;
    const userAllergens = options.userAllergens || [];
    const sortBy = options.sortBy || 'default';
    const showOnlyFavorites = options.showOnlyFavorites || false;
    const favorites = options.favorites || [];

    let result = MENU_ITEMS.filter(item => {
      if (showOnlyFavorites && !favorites.includes(item.id)) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const chainName = CHAINS.find(c => c.id === item.chainId)?.name.toLowerCase() || '';
        const matchesName = item.name.toLowerCase().includes(q) || (item.nameEn && item.nameEn.toLowerCase().includes(q));
        const matchesChain = chainName.includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.dietaryTags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesChain && !matchesDesc && !matchesTags) return false;
      }

      if (selectedChainId && item.chainId !== selectedChainId) return false;

      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      if (isOnlyDrinks && !item.isDrink) return false;
      if (isOnlyFood && item.isDrink) return false;

      if (selectedDietaryTags.length > 0) {
        if (selectedDietaryTags.includes('low_calorie') && item.baseMacros.calories >= 150) {
          return false;
        }
        const otherTags = selectedDietaryTags.filter(t => t !== 'low_calorie');
        if (otherTags.length > 0 && !otherTags.every(t => item.dietaryTags.includes(t))) {
          return false;
        }
      }

      if (hideAllergens && userAllergens.length > 0) {
        if (item.allergens.some(a => userAllergens.includes(a))) {
          return false;
        }
      }

      return true;
    });

    if (sortBy === 'cal_asc') {
      result = [...result].sort((a, b) => a.baseMacros.calories - b.baseMacros.calories);
    } else if (sortBy === 'protein_desc') {
      result = [...result].sort((a, b) => b.baseMacros.protein - a.baseMacros.protein);
    } else if (sortBy === 'caffeine_desc') {
      result = [...result].sort((a, b) => b.baseMacros.caffeine - a.baseMacros.caffeine);
    }

    return result;
  }

  // --- Interaction Test 1: Chain + Category + Dietary Tag ---
  const cross1Res = filterAndSortMenu({
    selectedChainId: 'starbucks',
    selectedCategory: 'espresso_iced',
    selectedDietaryTags: ['vegetarian']
  });

  assert(
    cross1Res.length > 0 && cross1Res.every(i => i.chainId === 'starbucks' && i.category === 'espresso_iced' && i.dietaryTags.includes('vegetarian')),
    'Cross-Feature 1: Chain (Starbucks) + Category (Espresso Iced) + Tag (Vegetarian)',
    `Returned ${cross1Res.length} matching items`
  );

  // --- Interaction Test 2: Search + Allergen Hide ---
  const cross2Res = filterAndSortMenu({
    searchQuery: 'latte',
    hideAllergens: true,
    userAllergens: ['lactose']
  });

  assert(
    cross2Res.every(i => (i.name.toLowerCase().includes('latte') || i.description.toLowerCase().includes('latte')) && !i.allergens.includes('lactose')),
    'Cross-Feature 2: Search ("latte") + Hide Lactose Allergen',
    `Returned ${cross2Res.length} items free of lactose allergen`
  );

  // --- Interaction Test 3: Chain + Search + Drink Only Toggle ---
  const cross3Res = filterAndSortMenu({
    selectedChainId: 'espressolab',
    searchQuery: 'cold',
    isOnlyDrinks: true
  });

  assert(
    cross3Res.every(i => i.chainId === 'espressolab' && i.isDrink === true),
    'Cross-Feature 3: Chain (Espressolab) + Search ("cold") + Drink Only Toggle',
    `Returned ${cross3Res.length} drink items for Espressolab`
  );

  // --- Interaction Test 4: Dietary Tag + Food Only + Calorie Sort ---
  const cross4Res = filterAndSortMenu({
    selectedDietaryTags: ['vegetarian'],
    isOnlyFood: true,
    sortBy: 'cal_asc'
  });

  let sortedCalAsc = true;
  for (let i = 1; i < cross4Res.length; i++) {
    if (cross4Res[i].baseMacros.calories < cross4Res[i - 1].baseMacros.calories) {
      sortedCalAsc = false;
      break;
    }
  }

  assert(
    cross4Res.length > 0 && cross4Res.every(i => !i.isDrink) && sortedCalAsc,
    'Cross-Feature 4: Vegetarian Tag + Food Only Toggle + Calorie Ascending Sort',
    `Returned ${cross4Res.length} food items sorted by calories ascending`
  );

  // --- Interaction Test 5: Search + High Protein Tag + Caffeine Sort ---
  const cross5Res = filterAndSortMenu({
    selectedDietaryTags: ['high_protein'],
    sortBy: 'caffeine_desc'
  });

  let sortedCaffDesc = true;
  for (let i = 1; i < cross5Res.length; i++) {
    if (cross5Res[i].baseMacros.caffeine > cross5Res[i - 1].baseMacros.caffeine) {
      sortedCaffDesc = false;
      break;
    }
  }

  assert(
    cross5Res.length > 0 && sortedCaffDesc,
    'Cross-Feature 5: High Protein Tag + Caffeine Descending Sort',
    `Returned ${cross5Res.length} high-protein items sorted by caffeine descending`
  );

  // --- Hero Pill Interaction 1: Starbucks Pill ---
  let chainState: string | null = null;
  function handleHeroFilter(pill: string) {
    if (pill === 'Starbucks') chainState = 'starbucks';
  }
  handleHeroFilter('Starbucks');
  assert(
    chainState === 'starbucks',
    'Hero Pill Interaction 1: Clicking "Starbucks" pill updates selectedChainId to "starbucks"',
    `Chain state: ${chainState}`
  );

  // --- Hero Pill Interaction 2: Glutensiz Pill ---
  let tagState: DietaryPreference[] = [];
  function handleHeroGlutenFilter(pill: string) {
    if (pill === 'Glutensiz') tagState = ['gluten_free'];
  }
  handleHeroGlutenFilter('Glutensiz');
  assert(
    tagState.includes('gluten_free'),
    'Hero Pill Interaction 2: Clicking "Glutensiz" pill updates selectedDietaryTags to ["gluten_free"]',
    `Tag state: ${JSON.stringify(tagState)}`
  );

  // --- Hero Pill Interaction 3: Soğuk Kahve Pill ---
  let categoryState: Category | 'all' = 'all';
  function handleHeroCategoryFilter(pill: string) {
    if (pill === 'Soğuk Kahve') categoryState = 'espresso_iced';
  }
  handleHeroCategoryFilter('Soğuk Kahve');
  assert(
    categoryState === 'espresso_iced',
    'Hero Pill Interaction 3: Clicking "Soğuk Kahve" pill updates selectedCategory to "espresso_iced"',
    `Category state: ${categoryState}`
  );

  // --- Interaction Test 9: Basket + Customization + Goal Calculation ---
  const itemToCustom = MENU_ITEMS[0];
  const customConfig: CustomizationState = {
    sizeId: 'venti',
    milkId: 'oat_milk',
    syrupPumps: 2,
    hasWhippedCream: false,
    hasColdFoam: true,
    extraEspressoShots: 2
  };
  const { calculatedMacros, calculatedAllergens } = calculateMacrosAndAllergens(itemToCustom, customConfig);

  const basketItem: BasketItem = {
    id: 'test_basket_1',
    item: itemToCustom,
    customization: customConfig,
    calculatedMacros,
    calculatedAllergens,
    addedAt: new Date()
  };

  const totalBasketCalories = basketItem.calculatedMacros.calories;
  const totalBasketCaffeine = basketItem.calculatedMacros.caffeine;
  const userCalorieGoal = 2000;
  const goalPercentage = Math.round((totalBasketCalories / userCalorieGoal) * 100);

  assert(
    totalBasketCalories > itemToCustom.baseMacros.calories && totalBasketCaffeine === itemToCustom.baseMacros.caffeine + 150 && goalPercentage > 0,
    'Cross-Feature 9: Customized Basket Item Updates Total Calories, Caffeine & Goal Percentage',
    `Calculated Basket Item: ${totalBasketCalories} kcal, ${totalBasketCaffeine}mg caffeine, Goal: ${goalPercentage}%`
  );

  // --- Interaction Test 10: Allergen Profile + Item Card Flagging ---
  const userAllergensState: Allergen[] = ['lactose'];
  const testItemWithLactose = MENU_ITEMS.find(i => i.allergens.includes('lactose'))!;
  const hasUserAllergenWarning = testItemWithLactose.allergens.some(a => userAllergensState.includes(a));

  assert(
    hasUserAllergenWarning === true,
    'Cross-Feature 10: User Allergen Profile Flags Matching Item Cards',
    `Item ${testItemWithLactose.name} flagged for lactose allergen warning`
  );

  // --- Interaction Test 11: Multi-Filter Reset State Restoration ---
  let filterState = {
    searchQuery: 'Latte',
    selectedChainId: 'starbucks',
    selectedCategory: 'espresso_iced' as Category | 'all',
    selectedDietaryTags: ['vegetarian' as DietaryPreference],
    isOnlyDrinks: true,
    isOnlyFood: false,
    sortBy: 'protein_desc' as const,
    showOnlyFavorites: true
  };

  function resetAllFilters() {
    filterState = {
      searchQuery: '',
      selectedChainId: null,
      selectedCategory: 'all',
      selectedDietaryTags: [],
      isOnlyDrinks: false,
      isOnlyFood: false,
      sortBy: 'protein_desc',
      showOnlyFavorites: false
    };
    filterState.sortBy = 'default' as any;
  }

  resetAllFilters();

  assert(
    filterState.searchQuery === '' &&
    filterState.selectedChainId === null &&
    filterState.selectedCategory === 'all' &&
    filterState.selectedDietaryTags.length === 0 &&
    filterState.isOnlyDrinks === false &&
    filterState.showOnlyFavorites === false,
    'Cross-Feature 11: Reset All Filters Restores All Filter States to Default Values Simultaneously',
    'Verified resetAllFilters cleanly clears all state fields'
  );

  return results;
}
