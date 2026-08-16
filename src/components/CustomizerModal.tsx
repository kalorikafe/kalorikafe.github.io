import React, { useState, useEffect } from 'react';
import type { MenuItem, CustomizationState } from '../types/cafe';
import { MILK_OPTIONS, SIZE_OPTIONS } from '../data/modifiers';
import { calculateMacrosAndAllergens, ALLERGEN_MAP } from '../utils/macroCalculator';
import { X, Sparkles, Plus, Minus, Check, Flame, Zap } from 'lucide-react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { handleRadioGroupKeyDown } from '../utils/radioGroup';

interface CustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToBasket: (item: MenuItem, customization: CustomizationState) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  item,
  onClose,
  onAddToBasket,
}) => {
  const dialogRef = useModalAccessibility(Boolean(item), onClose);
  const [customization, setCustomization] = useState<CustomizationState>({
    sizeId: item?.defaultSizeId || 'tall',
    milkId: item?.defaultMilkId || 'whole_milk',
    syrupPumps: item?.defaultSyrupPumps || 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  });

  useEffect(() => {
    if (item) {
      setCustomization({
        sizeId: item.defaultSizeId || 'tall',
        milkId: item.defaultMilkId || 'whole_milk',
        syrupPumps: item.defaultSyrupPumps || 0,
        hasWhippedCream: false,
        hasColdFoam: false,
        extraEspressoShots: 0
      });
    }
  }, [item]);

  if (!item) return null;

  const { calculatedMacros, calculatedAllergens } = calculateMacrosAndAllergens(item, customization);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="customizer-title" tabIndex={-1} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-stone-200 dark:border-[var(--dark-border)] shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 shrink-0 rounded-2xl object-cover border border-stone-200 dark:border-[var(--dark-border)] shadow-sm bg-stone-100 dark:bg-[var(--dark-surface-elevated)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/menu/placeholder.webp';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 id="customizer-title" className="text-xl font-extrabold text-stone-900 dark:text-[var(--dark-text)]">
                  {item.name}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Tarif Özelleştirici
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)] mt-0.5">
                Süt, şurup ve boyut seçiminize göre makro ve alerjenlerinizi kişiselleştirin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Özelleştiriciyi kapat"
            className="p-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-500 hover:text-stone-900 dark:hover:text-[var(--dark-text)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Macro Summary Gauge Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-[var(--dark-text-muted)]">
            <span>Hesaplanan Canlı Makro Değerleri</span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> Anlık Güncelleme
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            
            <div className="p-2 rounded-xl bg-white/70 dark:bg-[var(--dark-surface)]/70 border border-amber-500/20">
              <div className="text-[10px] uppercase font-bold text-stone-400">Kalori</div>
              <div data-testid="customizer-calories" className="text-sm font-black text-red-500 flex items-center justify-center gap-0.5">
                <Flame className="w-3.5 h-3.5" />
                {calculatedMacros.calories}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/70 dark:bg-[var(--dark-surface)]/70 border border-blue-500/20">
              <div className="text-[10px] uppercase font-bold text-stone-400">Protein</div>
              <div className="text-sm font-black text-blue-500">
                {calculatedMacros.protein}g
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/70 dark:bg-[var(--dark-surface)]/70 border border-amber-500/20">
              <div className="text-[10px] uppercase font-bold text-stone-400">Karbonhidrat</div>
              <div className="text-sm font-black text-amber-500">
                {calculatedMacros.carbs}g
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/70 dark:bg-[var(--dark-surface)]/70 border border-orange-500/20">
              <div className="text-[10px] uppercase font-bold text-stone-400">Şeker</div>
              <div className="text-sm font-black text-orange-500">
                {calculatedMacros.sugar}g
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/70 dark:bg-[var(--dark-surface)]/70 border border-emerald-500/20">
              <div className="text-[10px] uppercase font-bold text-stone-400">Yağ</div>
              <div className="text-sm font-black text-emerald-500">
                {calculatedMacros.fat}g
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/70 dark:bg-[var(--dark-surface)]/70 border border-purple-500/20">
              <div className="text-[10px] uppercase font-bold text-stone-400">Kafein</div>
              <div className="text-sm font-black text-purple-500 flex items-center justify-center gap-0.5">
                <Zap className="w-3.5 h-3.5" />
                {calculatedMacros.caffeine}mg
              </div>
            </div>

          </div>

          {/* Computed Allergen Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-stone-500 dark:text-[var(--dark-text-muted)] mr-1">Tetiklenen Alerjenler:</span>
            {calculatedAllergens.length > 0 ? (
              calculatedAllergens.map(a => {
                const info = ALLERGEN_MAP[a];
                return (
                  <span
                    key={a}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${info.bg} ${info.text}`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </span>
                );
              })
            ) : (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Herhangi bir alerjen tespit edilmedi.
              </span>
            )}
          </div>
        </div>

        {/* Customization Controls Section */}
        <div className="space-y-5">
          
          {/* 1. Size Selection */}
          <div>
            <div id="customizer-size-label" className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--dark-text-muted)] mb-2">
              1. İçecek Boyutu
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-labelledby="customizer-size-label">
              {SIZE_OPTIONS.map((size, index) => (
                <button
                  type="button"
                  role="radio"
                  key={size.id}
                  onClick={() => setCustomization(prev => ({ ...prev, sizeId: size.id }))}
                  onKeyDown={(event) => handleRadioGroupKeyDown(
                    event,
                    index,
                    SIZE_OPTIONS.length,
                    nextIndex => setCustomization(prev => ({ ...prev, sizeId: SIZE_OPTIONS[nextIndex].id })),
                  )}
                  aria-checked={customization.sizeId === size.id}
                  tabIndex={customization.sizeId === size.id ? 0 : -1}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    customization.sizeId === size.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-sm'
                      : 'bg-stone-100/60 dark:bg-[var(--dark-surface-elevated)]/60 border-stone-200 dark:border-[var(--dark-border)] text-stone-700 dark:text-[var(--dark-text-muted)] hover:border-amber-500/30'
                  }`}
                >
                  <div className="text-xs font-bold">{size.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Milk Selection */}
          {item.defaultMilkId && (
            <div>
              <div id="customizer-milk-label" className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--dark-text-muted)] mb-2">
                2. Süt Türü Seçimi
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-labelledby="customizer-milk-label">
                {MILK_OPTIONS.map((milk, index) => {
                  const isSelected = customization.milkId === milk.id;
                  return (
                    <button
                      type="button"
                      role="radio"
                      key={milk.id}
                      onClick={() => setCustomization(prev => ({ ...prev, milkId: milk.id }))}
                      onKeyDown={(event) => handleRadioGroupKeyDown(
                        event,
                        index,
                        MILK_OPTIONS.length,
                        nextIndex => setCustomization(prev => ({ ...prev, milkId: MILK_OPTIONS[nextIndex].id })),
                      )}
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-sm'
                          : 'bg-stone-100/60 dark:bg-[var(--dark-surface-elevated)]/60 border-stone-200 dark:border-[var(--dark-border)] text-stone-700 dark:text-[var(--dark-text-muted)] hover:border-amber-500/30'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{milk.name}</span>
                          {milk.isDairyFree && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              Bitkisel
                            </span>
                          )}
                        </div>
                        {milk.celiacRisk && (
                          <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-0.5">
                            ⚠️ Çölyak Riski (Sertifikasız Yulaf)
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Syrup Pumps */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-100/70 dark:bg-[var(--dark-surface-elevated)]/60 border border-stone-200/60 dark:border-[var(--dark-border)]/60">
            <div>
              <div className="text-xs font-bold text-stone-800 dark:text-[var(--dark-text)]">
                Şurup Pompa Sayısı
              </div>
              <div className="text-[11px] text-stone-500 dark:text-[var(--dark-text-muted)]">
                Her pompa ~20 kcal ve 5g şeker katar.
              </div>
            </div>
            
            <div className="flex items-center gap-3" role="group" aria-label="Şurup pompa sayısı">
              <button
                type="button"
                onClick={() => setCustomization(prev => ({ ...prev, syrupPumps: Math.max(0, prev.syrupPumps - 1) }))}
                disabled={customization.syrupPumps === 0}
                aria-label="Şurup pompasını azalt"
                className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-[var(--dark-surface-elevated)] flex items-center justify-center font-bold text-stone-700 dark:text-[var(--dark-text)] hover:bg-amber-500 hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-base font-black text-amber-600 dark:text-amber-400 min-w-[20px] text-center" aria-live="polite" aria-atomic="true">
                {customization.syrupPumps}
              </span>

              <button
                type="button"
                onClick={() => setCustomization(prev => ({ ...prev, syrupPumps: prev.syrupPumps + 1 }))}
                aria-label="Şurup pompasını artır"
                className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-[var(--dark-surface-elevated)] flex items-center justify-center font-bold text-stone-700 dark:text-[var(--dark-text)] hover:bg-amber-500 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4. Extras & Toppings */}
          <div>
            <div id="customizer-extras-label" className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-[var(--dark-text-muted)] mb-2">
              Ekstra Eklemler & Malzemeler
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-labelledby="customizer-extras-label">
              
              <button
                type="button"
                onClick={() => setCustomization(prev => ({ ...prev, hasWhippedCream: !prev.hasWhippedCream }))}
                aria-pressed={customization.hasWhippedCream}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  customization.hasWhippedCream
                    ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold'
                    : 'bg-stone-100/60 dark:bg-[var(--dark-surface-elevated)]/60 border-stone-200 dark:border-[var(--dark-border)] text-stone-700 dark:text-[var(--dark-text-muted)]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Krema (+82 kcal)</div>
                  <div className="text-[10px] text-stone-400">Süt ürünü içerir</div>
                </div>
                {customization.hasWhippedCream && <Check className="w-4 h-4 text-amber-500" />}
              </button>

              <button
                type="button"
                onClick={() => setCustomization(prev => ({ ...prev, hasColdFoam: !prev.hasColdFoam }))}
                aria-pressed={customization.hasColdFoam}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  customization.hasColdFoam
                    ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold'
                    : 'bg-stone-100/60 dark:bg-[var(--dark-surface-elevated)]/60 border-stone-200 dark:border-[var(--dark-border)] text-stone-700 dark:text-[var(--dark-text-muted)]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Cold Foam (+110 kcal)</div>
                  <div className="text-[10px] text-stone-400">Kremsi tatlı köpük</div>
                </div>
                {customization.hasColdFoam && <Check className="w-4 h-4 text-amber-500" />}
              </button>

              <button
                type="button"
                onClick={() => setCustomization(prev => ({ ...prev, extraEspressoShots: prev.extraEspressoShots > 0 ? 0 : 1 }))}
                aria-pressed={customization.extraEspressoShots > 0}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  customization.extraEspressoShots > 0
                    ? 'bg-purple-500/15 border-purple-500 text-purple-900 dark:text-purple-200 font-bold'
                    : 'bg-stone-100/60 dark:bg-[var(--dark-surface-elevated)]/60 border-stone-200 dark:border-[var(--dark-border)] text-stone-700 dark:text-[var(--dark-text-muted)]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">+1 Shot Espresso</div>
                  <div className="text-[10px] text-purple-400">+75mg Kafein</div>
                </div>
                {customization.extraEspressoShots > 0 && <Check className="w-4 h-4 text-purple-500" />}
              </button>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-200 dark:border-[var(--dark-border)] flex items-center justify-between gap-3">
          <div className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)]">
            Toplam: <span className="font-extrabold text-stone-900 dark:text-[var(--dark-text)] text-sm">{calculatedMacros.calories} kcal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-[var(--dark-border)] text-xs font-semibold text-stone-600 dark:text-[var(--dark-text-muted)] hover:bg-stone-100 dark:hover:bg-[var(--dark-surface-elevated)]"
            >
              Vazgeç
            </button>

            <button
              onClick={() => {
                onAddToBasket(item, customization);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 hover:from-amber-500 hover:to-amber-400 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Sepetime Ekle</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
