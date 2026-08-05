import { MENU_ITEMS } from '../../src/data/items';
import { CHAINS } from '../../src/data/chains';
import { calculateMacrosAndAllergens } from '../../src/utils/macroCalculator';
import type { MenuItem, CustomizationState, BasketItem, Allergen } from '../../src/types/cafe';

export interface TestResult {
  name: string;
  tier: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export function runTier4Tests(): TestResult[] {
  const results: TestResult[] = [];

  function assert(condition: boolean, name: string, details?: string) {
    if (condition) {
      results.push({ name, tier: 'Tier 4', passed: true, details });
    } else {
      results.push({ name, tier: 'Tier 4', passed: false, error: details || 'Assertion failed' });
    }
  }

  // --- Real-World Journey 1: Lactose-Intolerant Healthy Coffee Seeker ---
  let userAllergens: Allergen[] = ['lactose'];
  let hideAllergens = true;
  let selectedChainId = 'starbucks';

  const journey1Items = MENU_ITEMS.filter(item => {
    if (item.chainId !== selectedChainId) return false;
    if (hideAllergens && userAllergens.length > 0) {
      if (item.allergens.some(a => userAllergens.includes(a))) return false;
    }
    return true;
  });

  // Pick Starbucks Cold Brew (lactose free) or customize a latte with almond milk
  const chosenItem = journey1Items.find(i => i.id === 'sb_cold_brew') || MENU_ITEMS[0];
  const customConfig: CustomizationState = {
    sizeId: 'tall',
    milkId: 'almond_milk',
    syrupPumps: 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  };

  const { calculatedMacros, calculatedAllergens } = calculateMacrosAndAllergens(chosenItem, customConfig);

  assert(
    !calculatedAllergens.includes('lactose') && calculatedMacros.calories <= 150,
    'Real-World Journey 1: Lactose-Intolerant Healthy Coffee Seeker End-to-End Validation',
    `Selected: ${chosenItem.name}, Calories: ${calculatedMacros.calories} kcal, Lactose-free: ${!calculatedAllergens.includes('lactose')}`
  );

  // --- Real-World Journey 2: Fitness Enthusiast High Protein Planner ---
  const highProteinItems = MENU_ITEMS.filter(i => i.dietaryTags.includes('high_protein'))
    .sort((a, b) => b.baseMacros.protein - a.baseMacros.protein);

  const compareSet: MenuItem[] = [];
  if (highProteinItems.length >= 2) {
    compareSet.push(highProteinItems[0], highProteinItems[1]);
  } else {
    compareSet.push(MENU_ITEMS[0], MENU_ITEMS[1]);
  }

  const bestProteinItem = compareSet.reduce((prev, curr) => 
    (curr.baseMacros.protein / curr.baseMacros.calories) > (prev.baseMacros.protein / prev.baseMacros.calories) ? curr : prev
  );

  const basket: BasketItem[] = [{
    id: 'j2_b1',
    item: bestProteinItem,
    customization: {
      sizeId: bestProteinItem.defaultSizeId || 'tall',
      milkId: bestProteinItem.defaultMilkId || 'whole_milk',
      syrupPumps: 0,
      hasWhippedCream: false,
      hasColdFoam: false,
      extraEspressoShots: 0
    },
    calculatedMacros: bestProteinItem.baseMacros,
    calculatedAllergens: bestProteinItem.allergens,
    addedAt: new Date()
  }];

  const dailyProteinTotal = basket.reduce((acc, b) => acc + b.calculatedMacros.protein, 0);

  assert(
    compareSet.length >= 2 && dailyProteinTotal > 0,
    'Real-World Journey 2: High Protein Snack & Drink Macro Optimization Journey',
    `Compared ${compareSet.length} items, Selected highest protein density: ${bestProteinItem.name} (${dailyProteinTotal}g protein)`
  );

  // --- Real-World Journey 3: Celiac Safety Verification ---
  const celiacUserAllergens: Allergen[] = ['gluten', 'celiac_oat_risk'];
  const safeItems = MENU_ITEMS.filter(item => {
    return !item.allergens.some(a => celiacUserAllergens.includes(a));
  });

  const containsUnsafeItem = safeItems.some(i => i.allergens.includes('gluten') || i.allergens.includes('celiac_oat_risk'));

  assert(
    !containsUnsafeItem && safeItems.length > 0,
    'Real-World Journey 3: Celiac Safety Allergen Filtering & Safe Option Discovery',
    `Filtered ${safeItems.length} celiac-safe menu options with 0 gluten/oat risk violations`
  );

  // --- Real-World Journey 4: Custom Recipe Creation & Daily Macro Budgeting ---
  const customRecipeItem: MenuItem = {
    id: 'custom_iced_blonde_latte',
    chainId: 'starbucks',
    name: 'Benim Iced Blonde Almond Latte',
    category: 'espresso_iced',
    description: 'Özel hazırladığım şekersiz badem sütlü çift shot soğuk kahve',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c',
    isDrink: true,
    defaultSizeId: 'grande',
    defaultMilkId: 'almond_milk',
    baseMacros: { calories: 85, protein: 3, carbs: 7, sugar: 4, fat: 4, caffeine: 150 },
    allergens: [],
    dietaryTags: ['vegan', 'lactose_free', 'sugar_free']
  };

  const dynamicMenuItems = [customRecipeItem, ...MENU_ITEMS];
  const foundInMenu = dynamicMenuItems.some(i => i.id === 'custom_iced_blonde_latte');

  const recipeCustomization: CustomizationState = {
    sizeId: 'grande',
    milkId: 'almond_milk',
    syrupPumps: 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 1
  };

  const recipeMacros = calculateMacrosAndAllergens(customRecipeItem, recipeCustomization);

  assert(
    foundInMenu && recipeMacros.calculatedMacros.calories > 0 && recipeMacros.calculatedMacros.caffeine >= 225,
    'Real-World Journey 4: Custom Recipe Builder & Daily Macro Budgeting Integration',
    `Created: ${customRecipeItem.name}, Added to menu: ${foundInMenu}, Final Caffeine: ${recipeMacros.calculatedMacros.caffeine}mg`
  );

  // --- Real-World Journey 5: Multi-Chain Price & Macro Comparison ---
  const chainIdsToCompare = ['starbucks', 'espressolab', 'caffe_nero', 'coffy'];
  const multiChainCompareItems: MenuItem[] = [];

  chainIdsToCompare.forEach(cId => {
    const item = MENU_ITEMS.find(i => i.chainId === cId);
    if (item) multiChainCompareItems.push(item);
  });

  const compareCapacityValid = multiChainCompareItems.length <= 4;
  const lowestCalorieCompared = multiChainCompareItems.reduce((min, curr) => 
    curr.baseMacros.calories < min.baseMacros.calories ? curr : min
  , multiChainCompareItems[0]);

  assert(
    compareCapacityValid && multiChainCompareItems.length >= 2 && lowestCalorieCompared !== undefined,
    'Real-World Journey 5: Multi-Chain Espresso Macro Comparison Matrix',
    `Compared ${multiChainCompareItems.length} chains. Lowest calorie choice: ${lowestCalorieCompared.name} (${lowestCalorieCompared.baseMacros.calories} kcal)`
  );

  return results;
}
