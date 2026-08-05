import React, { useEffect, useRef, useState } from 'react';
import type { MenuItem } from '../types/cafe';
import { Search, X } from 'lucide-react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { SearchSuggestions } from './SearchSuggestions';
import { handleSuggestionKeydown, DEFAULT_ACTIVE_INDEX, buildSuggestionIds } from '../utils/searchInteraction';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: MenuItem[];
  resultCount: number;
  onSelectSuggestion: (item: MenuItem) => void;
  onSubmitQuery: () => void;
}

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  suggestions,
  resultCount,
  onSelectSuggestion,
  onSubmitQuery,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useModalAccessibility(isOpen, onClose);
  const [activeIndex, setActiveIndex] = useState(DEFAULT_ACTIVE_INDEX);
    const suggestionsOpen = searchQuery.trim().length >= 2 && suggestions.length > 0;
    // Unique ids for THIS search surface (mobile modal).
    const suggestionIds = buildSuggestionIds('mobile-search');

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(DEFAULT_ACTIVE_INDEX);
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(t);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      // Escape closes the dialog; it never clears the query.
      event.preventDefault();
      onClose();
      return;
    }
    handleSuggestionKeydown(event, {
      suggestions,
      isOpen: suggestionsOpen,
      activeIndex,
      setActiveIndex,
      onSelect: item => {
        setActiveIndex(DEFAULT_ACTIVE_INDEX);
        onSelectSuggestion(item);
      },
      onSubmitQuery,
    });
  };

  const handleChange = (value: string) => {
    setSearchQuery(value);
    setActiveIndex(DEFAULT_ACTIVE_INDEX);
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveIndex(DEFAULT_ACTIVE_INDEX);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobil arama"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[var(--dark-surface)] border border-stone-200 dark:border-[var(--dark-border)] p-3 shadow-2xl"
      >
        <div className="relative">
          <div
                      className="flex items-center gap-2"
                      role="combobox"
                      aria-expanded={suggestionsOpen}
                      aria-haspopup="listbox"
                      aria-controls={suggestionsOpen ? suggestionIds.listboxId : undefined}
                      aria-owns={suggestionIds.listboxId}
                      aria-activedescendant={suggestionsOpen && activeIndex >= 0 ? suggestionIds.optionId(activeIndex) : undefined}
                    >
          <Search className="w-5 h-5 text-stone-400 dark:text-[var(--dark-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            aria-label="Mobil aramada ara"
            aria-autocomplete="list"
            value={searchQuery}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kahve, kafe adı veya filtre ara..."
            className="flex-1 min-w-0 bg-transparent text-stone-900 dark:text-[var(--dark-text)] placeholder-stone-400 dark:placeholder-[var(--dark-text-muted)] text-sm font-bold focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              aria-label="Aramayı temizle"
              className="shrink-0 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-[var(--dark-text)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Aramayı kapat"
            className="shrink-0 px-3 py-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text)] text-xs font-black hover:bg-stone-200 dark:hover:bg-[var(--dark-surface-elevated)]"
          >
            Kapat
          </button>
          </div>

          {suggestionsOpen && (
                      <SearchSuggestions
                        idPrefix="mobile-search"
                        suggestions={suggestions}
                        isOpen
                        activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              onSelect={item => {
                setActiveIndex(DEFAULT_ACTIVE_INDEX);
                onSelectSuggestion(item);
              }}
              onSubmitQuery={onSubmitQuery}
              onClear={handleClear}
              resultCount={resultCount}
            />
          )}
        </div>
      </div>
    </div>
  );
};