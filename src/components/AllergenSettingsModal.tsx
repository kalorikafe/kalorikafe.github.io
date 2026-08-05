import React from 'react';
import type { Allergen } from '../types/cafe';
import { ALLERGEN_MAP } from '../utils/macroCalculator';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { X, ShieldAlert, Check, AlertTriangle } from 'lucide-react';

interface AllergenSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAllergens: Allergen[];
  onToggleUserAllergen: (a: Allergen) => void;
  hideAllergens: boolean;
  setHideAllergens: (val: boolean) => void;
  clearAllUserAllergens: () => void;
}

const ALLERGEN_KEYS: Allergen[] = ['gluten', 'lactose', 'nuts', 'soy', 'egg', 'celiac_oat_risk'];

export const AllergenSettingsModal: React.FC<AllergenSettingsModalProps> = ({
  isOpen,
  onClose,
  userAllergens,
  onToggleUserAllergen,
  hideAllergens,
  setHideAllergens,
  clearAllUserAllergens,
}) => {
  const dialogRef = useModalAccessibility(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="allergen-dialog-title" tabIndex={-1} className="relative w-full max-w-xl rounded-3xl glass-panel border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 id="allergen-dialog-title" className="text-xl font-extrabold text-stone-900 dark:text-stone-50">
                Kişisel Alerjen & Hassasiyet Profili
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Aşağıdaki alerjenleri seçerek size uygun olmayan kafe ürünlerini önceden görün.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Alerjen profilini kapat"
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Allergen Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALLERGEN_KEYS.map(key => {
            const info = ALLERGEN_MAP[key];
            const isSelected = userAllergens.includes(key);

            return (
              <button
                key={key}
                onClick={() => onToggleUserAllergen(key)}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-sm'
                    : 'bg-stone-100/60 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500/30'
                }`}
              >
                <span className="text-2xl">{info.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{info.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 font-normal">
                    {info.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Behavior Switch */}
        <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 space-y-3">
          <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Filtreleme Davranışı</span>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="allergenBehavior"
                checked={!hideAllergens}
                onChange={() => setHideAllergens(false)}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-stone-700 dark:text-stone-300 font-medium">
                Belirgin Kırmızı İkaz Rozeti Göster (Önerilen)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="allergenBehavior"
                checked={hideAllergens}
                onChange={() => setHideAllergens(true)}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-stone-700 dark:text-stone-300 font-medium">
                Alerji İçeren Tüm Ürünleri Menüden Gizle
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          {userAllergens.length > 0 ? (
            <button
              onClick={clearAllUserAllergens}
              className="text-xs text-red-500 hover:underline font-semibold"
            >
              Seçimleri Temizle
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20"
          >
            Kaydet & Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
