import React, { useEffect, useRef } from 'react';
import { buildSuggestionIds } from '../utils/searchInteraction';
import type { MenuItem } from '../types/cafe';
import { CHAINS } from '../data/chains';
import { Search } from 'lucide-react';

interface SearchSuggestionsProps {
  /** Candidates ranked by the shared ranker (max 8). */
  suggestions: MenuItem[];
  /** Whether the panel should be visible (query length >= 2). */
  isOpen: boolean;
  /** Active option index for keyboard navigation (managed by the parent). */
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  /** Select a suggestion: applies the query and scrolls to results. */
  onSelect: (item: MenuItem) => void;
  /** Apply the raw query and jump to the results grid. */
  onSubmitQuery: () => void;
  onClear: () => void;
  /** Total filtered result count announced via aria-live. */
  resultCount: number;
  /**
   * Unique id namespace for this search surface (desktop navbar vs mobile
   * modal). The listbox and every option id derive from it so
   * aria-controls / aria-activedescendant never collide.
   */
  idPrefix?: string;
}


/**
 * Shared suggestion panel for the desktop navbar search and the mobile
 * search modal. Implements ARIA combobox/listbox semantics and exposes the
 * keyboard contract (ArrowDown/ArrowUp/Enter/Escape) to the parent input.
 */
export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isOpen,
  activeIndex,
  setActiveIndex,
  onSelect,
  onSubmitQuery: _onSubmitQuery,
  onClear: _onClear,
  resultCount,
  idPrefix = 'search',
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const ids = buildSuggestionIds(idPrefix);

  // Keep the active option in view while navigating with the keyboard.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  if (!isOpen || suggestions.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-2 z-50">
      <div
        role="listbox"
        id={ids.listboxId}
        aria-label="Arama önerileri"
        className="overflow-hidden rounded-2xl border border-stone-200 dark:border-[var(--dark-border)] bg-white dark:bg-[var(--dark-surface)] shadow-2xl shadow-black/10 dark:shadow-black/40"
      >
        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-[var(--dark-text-muted)] border-b border-stone-100 dark:border-[var(--dark-border)] flex items-center justify-between">
          <span>Öneriler</span>
          <span className="normal-case font-bold tracking-normal">
            {resultCount} sonuç
          </span>
        </div>
        <ul ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {suggestions.map((item, index) => {
            const chain = CHAINS.find(c => c.id === item.chainId);
            const isActive = index === activeIndex;
            return (
              <li
                key={item.id}
                id={ids.optionId(index)}
                role="option"
                aria-selected={isActive}
                data-suggestion-index={index}
              >
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => onSelect(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-amber-50 dark:bg-[var(--dark-surface-elevated)]'
                      : 'bg-transparent hover:bg-stone-50 dark:hover:bg-[#2B211C]/60'
                  }`}
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover bg-stone-100 dark:bg-[var(--dark-surface-elevated)] shrink-0"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/menu/placeholder.webp';
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-xs font-black ${
                        isActive ? 'text-amber-800 dark:text-amber-300' : 'text-stone-900 dark:text-[var(--dark-text)]'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="block truncate text-[11px] font-bold text-stone-500 dark:text-[var(--dark-text-muted)]">
                      {chain?.name}
                    </span>
                  </span>
                  <Search className="w-3.5 h-3.5 text-stone-300 dark:text-[var(--dark-text-muted)] shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};