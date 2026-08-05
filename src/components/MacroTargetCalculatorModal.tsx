import React, { useState } from 'react';
import { X, Calculator, Sparkles, Check } from 'lucide-react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

export interface UserMacroGoals {
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  maxCaffeine: number;
}

interface MacroTargetCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGoals?: UserMacroGoals;
  onSaveGoals: (goals: UserMacroGoals) => void;
}

export const MacroTargetCalculatorModal: React.FC<MacroTargetCalculatorModalProps> = ({
  isOpen,
  onClose,
  userGoals: _userGoals,
  onSaveGoals,
}) => {
  const dialogRef = useModalAccessibility(isOpen, onClose);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [activity, setActivity] = useState<number>(1.375); // 1-3 days sport
  const [goalType, setGoalType] = useState<'lose' | 'maintain' | 'gain'>('lose');

  if (!isOpen) return null;

  // Calculate Harris-Benedict BMR
  const calculateResult = () => {
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    }

    let tdee = bmr * activity;

    if (goalType === 'lose') tdee *= 0.8; // 20% deficit
    else if (goalType === 'gain') tdee *= 1.15; // 15% surplus

    const cal = Math.round(tdee);
    const protein = Math.round(weightKg * 1.8);
    const fat = Math.round((cal * 0.25) / 9);
    const carb = Math.round((cal - (protein * 4) - (fat * 9)) / 4);

    return {
      calorieGoal: cal,
      proteinGoal: protein,
      carbGoal: Math.max(50, carb),
      fatGoal: Math.max(40, fat),
      maxCaffeine: 400
    };
  };

  const computedGoals = calculateResult();

  const handleApply = () => {
    onSaveGoals(computedGoals);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="macro-target-dialog-title" tabIndex={-1} className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 id="macro-target-dialog-title" className="text-xl font-extrabold text-stone-900 dark:text-stone-50">
                Kişisel Günlük Makro Hesaplayıcı
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                BMR ve TDEE formülü ile kafe sepetiniz için kişisel hedeflerinizi belirleyin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Makro hesaplayıcıyı kapat"
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Gender */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Cinsiyet</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGender('male')}
                className={`py-2 rounded-xl border font-bold ${gender === 'male' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}
              >
                Erkek
              </button>
              <button
                onClick={() => setGender('female')}
                className={`py-2 rounded-xl border font-bold ${gender === 'female' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}
              >
                Kadın
              </button>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Yaş ({age})</label>
            <input
              type="range"
              min={15}
              max={75}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Kilo ({weightKg} kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Boy ({heightCm} cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold"
            />
          </div>

          {/* Activity Level */}
          <div className="sm:col-span-2">
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Haftalık Aktivite Seviyesi</label>
            <select
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-semibold"
            >
              <option value={1.2}>Masa Başı / Hareketsiz Seviye</option>
              <option value={1.375}>Az Hareketli (Haftada 1-3 Gün Spor)</option>
              <option value={1.55}>Orta Hareketli (Haftada 3-5 Gün Spor)</option>
              <option value={1.725}>Çok Aktif / Atletik (Haftada 6-7 Gün Spor)</option>
            </select>
          </div>

          {/* Goal Type */}
          <div className="sm:col-span-2">
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Ana Hedefiniz</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setGoalType('lose')}
                className={`py-2 px-2 rounded-xl border text-[11px] font-bold ${goalType === 'lose' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}
              >
                🔥 Yağ Yakmak (-20%)
              </button>
              <button
                onClick={() => setGoalType('maintain')}
                className={`py-2 px-2 rounded-xl border text-[11px] font-bold ${goalType === 'maintain' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}
              >
                ⚖️ Kilo Korumak
              </button>
              <button
                onClick={() => setGoalType('gain')}
                className={`py-2 px-2 rounded-xl border text-[11px] font-bold ${goalType === 'gain' ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}
              >
                💪 Kas Yapmak (+15%)
              </button>
            </div>
          </div>

        </div>

        {/* Calculated Preview Dashboard */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-center">
          <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" /> Hesaplanan Günlük Hedefleriniz
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1 text-xs">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80">
              <div className="text-[10px] text-stone-400 font-bold">Hedef Kalori</div>
              <div className="font-black text-red-500 text-sm">{computedGoals.calorieGoal} kcal</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80">
              <div className="text-[10px] text-stone-400 font-bold">Protein</div>
              <div className="font-black text-blue-500 text-sm">{computedGoals.proteinGoal}g</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80">
              <div className="text-[10px] text-stone-400 font-bold">Karb</div>
              <div className="font-black text-amber-500 text-sm">{computedGoals.carbGoal}g</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80">
              <div className="text-[10px] text-stone-400 font-bold">Yağ</div>
              <div className="font-black text-emerald-500 text-sm">{computedGoals.fatGoal}g</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300"
          >
            Vazgeç
          </button>

          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Sepet Hedeflerime Uygula</span>
          </button>
        </div>

      </div>
    </div>
  );
};
