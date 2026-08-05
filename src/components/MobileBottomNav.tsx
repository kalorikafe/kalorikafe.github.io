import React from 'react';
import { Search, Scale, ShoppingBag, Wand2 } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenSearch: () => void;
  onOpenCustomBuilder: () => void;
  onOpenCompare: () => void;
  compareCount: number;
  onOpenBasket: () => void;
  basketCount: number;
  totalCalories: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenSearch,
  onOpenCustomBuilder,
  onOpenCompare,
  compareCount,
  onOpenBasket,
  basketCount,
  totalCalories,
}) => {
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
      <div className="glass-panel rounded-2xl p-2 border border-stone-200/80 dark:border-[var(--dark-border)] shadow-2xl flex items-center justify-around text-stone-700 dark:text-[var(--dark-text-muted)]">
        
        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold text-stone-600 dark:text-[var(--dark-text-muted)] hover:text-amber-500"
        >
          <Search className="w-5 h-5 text-amber-500" />
          <span>Arama</span>
        </button>

        {/* Custom Builder */}
        <button
          onClick={onOpenCustomBuilder}
          className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold text-stone-600 dark:text-[var(--dark-text-muted)] hover:text-amber-500"
        >
          <Wand2 className="w-5 h-5 text-amber-500" />
          <span>Özel Tarif</span>
        </button>

        {/* Compare */}
        <button
          onClick={onOpenCompare}
          disabled={compareCount === 0}
          className={`relative flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold ${
            compareCount > 0 ? 'text-blue-500' : 'text-stone-400 opacity-60'
          }`}
        >
          <Scale className="w-5 h-5" />
          <span>Karşılaştır</span>
          {compareCount > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">
              {compareCount}
            </span>
          )}
        </button>

        {/* Basket */}
        <button
          onClick={onOpenBasket}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-xs shadow-md"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{totalCalories} kcal</span>
          {basketCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
              {basketCount}
            </span>
          )}
        </button>

      </div>
    </div>
  );
};
