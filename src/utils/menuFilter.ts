import type { MenuItem, Category, DietaryPreference, Allergen } from '../types/cafe';
import { CHAINS } from '../data/chains';

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
  menuItems: MenuItem[],
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
      const q = searchQuery.toLowerCase();
      const chainName = CHAINS.find(c => c.id === item.chainId)?.name.toLowerCase() || '';
      const matchesName = item.name.toLowerCase().includes(q) || (item.nameEn && item.nameEn.toLowerCase().includes(q));
      const matchesChain = chainName.includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      const matchesTags = item.dietaryTags.some(t => t.toLowerCase().includes(q));
      if (!matchesName && !matchesChain && !matchesDesc && !matchesTags) return false;
    }

    // 3. Chain Selection
    if (selectedChainId && item.chainId !== selectedChainId) return false;

    // 4. Category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    // 5. Drink / Food Only
    if (isOnlyDrinks && !item.isDrink) return false;
    if (isOnlyFood && item.isDrink) return false;

    // 6. Dietary Tags Filter
    if (selectedDietaryTags.length > 0) {
      if (selectedDietaryTags.includes('low_calorie') && item.baseMacros.calories >= 150) {
        return false;
      }
      const otherTags = selectedDietaryTags.filter(t => t !== 'low_calorie');
      if (otherTags.length > 0 && !otherTags.every(t => item.dietaryTags.includes(t))) {
        return false;
      }
    }

    // 7. User Allergen Hide Mode
    if (hideAllergens && userAllergens.length > 0) {
      if (item.allergens.some(a => userAllergens.includes(a))) {
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