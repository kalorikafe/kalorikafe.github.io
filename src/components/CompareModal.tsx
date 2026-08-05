import React from 'react';
import type { MenuItem } from '../types/cafe';
import { CHAINS } from '../data/chains';
import { ALLERGEN_MAP } from '../utils/macroCalculator';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { X, Scale, Flame, Zap, Trash2 } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
}) => {
  const dialogRef = useModalAccessibility(isOpen, onClose);
  if (!isOpen) return null;

  const minCalories = items.length > 0 ? Math.min(...items.map(i => i.baseMacros.calories)) : 0;
  const maxProtein = items.length > 0 ? Math.max(...items.map(i => i.baseMacros.protein)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="compare-dialog-title" tabIndex={-1} className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-stone-200 dark:border-[var(--dark-border)] shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-500">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 id="compare-dialog-title" className="text-xl font-extrabold text-stone-900 dark:text-[var(--dark-text)]">
                Kafe Ürün Karşılaştırması ({items.length}/4)
              </h2>
              <p className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)]">
                Besin değerleri, şeker ve kafein oranlarını yan yana inceleyin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-red-500 hover:underline font-semibold mr-2"
              >
                Karşılaştırmayı Sıfırla
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Karşılaştırmayı kapat"
              className="p-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-500 hover:text-stone-900 dark:hover:text-[var(--dark-text)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center text-stone-500 dark:text-[var(--dark-text-muted)] space-y-2">
            <Scale className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 stroke-1" />
            <p className="text-sm font-semibold">Henüz karşılaştırma için ürün seçmediniz.</p>
            <p className="text-xs">Menüdeki ürün kartlarında bulunan ⚖️ butonuna basarak ürün ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto">
            {items.map(item => {
              const chainObj = CHAINS.find(c => c.id === item.chainId);
              const isLowestCal = item.baseMacros.calories === minCalories && items.length > 1;
              const isHighestProtein = item.baseMacros.protein === maxProtein && maxProtein > 0 && items.length > 1;

              return (
                <div
                  key={item.id}
                  className="relative p-4 rounded-2xl glass-panel border border-stone-200/80 dark:border-[var(--dark-border)]/80 flex flex-col justify-between space-y-3"
                >
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-200/80 dark:bg-[var(--dark-surface-elevated)] text-stone-500 hover:text-red-500 transition-colors"
                    title="Kaldır"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 rounded-xl object-cover bg-stone-100 dark:bg-[var(--dark-surface-elevated)]"
                      onError={(e) => {
                                              (e.target as HTMLImageElement).src = '/images/menu/placeholder.webp';
                                            }}
                    />

                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <img src={chainObj?.logo} alt={chainObj?.name} className="w-4 h-4 object-contain rounded-full bg-white p-0.5" />
                      <span>{chainObj?.name}</span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 dark:text-[var(--dark-text)] line-clamp-2">
                      {item.name}
                    </h4>

                    {/* Best Performance Pills */}
                    {isLowestCal && (
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        🏆 En Düşük Kalori
                      </div>
                    )}
                    {isHighestProtein && (
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        💪 En Yüksek Protein
                      </div>
                    )}
                  </div>

                  {/* Macro Comparison List */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-[var(--dark-border)] text-xs">
                    <div className="flex items-center justify-between p-1 rounded bg-stone-100 dark:bg-[var(--dark-surface-elevated)]">
                      <span className="text-stone-500 text-[11px] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-500" /> Kalori:
                      </span>
                      <span className="font-extrabold text-red-600 dark:text-red-400">
                        {item.baseMacros.calories} kcal
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-1 rounded bg-stone-100 dark:bg-[var(--dark-surface-elevated)]">
                      <span className="text-stone-500 text-[11px]">Protein:</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">
                        {item.baseMacros.protein}g
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-1 rounded bg-stone-100 dark:bg-[var(--dark-surface-elevated)]">
                      <span className="text-stone-500 text-[11px]">Karb (Şeker):</span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400">
                        {item.baseMacros.carbs}g ({item.baseMacros.sugar}g)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-1 rounded bg-stone-100 dark:bg-[var(--dark-surface-elevated)]">
                      <span className="text-stone-500 text-[11px]">Yağ:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {item.baseMacros.fat}g
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-1 rounded bg-stone-100 dark:bg-[var(--dark-surface-elevated)]">
                      <span className="text-stone-500 text-[11px] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-purple-500" /> Kafein:
                      </span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">
                        {item.baseMacros.caffeine} mg
                      </span>
                    </div>
                  </div>

                  {/* Allergen List */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.allergens.map(a => (
                      <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-[var(--dark-surface-elevated)]">
                        {ALLERGEN_MAP[a]?.icon} {ALLERGEN_MAP[a]?.name}
                      </span>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
