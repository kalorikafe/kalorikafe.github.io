import type { MenuItem, CustomizationState, Macros, Allergen } from '../types/cafe';
import { SIZE_OPTIONS, MILK_OPTIONS, EXTRAS_MACROS } from '../data/modifiers';

export const ALLERGEN_MAP: Record<Allergen, { name: string; icon: string; bg: string; text: string; description: string }> = {
  lactose: {
    name: 'Süt / Laktoz',
    icon: '🥛',
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    text: 'text-blue-800 dark:text-blue-300',
    description: 'Hayvansal süt protein ve laktozu içerir. Bitkisel süt tercihi ile çıkarılabilir.'
  },
  gluten: {
    name: 'Gluten',
    icon: '🌾',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    description: 'Buğday, arpa veya çavdar unu içerir.'
  },
  celiac_oat_risk: {
    name: 'Yulaf (Çölyak Riski)',
    icon: '⚠️',
    bg: 'bg-orange-100 dark:bg-orange-950/60',
    text: 'text-orange-800 dark:text-orange-300',
    description: 'Sertifikasız yulaf sütünde tarlada buğday çapraz bulaşma riski vardır.'
  },
  nuts: {
    name: 'Kabuklu Yemişler',
    icon: '🥜',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    description: 'Fındık, fıstık, badem veya ceviz türevleri içerir.'
  },
  peanut: {
    name: 'Yer Fıstığı',
    icon: '🥜',
    bg: 'bg-yellow-100 dark:bg-yellow-950/60',
    text: 'text-yellow-800 dark:text-yellow-300',
    description: 'Yer fıstığı proteini içerir.'
  },
  soy: {
    name: 'Soya',
    icon: '🫘',
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    text: 'text-purple-800 dark:text-purple-300',
    description: 'Soya lesitini veya soya sütü türevleri içerir.'
  },
  egg: {
    name: 'Yumurta',
    icon: '🥚',
    bg: 'bg-stone-200 dark:bg-stone-800',
    text: 'text-stone-800 dark:text-stone-200',
    description: 'Taze yumurta veya yumurta akı tozu içerir.'
  }
};

/**
 * Single-source, idempotent macro engine.
 *
 * Contract: `item.baseMacros` is the nutrition profile of the item in its
 * DEFAULT configuration (default size, default milk, default syrup pumps,
 * no optional extras). Therefore:
 *  - an untouched default customizer reproduces the card value exactly;
 *  - the size multiplier is applied RELATIVE to the default serving size
 *    (so the serving-based base value is never re-multiplied);
 *  - the default syrup pumps baked into `baseMacros` are never added twice;
 *  - re-running the engine with the configuration that produced a
 *    pre-computed `baseMacros` is a no-op (idempotent).
 */
export function calculateMacrosAndAllergens(
  item: MenuItem,
  customization: CustomizationState
): { calculatedMacros: Macros; calculatedAllergens: Allergen[] } {
  const baseline: CustomizationState = item.baseCustomization ?? {
    sizeId: item.defaultSizeId || 'tall',
    milkId: item.defaultMilkId || 'whole_milk',
    syrupPumps: item.defaultSyrupPumps || 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0,
  };

  const defaultSize = SIZE_OPTIONS.find(s => s.id === baseline.sizeId) || SIZE_OPTIONS[1]; // default Tall
  const size = SIZE_OPTIONS.find(s => s.id === customization.sizeId) || defaultSize;
  const defaultMilk = MILK_OPTIONS.find(m => m.id === baseline.milkId) || null;
  const milk = MILK_OPTIONS.find(m => m.id === customization.milkId) || defaultMilk || MILK_OPTIONS[0]; // default Whole

  // Base multiplier relative to the item's default serving size, so the
  // untouched default customizer always equals `baseMacros`.
  const mult = size.multiplier / defaultSize.multiplier;

  // Base values adjusted for size (relative to the default size)
  let calories = item.baseMacros.calories * mult;
  let protein = item.baseMacros.protein * mult;
  let carbs = item.baseMacros.carbs * mult;
  let sugar = item.baseMacros.sugar * mult;
  let fat = item.baseMacros.fat * mult;
  let satFat = (item.baseMacros.satFat || 0) * mult;
  let caffeine = item.baseMacros.caffeine; // Caffeine scales with shots, not size volume directly
  let sodium = (item.baseMacros.sodium || 0) * mult;

  // 1. Milk modifications (only if item is a milk-based drink).
  //    baseMacros already includes the item's DEFAULT milk, so only the delta
  //    relative to the default milk is applied.
  if (item.isDrink && (item.defaultMilkId || item.baseCustomization)) {
    const baseMilk = defaultMilk || MILK_OPTIONS[0];
    calories += (milk.calDelta - baseMilk.calDelta) * mult;
    protein += (milk.proteinDelta - baseMilk.proteinDelta) * mult;
    fat += (milk.fatDelta - baseMilk.fatDelta) * mult;
    sugar += (milk.sugarDelta - baseMilk.sugarDelta) * mult;
    if ((milk.carbDelta || 0) !== (baseMilk.carbDelta || 0)) {
      carbs += ((milk.carbDelta || 0) - (baseMilk.carbDelta || 0)) * mult;
    }
  }

  // 2. Extra syrup pumps. baseMacros already includes the item's DEFAULT pump
  //    count, so only the difference is applied (negative removes pumps).
  const pumpDelta = customization.syrupPumps - baseline.syrupPumps;
  if (pumpDelta !== 0) {
    calories += pumpDelta * EXTRAS_MACROS.syrupPump.calories;
    carbs += pumpDelta * EXTRAS_MACROS.syrupPump.carbs;
    sugar += pumpDelta * EXTRAS_MACROS.syrupPump.sugar;
  }

  // 3. Whipped cream
  const whippedCreamDelta = Number(customization.hasWhippedCream) - Number(baseline.hasWhippedCream);
  if (whippedCreamDelta !== 0) {
    calories += whippedCreamDelta * EXTRAS_MACROS.whippedCream.calories;
    protein += whippedCreamDelta * EXTRAS_MACROS.whippedCream.protein;
    carbs += whippedCreamDelta * EXTRAS_MACROS.whippedCream.carbs;
    sugar += whippedCreamDelta * EXTRAS_MACROS.whippedCream.sugar;
    fat += whippedCreamDelta * EXTRAS_MACROS.whippedCream.fat;
    satFat += whippedCreamDelta * EXTRAS_MACROS.whippedCream.satFat;
  }

  // 4. Cold foam
  const coldFoamDelta = Number(customization.hasColdFoam) - Number(baseline.hasColdFoam);
  if (coldFoamDelta !== 0) {
    calories += coldFoamDelta * EXTRAS_MACROS.coldFoam.calories;
    protein += coldFoamDelta * EXTRAS_MACROS.coldFoam.protein;
    carbs += coldFoamDelta * EXTRAS_MACROS.coldFoam.carbs;
    sugar += coldFoamDelta * EXTRAS_MACROS.coldFoam.sugar;
    fat += coldFoamDelta * EXTRAS_MACROS.coldFoam.fat;
  }

  // 5. Extra espresso shots (each shot +75mg caffeine, 5 kcal)
  const shotDelta = customization.extraEspressoShots - baseline.extraEspressoShots;
  if (shotDelta !== 0) {
    calories += shotDelta * EXTRAS_MACROS.extraShot.calories;
    protein += shotDelta * EXTRAS_MACROS.extraShot.protein;
    carbs += shotDelta * EXTRAS_MACROS.extraShot.carbs;
    fat += shotDelta * EXTRAS_MACROS.extraShot.fat;
    caffeine += shotDelta * EXTRAS_MACROS.extraShot.caffeine;
  }

  // Calculate dynamic allergens
  const calculatedAllergens: Allergen[] = [...item.allergens];

  // If user chose non-dairy milk and NO whipped cream / cold foam, remove lactose allergen!
  if (!milk.isDairy && !customization.hasWhippedCream && !customization.hasColdFoam) {
    const idx = calculatedAllergens.indexOf('lactose');
    if (idx !== -1) {
      calculatedAllergens.splice(idx, 1);
    }
  }

  // If user chose plant milk with celiac oat risk, add oat warning
  if (milk.hasCeliacRisk || milk.celiacRisk) {
    if (!calculatedAllergens.includes('celiac_oat_risk')) {
      calculatedAllergens.push('celiac_oat_risk');
    }
  }

  // If milk has specific allergens (e.g. soy/nuts)
  if (milk.allergens) {
    milk.allergens.forEach((a: Allergen) => {
      if (!calculatedAllergens.includes(a)) {
        calculatedAllergens.push(a);
      }
    });
  }

  return {
    calculatedMacros: {
      calories: Math.max(0, Math.round(calories)),
      protein: Math.max(0, Number(protein.toFixed(1))),
      carbs: Math.max(0, Number(carbs.toFixed(1))),
      sugar: Math.max(0, Number(sugar.toFixed(1))),
      fat: Math.max(0, Number(fat.toFixed(1))),
      satFat: Math.max(0, Number(satFat.toFixed(1))),
      caffeine: Math.max(0, Math.round(caffeine)),
      sodium: Math.max(0, Math.round(sodium))
    },
    calculatedAllergens
  };
}
