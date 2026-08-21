import type { MenuItem } from '../types/cafe';

interface CatalogManifest {
  schemaVersion: number;
  count: number;
  sha256: string;
  file: string;
}

interface CatalogPayload {
  schemaVersion: number;
  items: MenuItem[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isManifest = (value: unknown): value is CatalogManifest => {
  if (!isRecord(value)) return false;
  return value.schemaVersion === 1
    && Number.isInteger(value.count)
    && typeof value.sha256 === 'string'
    && /^[a-f0-9]{64}$/.test(value.sha256)
    && typeof value.file === 'string'
    && /^catalog\.[a-f0-9]{12}\.json$/.test(value.file);
};

const isMenuItem = (value: unknown): value is MenuItem => {
  if (!isRecord(value) || !isRecord(value.baseMacros)) return false;
  const macros = value.baseMacros;
  return typeof value.id === 'string'
    && typeof value.chainId === 'string'
    && typeof value.name === 'string'
    && typeof value.category === 'string'
    && typeof value.description === 'string'
    && typeof value.image === 'string'
    && (value.productKind === 'drink' || value.productKind === 'food' || typeof value.isDrink === 'boolean')
    && Array.isArray(value.allergens)
    && Array.isArray(value.dietaryTags)
    && ['calories', 'protein', 'carbs', 'sugar', 'fat', 'caffeine']
      .every(field => typeof macros[field] === 'number' && Number.isFinite(macros[field]));
};

const catalogUrl = (file: string): string => {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}data/${file}`;
};

const sha256 = async (value: string): Promise<string> => {
  if (!globalThis.crypto?.subtle) throw new Error('Katalog bütünlük denetimi bu tarayıcıda desteklenmiyor.');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
};

let catalogPromise: Promise<readonly MenuItem[]> | undefined;

export const loadCatalog = async (): Promise<readonly MenuItem[]> => {
  catalogPromise ??= (async () => {
    const manifestResponse = await fetch(catalogUrl('catalog-manifest.json'), { cache: 'no-cache' });
    if (!manifestResponse.ok) {
      throw new Error(`Katalog manifesti yüklenemedi (${manifestResponse.status}).`);
    }

    const manifest: unknown = await manifestResponse.json();
    if (!isManifest(manifest)) {
      throw new Error('Katalog manifesti beklenen biçimde değil.');
    }

    const catalogResponse = await fetch(catalogUrl(manifest.file), { cache: 'force-cache' });
    if (!catalogResponse.ok) {
      throw new Error(`Katalog yüklenemedi (${catalogResponse.status}).`);
    }

    const serialized = await catalogResponse.text();
    if (await sha256(serialized.trimEnd()) !== manifest.sha256) {
      throw new Error('Katalog dosyasının SHA-256 özeti manifestle eşleşmiyor.');
    }
    let payload: unknown;
    try {
      payload = JSON.parse(serialized);
    } catch {
      throw new Error('Katalog dosyası geçerli JSON değil.');
    }
    if (!isRecord(payload) || payload.schemaVersion !== manifest.schemaVersion || !Array.isArray(payload.items)) {
      throw new Error('Katalog dosyasının sürümü veya biçimi geçersiz.');
    }
    if (payload.items.length !== manifest.count || !payload.items.every(isMenuItem)) {
      throw new Error('Katalog bütünlük denetimini geçemedi.');
    }

    return (payload as unknown as CatalogPayload).items;
  })();

  return catalogPromise;
};
