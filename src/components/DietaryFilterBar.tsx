import React from 'react';
import type { Category, DietaryPreference } from '../types/cafe';
import { Filter, RotateCcw } from 'lucide-react';

interface DietaryFilterBarProps {
  selectedCategory: Category | 'all';
  onSelectCategory: (cat: Category | 'all') => void;
  selectedDietaryTags: DietaryPreference[];
  onToggleDietaryTag: (tag: DietaryPreference) => void;
  isOnlyDrinks: boolean;
  setIsOnlyDrinks: (val: boolean) => void;
  isOnlyFood: boolean;
  setIsOnlyFood: (val: boolean) => void;
  resetAllFilters: () => void;
  hasActiveFilters: boolean;
}

const CATEGORY_TABS: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Tüm Menü', icon: '✨' },
  { id: 'espresso_hot', label: 'Sıcak Kahveler', icon: '☕' },
  { id: 'espresso_iced', label: 'Soğuk Kahveler', icon: '🧊' },
  { id: 'cold_brew', label: 'Cold Brew', icon: '❄️' },
  { id: 'frappe_blended', label: 'Frappe & Buzlu', icon: '🥤' },
  { id: 'tea_herbal', label: 'Çay & Matcha', icon: '🍵' },
  { id: 'smoothie_juice', label: 'Smoothie & Meyve Suyu', icon: '🍹' },
  { id: 'bakery_dessert', label: 'Fırın & Tatlı', icon: '🍰' },
  { id: 'sandwich_savory', label: 'Sandviç & Tost', icon: '🥪' },
  { id: 'fit_healthy', label: 'Fit & Protein Kasesi', icon: '🥗' },
];

const DIETARY_PILLS: { id: DietaryPreference; label: string; icon: string }[] = [
  { id: 'gluten_free', label: 'Glutensiz', icon: '🌾' },
  { id: 'lactose_free', label: 'Laktozsuz', icon: '🥛' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'vegetarian', label: 'Vejetaryen', icon: '🥬' },
  { id: 'high_protein', label: 'Yüksek Protein (15g+)', icon: '💪' },
  { id: 'low_calorie', label: 'Düşük Kalori (<150 kcal)', icon: '🔥' },
];

export const DietaryFilterBar: React.FC<DietaryFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedDietaryTags,
  onToggleDietaryTag,
  isOnlyDrinks,
  setIsOnlyDrinks,
  isOnlyFood,
  setIsOnlyFood,
  resetAllFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="space-y-4 p-4 rounded-3xl bg-white dark:bg-[var(--dark-surface)] border border-stone-200 dark:border-[var(--dark-border)] shadow-sm">
      
      {/* Category Tabs Header */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          {CATEGORY_TABS.map(tab => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#2C221E] text-white dark:bg-[#FAF8F5] dark:text-[#2C221E] shadow-md scale-105'
                    : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text-muted)] hover:bg-stone-200 dark:hover:bg-[var(--dark-surface-elevated)] border border-stone-200/60 dark:border-[var(--dark-border)]/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Second Row: Drink/Food Toggles & Dietary Pills */}
      <div className="pt-2 border-t border-stone-200 dark:border-[var(--dark-border)] flex flex-wrap items-center justify-between gap-3">
        
        {/* Drink / Food Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)]">
          <button
            onClick={() => {
              setIsOnlyDrinks(!isOnlyDrinks);
              if (isOnlyFood) setIsOnlyFood(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isOnlyDrinks ? 'bg-[#6F4E37] text-white dark:bg-[#D4B996] dark:text-[#2C221E] shadow-sm' : 'text-stone-700 dark:text-[var(--dark-text-muted)]'
            }`}
          >
            🥤 Sadece İçecekler
          </button>

          <button
            onClick={() => {
              setIsOnlyFood(!isOnlyFood);
              if (isOnlyDrinks) setIsOnlyDrinks(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isOnlyFood ? 'bg-[#6F4E37] text-white dark:bg-[#D4B996] dark:text-[#2C221E] shadow-sm' : 'text-stone-700 dark:text-[var(--dark-text-muted)]'
            }`}
          >
            🥪 Sadece Yiyecekler
          </button>
        </div>

        {/* Dietary Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black text-stone-500 dark:text-[var(--dark-text-muted)] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#6F4E37] dark:text-[#D4B996]" /> Diyet Tercihi:
          </span>

          {DIETARY_PILLS.map(pill => {
            const isSelected = selectedDietaryTags.includes(pill.id);
            return (
              <button
                key={pill.id}
                onClick={() => onToggleDietaryTag(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#2C221E] text-white border-[#2C221E] dark:bg-[#FAF8F5] dark:text-[#2C221E] dark:border-[#FAF8F5] shadow-xs'
                    : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border-stone-200 dark:border-[var(--dark-border)] text-stone-700 dark:text-[var(--dark-text-muted)] hover:border-[#6F4E37]'
                }`}
              >
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Filtreleri Temizle"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
