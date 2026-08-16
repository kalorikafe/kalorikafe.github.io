import React from 'react';
import type { Allergen, OfficialAllergen } from '../types/cafe';
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

const OFFICIAL_ALLERGEN_KEYS: OfficialAllergen[] = [
  'gluten',
  'crustaceans',
  'egg',
  'fish',
  'peanut',
  'soy',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs',
];

const SENSITIVITY_KEYS: Allergen[] = [
  'lactose',
  'celiac_oat_risk',
];

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
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="allergen-dialog-title" tabIndex={-1} className="relative w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl glass-panel border border-stone-200 dark:border-[var(--dark-border)] shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 id="allergen-dialog-title" className="text-xl font-extrabold text-stone-900 dark:text-[var(--dark-text)]">
                Kişisel Alerjen & Hassasiyet Profili
              </h2>
              <p className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)]">
                Aşağıdaki alerjenleri seçerek size uygun olmayan kafe ürünlerini önceden görün.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Alerjen profilini kapat"
            className="p-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-500 hover:text-stone-900 dark:hover:text-[var(--dark-text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-stone-600 dark:text-[var(--dark-text-muted)]">14 resmî alerjen grubu</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {OFFICIAL_ALLERGEN_KEYS.map(key => {
            const info = ALLERGEN_MAP[key];
            const isSelected = userAllergens.includes(key);

            return (
              <button
                type="button"
                key={key}
                onClick={() => onToggleUserAllergen(key)}
                aria-pressed={isSelected}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-sm'
                    : 'bg-stone-100/60 dark:bg-[var(--dark-surface-elevated)]/60 border-stone-200 dark:border-[var(--dark-border)] text-stone-700 dark:text-[var(--dark-text-muted)] hover:border-amber-500/30'
                }`}
              >
                <span className="text-2xl">{info.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{info.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-[var(--dark-text-muted)] mt-0.5 font-normal">
                    {info.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-stone-600 dark:text-[var(--dark-text-muted)]">İntolerans ve çapraz temas tercihleri</h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SENSITIVITY_KEYS.map(key => {
              const info = ALLERGEN_MAP[key];
              const isSelected = userAllergens.includes(key);
              return (
                <button type="button" key={key} onClick={() => onToggleUserAllergen(key)} aria-pressed={isSelected} className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${isSelected ? 'border-amber-500 bg-amber-500/15 font-bold text-amber-900 dark:text-amber-200' : 'border-stone-200 bg-stone-100/60 text-stone-700 dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface-elevated)]/60 dark:text-[var(--dark-text-muted)]'}`}>
                  <span className="text-2xl">{info.icon}</span>
                  <span><span className="flex items-center justify-between text-xs font-bold">{info.name}{isSelected && <Check className="h-4 w-4" />}</span><span className="mt-0.5 block text-[10px] font-normal text-stone-500 dark:text-[var(--dark-text-muted)]">{info.description}</span></span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cross-contamination & data caveat — always visible */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] leading-relaxed text-stone-700 dark:text-[var(--dark-text-muted)]">
                  <div className="flex items-center gap-2 font-black text-stone-800 dark:text-[var(--dark-text)] mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Alerjen bilgisi garanti değildir</span>
                  </div>
                  Buradaki alerjen işaretleri zincirlerin resmî menü/üretici bilgilerinden derlenen
                  referans özetlerdir; ürün içerikleri şubeye ve döneme göre değişebilir. Gerçek
                  alerji veya çapraz bulaşma riski için lütfen markanın güncel resmî bilgilerini
                  ve ürün ambalajını kontrol edin. Bu uygulama tıbbi tavsiye vermez.
                </div>

                {/* Behavior Switch */}
                <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-[var(--dark-surface-elevated)]/80 border border-stone-200/80 dark:border-[var(--dark-border)]/80 space-y-3">
          <div className="text-xs font-bold text-stone-800 dark:text-[var(--dark-text)] flex items-center gap-2">
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
              <span className="text-stone-700 dark:text-[var(--dark-text-muted)] font-medium">
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
              <span className="text-stone-700 dark:text-[var(--dark-text-muted)] font-medium">
                Seçili riski olan veya alerjen verisi doğrulanmamış ürünleri gizle (en korumacı)
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
