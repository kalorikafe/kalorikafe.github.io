import React, { useState } from 'react';
import { X, Calculator, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { handleRadioGroupKeyDown } from '../utils/radioGroup';
import {
  DEFAULT_MACRO_PROFILE,
  calculateUserMacroGoals,
  validateProfile,
  type MacroProfile,
  type UserMacroGoals,
} from '../utils/macroGoals';

export type { UserMacroGoals, MacroProfile };

interface MacroTargetCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGoals?: UserMacroGoals;
  onSaveGoals: (goals: UserMacroGoals) => void;
}

export const MacroTargetCalculatorModal: React.FC<MacroTargetCalculatorModalProps> = ({
  isOpen,
  onClose,
  userGoals,
  onSaveGoals,
}) => {
  const dialogRef = useModalAccessibility(isOpen, onClose);

  // The modal mounts fresh on every open, so initializing from the saved
  // profile (falling back to the default profile) always reflects the
  // latest stored state — including migrated legacy records.
  const savedProfile = userGoals?.profile ?? DEFAULT_MACRO_PROFILE;

  const [gender, setGender] = useState<MacroProfile['gender']>(savedProfile.gender);
  const [age, setAge] = useState<number>(savedProfile.age);
  const [weightKg, setWeightKg] = useState<number>(savedProfile.weightKg);
  const [heightCm, setHeightCm] = useState<number>(savedProfile.heightCm);
  const [activity, setActivity] = useState<number>(savedProfile.activity); // 1-3 days sport
  const [goalType, setGoalType] = useState<MacroProfile['goalType']>(savedProfile.goalType);

  if (!isOpen) return null;

  const validation = validateProfile({ age, weightKg, heightCm });
  const isValid = validation.valid;

  const profile: MacroProfile = { gender, age, weightKg, heightCm, activity, goalType };
  const computedGoals = calculateUserMacroGoals(profile);

  const handleApply = () => {
    if (!isValid) return;
    onSaveGoals(computedGoals);
    onClose();
  };

  const fieldError = (field: 'age' | 'weightKg' | 'heightCm'): string | null => {
    if (validation[field]) return null;
    const { min, max } =
      field === 'age' ? { min: 15, max: 75 } : field === 'weightKg' ? { min: 35, max: 250 } : { min: 120, max: 230 };
    return `${min}–${max} arasında bir değer girin`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="macro-target-dialog-title" tabIndex={-1} className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-stone-200 dark:border-[var(--dark-border)] shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 id="macro-target-dialog-title" className="text-xl font-extrabold text-stone-900 dark:text-[var(--dark-text)]">
                Kişisel Günlük Makro Hesaplayıcı
              </h2>
              <p className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)]">
                BMR ve TDEE formülü ile kafe sepetiniz için kişisel hedeflerinizi belirleyin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Makro hesaplayıcıyı kapat"
            className="p-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-500 hover:text-stone-900 dark:hover:text-[var(--dark-text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Gender */}
          <div>
            <div id="macro-gender-label" className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">Cinsiyet</div>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="macro-gender-label">
              <button
                type="button"
                role="radio"
                onClick={() => setGender('male')}
                onKeyDown={(event) => handleRadioGroupKeyDown(event, 0, 2, nextIndex => setGender(nextIndex === 0 ? 'male' : 'female'))}
                aria-checked={gender === 'male'}
                tabIndex={gender === 'male' ? 0 : -1}
                className={`py-2 rounded-xl border font-bold ${gender === 'male' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
              >
                Erkek
              </button>
              <button
                type="button"
                role="radio"
                onClick={() => setGender('female')}
                onKeyDown={(event) => handleRadioGroupKeyDown(event, 1, 2, nextIndex => setGender(nextIndex === 0 ? 'male' : 'female'))}
                aria-checked={gender === 'female'}
                tabIndex={gender === 'female' ? 0 : -1}
                className={`py-2 rounded-xl border font-bold ${gender === 'female' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
              >
                Kadın
              </button>
            </div>
          </div>

          {/* Age */}
          <div>
            <label htmlFor="macro-age" className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">Yaş ({age})</label>
            <input
              id="macro-age"
              type="range"
              min={15}
              max={75}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              aria-invalid={!validation.age}
              aria-describedby={!validation.age ? 'age-error' : undefined}
              className="w-full accent-amber-500"
            />
            {fieldError('age') && (
              <p id="age-error" className="mt-1 text-[10px] font-bold text-red-600 dark:text-red-400" role="alert">
                {fieldError('age')}
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="macro-weight" className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">Kilo ({weightKg} kg)</label>
            <input
              id="macro-weight"
              type="number"
              min={35}
              max={250}
              value={Number.isFinite(weightKg) ? weightKg : ''}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              data-testid="macro-weight-input"
              aria-invalid={!validation.weightKg}
              aria-describedby={!validation.weightKg ? 'weight-error' : undefined}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)] font-bold"
            />
            {!validation.weightKg && (
              <p id="weight-error" className="mt-1 text-[10px] font-bold text-red-600 dark:text-red-400" role="alert">
                {fieldError('weightKg')}
              </p>
            )}
          </div>

          {/* Height */}
          <div>
            <label htmlFor="macro-height" className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">Boy ({heightCm} cm)</label>
            <input
              id="macro-height"
              type="number"
              min={120}
              max={230}
              value={Number.isFinite(heightCm) ? heightCm : ''}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              data-testid="macro-height-input"
              aria-invalid={!validation.heightCm}
              aria-describedby={!validation.heightCm ? 'height-error' : undefined}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)] font-bold"
            />
            {!validation.heightCm && (
              <p id="height-error" className="mt-1 text-[10px] font-bold text-red-600 dark:text-red-400" role="alert">
                {fieldError('heightCm')}
              </p>
            )}
          </div>

          {/* Activity Level */}
          <div className="sm:col-span-2">
            <label htmlFor="macro-activity" className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">Haftalık Aktivite Seviyesi</label>
            <select
              id="macro-activity"
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)] font-semibold"
            >
              <option value={1.2}>Masa Başı / Hareketsiz Seviye</option>
              <option value={1.375}>Az Hareketli (Haftada 1-3 Gün Spor)</option>
              <option value={1.55}>Orta Hareketli (Haftada 3-5 Gün Spor)</option>
              <option value={1.725}>Çok Aktif / Atletik (Haftada 6-7 Gün Spor)</option>
            </select>
          </div>

          {/* Goal Type */}
          <div className="sm:col-span-2">
            <div id="macro-goal-label" className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">Ana Hedefiniz</div>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="macro-goal-label">
              <button
                type="button"
                role="radio"
                onClick={() => setGoalType('lose')}
                onKeyDown={(event) => handleRadioGroupKeyDown(event, 0, 3, nextIndex => setGoalType((['lose', 'maintain', 'gain'] as const)[nextIndex]))}
                aria-checked={goalType === 'lose'}
                tabIndex={goalType === 'lose' ? 0 : -1}
                className={`py-2 px-2 rounded-xl border text-[11px] font-bold ${goalType === 'lose' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
              >
                🔥 Yağ Yakmak (-20%)
              </button>
              <button
                type="button"
                role="radio"
                onClick={() => setGoalType('maintain')}
                onKeyDown={(event) => handleRadioGroupKeyDown(event, 1, 3, nextIndex => setGoalType((['lose', 'maintain', 'gain'] as const)[nextIndex]))}
                aria-checked={goalType === 'maintain'}
                tabIndex={goalType === 'maintain' ? 0 : -1}
                className={`py-2 px-2 rounded-xl border text-[11px] font-bold ${goalType === 'maintain' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
              >
                ⚖️ Kilo Korumak
              </button>
              <button
                type="button"
                role="radio"
                onClick={() => setGoalType('gain')}
                onKeyDown={(event) => handleRadioGroupKeyDown(event, 2, 3, nextIndex => setGoalType((['lose', 'maintain', 'gain'] as const)[nextIndex]))}
                aria-checked={goalType === 'gain'}
                tabIndex={goalType === 'gain' ? 0 : -1}
                className={`py-2 px-2 rounded-xl border text-[11px] font-bold ${goalType === 'gain' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
              >
                💪 Kas Yapmak (+15%)
              </button>
            </div>
          </div>

        </div>

        {/* Validation summary */}
        {!isValid && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/40 text-[11px] font-bold text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Geçersiz değerler var: lütfen yaş (15–75), kilo (35–250 kg) ve boy (120–230 cm)
              alanlarını kontrol edin. Hesaplama geçersiz girdilerle yapılmaz.
            </span>
          </div>
        )}

        {/* Calculated Preview Dashboard */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-center">
          <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" /> Hesaplanan Günlük Hedefleriniz
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1 text-xs">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Hedef Kalori</div>
              <div className="font-black text-red-500 text-sm">{computedGoals.calorieGoal} kcal</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Protein</div>
              <div className="font-black text-blue-500 text-sm">{computedGoals.proteinGoal}g</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Karb</div>
              <div className="font-black text-amber-500 text-sm">{computedGoals.carbGoal}g</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Yağ</div>
              <div className="font-black text-emerald-500 text-sm">{computedGoals.fatGoal}g</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-[var(--dark-border)] text-xs font-semibold text-stone-600 dark:text-[var(--dark-text-muted)]"
          >
            Vazgeç
          </button>

          <button
            onClick={handleApply}
            disabled={!isValid}
            data-testid="macro-apply-button"
            className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 ${
              isValid
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400'
                : 'bg-stone-300 dark:bg-[var(--dark-surface-elevated)] cursor-not-allowed opacity-60'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Sepet Hedeflerime Uygula</span>
          </button>
        </div>

      </div>
    </div>
  );
};
