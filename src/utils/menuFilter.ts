import type { MenuItem, Category, DietaryPreference, Allergen } from '../types/cafe';
import { queryMatchesItem } from './searchNormalize';

export type SortOption = 'default' | 'cal_asc' | 'protein_desc' | 'sugar_asc' | 'fat_asc' | 'caffeine_desc';

export interface MenuFilterOptions {
  searchQuery?: string;
  selectedChainId?: string | null;
  selectedCategory?: Category | 'all';
  selectedDietaryTags?: DietaryPreference[];
  isOnlyDrinks?: boolean;
  isOnlyFood?: boolean;
  hideAllergens?: boolean;
  userAllergens?: Allergen[];
  sortBy?: SortOption;
  showOnlyFavorites?: boolean;
  favorites?: string[];
}

/**
 * Single source of truth for menu filtering + sorting. Used both by the app
 * (App.tsx) and by the unit/E2E test suites so tests exercise the real logic
 * instead of a duplicated copy.
 */
export function filterAndSortMenu(
  menuItems: readonly MenuItem[],
  options: MenuFilterOptions = {}
): MenuItem[] {
  const searchQuery = options.searchQuery || '';
  const selectedChainId = options.selectedChainId ?? null;
  const selectedCategory = options.selectedCategory || 'all';
  const selectedDietaryTags = options.selectedDietaryTags || [];
  const isOnlyDrinks = options.isOnlyDrinks || false;
  const isOnlyFood = options.isOnlyFood || false;
  const hideAllergens = options.hideAllergens || false;
  const userAllergens = options.userAllergens || [];
  const sortBy = options.sortBy || 'default';
  const showOnlyFavorites = options.showOnlyFavorites || false;
  const favorites = options.favorites || [];

  let result = menuItems.filter(item => {
    // 1. Favorites Filter
    if (showOnlyFavorites && !favorites.includes(item.id)) return false;

    // 2. Search Query
    if (searchQuery.trim() !== '') {
      if (!queryMatchesItem(item, searchQuery)) return false;
    }

    // 3. Chain Selection
    if (selectedChainId && item.chainId !== selectedChainId) return false;

    // 4. Category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    // 5. Drink / Food Only
    const itemIsDrink = item.productKind ? item.productKind === 'drink' : item.isDrink;
    if (isOnlyDrinks && !itemIsDrink) return false;
    if (isOnlyFood && itemIsDrink) return false;

    // 6. Dietary Tags Filter
    if (selectedDietaryTags.length > 0) {
      if (selectedDietaryTags.includes('low_calorie') && item.baseMacros.calories >= 150) {
        return false;
      }
      if (selectedDietaryTags.includes('gluten_free')) {
        const hasSourcedAllergenData = ['official', 'mixed'].includes(item.allergenSource?.status ?? '');
        if (!item.dietaryTags.includes('gluten_free')
          || !hasSourcedAllergenData
          || item.allergens.includes('gluten')
          || item.crossContactRisks?.includes('celiac_oat_risk')) return false;
      }
      if (selectedDietaryTags.includes('lactose_free')) {
        const hasSourcedAllergenData = ['official', 'mixed'].includes(item.allergenSource?.status ?? '');
        if (!item.dietaryTags.includes('lactose_free')
          || !hasSourcedAllergenData
          || item.containsLactose !== false
          || item.allergens.includes('milk')) return false;
      }
      const otherTags = selectedDietaryTags.filter(t => !['low_calorie', 'gluten_free', 'lactose_free'].includes(t));
      if (otherTags.length > 0 && !otherTags.every(t => item.dietaryTags.includes(t))) {
        return false;
      }
    }

    // 7. User Allergen Hide Mode
    if (hideAllergens && userAllergens.length > 0) {
      // Strict mode must never turn missing/heuristic evidence into a claim of
      // safety. Unknown or estimated allergen rows stay visible in the default
      // warning mode, but are excluded from the conservative hide mode.
      if (!item.allergenSource || ['estimated', 'unavailable'].includes(item.allergenSource.status)) {
        return false;
      }
      const hasRisk = userAllergens.some(allergen => {
        if (allergen === 'lactose') return item.containsLactose === true;
        if (allergen === 'celiac_oat_risk') return item.crossContactRisks?.includes('celiac_oat_risk') === true;
        return item.allergens.includes(allergen);
      });
      if (hasRisk) {
        return false;
      }
    }

    return true;
  });

  // Apply Sorting
  if (sortBy === 'cal_asc') {
    result = [...result].sort((a, b) => a.baseMacros.calories - b.baseMacros.calories);
  } else if (sortBy === 'protein_desc') {
    result = [...result].sort((a, b) => b.baseMacros.protein - a.baseMacros.protein);
  } else if (sortBy === 'sugar_asc') {
    result = [...result].sort((a, b) => a.baseMacros.sugar - b.baseMacros.sugar);
  } else if (sortBy === 'fat_asc') {
    result = [...result].sort((a, b) => a.baseMacros.fat - b.baseMacros.fat);
  } else if (sortBy === 'caffeine_desc') {
    result = [...result].sort((a, b) => b.baseMacros.caffeine - a.baseMacros.caffeine);
  }

  return result;
}
