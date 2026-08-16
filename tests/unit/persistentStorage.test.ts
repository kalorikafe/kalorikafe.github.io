import { describe, expect, it } from 'vitest';
import type { BasketItem, MenuItem } from '../../src/types/cafe';
import { DEFAULT_MACRO_PROFILE, DEFAULT_USER_GOALS } from '../../src/utils/macroGoals';
import {
  STORAGE_KEYS,
  STORAGE_QUARANTINE_KEY,
  appStorage,
  clearStorageQuarantine,
  discardQuarantinedStorage,
  listQuarantinedStorage,
  restoreQuarantinedStorage,
  type StorageEnvelope,
  type StorageLike,
  type StorageOptions,
} from '../../src/utils/persistentStorage';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const NOW = new Date('2026-08-11T10:30:00.000Z');

function options(storage: StorageLike | null): StorageOptions {
  return { storage, now: () => NOW };
}

function envelopeAt<T>(storage: MemoryStorage, key: string): StorageEnvelope<T> {
  return JSON.parse(storage.getItem(key)!) as StorageEnvelope<T>;
}

function menuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'custom_1',
    chainId: 'starbucks',
    name: 'Test Latte',
    category: 'espresso_iced',
    description: 'Test tarifi',
    image: '/images/menu/placeholder.webp',
    isDrink: true,
    defaultSizeId: 'tall',
    defaultMilkId: 'whole_milk',
    defaultSyrupPumps: 0,
    baseMacros: {
      calories: 100,
      protein: 4,
      carbs: 12,
      sugar: 10,
      fat: 4,
      caffeine: 75,
    },
    allergens: ['lactose'],
    dietaryTags: ['vegetarian'],
    ...overrides,
  };
}

function basketItem(overrides: Partial<BasketItem> = {}): BasketItem {
  const item = menuItem();
  return {
    id: 'basket_1',
    item,
    customization: {
      sizeId: 'tall',
      milkId: 'whole_milk',
      syrupPumps: 0,
      hasWhippedCream: false,
      hasColdFoam: false,
      extraEspressoShots: 0,
    },
    calculatedMacros: item.baseMacros,
    calculatedAllergens: ['lactose'],
    addedAt: new Date('2026-08-10T08:15:00.000Z'),
    ...overrides,
  };
}

describe('typed storage envelopes', () => {
  it('writes a current envelope and reads it without migration', () => {
    const storage = new MemoryStorage();
    const write = appStorage.favorites.save(['starbucks_latte'], options(storage));

    expect(write.ok).toBe(true);
    expect(envelopeAt<string[]>(storage, STORAGE_KEYS.favorites)).toEqual({
      version: 1,
      updatedAt: NOW.toISOString(),
      data: ['starbucks_latte'],
    });
    expect(appStorage.favorites.read(options(storage))).toEqual({
      value: ['starbucks_latte'],
      status: 'current',
      persisted: true,
    });
  });

  it('migrates an unwrapped legacy value in place', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.favorites, JSON.stringify(['a', 'b']));

    const result = appStorage.favorites.read(options(storage));

    expect(result).toMatchObject({ value: ['a', 'b'], status: 'migrated', persisted: true });
    expect(envelopeAt<string[]>(storage, STORAGE_KEYS.favorites)).toMatchObject({
      version: 1,
      data: ['a', 'b'],
    });
  });

  it('sanitizes partial arrays, quarantines the original and keeps valid data', () => {
    const storage = new MemoryStorage();
    const raw = JSON.stringify(['latte', 42, 'latte', '', 'mocha']);
    storage.setItem(STORAGE_KEYS.favorites, raw);

    const result = appStorage.favorites.read(options(storage));

    expect(result).toMatchObject({ value: ['latte', 'mocha'], status: 'recovered', persisted: true });
    expect(result.quarantineId).toBeTruthy();
    expect(envelopeAt<string[]>(storage, STORAGE_KEYS.favorites).data).toEqual(['latte', 'mocha']);
    expect(listQuarantinedStorage(options(storage))).toContainEqual(expect.objectContaining({
      id: result.quarantineId,
      originalKey: STORAGE_KEYS.favorites,
      rawValue: raw,
    }));
  });

  it('does not overwrite storage when a caller tries to save invalid runtime data', () => {
    const storage = new MemoryStorage();
    appStorage.favorites.save(['safe'], options(storage));
    const before = storage.getItem(STORAGE_KEYS.favorites);

    const write = appStorage.favorites.save({} as string[], options(storage));

    expect(write).toMatchObject({ ok: false, reason: 'invalid-data' });
    expect(storage.getItem(STORAGE_KEYS.favorites)).toBe(before);
  });
});

describe('corruption quarantine and recovery', () => {
  it('quarantines malformed JSON and replaces it with a safe default envelope', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.customRecipes, '{broken-json');

    const result = appStorage.customRecipes.read(options(storage));

    expect(result).toMatchObject({ value: [], status: 'corrupt', persisted: true });
    expect(envelopeAt<MenuItem[]>(storage, STORAGE_KEYS.customRecipes).data).toEqual([]);
    expect(listQuarantinedStorage(options(storage))).toEqual([
      expect.objectContaining({
        id: result.quarantineId,
        originalKey: STORAGE_KEYS.customRecipes,
        rawValue: '{broken-json',
        quarantinedAt: NOW.toISOString(),
      }),
    ]);
  });

  it('quarantines a structurally invalid value instead of returning it to the app', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.userAllergens, '{}');

    const result = appStorage.userAllergens.read(options(storage));

    expect(result).toMatchObject({ value: [], status: 'corrupt', persisted: true });
    expect(listQuarantinedStorage(options(storage))[0].reason).toContain('array');
  });

  it('preserves a future-version envelope in quarantine and falls back safely', () => {
    const storage = new MemoryStorage();
    const future = JSON.stringify({ version: 99, updatedAt: NOW.toISOString(), data: ['future'] });
    storage.setItem(STORAGE_KEYS.favorites, future);

    const result = appStorage.favorites.read(options(storage));

    expect(result).toMatchObject({ value: [], status: 'unsupported-version', persisted: true });
    expect(listQuarantinedStorage(options(storage))[0].rawValue).toBe(future);
  });

  it('can restore, discard and clear quarantined originals', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.favorites, '{}');
    const first = appStorage.favorites.read(options(storage));
    const firstId = first.quarantineId!;

    expect(restoreQuarantinedStorage(firstId, options(storage))).toBe(true);
    expect(storage.getItem(STORAGE_KEYS.favorites)).toBe('{}');
    expect(listQuarantinedStorage(options(storage))).toEqual([]);

    const second = appStorage.favorites.read(options(storage));
    expect(discardQuarantinedStorage(second.quarantineId!, options(storage))).toBe(true);
    expect(listQuarantinedStorage(options(storage))).toEqual([]);

    storage.setItem(STORAGE_KEYS.favorites, '{}');
    appStorage.favorites.read(options(storage));
    expect(storage.getItem(STORAGE_QUARANTINE_KEY)).not.toBeNull();
    expect(clearStorageQuarantine(options(storage))).toBe(true);
    expect(storage.getItem(STORAGE_QUARANTINE_KEY)).toBeNull();
  });

  it('returns defaults without throwing when storage is unavailable', () => {
    expect(appStorage.basket.read(options(null))).toEqual({
      value: [],
      status: 'unavailable',
      persisted: false,
    });
    expect(appStorage.basket.save([], options(null))).toEqual({ ok: false, reason: 'unavailable' });
  });
});

describe('domain decoders and legacy migrations', () => {
  it('migrates legacy custom recipes and drops invalid duplicate entries', () => {
    const storage = new MemoryStorage();
    const valid = menuItem();
    storage.setItem(STORAGE_KEYS.customRecipes, JSON.stringify([valid, valid, { id: 'broken' }]));

    const result = appStorage.customRecipes.read(options(storage));

    expect(result.status).toBe('recovered');
    expect(result.value).toHaveLength(1);
    expect(result.value[0]).toMatchObject({
      ...valid,
      chainId: 'custom',
      productKind: 'drink',
      nutritionSource: { status: 'estimated', label: 'Kullanıcı tarifi' },
    });
  });

  it('filters unknown and duplicate allergens while retaining supported values', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.userAllergens, JSON.stringify(['lactose', 'unknown', 'lactose', 'peanut']));

    const result = appStorage.userAllergens.read(options(storage));

    expect(result).toMatchObject({ value: ['lactose', 'peanut', 'milk'], status: 'recovered', persisted: true });
  });

  it('migrates legacy string booleans for the hide-allergens preference', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.hideAllergens, JSON.stringify('true'));

    const result = appStorage.hideAllergens.read(options(storage));

    expect(result).toMatchObject({ value: true, status: 'migrated', persisted: true });
    expect(envelopeAt<boolean>(storage, STORAGE_KEYS.hideAllergens).data).toBe(true);
  });

  it('migrates legacy goals and preserves their values while attaching a profile', () => {
    const storage = new MemoryStorage();
    const legacy = { calorieGoal: 1500, proteinGoal: 100, carbGoal: 180, fatGoal: 50, maxCaffeine: 300 };
    storage.setItem(STORAGE_KEYS.userGoals, JSON.stringify(legacy));

    const result = appStorage.userGoals.read(options(storage));

    expect(result).toMatchObject({ status: 'migrated', persisted: true });
    expect(result.value).toMatchObject(legacy);
    expect(result.value.profile).toEqual(DEFAULT_MACRO_PROFILE);
  });

  it('recovers partial goals field-by-field and quarantines the original', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEYS.userGoals, JSON.stringify({
      calorieGoal: 'bad',
      proteinGoal: 95,
      carbGoal: -1,
      fatGoal: 60,
      maxCaffeine: 250,
      profile: { gender: 'invalid' },
    }));

    const result = appStorage.userGoals.read(options(storage));

    expect(result.status).toBe('recovered');
    expect(result.value).toEqual({
      calorieGoal: DEFAULT_USER_GOALS.calorieGoal,
      proteinGoal: 95,
      carbGoal: DEFAULT_USER_GOALS.carbGoal,
      fatGoal: 60,
      maxCaffeine: 250,
      profile: DEFAULT_MACRO_PROFILE,
    });
    expect(result.quarantineId).toBeTruthy();
  });

  it('round-trips BasketItem.addedAt as a real Date', () => {
    const storage = new MemoryStorage();
    const original = basketItem();
    expect(appStorage.basket.save([original], options(storage)).ok).toBe(true);

    const serialized = envelopeAt<Array<{ addedAt: string }>>(storage, STORAGE_KEYS.basket);
    expect(serialized.data[0].addedAt).toBe('2026-08-10T08:15:00.000Z');

    const result = appStorage.basket.read(options(storage));
    expect(result.status).toBe('current');
    expect(result.value[0].addedAt).toBeInstanceOf(Date);
    expect(result.value[0].addedAt.toISOString()).toBe('2026-08-10T08:15:00.000Z');
  });

  it('preserves allergen evidence and licensed image attribution in saved basket items', () => {
    const storage = new MemoryStorage();
    const item = menuItem({
      allergenSource: { status: 'official', url: 'https://example.com/allergens', checkedAt: '2026-08-11' },
      imageSource: {
        url: 'https://commons.wikimedia.org/example',
        kind: 'licensed_fallback',
        exactProduct: false,
        author: 'Example Author',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
        metadataVerification: 'wikimedia_commons_api',
      },
    });
    expect(appStorage.basket.save([basketItem({ item })], options(storage)).ok).toBe(true);

    const restored = appStorage.basket.load(options(storage))[0].item;
    expect(restored.allergenSource).toEqual(item.allergenSource);
    expect(restored.imageSource).toEqual(item.imageSource);
  });

  it('recovers a legacy basket with partial customization and removes invalid entries', () => {
    const storage = new MemoryStorage();
    const valid = basketItem();
    const serialized = JSON.parse(JSON.stringify(valid)) as Record<string, unknown>;
    serialized.customization = { sizeId: 'grande' };
    storage.setItem(STORAGE_KEYS.basket, JSON.stringify([
      serialized,
      { id: 'broken', addedAt: 'not-a-date' },
    ]));

    const result = appStorage.basket.read(options(storage));

    expect(result.status).toBe('recovered');
    expect(result.value).toHaveLength(1);
    expect(result.value[0].addedAt).toBeInstanceOf(Date);
    expect(result.value[0].customization).toEqual({
      sizeId: 'grande',
      milkId: 'whole_milk',
      syrupPumps: 0,
      hasWhippedCream: false,
      hasColdFoam: false,
      extraEspressoShots: 0,
    });
  });
});
