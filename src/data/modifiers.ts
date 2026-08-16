import type { MilkOption, SizeOption } from '../types/cafe';

export const SIZE_OPTIONS: SizeOption[] = [
  { id: 'short', name: 'Short (8 oz / 236 ml)', volumeMl: 236, multiplier: 0.75 },
  { id: 'tall', name: 'Tall (12 oz / 355 ml)', volumeMl: 355, multiplier: 1.0 },
  { id: 'grande', name: 'Grande (16 oz / 473 ml)', volumeMl: 473, multiplier: 1.3 },
  { id: 'venti', name: 'Venti (20 oz / 591 ml)', volumeMl: 591, multiplier: 1.6 }
];

export const MILK_OPTIONS: MilkOption[] = [
  {
    id: 'whole_milk',
    name: 'Tam Yağlı İnek Sütü (%3.0 Yağ)',
    calDelta: 0,
    proteinDelta: 0,
    fatDelta: 0,
    sugarDelta: 0,
    carbDelta: 0,
    isDairy: true,
    isDairyFree: false,
    containsLactose: true,
    glycemicLevel: 'Orta'
  },
  {
    id: 'skim_milk',
    name: 'Yağsız Süt (%0.1 Yağ)',
    calDelta: -55,
    proteinDelta: 0,
    fatDelta: -6.5,
    sugarDelta: +1,
    carbDelta: 1,
    isDairy: true,
    isDairyFree: false,
    containsLactose: true,
    glycemicLevel: 'Düşük'
  },
  {
    id: 'lactose_free_milk',
    name: 'Laktozsuz Süt',
    calDelta: -10,
    proteinDelta: 0,
    fatDelta: -2.0,
    sugarDelta: 0,
    carbDelta: 0,
    isDairy: true,
    isDairyFree: false,
    containsLactose: false,
    glycemicLevel: 'Düşük'
  },
  {
    id: 'oat_milk',
    name: 'Barista Yulaf Sütü (Oat Sütü)',
    calDelta: +20,
    proteinDelta: -3,
    fatDelta: -1.5,
    sugarDelta: +4,
    carbDelta: 7,
    isDairy: false,
    isDairyFree: true,
    containsLactose: false,
    crossContactRisks: ['celiac_oat_risk'],
    hasCeliacRisk: true,
    celiacRisk: true,
    glycemicLevel: 'Yüksek'
  },
  {
    id: 'almond_milk',
    name: 'Şekersiz Badem Sütü (Almond Sütü)',
    calDelta: -75,
    proteinDelta: -6,
    fatDelta: -4.0,
    sugarDelta: -6,
    carbDelta: -5,
    isDairy: false,
    isDairyFree: true,
    containsLactose: false,
    allergens: ['nuts'],
    glycemicLevel: 'Çok Düşük'
  },
  {
    id: 'soy_milk',
    name: 'Organik Soya Sütü',
    calDelta: -25,
    proteinDelta: -1,
    fatDelta: -3.0,
    sugarDelta: -3,
    carbDelta: -2,
    isDairy: false,
    isDairyFree: true,
    containsLactose: false,
    allergens: ['soy'],
    glycemicLevel: 'Düşük'
  },
  {
    id: 'coconut_milk',
    name: 'Hindistan Cevizi Sütü',
    calDelta: -35,
    proteinDelta: -7,
    fatDelta: -1.0,
    sugarDelta: -2,
    carbDelta: -1,
    isDairy: false,
    isDairyFree: true,
    containsLactose: false,
    glycemicLevel: 'Düşük'
  }
];

export const EXTRAS_MACROS = {
  syrupPump: {
    calories: 20,
    carbs: 5,
    sugar: 5,
    fat: 0,
    protein: 0
  },
  whippedCream: {
    calories: 82,
    fat: 8.5,
    satFat: 5.2,
    carbs: 1,
    sugar: 1,
    protein: 0.5
  },
  coldFoam: {
    calories: 110,
    fat: 7.0,
    carbs: 10,
    sugar: 9,
    protein: 2.0
  },
  extraShot: {
    calories: 5,
    caffeine: 75,
    carbs: 0.5,
    protein: 0.3,
    fat: 0
  }
};
