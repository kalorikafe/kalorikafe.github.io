import React from 'react';
import type { Allergen } from '../types/cafe';
import { Coffee, Search, ShieldAlert, Scale, ShoppingBag, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  userAllergens,
  hideAllergens,
  onOpenAllergenModal,
  compareCount,
  onOpenCompareModal,
  basketCount: _basketCount,
  totalBasketCalories,
  onOpenBasketDrawer,
  isDarkMode,
  setIsDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#1C1816]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800/80 shadow-[0_4px_20px_-4px_rgba(44,34,30,0.04)] dark:shadow-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#2C221E] dark:bg-[#FAF8F5] flex items-center justify-center text-[#FAF8F5] dark:text-[#2C221E] shadow-md shadow-[#2C221E]/15 border border-[#2C221E]/10 transition-transform hover:scale-105">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-stone-950 dark:text-stone-50 tracking-tight whitespace-nowrap">
                Kalori Cafe
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#6F4E37]/10 dark:bg-[#D4B996]/15 text-[#6F4E37] dark:text-[#D4B996] font-extrabold text-[10px] uppercase border border-[#6F4E37]/20 dark:border-[#D4B996]/30 tracking-wider">
                Zincir Rehberi
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-bold hidden sm:block">
              Kafe Makro & Alerjen Takip Platformu
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              aria-label="Menüde ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kahve, yiyecek, kafe adı veya filtre ara... (örn: Latte, Glutensiz)"
              className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-stone-950 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 text-xs font-bold focus:outline-none focus:bg-white focus:border-[#6F4E37] focus:ring-4 focus:ring-[#6F4E37]/10 transition-all shadow-inner-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-black p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Header Action Buttons Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Allergen Profile Button */}
          <button
            onClick={onOpenAllergenModal}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-2xl border text-xs font-black transition-all ${
              userAllergens.length > 0
                ? hideAllergens
                  ? 'bg-red-700 hover:bg-red-800 text-white border-red-800 shadow-md shadow-red-700/20'
                  : 'bg-[#6F4E37]/15 dark:bg-[#D4B996]/20 text-[#6F4E37] dark:text-[#D4B996] border-[#6F4E37]/30 hover:bg-[#6F4E37]/25'
                : 'bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 shadow-xs'
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
            onClick={onOpenCompareModal}
            disabled={compareCount === 0}
            className={`relative hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black transition-all ${
              compareCount > 0
                ? 'bg-[#6F4E37] hover:bg-[#5C402C] text-white border-[#6F4E37] shadow-md shadow-[#6F4E37]/20'
                : 'bg-stone-50 dark:bg-stone-800/50 text-stone-400 dark:text-stone-500 border-stone-200/80 dark:border-stone-700/50 cursor-not-allowed opacity-60 font-semibold'
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
            onClick={onOpenBasketDrawer}
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
            className="p-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 transition-all shadow-xs"
            title={isDarkMode ? "Açık Moda Geç" : "Koyu Moda Geç"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#D4B996] font-bold" /> : <Moon className="w-4 h-4 text-[#2C221E] font-bold" />}
          </button>

        </div>

      </div>
    </header>
  );
};
