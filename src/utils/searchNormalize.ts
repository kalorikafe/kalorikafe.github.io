import type { MenuItem } from '../types/cafe';
import { CHAINS } from '../data/chains';

/**
 * Single source of truth for search normalization tokenization.
 * Used by the menu filter (desktop + mobile) and by the suggestion panel
 * so both surfaces behave identically.
 *
 * Handles:
 * - Turkish case folding (İ→i, I→ı) via toLocaleLowerCase('tr-TR')
 * - Diacritic stripping (türk → turk) so accent-free queries match
 * - Whitespace collapse + trim
 * - Extra Latin fallback for ß-like edge chars
 */
export function normalizeSearchText(raw: string): string {
  return raw
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ı]/g, 'i')
    .replace(/\s+/g, ' ')
    .trim();
}

const CATEGORY_LABELS: Record<string, string> = {
  espresso_hot: 'Sıcak Espresso',
  espresso_iced: 'Buzlu Espresso',
  cold_brew: 'Cold Brew',
  frappe_blended: 'Frappe ve Karışık İçecekler',
  tea_herbal: 'Çay ve Bitki Çayları',
  smoothie_juice: 'Smoothie ve Meyve Suları',
  bakery_dessert: 'Fırın ve Tatlılar',
  sandwich_savory: 'Sandviç ve Tuzlular',
  fit_healthy: 'Fit ve Sağlıklı',
};

const DIET_LABELS: Record<string, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vejetaryen',
  gluten_free: 'Glutensiz',
  lactose_free: 'Laktozsuz',
  sugar_free: 'Şekersiz',
  high_protein: 'Yüksek Protein',
  low_calorie: 'Düşük Kalori',
};

export interface SearchableFields {
  name: string;
  nameEn: string;
  chainName: string;
  description: string;
  categoryLabel: string;
  dietaryLabels: string[];
}

/** Extract the human-searchable fields of an item, normalized once. */
export function getSearchableFields(item: MenuItem): SearchableFields {
  const chainName = CHAINS.find(c => c.id === item.chainId)?.name ?? '';
  return {
    name: normalizeSearchText(item.name),
    nameEn: normalizeSearchText(item.nameEn ?? ''),
    chainName: normalizeSearchText(chainName),
    description: normalizeSearchText(item.description),
    categoryLabel: normalizeSearchText(CATEGORY_LABELS[item.category] ?? ''),
    dietaryLabels: item.dietaryTags.map(t => normalizeSearchText(DIET_LABELS[t] ?? t)),
  };
}

/** Whether a single normalized term matches any searchable field. */
export function matchesNormalizedTerm(item: MenuItem, term: string): boolean {
  const f = getSearchableFields(item);
  return (
    f.name.includes(term) ||
    f.nameEn.includes(term) ||
    f.chainName.includes(term) ||
    f.description.includes(term) ||
    f.categoryLabel.includes(term) ||
    f.dietaryLabels.some(label => label.includes(term))
  );
}

/**
 * Splits a raw query into normalized terms and checks every term matches.
 * Multi-word queries act as AND over terms; a full-phrase match is not
 * required so "turk kahvesi" still finds "Türk Kahvesi".
 */
export function queryMatchesItem(item: MenuItem, rawQuery: string): boolean {
  const terms = normalizeSearchText(rawQuery)
    .split(' ')
    .filter(Boolean);
  if (terms.length === 0) return true;
  return terms.every(term => itemNormalizedBlob(item).includes(term));
}

const blobCache = new WeakMap<MenuItem, string>();

function itemNormalizedBlob(item: MenuItem): string {
  let blob = blobCache.get(item);
  if (!blob) {
    const f = getSearchableFields(item);
    blob = [f.name, f.nameEn, f.chainName, f.description, f.categoryLabel, ...f.dietaryLabels]
      .filter(Boolean)
      .join(' ');
    blobCache.set(item, blob);
  }
  return blob;
}

/**
 * Rank candidates for the suggestion panel: exact-name prefix > name
 * contains > other fields. Stable tie-break by id.
 */
export function rankSearchMatches(items: MenuItem[], rawQuery: string, limit: number): MenuItem[] {
  const terms = normalizeSearchText(rawQuery)
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return [];

  const scored: Array<{ item: MenuItem; score: number }> = [];
  for (const item of items) {
    const f = getSearchableFields(item);
    const name = f.name;
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      if (name.includes(term)) {
        score += 10;
        if (name.startsWith(term)) score += 5;
      } else if (f.nameEn.includes(term)) {
        score += 8;
      } else if (f.chainName.includes(term)) {
        score += 4;
      } else if (f.categoryLabel.includes(term)) {
        score += 3;
      } else if (f.dietaryLabels.some(l => l.includes(term))) {
        score += 2;
      } else if (f.description.includes(term)) {
        score += 1;
      } else {
        matchedAll = false;
        break;
      }
    }
    if (matchedAll && score > 0) scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
  return scored.slice(0, limit).map(s => s.item);
}