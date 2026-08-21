import React from 'react';
import type { Category, DietaryPreference } from '../types/cafe';
import { Filter, RotateCcw } from 'lucide-react';

interface DietaryFilterBarProps {
  selectedCategory: Category | 'all';
  onSelectCategory: (cat: Category | 'all') => void;
  selectedDietaryTags: DietaryPreference[];
  onToggleDietaryTag: (tag: DietaryPreference) => void;
  isOnlyDrinks: boolean;
  setIsOnlyDrinks: (value: boolean) => void;
  isOnlyFood: boolean;
  setIsOnlyFood: (value: boolean) => void;
  resetAllFilters: () => void;
  hasActiveFilters: boolean;
}

const CATEGORY_TABS: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Tüm menü', icon: '✨' },
  { id: 'espresso_hot', label: 'Sıcak kahveler', icon: '☕' },
  { id: 'espresso_iced', label: 'Soğuk kahveler', icon: '🧊' },
  { id: 'cold_brew', label: 'Cold Brew', icon: '❄️' },
  { id: 'frappe_blended', label: 'Frappe ve buzlu', icon: '🥤' },
  { id: 'tea_herbal', label: 'Çay ve matcha', icon: '🍵' },
  { id: 'smoothie_juice', label: 'Smoothie ve meyve suyu', icon: '🍹' },
  { id: 'bakery_dessert', label: 'Fırın ve tatlı', icon: '🍰' },
  { id: 'sandwich_savory', label: 'Sandviç ve tost', icon: '🥪' },
  { id: 'fit_healthy', label: 'Fit ve sağlıklı', icon: '🥗' },
];

const DIETARY_PILLS: { id: DietaryPreference; label: string; icon: string }[] = [
  { id: 'gluten_free', label: 'Glutensiz', icon: '🌾' },
  { id: 'lactose_free', label: 'Laktozsuz', icon: '🥛' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'vegetarian', label: 'Vejetaryen', icon: '🥬' },
  { id: 'high_protein', label: 'Yüksek protein', icon: '💪' },
  { id: 'low_calorie', label: '150 kcal altı', icon: '🔥' },
  { id: 'sugar_free', label: 'Şekersiz', icon: '🍬' },
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
}) => (
  <div className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface)] sm:grid-cols-[minmax(0,1fr)_auto]">
    <div>
      <label htmlFor="category-filter" className="mb-1 block text-[11px] font-black uppercase text-stone-500 dark:text-[var(--dark-text-muted)]">Kategori</label>
      <select
        id="category-filter"
        value={selectedCategory}
        onChange={event => onSelectCategory(event.target.value as Category | 'all')}
        className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-black dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface-elevated)]"
      >
        {CATEGORY_TABS.map(tab => <option key={tab.id} value={tab.id}>{tab.icon} {tab.label}</option>)}
      </select>
    </div>

    <div className="flex items-end gap-1">
      <div className="flex min-h-11 items-center gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface-elevated)]">
        <button
          type="button"
          onClick={() => setIsOnlyDrinks(!isOnlyDrinks)}
          aria-pressed={isOnlyDrinks}
          className={`min-h-9 rounded-lg px-3 text-xs font-black transition ${isOnlyDrinks ? 'bg-[#6F4E37] text-white dark:bg-[#D4B996] dark:text-[#2C221E]' : 'text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
        >
          🥤 İçecek
        </button>
        <button
          type="button"
          onClick={() => setIsOnlyFood(!isOnlyFood)}
          aria-pressed={isOnlyFood}
          className={`min-h-9 rounded-lg px-3 text-xs font-black transition ${isOnlyFood ? 'bg-[#6F4E37] text-white dark:bg-[#D4B996] dark:text-[#2C221E]' : 'text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
        >
          🥪 Yiyecek
        </button>
      </div>
    </div>

    <details className="rounded-xl border border-stone-200 px-3 dark:border-[var(--dark-border)] sm:col-span-2" open={selectedDietaryTags.length > 0 || undefined}>
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 py-2 text-xs font-black">
        <Filter className="h-4 w-4" /> Diyet ve beslenme filtreleri {selectedDietaryTags.length > 0 && `(${selectedDietaryTags.length})`}
      </summary>
      <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 py-3 dark:border-[var(--dark-border)]">
        {DIETARY_PILLS.map(pill => {
          const selected = selectedDietaryTags.includes(pill.id);
          return (
            <button
              type="button"
              key={pill.id}
              onClick={() => onToggleDietaryTag(pill.id)}
              aria-pressed={selected}
              className={`flex min-h-11 items-center gap-1 rounded-xl border px-3 py-2 text-[11px] font-black transition ${selected ? 'border-[#2C221E] bg-[#2C221E] text-white dark:border-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#2C221E]' : 'border-stone-200 bg-stone-100 text-stone-700 dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface-elevated)] dark:text-[var(--dark-text-muted)]'}`}
            >
              <span>{pill.icon}</span><span>{pill.label}</span>
            </button>
          );
        })}
        {hasActiveFilters && (
          <button type="button" onClick={resetAllFilters} aria-label="Filtreleri temizle" className="min-h-11 min-w-11 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" title="Filtreleri temizle">
            <RotateCcw className="mx-auto h-4 w-4" />
          </button>
        )}
        <p className="w-full text-[10px] leading-relaxed text-stone-500 dark:text-[var(--dark-text-muted)]">
          Glutensiz ve laktozsuz sonuçlar yalnız kaynaklı alerjen verisi olan ürünlerden gösterilir; yine de çapraz temas ve reçete değişikliği için markadan teyit alın.
        </p>
      </div>
    </details>
  </div>
);
