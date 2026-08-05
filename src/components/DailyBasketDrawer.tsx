import React, { useState } from 'react';
import type { BasketItem } from '../types/cafe';
import type { UserMacroGoals } from './MacroTargetCalculatorModal';
import { MILK_OPTIONS, SIZE_OPTIONS } from '../data/modifiers';
import { X, ShoppingBag, Trash2, Copy, Check, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface DailyBasketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  basket: BasketItem[];
  onRemoveItem: (id: string) => void;
  onClearBasket: () => void;
  userGoals: UserMacroGoals;
  onOpenMacroCalculator: () => void;
}

export const DailyBasketDrawer: React.FC<DailyBasketDrawerProps> = ({
  isOpen,
  onClose,
  basket,
  onRemoveItem,
  onClearBasket,
  userGoals,
  onOpenMacroCalculator,
}) => {
  const [copied, setCopied] = useState(false);
  const dialogRef = useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  // Calculate totals
  const totalCalories = basket.reduce((acc, b) => acc + b.calculatedMacros.calories, 0);
  const totalProtein = basket.reduce((acc, b) => acc + b.calculatedMacros.protein, 0);
  const totalCarbs = basket.reduce((acc, b) => acc + b.calculatedMacros.carbs, 0);
  const totalSugar = basket.reduce((acc, b) => acc + b.calculatedMacros.sugar, 0);
  const totalFat = basket.reduce((acc, b) => acc + b.calculatedMacros.fat, 0);
  const totalCaffeine = basket.reduce((acc, b) => acc + b.calculatedMacros.caffeine, 0);

  const calProgress = Math.min(100, Math.round((totalCalories / userGoals.calorieGoal) * 100));

  const handleCopyText = () => {
    let text = `📋 [Kalori Cafe - Günlük Kafe Makro Özeti]\n`;
    text += `🔥 Toplam Kalori: ${totalCalories} / ${userGoals.calorieGoal} kcal\n`;
    text += `💪 Protein: ${totalProtein.toFixed(1)}g / ${userGoals.proteinGoal}g\n`;
    text += `🥖 Karbonhidrat: ${totalCarbs.toFixed(1)}g (${totalSugar.toFixed(1)}g Şeker)\n`;
    text += `🥑 Yağ: ${totalFat.toFixed(1)}g / ${userGoals.fatGoal}g\n`;
    text += `⚡ Kafein: ${totalCaffeine} mg (Kişisel Güvenli Sınır: ${userGoals.maxCaffeine}mg)\n\n`;
    text += `Tüketilen Ürünler:\n`;

    basket.forEach((b, idx) => {
      const sizeObj = SIZE_OPTIONS.find(s => s.id === b.customization.sizeId);
      const milkObj = MILK_OPTIONS.find(m => m.id === b.customization.milkId);
      text += `${idx + 1}. ${b.item.name} (${sizeObj?.name || 'Tall'}, ${milkObj?.name || 'Süt'}) - ${b.calculatedMacros.calories} kcal | ${b.calculatedMacros.protein}g Protein | ${b.calculatedMacros.caffeine}mg Kafein\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn flex justify-end">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="basket-dialog-title" tabIndex={-1} className="relative w-full max-w-md h-full bg-white dark:bg-[var(--dark-surface)] shadow-2xl flex flex-col justify-between border-l border-stone-200 dark:border-[var(--dark-border)]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-[var(--dark-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="basket-dialog-title" className="text-lg font-extrabold text-stone-900 dark:text-[var(--dark-text)]">
                Günlük Kafe Makro Sepetim
              </h2>
              <p className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)]">
                {basket.length} adet ürün kayıtlı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Sepeti kapat"
            className="p-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-500 hover:text-stone-900 dark:hover:text-[var(--dark-text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Personal Goal Dashboard */}
          <div className="p-4 rounded-3xl bg-stone-100/80 dark:bg-[var(--dark-surface-elevated)]/80 border border-stone-200/80 dark:border-[var(--dark-border)]/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-[var(--dark-text)]">
              <span>Günlük Alım İlerlemeniz</span>
              <button
                onClick={onOpenMacroCalculator}
                className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Hedefleri Değiştir
              </button>
            </div>

            {/* Calorie Progress Bar */}
            <div className="w-full h-3 rounded-full bg-stone-200 dark:bg-[var(--dark-surface-elevated)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
                style={{ width: `${calProgress}%` }}
              />
            </div>

            <div className="text-[11px] text-right font-bold text-stone-500 dark:text-[var(--dark-text-muted)]">
              {totalCalories} / {userGoals.calorieGoal} kcal (%{calProgress})
            </div>

            {/* Personal Stats Row */}
            <div className="grid grid-cols-4 gap-1 text-center pt-1 text-xs">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
                <div className="text-[10px] text-stone-400 font-bold">Kalori</div>
                <div className="font-extrabold text-red-500">{totalCalories}</div>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
                <div className="text-[10px] text-stone-400 font-bold">Protein</div>
                <div className="font-extrabold text-blue-500">{totalProtein.toFixed(1)}g</div>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
                <div className="text-[10px] text-stone-400 font-bold">Şeker</div>
                <div className="font-extrabold text-orange-500">{totalSugar.toFixed(1)}g</div>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
                <div className="text-[10px] text-stone-400 font-bold">Kafein</div>
                <div className="font-extrabold text-purple-500">{totalCaffeine}mg</div>
              </div>
            </div>

            {/* Caffeine Warning Banner */}
            {totalCaffeine >= 300 && (
              <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                totalCaffeine >= userGoals.maxCaffeine
                  ? 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
              }`}>
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  {totalCaffeine >= userGoals.maxCaffeine
                    ? `🚨 Kafein Sınırı Aşıldı (${totalCaffeine}mg)! Kişisel max sınır ${userGoals.maxCaffeine}mg'dır.`
                    : `⚠️ Yüksek Kafein Alımı! ${userGoals.maxCaffeine}mg günlük limitinize yaklaştınız.`}
                </span>
              </div>
            )}
          </div>

          {/* Itemized List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-[var(--dark-text-muted)] uppercase tracking-wider">
              <span>Eklenen Ürünler</span>
              {basket.length > 0 && (
                <button
                  onClick={onClearBasket}
                  className="text-red-500 hover:underline lowercase font-normal"
                >
                  sepeti temizle
                </button>
              )}
            </div>

            {basket.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto stroke-1" />
                <p className="text-xs font-semibold">Sepetinizde ürün bulunmuyor.</p>
              </div>
            ) : (
              basket.map(b => {
                const sizeObj = SIZE_OPTIONS.find(s => s.id === b.customization.sizeId);
                const milkObj = MILK_OPTIONS.find(m => m.id === b.customization.milkId);

                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl glass-panel border border-stone-200 dark:border-[var(--dark-border)] flex items-center justify-between gap-3"
                  >
                    <img
                      src={b.item.image}
                      alt={b.item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 dark:bg-[var(--dark-surface-elevated)]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/menu/placeholder.webp';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-[var(--dark-text)] truncate">
                        {b.item.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-[var(--dark-text-muted)] truncate">
                        {sizeObj?.name} {milkObj ? `• ${milkObj.name}` : ''} {b.customization.syrupPumps > 0 ? `• ${b.customization.syrupPumps} Şurup` : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
                        <span className="text-red-500">{b.calculatedMacros.calories} kcal</span>
                        <span className="text-blue-500">{b.calculatedMacros.protein}g P</span>
                        <span className="text-purple-500">{b.calculatedMacros.caffeine}mg K</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(b.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
                      title="Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer Copy & Export */}
        <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-[var(--dark-border)] space-y-3">
          <button
            onClick={handleCopyText}
            disabled={basket.length === 0}
            className={`w-full py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
              copied
                ? 'bg-emerald-600 text-white'
                : basket.length > 0
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-amber-600/20 hover:from-amber-500 hover:to-amber-400'
                : 'bg-stone-200 dark:bg-[var(--dark-surface-elevated)] text-stone-400 cursor-not-allowed'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Panoya Kopyalandı! (MyFitnessPal Hazır)</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Makro Özeti Kopyala (Fitness Uygulamaları)</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-stone-400">
            Kopyalanan özeti MyFitnessPal, FatSecret veya antrenörünüze doğrudan mesaj olarak iletebilirsiniz.
          </p>
        </div>

      </div>
    </div>
  );
};
