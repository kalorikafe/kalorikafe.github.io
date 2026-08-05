import React from 'react';
import type { MenuItem, Allergen } from '../types/cafe';
import { CHAINS } from '../data/chains';
import { ALLERGEN_MAP } from '../utils/macroCalculator';
import { SlidersHorizontal, Scale, Plus, ShieldAlert, Check, Flame, Zap, Star, FileText, Info } from 'lucide-react';

interface ItemCardProps {
  item: MenuItem;
  userAllergens: Allergen[];
  isComparing: boolean;
  onToggleCompare: (item: MenuItem) => void;
  onOpenCustomizer: (item: MenuItem) => void;
  onQuickAddToBasket: (item: MenuItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenNutritionLabel: (item: MenuItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  userAllergens,
  isComparing,
  onToggleCompare,
  onOpenCustomizer,
  onQuickAddToBasket,
  isFavorite,
  onToggleFavorite,
  onOpenNutritionLabel,
}) => {
  const chainObj = CHAINS.find(c => c.id === item.chainId);

  const matchedUserAllergens = item.allergens.filter(a => userAllergens.includes(a));
  const hasUserAllergenRisk = matchedUserAllergens.length > 0;

  return (
    <article
      data-testid="item-card"
      data-item-id={item.id}
      className={`group relative rounded-3xl overflow-hidden bg-white dark:bg-[var(--dark-surface)] border transition-all duration-300 hover:shadow-2xl flex flex-col justify-between ${
      hasUserAllergenRisk 
        ? 'border-red-500/80 ring-2 ring-red-500/20' 
        : 'border-stone-200 dark:border-[var(--dark-border)]/80 hover:border-[#D97706]/60'
    }`}
    >
      
      {/* Top Image & Overlay Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-[var(--dark-surface-elevated)]">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/menu/placeholder.webp';
                    }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Chain Badge Top Left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12100E]/85 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
          <img src={chainObj?.logo} alt={chainObj?.name} className="w-4 h-4 object-contain rounded-full bg-white p-0.5" />
          <span>{chainObj?.name}</span>
        </div>

        {/* Top Right: Favorite Star & Caffeine Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {item.baseMacros.caffeine > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2C221E]/90 backdrop-blur-md border border-[#D4B996]/40 text-[#D4B996] text-[11px] font-extrabold shadow-md">
              <Zap className="w-3.5 h-3.5 text-[#D4B996]" />
              <span>{item.baseMacros.caffeine} mg</span>
            </div>
          )}

          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
              isFavorite
                ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-md scale-110'
                : 'bg-black/60 border-white/20 text-white/80 hover:text-[#D4B996]'
            }`}
            title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Title Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-black leading-tight drop-shadow-md tracking-tight">
            {item.name}
          </h3>
          {item.nameEn && (
            <p className="text-xs text-stone-300 font-semibold">
              {item.nameEn}
            </p>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4 text-stone-900 dark:text-[var(--dark-text)]">
        
        {/* User Allergen Warning Banner if Matched */}
        {hasUserAllergenRisk && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-300 text-xs font-black flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 animate-bounce" />
            <span>
              Uyarı: Profilinizdeki {matchedUserAllergens.map(a => ALLERGEN_MAP[a]?.name).join(', ')} hassasiyetini içerir!
            </span>
          </div>
        )}

        <p className="text-xs text-stone-600 dark:text-[var(--dark-text-muted)] font-medium line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Estimated-value badge: shown unless nutrition was verified */}
        {item.nutritionSource?.status !== 'verified' && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 dark:text-[var(--dark-text-muted)]">
            <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span data-testid="estimated-badge">Tahmini değer — resmî besin tablosu yayımlanmıyor</span>
          </div>
        )}

        {/* Ultra High Contrast Macro Grid Summary */}
        <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-stone-50 dark:bg-[var(--dark-surface-elevated)]/60 border border-stone-200 dark:border-[var(--dark-border)]/80 text-center">
          
          <div className="p-1.5 rounded-xl bg-white dark:bg-[var(--dark-surface)] border border-stone-200/80 dark:border-[var(--dark-border)]">
            <div className="text-[10px] uppercase font-black text-stone-500 dark:text-[var(--dark-text-muted)]">Kalori</div>
            <div data-testid="card-calories" className="text-xs font-black text-red-600 dark:text-red-400 flex items-center justify-center gap-0.5 mt-0.5">
              <Flame className="w-3 h-3" />
              {item.baseMacros.calories}
            </div>
          </div>

          <div className="p-1.5 rounded-xl bg-white dark:bg-[var(--dark-surface)] border border-stone-200/80 dark:border-[var(--dark-border)]">
            <div className="text-[10px] uppercase font-black text-stone-500 dark:text-[var(--dark-text-muted)]">Protein</div>
            <div className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {item.baseMacros.protein}g
            </div>
          </div>

          <div className="p-1.5 rounded-xl bg-white dark:bg-[var(--dark-surface)] border border-stone-200/80 dark:border-[var(--dark-border)]">
            <div className="text-[10px] uppercase font-black text-stone-500 dark:text-[var(--dark-text-muted)]">Karb/Şeker</div>
            <div className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {item.baseMacros.carbs}g <span className="text-[10px] text-stone-500 font-bold">({item.baseMacros.sugar}g)</span>
            </div>
          </div>

          <div className="p-1.5 rounded-xl bg-white dark:bg-[var(--dark-surface)] border border-stone-200/80 dark:border-[var(--dark-border)]">
            <div className="text-[10px] uppercase font-black text-stone-500 dark:text-[var(--dark-text-muted)]">Yağ</div>
            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {item.baseMacros.fat}g
            </div>
          </div>

        </div>

        {/* Allergen & Smart Swap Tags */}
        <div className="space-y-2">
          {item.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.allergens.map(allergen => {
                const info = ALLERGEN_MAP[allergen];
                if (!info) return null;
                return (
                  <span
                    key={allergen}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border-stone-200 dark:border-[var(--dark-border)] text-stone-800 dark:text-[var(--dark-text)]"
                    title={info.description}
                  >
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Smart Swap Badge if available */}
          {item.smartSwapSaveKcal && (
            <div className="text-[11px] p-2.5 rounded-xl bg-[#6F4E37]/10 border border-[#6F4E37]/20 text-[#6F4E37] dark:text-[#D4B996] font-bold leading-snug">
              💡 {item.smartSwapNote}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-stone-200 dark:border-[var(--dark-border)] flex items-center justify-between gap-1.5">
          
          {/* Customizer / Quick Add Button */}
          {item.isDrink ? (
            <button
              onClick={() => onOpenCustomizer(item)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2C221E] hover:bg-[#3D2B1F] dark:bg-[#FAF8F5] dark:hover:bg-[var(--dark-surface-elevated)] text-white dark:text-[#2C221E] text-xs font-black transition-all shadow-md active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Özelleştir</span>
            </button>
          ) : (
            <button
              onClick={() => onQuickAddToBasket(item)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2C221E] hover:bg-[#3D2B1F] dark:bg-[#FAF8F5] dark:hover:bg-[var(--dark-surface-elevated)] text-white dark:text-[#2C221E] text-xs font-black transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sepete Ekle</span>
            </button>
          )}

          {/* FDA Label Button */}
          <button
            onClick={() => onOpenNutritionLabel(item)}
            className="p-2.5 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)] text-stone-700 dark:text-[var(--dark-text-muted)] hover:bg-stone-200 dark:hover:bg-[var(--dark-surface-elevated)] transition-colors"
            title="FDA Besin Etiketi Göster"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Compare Toggle Button */}
          <button
            onClick={() => onToggleCompare(item)}
            className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all ${
              isComparing
                ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-sm'
                : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border-stone-200 dark:border-[var(--dark-border)] text-stone-700 dark:text-[var(--dark-text-muted)] hover:bg-stone-200 dark:hover:bg-[var(--dark-surface-elevated)]'
            }`}
            title={isComparing ? "Karşılaştırmadan Çıkar" : "Karşılaştırmaya Ekle"}
          >
            {isComparing ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
          </button>

          {/* Quick Add Button if Drink */}
          {item.isDrink && (
            <button
              onClick={() => onQuickAddToBasket(item)}
              className="p-2.5 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-900 dark:text-[var(--dark-text)] border border-stone-200 dark:border-[var(--dark-border)] hover:bg-[#2C221E] hover:text-white dark:hover:bg-[#FAF8F5] dark:hover:text-[#2C221E] transition-colors shadow-xs"
              title="Hızlı Sepete Ekle (Varsayılan Tarif)"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

    </article>
  );
};
