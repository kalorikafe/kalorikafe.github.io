import type {
  Allergen,
  AllergenSource,
  BasketItem,
  CatalogSource,
  Category,
  CustomizationState,
  DietaryPreference,
  ImageSource,
  Macros,
  MenuItem,
  NutritionSource,
} from '../types/cafe';
import {
  DEFAULT_MACRO_PROFILE,
  DEFAULT_USER_GOALS,
  normalizeStoredGoals,
  type MacroProfile,
  type UserMacroGoals,
} from './macroGoals';

export const STORAGE_SCHEMA_VERSION = 1 as const;
export const STORAGE_QUARANTINE_KEY = 'kalori_cafe_storage_quarantine';

export const STORAGE_KEYS = {
  customRecipes: 'kalori_cafe_custom_recipes',
  favorites: 'kalori_cafe_favorites',
  userAllergens: 'kalori_cafe_allergens',
  hideAllergens: 'kalori_cafe_hide_allergens',
  basket: 'kalori_cafe_basket',
  userGoals: 'kalori_cafe_goals',
} as const;

const MAX_QUARANTINE_RECORDS = 20;

export interface StorageEnvelope<T> {
  version: number;
  updatedAt: string;
  data: T;
}

/** Minimal browser Storage contract, kept injectable for SSR and unit tests. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface StorageOptions {
  /** Pass `null` to explicitly disable persistence (for example during SSR). */
  storage?: StorageLike | null;
  /** Injectable clock keeps migrations and tests deterministic. */
  now?: () => Date;
}

export type StorageReadStatus =
  | 'missing'
  | 'current'
  | 'migrated'
  | 'recovered'
  | 'corrupt'
  | 'unsupported-version'
  | 'unavailable';

export interface StorageReadResult<T> {
  value: T;
  status: StorageReadStatus;
  /** Whether the value returned to the caller is also stored in a current envelope. */
  persisted: boolean;
  issue?: string;
  quarantineId?: string;
}

export type StorageWriteResult<T> =
  | { ok: true; envelope: StorageEnvelope<T> }
  | { ok: false; reason: 'unavailable' | 'invalid-data' | 'write-failed'; issue?: string };

export interface QuarantinedStorageRecord {
  id: string;
  originalKey: string;
  quarantinedAt: string;
  reason: string;
  /** Original serialized value, retained so a newer app can restore it. */
  rawValue: string;
}

export interface TypedStorageSlot<T> {
  readonly key: string;
  readonly version: number;
  read(options?: StorageOptions): StorageReadResult<T>;
  load(options?: StorageOptions): T;
  save(value: T, options?: StorageOptions): StorageWriteResult<T>;
  clear(options?: StorageOptions): boolean;
}

type DecodeResult<T> =
  | { ok: true; value: T; recovered: boolean; issue?: string }
  | { ok: false; issue: string };

interface SlotDefinition<T> {
  key: string;
  version: number;
  defaultValue: () => T;
  decode: (value: unknown) => DecodeResult<T>;
}

const CATEGORIES = new Set<Category>([
  'espresso_hot',
  'espresso_iced',
  'cold_brew',
  'frappe_blended',
  'tea_herbal',
  'smoothie_juice',
  'bakery_dessert',
  'sandwich_savory',
  'fit_healthy',
]);

const ALLERGENS = new Set<Allergen>([
  'gluten',
  'crustaceans',
  'egg',
  'fish',
  'peanut',
  'soy',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs',
  'lactose',
  'celiac_oat_risk',
]);

const DIETARY_PREFERENCES = new Set<DietaryPreference>([
  'vegan',
  'vegetarian',
  'gluten_free',
  'lactose_free',
  'sugar_free',
  'high_protein',
  'low_calorie',
]);

function success<T>(value: T, recovered = false, issue?: string): DecodeResult<T> {
  return { ok: true, value, recovered, ...(issue ? { issue } : {}) };
}

function failure<T>(issue: string): DecodeResult<T> {
  return { ok: false, issue };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function decodeMacros(value: unknown): DecodeResult<Macros> {
  if (!isRecord(value)) return failure('macros must be an object');

  const required = ['calories', 'protein', 'carbs', 'sugar', 'fat', 'caffeine'] as const;
  if (!required.every(field => isFiniteNonNegative(value[field]))) {
    return failure('macros contain a missing, negative, or non-finite required value');
  }

  const macros: Macros = {
    calories: value.calories as number,
    protein: value.protein as number,
    carbs: value.carbs as number,
    sugar: value.sugar as number,
    fat: value.fat as number,
    caffeine: value.caffeine as number,
  };
  let recovered = false;

  for (const field of ['satFat', 'sodium'] as const) {
    const candidate = value[field];
    if (candidate === undefined) continue;
    if (isFiniteNonNegative(candidate)) macros[field] = candidate;
    else recovered = true;
  }

  return success(macros, recovered, recovered ? 'invalid optional macro fields were removed' : undefined);
}

function decodeEnumList<T extends string>(value: unknown, allowed: ReadonlySet<T>): DecodeResult<T[]> {
  if (!Array.isArray(value)) return failure('expected an array');
  const decoded: T[] = [];
  let recovered = false;

  for (const candidate of value) {
    if (typeof candidate !== 'string' || !allowed.has(candidate as T) || decoded.includes(candidate as T)) {
      recovered = true;
      continue;
    }
    decoded.push(candidate as T);
  }

  return success(decoded, recovered, recovered ? 'invalid or duplicate list values were removed' : undefined);
}

function decodeStringList(value: unknown): DecodeResult<string[]> {
  if (!Array.isArray(value)) return failure('expected an array of strings');
  const decoded: string[] = [];
  let recovered = false;

  for (const candidate of value) {
    if (!isNonEmptyString(candidate) || decoded.includes(candidate)) {
      recovered = true;
      continue;
    }
    decoded.push(candidate);
  }

  return success(decoded, recovered, recovered ? 'invalid or duplicate string values were removed' : undefined);
}

function decodeCustomization(
  value: unknown,
  defaults: Partial<CustomizationState> = {},
): DecodeResult<CustomizationState> {
  if (!isRecord(value)) return failure('customization must be an object');
  let recovered = false;

  const stringField = (field: 'sizeId' | 'milkId', fallback: string): string => {
    if (isNonEmptyString(value[field])) return value[field];
    recovered = true;
    return fallback;
  };
  const numberField = (field: 'syrupPumps' | 'extraEspressoShots', fallback: number): number => {
    if (isFiniteNonNegative(value[field])) return value[field];
    recovered = true;
    return fallback;
  };
  const booleanField = (field: 'hasWhippedCream' | 'hasColdFoam', fallback: boolean): boolean => {
    if (typeof value[field] === 'boolean') return value[field];
    recovered = true;
    return fallback;
  };

  return success(
    {
      sizeId: stringField('sizeId', defaults.sizeId ?? 'tall'),
      milkId: stringField('milkId', defaults.milkId ?? 'whole_milk'),
      syrupPumps: numberField('syrupPumps', defaults.syrupPumps ?? 0),
      hasWhippedCream: booleanField('hasWhippedCream', defaults.hasWhippedCream ?? false),
      hasColdFoam: booleanField('hasColdFoam', defaults.hasColdFoam ?? false),
      extraEspressoShots: numberField('extraEspressoShots', defaults.extraEspressoShots ?? 0),
    },
    recovered,
    recovered ? 'missing or invalid customization fields were defaulted' : undefined,
  );
}

function optionalString(
  source: Record<string, unknown>,
  field: string,
): { value?: string; recovered: boolean } {
  const candidate = source[field];
  if (candidate === undefined) return { recovered: false };
  return isNonEmptyString(candidate) ? { value: candidate, recovered: false } : { recovered: true };
}

function optionalNumber(
  source: Record<string, unknown>,
  field: string,
): { value?: number; recovered: boolean } {
  const candidate = source[field];
  if (candidate === undefined) return { recovered: false };
  return isFiniteNonNegative(candidate) ? { value: candidate, recovered: false } : { recovered: true };
}

function decodeNutritionSource(value: unknown): DecodeResult<NutritionSource | undefined> {
  if (value === undefined) return success(undefined);
  if (!isRecord(value) || !['verified', 'mixed', 'estimated', 'unverified'].includes(String(value.status))) {
    return success(undefined, true, 'invalid nutrition source was removed');
  }

  const source: NutritionSource = {
    status: value.status as NutritionSource['status'],
  };
  let recovered = false;
  for (const field of ['label', 'url', 'verifiedAt', 'servingBasis', 'notes'] as const) {
    const decoded = optionalString(value, field);
    recovered ||= decoded.recovered;
    if (decoded.value !== undefined) source[field] = decoded.value;
  }
  if (value.fieldStatus !== undefined) {
    if (isRecord(value.fieldStatus)) {
      const statuses = ['official', 'derived', 'estimated', 'unknown'];
      const decoded = Object.fromEntries(Object.entries(value.fieldStatus).filter(([, status]) => statuses.includes(String(status))));
      source.fieldStatus = decoded;
      recovered ||= Object.keys(decoded).length !== Object.keys(value.fieldStatus).length;
    } else recovered = true;
  }
  return success(source, recovered, recovered ? 'invalid nutrition source fields were removed' : undefined);
}

function decodeCatalogSource(value: unknown): DecodeResult<CatalogSource | undefined> {
  if (value === undefined) return success(undefined);
  if (
    !isRecord(value)
    || !isNonEmptyString(value.url)
    || !isNonEmptyString(value.checkedAt)
    || (value.kind !== 'official' && value.kind !== 'secondary' && value.kind !== 'legacy_unverified')
  ) {
    return success(undefined, true, 'invalid catalog source was removed');
  }
  return success({ url: value.url, checkedAt: value.checkedAt, kind: value.kind });
}

function decodeImageSource(value: unknown): DecodeResult<ImageSource | undefined> {
  if (value === undefined) return success(undefined);
  if (
    !isRecord(value)
    || !isNonEmptyString(value.url)
    || (value.kind !== 'official' && value.kind !== 'licensed_fallback')
    || typeof value.exactProduct !== 'boolean'
  ) {
    return success(undefined, true, 'invalid image source was removed');
  }
  const source: ImageSource = { url: value.url, kind: value.kind, exactProduct: value.exactProduct };
  let recovered = false;
  for (const field of ['author', 'license', 'licenseUrl', 'sourcePageUrl'] as const) {
    const decoded = optionalString(value, field);
    recovered ||= decoded.recovered;
    if (decoded.value !== undefined) source[field] = decoded.value;
  }
  if (value.metadataVerification !== undefined) {
    const allowed = ['wikimedia_commons_api', 'snapshot_license_with_canonical_url', 'snapshot_only'];
    if (allowed.includes(String(value.metadataVerification))) {
      source.metadataVerification = value.metadataVerification as ImageSource['metadataVerification'];
    } else recovered = true;
  }
  return success(source, recovered, recovered ? 'invalid image attribution fields were removed' : undefined);
}

function decodeAllergenSource(value: unknown): DecodeResult<AllergenSource | undefined> {
  if (value === undefined) return success(undefined);
  if (!isRecord(value) || !['official', 'mixed', 'estimated', 'unavailable'].includes(String(value.status))) {
    return success(undefined, true, 'invalid allergen source was removed');
  }
  const source: AllergenSource = { status: value.status as AllergenSource['status'] };
  let recovered = false;
  for (const field of ['url', 'checkedAt', 'notes'] as const) {
    const decoded = optionalString(value, field);
    recovered ||= decoded.recovered;
    if (decoded.value !== undefined) source[field] = decoded.value;
  }
  return success(source, recovered, recovered ? 'invalid allergen source fields were removed' : undefined);
}

function decodeMenuItem(value: unknown): DecodeResult<MenuItem> {
  if (!isRecord(value)) return failure('menu item must be an object');
  const productKind = value.productKind === 'drink' || value.productKind === 'food'
    ? value.productKind
    : typeof value.isDrink === 'boolean'
      ? value.isDrink ? 'drink' : 'food'
      : null;
  if (
    !isNonEmptyString(value.id)
    || !isNonEmptyString(value.chainId)
    || !isNonEmptyString(value.name)
    || !isNonEmptyString(value.description)
    || !isNonEmptyString(value.image)
    || productKind === null
    || !CATEGORIES.has(value.category as Category)
  ) {
    return failure('menu item has invalid required identity fields');
  }

  const macros = decodeMacros(value.baseMacros);
  if (!macros.ok) return failure(`menu item ${value.id}: ${macros.issue}`);

  const allergens = value.allergens === undefined
    ? success<Allergen[]>([], true, 'missing allergens defaulted to an empty list')
    : decodeEnumList(value.allergens, ALLERGENS);
  const dietaryTags = value.dietaryTags === undefined
    ? success<DietaryPreference[]>([], true, 'missing dietary tags defaulted to an empty list')
    : decodeEnumList(value.dietaryTags, DIETARY_PREFERENCES);
  if (!allergens.ok || !dietaryTags.ok) return failure(`menu item ${value.id}: invalid tag lists`);

  let recovered = macros.recovered || allergens.recovered || dietaryTags.recovered;
  const item: MenuItem = {
    id: value.id,
    chainId: value.chainId,
    name: value.name,
    category: value.category as Category,
    description: value.description,
    image: value.image,
    productKind,
    isDrink: productKind === 'drink',
    baseMacros: macros.value,
    allergens: allergens.value,
    dietaryTags: dietaryTags.value,
  };

  const nameEn = optionalString(value, 'nameEn');
  const defaultSizeId = optionalString(value, 'defaultSizeId');
  const defaultMilkId = optionalString(value, 'defaultMilkId');
  const defaultSyrupPumps = optionalNumber(value, 'defaultSyrupPumps');
  const smartSwapNote = optionalString(value, 'smartSwapNote');
  const smartSwapSaveKcal = optionalNumber(value, 'smartSwapSaveKcal');
  recovered ||= nameEn.recovered || defaultSizeId.recovered || defaultMilkId.recovered
    || defaultSyrupPumps.recovered || smartSwapNote.recovered || smartSwapSaveKcal.recovered;

  if (nameEn.value !== undefined) item.nameEn = nameEn.value;
  if (defaultSizeId.value !== undefined) item.defaultSizeId = defaultSizeId.value;
  if (defaultMilkId.value !== undefined) item.defaultMilkId = defaultMilkId.value;
  if (defaultSyrupPumps.value !== undefined) item.defaultSyrupPumps = defaultSyrupPumps.value;
  if (smartSwapNote.value !== undefined) item.smartSwapNote = smartSwapNote.value;
  if (smartSwapSaveKcal.value !== undefined) item.smartSwapSaveKcal = smartSwapSaveKcal.value;

  if (value.baseCustomization !== undefined) {
    const customization = decodeCustomization(value.baseCustomization, {
      sizeId: item.defaultSizeId,
      milkId: item.defaultMilkId,
      syrupPumps: item.defaultSyrupPumps,
    });
    if (customization.ok) {
      item.baseCustomization = customization.value;
      recovered ||= customization.recovered;
    } else {
      recovered = true;
    }
  }

  if (value.glycemicImpact !== undefined) {
    if (value.glycemicImpact === 'Düşük' || value.glycemicImpact === 'Orta' || value.glycemicImpact === 'Yüksek') {
      item.glycemicImpact = value.glycemicImpact;
    } else recovered = true;
  }

  if (value.availability !== undefined) {
    if (value.availability === 'current' || value.availability === 'seasonal') item.availability = value.availability;
    else recovered = true;
  }

  if (value.containsLactose !== undefined) {
    if (typeof value.containsLactose === 'boolean') item.containsLactose = value.containsLactose;
    else recovered = true;
  }
  if (value.crossContactRisks !== undefined) {
    const risks = decodeEnumList(value.crossContactRisks, new Set(['celiac_oat_risk'] as const));
    if (risks.ok) {
      item.crossContactRisks = risks.value;
      recovered ||= risks.recovered;
    } else recovered = true;
  }

  const nutritionSource = decodeNutritionSource(value.nutritionSource);
  const catalogSource = decodeCatalogSource(value.catalogSource);
  const imageSource = decodeImageSource(value.imageSource);
  const allergenSource = decodeAllergenSource(value.allergenSource);
  if (nutritionSource.ok && nutritionSource.value !== undefined) item.nutritionSource = nutritionSource.value;
  if (catalogSource.ok && catalogSource.value !== undefined) item.catalogSource = catalogSource.value;
  if (imageSource.ok && imageSource.value !== undefined) item.imageSource = imageSource.value;
  if (allergenSource.ok && allergenSource.value !== undefined) item.allergenSource = allergenSource.value;
  recovered ||= (nutritionSource.ok && nutritionSource.recovered)
    || (catalogSource.ok && catalogSource.recovered)
    || (imageSource.ok && imageSource.recovered)
    || (allergenSource.ok && allergenSource.recovered);

  return success(item, recovered, recovered ? `menu item ${item.id} was sanitized` : undefined);
}

function decodeMenuItemList(value: unknown): DecodeResult<MenuItem[]> {
  if (!Array.isArray(value)) return failure('custom recipes must be an array');
  const items: MenuItem[] = [];
  const ids = new Set<string>();
  let recovered = false;

  for (const candidate of value) {
    const decoded = decodeMenuItem(candidate);
    if (!decoded.ok || ids.has(decoded.value.id)) {
      recovered = true;
      continue;
    }
    ids.add(decoded.value.id);
    items.push({
      ...decoded.value,
      chainId: 'custom',
      catalogSource: undefined,
      imageSource: undefined,
      nutritionSource: decoded.value.nutritionSource ?? { status: 'estimated', label: 'Kullanıcı tarifi' },
    });
    recovered ||= decoded.recovered;
  }

  return success(items, recovered, recovered ? 'invalid or duplicate custom recipes were removed' : undefined);
}

function decodeBasketItem(value: unknown): DecodeResult<BasketItem> {
  if (!isRecord(value) || !isNonEmptyString(value.id)) return failure('basket item has no valid id');

  const item = decodeMenuItem(value.item);
  const macros = decodeMacros(value.calculatedMacros);
  const allergens = decodeEnumList(value.calculatedAllergens, ALLERGENS);
  if (!item.ok || !macros.ok || !allergens.ok) return failure(`basket item ${value.id} has invalid product data`);

  const customization = decodeCustomization(value.customization, {
    sizeId: item.value.defaultSizeId,
    milkId: item.value.defaultMilkId,
    syrupPumps: item.value.defaultSyrupPumps,
  });
  if (!customization.ok) return failure(`basket item ${value.id} has invalid customization`);

  const addedAt = value.addedAt instanceof Date
    ? new Date(value.addedAt.getTime())
    : typeof value.addedAt === 'string' || typeof value.addedAt === 'number'
      ? new Date(value.addedAt)
      : null;
  if (addedAt === null || !Number.isFinite(addedAt.getTime())) {
    return failure(`basket item ${value.id} has an invalid addedAt date`);
  }

  return success(
    {
      id: value.id,
      item: item.value,
      customization: customization.value,
      calculatedMacros: macros.value,
      calculatedAllergens: allergens.value,
      addedAt,
    },
    item.recovered || customization.recovered || macros.recovered || allergens.recovered,
  );
}

function decodeBasket(value: unknown): DecodeResult<BasketItem[]> {
  if (!Array.isArray(value)) return failure('basket must be an array');
  const basket: BasketItem[] = [];
  const ids = new Set<string>();
  let recovered = false;

  for (const candidate of value) {
    const decoded = decodeBasketItem(candidate);
    if (!decoded.ok || ids.has(decoded.value.id)) {
      recovered = true;
      continue;
    }
    ids.add(decoded.value.id);
    basket.push(decoded.value);
    recovered ||= decoded.recovered;
  }

  return success(basket, recovered, recovered ? 'invalid or duplicate basket entries were removed' : undefined);
}

function isValidProfile(value: unknown): value is MacroProfile {
  if (!isRecord(value)) return false;
  return (value.gender === 'male' || value.gender === 'female')
    && (value.goalType === 'lose' || value.goalType === 'maintain' || value.goalType === 'gain')
    && ['age', 'weightKg', 'heightCm', 'activity'].every(field => isFiniteNonNegative(value[field]));
}

function cloneDefaultGoals(): UserMacroGoals {
  return { ...DEFAULT_USER_GOALS, profile: { ...DEFAULT_MACRO_PROFILE } };
}

function decodeUserGoals(value: unknown): DecodeResult<UserMacroGoals> {
  if (!isRecord(value)) return failure('user goals must be an object');
  const numericFields = ['calorieGoal', 'proteinGoal', 'carbGoal', 'fatGoal', 'maxCaffeine'] as const;
  const recoveredNumericField = numericFields.some(field => !isFiniteNonNegative(value[field]));
  const recoveredProfile = value.profile !== undefined && !isValidProfile(value.profile);
  const recovered = recoveredNumericField || recoveredProfile;
  return success(
    normalizeStoredGoals(value),
    recovered,
    recovered ? 'invalid goal fields were replaced with safe defaults' : undefined,
  );
}

function decodeBoolean(value: unknown): DecodeResult<boolean> {
  if (typeof value === 'boolean') return success(value);
  if (value === 'true') return success(true);
  if (value === 'false') return success(false);
  return failure('expected a boolean');
}

function resolveStorage(options: StorageOptions): StorageLike | null {
  if (options.storage !== undefined) return options.storage;
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function timestamp(options: StorageOptions): string {
  const candidate = options.now?.() ?? new Date();
  return Number.isFinite(candidate.getTime()) ? candidate.toISOString() : new Date().toISOString();
}

function isEnvelope(value: unknown): value is StorageEnvelope<unknown> {
  return isRecord(value) && Object.hasOwn(value, 'version') && Object.hasOwn(value, 'data');
}

function hasValidTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function decodeQuarantineRecords(value: unknown): QuarantinedStorageRecord[] {
  const payload = isEnvelope(value) ? value.data : value;
  if (!Array.isArray(payload)) return [];
  return payload.flatMap(candidate => {
    if (
      !isRecord(candidate)
      || !isNonEmptyString(candidate.id)
      || !isNonEmptyString(candidate.originalKey)
      || !hasValidTimestamp(candidate.quarantinedAt)
      || !isNonEmptyString(candidate.reason)
      || typeof candidate.rawValue !== 'string'
    ) return [];
    return [{
      id: candidate.id,
      originalKey: candidate.originalKey,
      quarantinedAt: candidate.quarantinedAt,
      reason: candidate.reason,
      rawValue: candidate.rawValue,
    }];
  });
}

function readQuarantine(storage: StorageLike): QuarantinedStorageRecord[] {
  try {
    const raw = storage.getItem(STORAGE_QUARANTINE_KEY);
    return raw === null ? [] : decodeQuarantineRecords(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeQuarantine(
  storage: StorageLike,
  records: QuarantinedStorageRecord[],
  options: StorageOptions,
): boolean {
  try {
    const envelope: StorageEnvelope<QuarantinedStorageRecord[]> = {
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: timestamp(options),
      data: records.slice(0, MAX_QUARANTINE_RECORDS),
    };
    storage.setItem(STORAGE_QUARANTINE_KEY, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

function quarantineRaw(
  storage: StorageLike,
  originalKey: string,
  rawValue: string,
  reason: string,
  options: StorageOptions,
): string | undefined {
  const quarantinedAt = timestamp(options);
  const id = `${originalKey}:${quarantinedAt}:${Math.random().toString(36).slice(2, 9)}`;
  const record: QuarantinedStorageRecord = { id, originalKey, quarantinedAt, reason, rawValue };
  return writeQuarantine(storage, [record, ...readQuarantine(storage)], options) ? id : undefined;
}

function writeKnownGood<T>(
  definition: SlotDefinition<T>,
  storage: StorageLike,
  value: T,
  options: StorageOptions,
): StorageWriteResult<T> {
  const envelope: StorageEnvelope<T> = {
    version: definition.version,
    updatedAt: timestamp(options),
    data: value,
  };
  try {
    storage.setItem(definition.key, JSON.stringify(envelope));
    return { ok: true, envelope };
  } catch (error) {
    return { ok: false, reason: 'write-failed', issue: error instanceof Error ? error.message : 'storage write failed' };
  }
}

function recoverCorrupt<T>(
  definition: SlotDefinition<T>,
  storage: StorageLike,
  rawValue: string,
  status: 'corrupt' | 'unsupported-version',
  issue: string,
  options: StorageOptions,
): StorageReadResult<T> {
  const value = definition.defaultValue();
  const quarantineId = quarantineRaw(storage, definition.key, rawValue, issue, options);
  if (quarantineId === undefined) {
    return { value, status, persisted: false, issue };
  }

  try {
    storage.removeItem(definition.key);
  } catch {
    // The original is still recoverable through the quarantine copy.
  }
  const write = writeKnownGood(definition, storage, value, options);
  return {
    value,
    status,
    persisted: write.ok,
    issue,
    quarantineId,
  };
}

function readSlot<T>(definition: SlotDefinition<T>, options: StorageOptions = {}): StorageReadResult<T> {
  const storage = resolveStorage(options);
  if (storage === null) {
    return { value: definition.defaultValue(), status: 'unavailable', persisted: false };
  }

  let rawValue: string | null;
  try {
    rawValue = storage.getItem(definition.key);
  } catch (error) {
    return {
      value: definition.defaultValue(),
      status: 'unavailable',
      persisted: false,
      issue: error instanceof Error ? error.message : 'storage read failed',
    };
  }
  if (rawValue === null) return { value: definition.defaultValue(), status: 'missing', persisted: false };

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return recoverCorrupt(definition, storage, rawValue, 'corrupt', 'stored value is not valid JSON', options);
  }

  let payload = parsed;
  let migrated = false;
  let envelopeTimestampValid = true;
  if (isEnvelope(parsed)) {
    if (!Number.isInteger(parsed.version) || parsed.version < 0) {
      return recoverCorrupt(definition, storage, rawValue, 'corrupt', 'storage envelope has an invalid version', options);
    }
    if (parsed.version > definition.version) {
      return recoverCorrupt(
        definition,
        storage,
        rawValue,
        'unsupported-version',
        `storage version ${parsed.version} is newer than supported version ${definition.version}`,
        options,
      );
    }
    payload = parsed.data;
    migrated = parsed.version < definition.version;
    envelopeTimestampValid = hasValidTimestamp(parsed.updatedAt);
  } else if (isRecord(parsed) && ('version' in parsed || 'data' in parsed || 'updatedAt' in parsed)) {
    return recoverCorrupt(definition, storage, rawValue, 'corrupt', 'storage envelope is incomplete', options);
  } else {
    migrated = true;
  }

  const decoded = definition.decode(payload);
  if (!decoded.ok) {
    return recoverCorrupt(definition, storage, rawValue, 'corrupt', decoded.issue, options);
  }

  const recovered = decoded.recovered || !envelopeTimestampValid;
  let quarantineId: string | undefined;
  if (recovered) {
    quarantineId = quarantineRaw(
      storage,
      definition.key,
      rawValue,
      decoded.issue ?? 'invalid envelope metadata or fields were sanitized',
      options,
    );
    if (quarantineId === undefined) {
      return {
        value: decoded.value,
        status: 'recovered',
        persisted: false,
        issue: decoded.issue,
      };
    }
  }

  if (migrated || recovered) {
    const write = writeKnownGood(definition, storage, decoded.value, options);
    return {
      value: decoded.value,
      status: recovered ? 'recovered' : 'migrated',
      persisted: write.ok,
      ...(decoded.issue ? { issue: decoded.issue } : {}),
      ...(quarantineId ? { quarantineId } : {}),
    };
  }

  return { value: decoded.value, status: 'current', persisted: true };
}

function createStorageSlot<T>(definition: SlotDefinition<T>): TypedStorageSlot<T> {
  return {
    key: definition.key,
    version: definition.version,
    read: options => readSlot(definition, options),
    load: options => readSlot(definition, options).value,
    save: (value, options = {}) => {
      const storage = resolveStorage(options);
      if (storage === null) return { ok: false, reason: 'unavailable' };
      const decoded = definition.decode(value);
      if (!decoded.ok) return { ok: false, reason: 'invalid-data', issue: decoded.issue };
      return writeKnownGood(definition, storage, decoded.value, options);
    },
    clear: (options = {}) => {
      const storage = resolveStorage(options);
      if (storage === null) return false;
      try {
        storage.removeItem(definition.key);
        return true;
      } catch {
        return false;
      }
    },
  };
}

export function listQuarantinedStorage(options: StorageOptions = {}): QuarantinedStorageRecord[] {
  const storage = resolveStorage(options);
  return storage === null ? [] : readQuarantine(storage);
}

/** Restore the untouched serialized value for inspection by this or a newer app version. */
export function restoreQuarantinedStorage(id: string, options: StorageOptions = {}): boolean {
  const storage = resolveStorage(options);
  if (storage === null) return false;
  const records = readQuarantine(storage);
  const record = records.find(candidate => candidate.id === id);
  if (!record) return false;

  try {
    storage.setItem(record.originalKey, record.rawValue);
  } catch {
    return false;
  }
  return writeQuarantine(storage, records.filter(candidate => candidate.id !== id), options);
}

export function discardQuarantinedStorage(id: string, options: StorageOptions = {}): boolean {
  const storage = resolveStorage(options);
  if (storage === null) return false;
  const records = readQuarantine(storage);
  if (!records.some(candidate => candidate.id === id)) return false;
  return writeQuarantine(storage, records.filter(candidate => candidate.id !== id), options);
}

export function clearStorageQuarantine(options: StorageOptions = {}): boolean {
  const storage = resolveStorage(options);
  if (storage === null) return false;
  try {
    storage.removeItem(STORAGE_QUARANTINE_KEY);
    return true;
  } catch {
    return false;
  }
}

export const customRecipesStorage = createStorageSlot<MenuItem[]>({
  key: STORAGE_KEYS.customRecipes,
  version: STORAGE_SCHEMA_VERSION,
  defaultValue: () => [],
  decode: decodeMenuItemList,
});

export const favoritesStorage = createStorageSlot<string[]>({
  key: STORAGE_KEYS.favorites,
  version: STORAGE_SCHEMA_VERSION,
  defaultValue: () => [],
  decode: decodeStringList,
});

export const userAllergensStorage = createStorageSlot<Allergen[]>({
  key: STORAGE_KEYS.userAllergens,
  version: STORAGE_SCHEMA_VERSION,
  defaultValue: () => [],
  decode: value => {
    const decoded = decodeEnumList(value, ALLERGENS);
    if (!decoded.ok || !decoded.value.includes('lactose') || decoded.value.includes('milk')) return decoded;
    return success([...decoded.value, 'milk'], true, 'legacy Süt/Laktoz seçimi süt alerjeni ve laktoz hassasiyeti olarak ayrıldı');
  },
});

export const hideAllergensStorage = createStorageSlot<boolean>({
  key: STORAGE_KEYS.hideAllergens,
  version: STORAGE_SCHEMA_VERSION,
  defaultValue: () => false,
  decode: decodeBoolean,
});

export const basketStorage = createStorageSlot<BasketItem[]>({
  key: STORAGE_KEYS.basket,
  version: STORAGE_SCHEMA_VERSION,
  defaultValue: () => [],
  decode: decodeBasket,
});

export const userGoalsStorage = createStorageSlot<UserMacroGoals>({
  key: STORAGE_KEYS.userGoals,
  version: STORAGE_SCHEMA_VERSION,
  defaultValue: cloneDefaultGoals,
  decode: decodeUserGoals,
});

/** Grouped API for concise App integration while retaining individually tree-shakeable exports. */
export const appStorage = {
  customRecipes: customRecipesStorage,
  favorites: favoritesStorage,
  userAllergens: userAllergensStorage,
  hideAllergens: hideAllergensStorage,
  basket: basketStorage,
  userGoals: userGoalsStorage,
} as const;
