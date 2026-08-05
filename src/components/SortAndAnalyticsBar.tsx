import React from 'react';
import { ArrowUpDown, Star, Lightbulb } from 'lucide-react';

export type SortOption = 
  | 'default'
  | 'cal_asc'
  | 'protein_desc'
  | 'sugar_asc'
  | 'fat_asc'
  | 'caffeine_desc';

interface SortAndAnalyticsBarProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (val: boolean) => void;
  favoriteCount: number;
  onOpenSmartSwapModal: () => void;
}

export const SortAndAnalyticsBar: React.FC<SortAndAnalyticsBarProps> = ({
  sortBy,
  setSortBy,
  showOnlyFavorites,
  setShowOnlyFavorites,
  favoriteCount,
  onOpenSmartSwapModal,
}) => {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 overflow-hidden p-4 rounded-3xl bg-white dark:bg-[var(--dark-surface)] border border-stone-200 dark:border-[var(--dark-border)] shadow-sm">
      
      {/* Sort Dropdown Left */}
      <div className="flex min-w-0 w-full items-center gap-2 sm:w-auto">
        <div className="flex shrink-0 items-center gap-1.5 text-xs font-black text-stone-700 dark:text-[var(--dark-text-muted)]">
          <ArrowUpDown className="w-4 h-4 text-[#6F4E37] dark:text-[#D4B996]" />
          <span className="hidden sm:inline">Sıralama:</span>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          aria-label="Ürünleri sırala"
          className="min-w-0 flex-1 max-w-full px-3.5 py-2 rounded-2xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)] text-stone-900 dark:text-[var(--dark-text)] text-xs font-bold focus:outline-none focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/20 sm:flex-none"
        >
          <option value="default">Önerilen Sıralama</option>
          <option value="cal_asc">🔥 En Düşük Kalori (Önce Düşük Kalorililer)</option>
          <option value="protein_desc">💪 En Yüksek Protein (Zirveden Aşağıya)</option>
          <option value="sugar_asc">🍭 En Düşük Şeker</option>
          <option value="fat_asc">🥑 En Düşük Yağ</option>
          <option value="caffeine_desc">⚡ En Yüksek Kafein Oranı</option>
        </select>
      </div>

      {/* Action Buttons Right */}
      <div className="flex items-center gap-2">
        
        {/* Smart Swap Button */}
        <button
          onClick={onOpenSmartSwapModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#2C221E] hover:bg-[#3D2B1F] dark:bg-[#FAF8F5] dark:hover:bg-[var(--dark-surface-elevated)] text-white dark:text-[#2C221E] font-black text-xs shadow-md border border-[#2C221E]/20 transition-all active:scale-95"
        >
          <Lightbulb className="w-4 h-4 text-[#D4B996] dark:text-[#6F4E37]" />
          <span>Akıllı Kalori Tasarrufu</span>
        </button>

        {/* Favorites Filter Button */}
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black transition-all ${
            showOnlyFavorites
              ? 'bg-[#6F4E37] text-white border-[#6F4E37] dark:bg-[#D4B996] dark:text-[#2C221E] shadow-md'
              : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border-stone-200 dark:border-[var(--dark-border)] text-stone-800 dark:text-[var(--dark-text)] hover:bg-stone-200'
          }`}
        >
          <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-current' : 'text-[#6F4E37] dark:text-[#D4B996]'}`} />
          <span>Favorilerim ({favoriteCount})</span>
        </button>

      </div>

    </div>
  );
};
