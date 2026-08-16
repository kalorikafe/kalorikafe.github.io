import { describe, expect, it } from 'vitest';
import { MENU_ITEMS } from '../../src/data/items';
import type { CustomizationState, MenuItem } from '../../src/types/cafe';
import { calculateMacrosAndAllergens, getDefaultCustomization } from '../../src/utils/macroCalculator';

const latte = MENU_ITEMS.find(item => item.id === 'starbucks_1_caff__latte')!;

const defaults: CustomizationState = {
  sizeId: latte.defaultSizeId || 'tall',
  milkId: latte.defaultMilkId || 'whole_milk',
  syrupPumps: latte.defaultSyrupPumps || 0,
  hasWhippedCream: false,
  hasColdFoam: false,
  extraEspressoShots: 0,
};

describe('calculateMacrosAndAllergens', () => {
  it('reproduces the card macros for an untouched default recipe', () => {
    const result = calculateMacrosAndAllergens(latte, defaults);

    expect(result.calculatedMacros).toEqual(latte.baseMacros);
    expect(result.calculatedAllergens).toEqual(latte.allergens);
  });

  it.each([
    {
      name: 'size is relative to the default serving',
      change: { sizeId: 'short' },
      expected: { calories: 110, protein: 6.9, carbs: 10.4, sugar: 9.8, fat: 4, caffeine: 150, sodium: 87 },
    },
    {
      name: 'milk applies only its delta from the default milk',
      change: { milkId: 'almond_milk' },
      expected: { calories: 115, protein: 6, carbs: 13, sugar: 11, fat: 3, caffeine: 150, sodium: 150 },
    },
    {
      name: 'syrup applies only pumps above the baked default',
      change: { syrupPumps: 2 },
      expected: { calories: 230, protein: 12, carbs: 28, sugar: 27, fat: 7, caffeine: 150, sodium: 150 },
    },
    {
      name: 'an extra shot changes each declared shot macro once',
      change: { extraEspressoShots: 1 },
      expected: { calories: 195, protein: 12.3, carbs: 18.5, sugar: 17, fat: 7, caffeine: 225, sodium: 150 },
    },
  ])('$name', ({ change, expected }) => {
    const result = calculateMacrosAndAllergens(latte, { ...defaults, ...change });

    expect(result.calculatedMacros).toMatchObject(expected);
  });

  it('removes baked syrup when the selected pump count is lower', () => {
    const caramel = MENU_ITEMS.find(item => item.id === 'starbucks_2_caramel_macchiato')!;
    const result = calculateMacrosAndAllergens(caramel, {
      sizeId: caramel.defaultSizeId || 'tall',
      milkId: caramel.defaultMilkId || 'whole_milk',
      syrupPumps: 0,
      hasWhippedCream: false,
      hasColdFoam: false,
      extraEspressoShots: 0,
    });

    expect(result.calculatedMacros).toMatchObject({ calories: 190, carbs: 20, sugar: 18 });
  });

  it('removes milk for plant milk but keeps it for lactose-free dairy milk', () => {
    const plant = calculateMacrosAndAllergens(latte, { ...defaults, milkId: 'almond_milk' });
    expect(plant.calculatedAllergens).not.toContain('milk');
    expect(plant.calculatedAllergens).toContain('nuts');

    const lactoseFreeDairy = calculateMacrosAndAllergens(latte, {
      ...defaults,
      milkId: 'lactose_free_milk',
    });
    expect(lactoseFreeDairy.calculatedAllergens).toContain('milk');
    expect(lactoseFreeDairy.calculatedAllergens).not.toContain('lactose');
  });

  it('does not recalculate an already baked custom recipe', () => {
    const selected: CustomizationState = {
      ...defaults,
      milkId: 'almond_milk',
      syrupPumps: 1,
      hasColdFoam: true,
      extraEspressoShots: 1,
    };
    const baked = calculateMacrosAndAllergens(latte, selected);
    const savedRecipe: MenuItem = {
      ...latte,
      id: 'custom_golden_recipe',
      defaultSizeId: selected.sizeId,
      defaultMilkId: selected.milkId,
      defaultSyrupPumps: selected.syrupPumps,
      baseCustomization: selected,
      baseMacros: baked.calculatedMacros,
      allergens: baked.calculatedAllergens,
    };

    expect(calculateMacrosAndAllergens(savedRecipe, selected)).toEqual(baked);
    expect(getDefaultCustomization(savedRecipe)).toEqual(selected);
  });

  it('rebuilds milk and dairy-extra allergens instead of retaining stale milk warnings', () => {
    const blankTemplate: MenuItem = {
      ...latte,
      id: 'custom_blank_template',
      allergens: [],
      defaultMilkId: 'whole_milk',
    };
    const wholeMilk = calculateMacrosAndAllergens(blankTemplate, defaults);
    expect(wholeMilk.calculatedAllergens).toEqual(['milk']);

    const almondWithCream = calculateMacrosAndAllergens(blankTemplate, {
      ...defaults,
      milkId: 'almond_milk',
      hasWhippedCream: true,
    });
    expect(almondWithCream.calculatedAllergens).toEqual(expect.arrayContaining(['nuts', 'milk']));

    const savedAlmond: MenuItem = {
      ...blankTemplate,
      allergens: ['nuts'],
      defaultMilkId: 'almond_milk',
      baseCustomization: { ...defaults, milkId: 'almond_milk' },
    };
    const editedToSoy = calculateMacrosAndAllergens(savedAlmond, { ...defaults, milkId: 'soy_milk' });
    expect(editedToSoy.calculatedAllergens).toContain('soy');
    expect(editedToSoy.calculatedAllergens).not.toContain('nuts');
    expect(editedToSoy.calculatedAllergens).not.toContain('milk');
  });
});
