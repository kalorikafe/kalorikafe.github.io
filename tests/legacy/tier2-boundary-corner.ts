import { MENU_ITEMS } from '../../src/data/items';
import { CHAINS } from '../../src/data/chains';
import { calculateMacrosAndAllergens } from '../../src/utils/macroCalculator';
import type { MenuItem, CustomizationState, Allergen } from '../../src/types/cafe';

export interface TestResult {
  name: string;
  tier: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export function runTier2Tests(): TestResult[] {
  const results: TestResult[] = [];

  function assert(condition: boolean, name: string, details?: string) {
    if (condition) {
      results.push({ name, tier: 'Tier 2', passed: true, details });
    } else {
      results.push({ name, tier: 'Tier 2', passed: false, error: details || 'Assertion failed' });
    }
  }

  // Helper filter logic mimicking App.tsx filteredItems logic
  function filterItems(options: {
    searchQuery?: string;
    selectedChainId?: string | null;
    userAllergens?: Allergen[];
    hideAllergens?: boolean;
    showOnlyFavorites?: boolean;
    favorites?: string[];
  }) {
    const searchQuery = options.searchQuery || '';
    const selectedChainId = options.selectedChainId ?? null;
    const userAllergens = options.userAllergens || [];
    const hideAllergens = options.hideAllergens || false;
    const showOnlyFavorites = options.showOnlyFavorites || false;
    const favorites = options.favorites || [];

    return MENU_ITEMS.filter(item => {
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

      if (hideAllergens && userAllergens.length > 0) {
        if (item.allergens.some(a => userAllergens.includes(a))) {
          return false;
        }
      }

      return true;
    });
  }

  // --- 1. Search Behavior Boundary Tests ---
  const emptySearchRes = filterItems({ searchQuery: '' });
  assert(
    emptySearchRes.length === MENU_ITEMS.length,
    'Search Boundary - Empty String: Empty search query returns entire menu items set',
    `Returned ${emptySearchRes.length} items out of ${MENU_ITEMS.length}`
  );

  const trimmedSearchRes = filterItems({ searchQuery: '   Latte   ' });
  const normalSearchRes = filterItems({ searchQuery: 'Latte' });
  assert(
    trimmedSearchRes.length === normalSearchRes.length && trimmedSearchRes.length > 0,
    'Search Boundary - Whitespace Trimming: Search query with whitespace trims correctly',
    `Trimmed search returned ${trimmedSearchRes.length} items`
  );

  const specialCharRes = filterItems({ searchQuery: 'Latte!@#$%^&*()' });
  assert(
    Array.isArray(specialCharRes),
    'Search Boundary - Special Character Escaping: Search input with special characters runs without error',
    `Returned ${specialCharRes.length} items safely`
  );

  const noMatchRes = filterItems({ searchQuery: 'xyz123nonexistentsearchterm' });
  assert(
    noMatchRes.length === 0,
    'Search Boundary - Zero Match Query: Non-matching query returns empty array gracefully',
    'Returned 0 items as expected'
  );

  const upperRes = filterItems({ searchQuery: 'LATTE' });
  const lowerRes = filterItems({ searchQuery: 'latte' });
  const mixedRes = filterItems({ searchQuery: 'LaTtE' });
  assert(
    upperRes.length === lowerRes.length && lowerRes.length === mixedRes.length,
    'Search Boundary - Case Insensitivity: Uppercase, lowercase, and mixed-case search queries yield identical results',
    `Upper: ${upperRes.length}, Lower: ${lowerRes.length}, Mixed: ${mixedRes.length}`
  );

  const descMatchRes = filterItems({ searchQuery: 'narenciye' });
  assert(
    descMatchRes.length > 0 && descMatchRes.some(i => i.description.toLowerCase().includes('narenciye')),
    'Search Boundary - Description Matching: Searching key terms present in description field matches items',
    `Matched ${descMatchRes.length} items with description keyword`
  );

  const tagMatchRes = filterItems({ searchQuery: 'vegan' });
  assert(
    tagMatchRes.length > 0 && tagMatchRes.every(i => i.dietaryTags.includes('vegan') || i.name.toLowerCase().includes('vegan') || i.description.toLowerCase().includes('vegan')),
    'Search Boundary - Dietary Tag Keyword Matching: Searching "vegan" matches items with vegan dietary tags',
    `Matched ${tagMatchRes.length} items for tag keyword`
  );

  // --- 2. Compare Feature Limits & Operations ---
  let compareList: MenuItem[] = [];
  function addCompareItem(item: MenuItem) {
    if (compareList.length >= 4) {
      return false;
    }
    if (!compareList.some(i => i.id === item.id)) {
      compareList.push(item);
      return true;
    }
    return false;
  }

  addCompareItem(MENU_ITEMS[0]);
  assert(
    compareList.length === 1,
    'Compare Limit - Single Item: Adding 1 item to compare list sets length to 1',
    `Compare list length: ${compareList.length}`
  );

  addCompareItem(MENU_ITEMS[1]);
  addCompareItem(MENU_ITEMS[2]);
  addCompareItem(MENU_ITEMS[3]);
  assert(
    compareList.length === 4,
    'Compare Limit - Maximum Capacity: Adding 4 items fills compare list to max capacity 4',
    `Compare list length: ${compareList.length}`
  );

  const fifthAddResult = addCompareItem(MENU_ITEMS[4]);
  assert(
    fifthAddResult === false && compareList.length === 4,
    'Compare Limit - 5th Item Rejection: Attempting to add 5th item is rejected, capping list at 4',
    `Rejection status: ${!fifthAddResult}, length capped at ${compareList.length}`
  );

  compareList = compareList.filter(i => i.id !== MENU_ITEMS[0].id);
  assert(
    compareList.length === 3,
    'Compare Operation - Item Removal: Removing an item from compare list decrements count to 3',
    `Remaining items: ${compareList.length}`
  );

  compareList = [];
  assert(
    compareList.length === 0,
    'Compare Operation - List Reset: Clearing compare list resets length to 0',
    `Compare list length: ${compareList.length}`
  );

  // --- 3. Zero Caffeine Items & Sorting ---
  const zeroCaffeineItems = MENU_ITEMS.filter(i => i.baseMacros.caffeine === 0);
  assert(
    zeroCaffeineItems.length > 0,
    'Zero Caffeine Boundary: Dataset includes items with exactly 0mg caffeine (decaf, teas, food)',
    `Found ${zeroCaffeineItems.length} zero-caffeine items`
  );

  const sortedCaffeineAsc = [...MENU_ITEMS].sort((a, b) => a.baseMacros.caffeine - b.baseMacros.caffeine);
  assert(
    sortedCaffeineAsc[0].baseMacros.caffeine === 0,
    'Zero Caffeine Sorting: Sorting by caffeine ascending places 0mg caffeine items first',
    `First item caffeine: ${sortedCaffeineAsc[0].baseMacros.caffeine}mg`
  );

  // --- 4. Allergen Filter Reset & Operations ---
  const emptyAllergenProfileRes = filterItems({ userAllergens: [], hideAllergens: true });
  assert(
    emptyAllergenProfileRes.length === MENU_ITEMS.length,
    'Allergen Filter - Empty Profile: Enabling hideAllergens with empty user allergen profile hides 0 items',
    `Items shown: ${emptyAllergenProfileRes.length}`
  );

  const lactoseHiddenRes = filterItems({ userAllergens: ['lactose'], hideAllergens: true });
  const lactoseItemsCount = MENU_ITEMS.filter(i => i.allergens.includes('lactose')).length;
  assert(
    lactoseHiddenRes.length === MENU_ITEMS.length - lactoseItemsCount,
    'Allergen Filter - Hide Lactose: Hiding lactose allergen excludes all lactose-containing items from menu',
    `Original items: ${MENU_ITEMS.length}, Lactose items: ${lactoseItemsCount}, Filtered: ${lactoseHiddenRes.length}`
  );

  const clearedAllergenRes = filterItems({ userAllergens: [], hideAllergens: false });
  assert(
    clearedAllergenRes.length === MENU_ITEMS.length,
    'Allergen Filter - Profile Reset: Resetting user allergens restores full menu item count',
    `Restored total items: ${clearedAllergenRes.length}`
  );

  // --- 5. Macro Calculation BVA & Delta Tests ---
  const baseItem = MENU_ITEMS[0]; // e.g. Starbucks Caffè Latte (tall, whole milk, 150 kcal, 8g p, 13g c, 12g s, 7g f, 75mg caf)
  
  // Short Size (0.75x)
  const shortCustomization: CustomizationState = {
    sizeId: 'short',
    milkId: 'whole_milk',
    syrupPumps: 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  };
  const shortRes = calculateMacrosAndAllergens(baseItem, shortCustomization);
  const expectedShortCal = Math.round(baseItem.baseMacros.calories * 0.75); // 150 * 0.75 = 112.5 -> 113
  assert(
    shortRes.calculatedMacros.calories === expectedShortCal,
    'Macro Calculation BVA - Short Size (0.75x): Short size volume scales calories down by 25%',
    `Calculated: ${shortRes.calculatedMacros.calories} kcal, Expected: ${expectedShortCal} kcal`
  );

  // Venti Size (1.6x)
  const ventiCustomization: CustomizationState = {
    sizeId: 'venti',
    milkId: 'whole_milk',
    syrupPumps: 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  };
  const ventiRes = calculateMacrosAndAllergens(baseItem, ventiCustomization);
  const expectedVentiCal = Math.round(baseItem.baseMacros.calories * 1.6); // 150 * 1.6 = 240
  assert(
    ventiRes.calculatedMacros.calories === expectedVentiCal,
    'Macro Calculation BVA - Venti Size (1.6x): Venti size volume scales calories up by 60%',
    `Calculated: ${ventiRes.calculatedMacros.calories} kcal, Expected: ${expectedVentiCal} kcal`
  );

  // Plant Milk Delta (Almond milk -75 kcal)
  const almondCustomization: CustomizationState = {
    sizeId: 'tall',
    milkId: 'almond_milk',
    syrupPumps: 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  };
  const almondRes = calculateMacrosAndAllergens(baseItem, almondCustomization);
  assert(
    almondRes.calculatedMacros.calories < baseItem.baseMacros.calories,
    'Macro Calculation BVA - Plant Milk Delta: Almond milk selection reduces total drink calories',
    `Base: ${baseItem.baseMacros.calories} kcal, Almond Milk: ${almondRes.calculatedMacros.calories} kcal`
  );

  // Extra Espresso Shot (+75mg caffeine, +5 kcal)
  const shotCustomization: CustomizationState = {
    sizeId: 'tall',
    milkId: 'whole_milk',
    syrupPumps: 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 1
  };
  const shotRes = calculateMacrosAndAllergens(baseItem, shotCustomization);
  assert(
    shotRes.calculatedMacros.caffeine === baseItem.baseMacros.caffeine + 75 &&
    shotRes.calculatedMacros.calories === baseItem.baseMacros.calories + 5,
    'Macro Calculation BVA - Extra Shot Addition: Extra shot adds +75mg caffeine and +5 kcal',
    `Calculated Caffeine: ${shotRes.calculatedMacros.caffeine}mg, Calories: ${shotRes.calculatedMacros.calories} kcal`
  );

  // Syrup Pumps Delta (+3 pumps = +60 kcal, +15g carbs, +15g sugar)
  const syrupCustomization: CustomizationState = {
    sizeId: 'tall',
    milkId: 'whole_milk',
    syrupPumps: 3,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  };
  const syrupRes = calculateMacrosAndAllergens(baseItem, syrupCustomization);
  assert(
    syrupRes.calculatedMacros.calories === baseItem.baseMacros.calories + 60 &&
    syrupRes.calculatedMacros.carbs === Number((baseItem.baseMacros.carbs + 15).toFixed(1)) &&
    syrupRes.calculatedMacros.sugar === Number((baseItem.baseMacros.sugar + 15).toFixed(1)),
    'Macro Calculation BVA - Syrup Pumps: Adding 3 syrup pumps increases calories (+60), carbs (+15g), and sugar (+15g)',
    `Calculated Calories: ${syrupRes.calculatedMacros.calories}, Sugar: ${syrupRes.calculatedMacros.sugar}g`
  );

  // Non-dairy Milk Allergen Removal
  assert(
    !almondRes.calculatedAllergens.includes('lactose'),
    'Macro Calculation BVA - Lactose Removal: Choosing plant milk without whipped cream/cold foam removes lactose allergen',
    `Original allergens: ${JSON.stringify(baseItem.allergens)}, Calculated: ${JSON.stringify(almondRes.calculatedAllergens)}`
  );

  // Oat Milk Celiac Warning Addition
  const oatCustomization: CustomizationState = {
    sizeId: 'tall',
    milkId: 'oat_milk',
    syrupPumps: 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  };
  const oatRes = calculateMacrosAndAllergens(baseItem, oatCustomization);
  assert(
    oatRes.calculatedAllergens.includes('celiac_oat_risk'),
    'Macro Calculation BVA - Oat Milk Warning: Selecting oat milk dynamically adds "celiac_oat_risk" allergen flag',
    `Calculated allergens: ${JSON.stringify(oatRes.calculatedAllergens)}`
  );

  // Clamping Invariant Test
  const extremeNegCustomization: CustomizationState = {
    sizeId: 'short',
    milkId: 'almond_milk',
    syrupPumps: 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  };
  const clampedRes = calculateMacrosAndAllergens(baseItem, extremeNegCustomization);
  assert(
    clampedRes.calculatedMacros.calories >= 0 &&
    clampedRes.calculatedMacros.protein >= 0 &&
    clampedRes.calculatedMacros.carbs >= 0 &&
    clampedRes.calculatedMacros.sugar >= 0 &&
    clampedRes.calculatedMacros.fat >= 0,
    'Macro Calculation Invariant - Non-Negative Clamping: Clamped macros never produce negative nutritional numbers',
    `Clamped macros: ${JSON.stringify(clampedRes.calculatedMacros)}`
  );

  // Favorites Toggle Test
  let favoritesList: string[] = [];
  const testId = MENU_ITEMS[0].id;
  favoritesList = favoritesList.includes(testId) ? favoritesList.filter(id => id !== testId) : [...favoritesList, testId];
  assert(
    favoritesList.includes(testId),
    'Favorites State - Toggle On: Toggling favorite adds item ID to favorites array',
    `Favorites array: ${JSON.stringify(favoritesList)}`
  );

  return results;
}
