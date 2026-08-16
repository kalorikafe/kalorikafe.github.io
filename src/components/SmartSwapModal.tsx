import React, { useMemo } from 'react';
import { ArrowRight, ExternalLink, Flame, ShieldAlert, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CHAINS } from '../data/chains';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import type { MenuItem } from '../types/cafe';
import { buildSwapPairs } from '../utils/smartSwaps';

interface SmartSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: readonly MenuItem[];
  detailsPath: (item: MenuItem) => string;
}

const sourceLabel = (item: MenuItem): string => {
  if (item.nutritionSource?.status === 'verified') return 'resmî';
  if (item.nutritionSource?.status === 'mixed') return 'karma';
  if (item.nutritionSource?.status === 'estimated') return 'tahmini';
  return 'doğrulanmamış';
};

export const SmartSwapModal: React.FC<SmartSwapModalProps> = ({ isOpen, onClose, items, detailsPath }) => {
  const dialogRef = useModalAccessibility(isOpen, onClose);
  const pairs = useMemo(() => buildSwapPairs(items), [items]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn sm:p-6">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="smart-swap-dialog-title" tabIndex={-1} className="relative max-h-[90vh] w-full max-w-3xl space-y-6 overflow-y-auto rounded-3xl border border-stone-200 p-6 shadow-2xl glass-panel dark:border-[var(--dark-border)]">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4 dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 id="smart-swap-dialog-title" className="text-xl font-extrabold text-stone-900 dark:text-[var(--dark-text)]">Katalogdan Daha Hafif Alternatifler</h2>
              <p className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)]">Aynı zincir, ürün ailesi ve porsiyon temelindeki kaynaklı alanlar karşılaştırılır.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Alternatifler penceresini kapat" className="min-h-11 min-w-11 rounded-xl bg-stone-100 p-2 text-stone-500 dark:bg-[var(--dark-surface-elevated)]">
            <X className="mx-auto h-5 w-5" />
          </button>
        </div>

        {pairs.length === 0 ? (
          <p className="rounded-2xl border border-stone-200 p-5 text-sm dark:border-[var(--dark-border)]">Bu görünümde resmî/türetilmiş kalori ve şeker alanlarıyla güvenle karşılaştırılabilen bir alternatif yok. Filtreleri genişletip yeniden deneyin.</p>
        ) : (
          <ul className="space-y-3">
            {pairs.map(pair => {
              const chainName = CHAINS.find(chain => chain.id === pair.original.chainId)?.name ?? pair.original.chainId;
              return (
                <li key={`${pair.original.id}:${pair.alternative.id}`} className="space-y-3 rounded-2xl border border-stone-200/80 bg-stone-50 p-4 dark:border-[var(--dark-border)]/80 dark:bg-[var(--dark-surface-elevated)]/60">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wide text-stone-500">{chainName}</span>
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <Flame className="h-3.5 w-3.5" /> {pair.savedCalories} kcal{pair.savedSugar > 0 ? ` · ${pair.savedSugar} g şeker` : ''} daha az
                    </span>
                  </div>
                  <div className="grid items-center gap-2 text-xs sm:grid-cols-[1fr_auto_1fr]">
                    <div>
                      <Link to={detailsPath(pair.original)} onClick={onClose} className="inline-flex min-h-11 items-center font-black underline">{pair.original.name}<ExternalLink className="ml-1 h-3 w-3" /></Link>
                      <p className="text-stone-500">{pair.original.baseMacros.calories} kcal · {pair.original.baseMacros.sugar} g şeker · {sourceLabel(pair.original)}</p>
                    </div>
                    <ArrowRight className="hidden h-4 w-4 text-emerald-500 sm:block" />
                    <div>
                      <Link to={detailsPath(pair.alternative)} onClick={onClose} className="inline-flex min-h-11 items-center font-black text-emerald-700 underline dark:text-emerald-300">{pair.alternative.name}<ExternalLink className="ml-1 h-3 w-3" /></Link>
                      <p className="text-stone-500">{pair.alternative.baseMacros.calories} kcal · {pair.alternative.baseMacros.sugar} g şeker · {sourceLabel(pair.alternative)}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-950 dark:text-amber-100">
          <div className="flex items-center gap-1.5 font-bold"><ShieldAlert className="h-4 w-4 text-amber-500" /> Karşılaştırmanın sınırı</div>
          <p>Bu bir reçete değiştirme veya tıbbi uygunluk önerisi değildir. Yalnız aynı zincir, kategori, ad ailesi ve porsiyon temelindeki ürünlerin resmî/türetilmiş kalori-şeker alanları kullanılır; içerik, tat ve alerjenler yine farklı olabilir.</p>
        </div>
      </div>
    </div>
  );
};
