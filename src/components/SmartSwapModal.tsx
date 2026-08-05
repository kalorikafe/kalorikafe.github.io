import React from 'react';
import { X, Sparkles, ArrowRight, Flame, ShieldAlert, Check } from 'lucide-react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { SMART_SWAPS } from '../data/smartSwaps';

interface SmartSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartSwapModal: React.FC<SmartSwapModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useModalAccessibility(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="smart-swap-dialog-title" tabIndex={-1} className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-stone-200 dark:border-[var(--dark-border)] shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 id="smart-swap-dialog-title" className="text-xl font-extrabold text-stone-900 dark:text-[var(--dark-text)]">
                Akıllı Kalori & Şeker Tasarruf Rehberi
              </h2>
              <p className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)]">
                Aynı lezzeti korurken 150-200 kcal ve onlarca gram şeker tasarrufu sağlayan ipuçları.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Akıllı takas rehberini kapat"
            className="p-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-500 hover:text-stone-900 dark:hover:text-[var(--dark-text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smart Swap Cards List */}
        <div className="space-y-3">
          {SMART_SWAPS.map((swap, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-stone-50 dark:bg-[var(--dark-surface-elevated)]/60 border border-stone-200/80 dark:border-[var(--dark-border)]/80 space-y-2 hover:border-emerald-500/40 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-stone-900 dark:text-[var(--dark-text)]">
                  {swap.original}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {swap.badge}
                </span>
              </div>

              <div className="flex items-center gap-3 py-1.5 text-xs">
                <div className="text-stone-500 line-through">
                  {swap.originalCal} kcal ({swap.originalSugar}g Şeker)
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {swap.originalCal - swap.savedCal} kcal ({swap.originalSugar - swap.savedSugar}g Şeker)
                </div>
              </div>

              <div className="text-xs font-bold text-stone-800 dark:text-[var(--dark-text)] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{swap.swapTitle}:</span>
                <span className="font-normal text-stone-600 dark:text-[var(--dark-text-muted)]">{swap.swapDescription}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Barista Ordering Tips */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Baristadan Sipariş Verirken Altın İpuçları:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-700 dark:text-[var(--dark-text-muted)]">
            <li>"Şurubumu yarı yarıya (half-sweet) azaltır mısınız?" deyin (Örn: 4 pompa yerine 2 pompa).</li>
            <li>Sauce (Sos) ile Syrup (Şurup) farkını unutmayın! Soslar yoğun şeker ve süt tozu içerir.</li>
            <li>Çölyak hastasıysanız yulaf sütü yerine Badem veya Soya sütü tercih edin.</li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
          >
            Anladım, Menüye Dön
          </button>
        </div>

      </div>
    </div>
  );
};
