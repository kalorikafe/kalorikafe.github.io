import React, { useRef, useState } from 'react';
import type { Allergen, MenuItem } from '../types/cafe';
import { Coffee, Search, ShieldAlert, Scale, ShoppingBag, Sun, Moon, X } from 'lucide-react';
import { SearchSuggestions } from './SearchSuggestions';
import { handleSuggestionKeydown, DEFAULT_ACTIVE_INDEX, buildSuggestionIds } from '../utils/searchInteraction';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: MenuItem[];
  resultCount: number;
  onSelectSuggestion: (item: MenuItem) => void;
  onSubmitQuery: () => void;
  userAllergens: Allergen[];
  hideAllergens: boolean;
  onOpenAllergenModal: () => void;
  compareCount: number;
  onOpenCompareModal: () => void;
  basketCount?: number;
  totalBasketCalories: number;
  onOpenBasketDrawer: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  suggestions,
  resultCount,
  onSelectSuggestion,
  onSubmitQuery,
  userAllergens,
  hideAllergens,
  onOpenAllergenModal,
  compareCount,
  onOpenCompareModal,
  basketCount = 0,
  totalBasketCalories,
  onOpenBasketDrawer,
  isDarkMode,
  setIsDarkMode,
}) => {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_ACTIVE_INDEX);
    const [panelOpen, setPanelOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryLength = searchQuery.trim().length;
    const suggestionsOpen = queryLength >= 2 && panelOpen && suggestions.length > 0;
    // Unique ids for THIS search surface (desktop navbar).
    const suggestionIds = buildSuggestionIds('desktop-search');

  const handleChange = (value: string) => {
    setSearchQuery(value);
    setActiveIndex(DEFAULT_ACTIVE_INDEX);
    setPanelOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      // Escape only closes the suggestion panel; it never clears the query.
      setPanelOpen(false);
      setActiveIndex(DEFAULT_ACTIVE_INDEX);
      (event.target as HTMLInputElement).blur();
      event.preventDefault();
      return;
    }
    const handled = handleSuggestionKeydown(event, {
      suggestions,
      isOpen: suggestionsOpen,
      activeIndex,
      setActiveIndex,
      onSelect: item => {
        setPanelOpen(false);
        onSelectSuggestion(item);
      },
      onSubmitQuery,
    });
    if (!handled && event.key === 'Enter') {
      event.preventDefault();
      onSubmitQuery();
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveIndex(DEFAULT_ACTIVE_INDEX);
    setPanelOpen(false);
    inputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[var(--dark-surface)]/95 backdrop-blur-md border-b border-stone-200 dark:border-[var(--dark-border)] shadow-[0_4px_20px_-4px_rgba(44,34,30,0.04)] dark:shadow-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#2C221E] dark:bg-[#FAF8F5] flex items-center justify-center text-[#FAF8F5] dark:text-[#2C221E] shadow-md shadow-[#2C221E]/15 border border-[#2C221E]/10 transition-transform hover:scale-105">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-stone-950 dark:text-[var(--dark-text)] tracking-tight whitespace-nowrap">
                Kalori Cafe
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#6F4E37]/10 dark:bg-[#D4B996]/15 text-[#6F4E37] dark:text-[#D4B996] font-extrabold text-[10px] uppercase border border-[#6F4E37]/20 dark:border-[#D4B996]/30 tracking-wider">
                Zincir Rehberi
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-[var(--dark-text-muted)] font-bold hidden sm:block">
              Kafe Makro & Alerjen Takip Platformu
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-[var(--dark-text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-label="Menüde ara"
              aria-autocomplete="list"
              aria-expanded={suggestionsOpen}
              aria-haspopup="listbox"
              aria-controls={suggestionsOpen ? suggestionIds.listboxId : undefined}
              aria-activedescendant={suggestionsOpen && activeIndex >= 0 ? suggestionIds.optionId(activeIndex) : undefined}
              value={searchQuery}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setPanelOpen(true)}
              placeholder="Kahve, yiyecek, kafe adı veya filtre ara... (örn: Latte, Glutensiz)"
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)] text-stone-950 dark:text-[var(--dark-text)] placeholder-stone-400 dark:placeholder-[var(--dark-text-muted)] text-xs font-bold focus:outline-none focus:bg-white focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 dark:focus:bg-[var(--dark-surface-elevated)] transition-all shadow-inner-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                aria-label="Aramayı temizle"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-[var(--dark-text)] text-xs font-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {suggestionsOpen && (
                      <SearchSuggestions
                        idPrefix="desktop-search"
                        suggestions={suggestions}
                        isOpen
                        activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              onSelect={(item) => {
                setPanelOpen(false);
                setActiveIndex(DEFAULT_ACTIVE_INDEX);
                onSelectSuggestion(item);
              }}
              onSubmitQuery={onSubmitQuery}
              onClear={handleClear}
              resultCount={resultCount}
            />
          )}
        </div>

        {/* Header Action Buttons Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Allergen Profile Button */}
          <button
            type="button"
            onClick={onOpenAllergenModal}
            aria-label={userAllergens.length > 0
              ? `Alerji Profili, ${userAllergens.length} seçim${hideAllergens ? ', eşleşen ürünler gizleniyor' : ''}`
              : 'Alerji Profili'}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-2xl border text-xs font-black transition-all ${
              userAllergens.length > 0
                ? hideAllergens
                  ? 'bg-red-700 hover:bg-red-800 text-white border-red-800 shadow-md shadow-red-700/20'
                  : 'bg-[#6F4E37]/15 dark:bg-[#D4B996]/20 text-[#6F4E37] dark:text-[#D4B996] border-[#6F4E37]/30 hover:bg-[#6F4E37]/25'
                : 'bg-stone-50 hover:bg-stone-100 dark:bg-[var(--dark-surface-elevated)] dark:hover:bg-[var(--dark-surface-elevated)] text-stone-800 dark:text-[var(--dark-text)] border-stone-200 dark:border-[var(--dark-border)] shadow-xs'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-[#6F4E37] dark:text-[#D4B996]" />
            <span className="hidden lg:inline">Alerji Profili</span>
            {userAllergens.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#2C221E] dark:bg-[#FAF8F5] text-white dark:text-[#2C221E] text-[10px] font-black min-w-[18px] text-center">
                {userAllergens.length}
              </span>
            )}
          </button>

          {/* Compare Modal Trigger */}
          <button
            type="button"
            onClick={onOpenCompareModal}
            disabled={compareCount === 0}
            aria-label={`Karşılaştırma, ${compareCount} ürün seçili`}
            className={`relative hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black transition-all ${
              compareCount > 0
                ? 'bg-[#6F4E37] hover:bg-[#5C402C] text-white border-[#6F4E37] shadow-md shadow-[#6F4E37]/20'
                : 'bg-stone-50 dark:bg-[var(--dark-surface-elevated)] text-stone-400 dark:text-[var(--dark-text-muted)] border-stone-200/80 dark:border-[var(--dark-border)]/50 cursor-not-allowed opacity-60 font-semibold'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Karşılaştır</span>
            {compareCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-[#6F4E37] text-[10px] font-black">
                {compareCount}
              </span>
            )}
          </button>

          {/* Daily Basket Trigger */}
          <button
            type="button"
            onClick={onOpenBasketDrawer}
            aria-label={`Sepetim, ${basketCount} ürün, ${totalBasketCalories} kcal`}
            className="flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-2xl bg-[#2C221E] hover:bg-[#3D2B1F] dark:bg-[#FAF8F5] dark:hover:bg-stone-200 text-white dark:text-[#2C221E] font-black text-xs shadow-md shadow-[#2C221E]/20 border border-[#2C221E]/20 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sepetim</span>
            <span className="hidden sm:inline px-2 py-0.5 rounded-lg bg-white/15 dark:bg-black/10 text-[#D4B996] dark:text-[#6F4E37] text-[11px] font-extrabold">
              {totalBasketCalories} kcal
            </span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            className="p-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 dark:bg-[var(--dark-surface-elevated)] dark:hover:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)] text-stone-800 dark:text-[var(--dark-text)] transition-all shadow-xs"
            title={isDarkMode ? "Açık Moda Geç" : "Koyu Moda Geç"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#D4B996] font-bold" /> : <Moon className="w-4 h-4 text-[#2C221E] font-bold" />}
          </button>

        </div>

      </div>
    </header>
  );
};
