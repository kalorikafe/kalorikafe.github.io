import type React from 'react';
import type { MenuItem } from '../types/cafe';

export const SUGGESTION_LIST_ID = 'search-suggestions';
export const DEFAULT_ACTIVE_INDEX = -1;
export const MAX_SUGGESTIONS = 8;

/**
 * Shared keyboard contract for the desktop navbar input and the mobile
 * search modal input (ArrowDown / ArrowUp / Enter).
 * Returns true when the key was handled by the suggestion panel.
 */
export function handleSuggestionKeydown(
  event: React.KeyboardEvent<HTMLInputElement>,
  opts: {
    suggestions: MenuItem[];
    isOpen: boolean;
    activeIndex: number;
    setActiveIndex: (index: number) => void;
    onSelect: (item: MenuItem) => void;
    onSubmitQuery: () => void;
  },
): boolean {
  const { suggestions, isOpen, activeIndex, setActiveIndex, onSelect, onSubmitQuery } = opts;
  const total = isOpen ? suggestions.length : 0;

  if (event.key === 'ArrowDown') {
    if (total === 0) return false;
    event.preventDefault();
    setActiveIndex((activeIndex + 1) % total);
    return true;
  }
  if (event.key === 'ArrowUp') {
    if (total === 0) return false;
    event.preventDefault();
    setActiveIndex((activeIndex - 1 + total) % total);
    return true;
  }
  if (event.key === 'Enter') {
    if (total > 0 && activeIndex >= 0) {
      event.preventDefault();
      onSelect(suggestions[activeIndex]);
    } else {
      onSubmitQuery();
    }
    return true;
  }
  // Escape is handled by the parent (close panel/dialog, never clear query).
  return false;
}