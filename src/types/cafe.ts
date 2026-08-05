export type Category = 
  | 'espresso_hot'
  | 'espresso_iced'
  | 'cold_brew'
  | 'frappe_blended'
  | 'tea_herbal'
  | 'smoothie_juice'
  | 'bakery_dessert'
  | 'sandwich_savory'
  | 'fit_healthy';

export type Allergen = 
  | 'lactose' 
  | 'gluten' 
  | 'celiac_oat_risk' 
  | 'nuts' 
  | 'soy' 
  | 'egg' 
  | 'peanut';

export type DietaryPreference = 
  | 'vegan' 
  | 'vegetarian' 
  | 'gluten_free' 
  | 'lactose_free' 
  | 'sugar_free' 
  | 'high_protein' 
  | 'low_calorie';

export interface Chain {
  id: string;
  name: string;
  logo: string;
  color: string;
  badgeColor?: string;
  accentBg?: string;
  description: string;
}

export interface Macros {
  calories: number; // kcal
  protein: number;  // g
  carbs: number;    // g
  sugar: number;    // g
  fat: number;      // g
  satFat?: number;   // g
  caffeine: number; // mg
  sodium?: number;   // mg
}

export interface MilkOption {
  id: string;
  name: string;
  calDelta: number; // +/- kcal relative to default whole milk
  proteinDelta: number;
  fatDelta: number;
  sugarDelta: number;
  carbDelta?: number;
  isDairy: boolean;
  isDairyFree?: boolean;
  hasCeliacRisk?: boolean;
  celiacRisk?: boolean;
  allergens?: Allergen[];
  glycemicLevel?: string;
}

export interface SizeOption {
  id: string;
  name: string;
  volumeMl: number;
  multiplier: number; // e.g. Short=0.75, Tall=1.0, Grande=1.3, Venti=1.6
}

export interface NutritionSource {
  status: 'verified' | 'estimated' | 'unverified';
  label?: string;
  url?: string;
  verifiedAt?: string;
  servingBasis?: string;
  notes?: string;
}

export interface CatalogSource {
  url: string;
  checkedAt: string; // YYYY-MM-DD
  kind: 'official' | 'secondary';
}

export interface ImageSource {
  url: string;
  kind: 'official' | 'licensed_fallback';
  exactProduct: boolean;
}

export interface MenuItem {
  id: string;
  chainId: string;
  name: string;
  nameEn?: string;
  category: Category;
  description: string;
  image: string;
  isDrink: boolean;
  defaultSizeId?: string;
  defaultMilkId?: string;
  defaultSyrupPumps?: number;
  /** Configuration already represented by baseMacros (used by saved recipes). */
  baseCustomization?: CustomizationState;
  baseMacros: Macros;
  allergens: Allergen[];
  dietaryTags: DietaryPreference[];
  glycemicImpact?: 'Düşük' | 'Orta' | 'Yüksek';
  smartSwapNote?: string;
  smartSwapSaveKcal?: number;
  nutritionSource?: NutritionSource;
  /**
   * Catalog provenance for static catalog products. Optional at the type
   * level so user recipes loaded from localStorage (which carry no
   * provenance) stay valid; the automated catalog audit requires it on
   * every static MENU_ITEMS entry.
   */
  availability?: 'current' | 'seasonal';
  catalogSource?: CatalogSource;
  imageSource?: ImageSource;
}

export interface CustomizationState {
  sizeId: string;
  milkId: string;
  syrupPumps: number;
  hasWhippedCream: boolean;
  hasColdFoam: boolean;
  extraEspressoShots: number;
}

export interface BasketItem {
  id: string;
  item: MenuItem;
  customization: CustomizationState;
  calculatedMacros: Macros;
  calculatedAllergens: Allergen[];
  addedAt: Date;
}
