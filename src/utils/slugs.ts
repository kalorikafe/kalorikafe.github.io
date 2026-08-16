import type { MenuItem } from '../types/cafe';

const TURKISH_ASCII: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
};

export const slugify = (value: string): string => {
  const lowered = value.trim().toLocaleLowerCase('tr-TR');
  const ascii = [...lowered]
    .map(character => TURKISH_ASCII[character] ?? character)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  return ascii
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'urun';
};

export const chainSlug = (chainId: string): string => slugify(chainId.replaceAll('_', ' '));

/**
 * Produces deterministic, collision-safe public slugs without changing stable
 * catalog IDs. The ID suffix is used only when a chain contains duplicate
 * normalized product names.
 */
export const createProductSlugMap = (items: readonly MenuItem[]): Map<string, string> => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = `${item.chainId}:${slugify(item.name)}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return new Map(items.map(item => {
    const base = slugify(item.name);
    const key = `${item.chainId}:${base}`;
    const slug = counts.get(key) === 1 ? base : `${base}-${slugify(item.id)}`;
    return [item.id, slug];
  }));
};

export const productPath = (item: MenuItem, slugs: ReadonlyMap<string, string>): string =>
  `/urun/${chainSlug(item.chainId)}/${slugs.get(item.id) ?? slugify(item.id)}/`;

