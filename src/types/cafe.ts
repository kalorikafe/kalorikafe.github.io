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

export type ProductKind = 'drink' | 'food';

/** The 14 allergen groups required by Turkish food-labelling rules. */
export type OfficialAllergen =
  | 'gluten'
  | 'crustaceans'
  | 'egg'
  | 'fish'
  | 'peanut'
  | 'soy'
  | 'milk'
  | 'nuts'
  | 'celery'
  | 'mustard'
  | 'sesame'
  | 'sulphites'
  | 'lupin'
  | 'molluscs';

/**
 * Compatibility values for saved user profiles created before the regulated
 * allergen migration. Static catalog rows are not allowed to use these.
 */
export type LegacyAllergen = 'lactose' | 'celiac_oat_risk';
export type Allergen = OfficialAllergen | LegacyAllergen;

export type FoodSensitivity = 'lactose';
export type CrossContactRisk = 'celiac_oat_risk';

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
  containsLactose?: boolean;
  crossContactRisks?: CrossContactRisk[];
  /** @deprecated Use crossContactRisks instead. */
  hasCeliacRisk?: boolean;
  /** @deprecated Use crossContactRisks instead. */
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

export type NutritionField = keyof Macros;
export type NutritionFieldStatus = 'official' | 'derived' | 'estimated' | 'unknown';

export interface NutritionSource {
  status: 'verified' | 'mixed' | 'estimated' | 'unverified';
  label?: string;
  url?: string;
  verifiedAt?: string;
  servingBasis?: string;
  notes?: string;
  /** Provenance of each displayed macro; the source URL applies to official/derived fields. */
  fieldStatus?: Partial<Record<NutritionField, NutritionFieldStatus>>;
}

export interface CatalogSource {
  url: string;
  checkedAt: string; // YYYY-MM-DD
  kind: 'official' | 'secondary' | 'legacy_unverified';
}

export interface AllergenSource {
  status: 'official' | 'mixed' | 'estimated' | 'unavailable';
  url?: string;
  checkedAt?: string;
  notes?: string;
}

export interface ImageSource {
  url: string;
  kind: 'official' | 'licensed_fallback';
  exactProduct: boolean;
  /** Human-readable attribution resolved by the tracked image provenance audit. */
  author?: string;
  license?: string;
  licenseUrl?: string;
  sourcePageUrl?: string;
  metadataVerification?: 'wikimedia_commons_api' | 'snapshot_license_with_canonical_url' | 'snapshot_only';
}

export interface MenuItem {
  id: string;
  chainId: string;
  name: string;
  nameEn?: string;
  category: Category;
  /** Canonical catalog discriminator. Required by the static catalog audit. */
  productKind?: ProductKind;
  description: string;
  image: string;
  /** @deprecated Compatibility mirror of productKind for saved recipes/UI migration. */
  isDrink: boolean;
  defaultSizeId?: string;
  defaultMilkId?: string;
  defaultSyrupPumps?: number;
  /** Configuration already represented by baseMacros (used by saved recipes). */
  baseCustomization?: CustomizationState;
  baseMacros: Macros;
  allergens: Allergen[];
  /** Separate from the regulated milk allergen; omitted means unknown. */
  containsLactose?: boolean;
  crossContactRisks?: CrossContactRisk[];
  allergenSource?: AllergenSource;
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

/** Static public-catalog row. Runtime validation and catalog:audit enforce it. */
export type CatalogItem = MenuItem & Required<Pick<MenuItem,
  'productKind' | 'availability' | 'catalogSource' | 'imageSource' | 'nutritionSource'
>>;

/** Local-only user recipe. It never enters chain counts, sitemap, or public URLs. */
export type CustomRecipeItem = MenuItem & {
  chainId: 'custom';
  productKind: 'drink';
  isDrink: true;
  baseCustomization: CustomizationState;
};
