import React, { useState } from 'react';
import type { MenuItem, CustomizationState, Category } from '../types/cafe';
import { MILK_OPTIONS, SIZE_OPTIONS } from '../data/modifiers';
import { calculateMacrosAndAllergens } from '../utils/macroCalculator';
import { MacroDistributionDonut } from './MacroDistributionDonut';
import { X, Plus, Check, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface CustomRecipeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomRecipe: (item: MenuItem, customization: CustomizationState) => void;
}

export const CustomRecipeBuilderModal: React.FC<CustomRecipeBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomRecipe,
}) => {
  const dialogRef = useModalAccessibility(isOpen, onClose);
  const [recipeName, setRecipeName] = useState<string>('Benim Özel Kahvem');
  const [sizeId, setSizeId] = useState<string>('tall');
  const [milkId, setMilkId] = useState<string>('almond_milk');
  const [syrupPumps, setSyrupPumps] = useState<number>(1);
  const [hasWhippedCream, setHasWhippedCream] = useState<boolean>(false);
  const [hasColdFoam, setHasColdFoam] = useState<boolean>(false);
  const [extraEspressoShots, setExtraEspressoShots] = useState<number>(1);

  if (!isOpen) return null;

  const baseCategory: Category = 'espresso_iced';

  // Template base item for calculation
  const templateItem: MenuItem = {
    id: `custom_${Date.now()}`,
    chainId: 'starbucks',
    name: recipeName || 'Benim Özel Kahvem',
    category: baseCategory,
    description: 'Kendi oluşturduğum özel lezzet ve makro tarifi.',
    image: '/images/menu/placeholder.webp',
    isDrink: true,
    defaultSizeId: 'tall',
    defaultMilkId: 'whole_milk',
    defaultSyrupPumps: 0,
    baseMacros: {
      calories: 45,
      protein: 1.5,
      carbs: 4.0,
      sugar: 3.0,
      fat: 2.0,
      caffeine: 75,
      sodium: 50
    },
    allergens: [],
    dietaryTags: ['vegetarian'],
    glycemicImpact: 'Düşük'
  };

  const customization: CustomizationState = {
    sizeId,
    milkId,
    syrupPumps,
    hasWhippedCream,
    hasColdFoam,
    extraEspressoShots
  };

  const { calculatedMacros, calculatedAllergens } = calculateMacrosAndAllergens(templateItem, customization);

  const handleSave = () => {
    const finalItem: MenuItem = {
      ...templateItem,
      name: recipeName.trim() || 'Benim Özel Kahvem',
      // Set defaults to match the chosen customization so the engine is
      // idempotent: re-running with the same config returns baseMacros.
      defaultSizeId: sizeId,
      defaultMilkId: milkId,
      defaultSyrupPumps: syrupPumps,
      baseCustomization: customization,
      baseMacros: calculatedMacros,
      allergens: calculatedAllergens,
    };

    onSaveCustomRecipe(finalItem, customization);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="recipe-builder-dialog-title" tabIndex={-1} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-stone-200 dark:border-[var(--dark-border)] shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-[var(--dark-border)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <h2 id="recipe-builder-dialog-title" className="text-xl font-extrabold text-stone-900 dark:text-[var(--dark-text)]">
                Kendi Kahveni / Tarifini Oluştur
              </h2>
              <p className="text-xs text-stone-500 dark:text-[var(--dark-text-muted)]">
                Malzemeleri kendin seç, makrolarını anlık hesapla ve sepetine ekle!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tarif oluşturucuyu kapat"
            className="p-2 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-500 hover:text-stone-900 dark:hover:text-[var(--dark-text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Donut Chart & Calculated Macros Dashboard */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <MacroDistributionDonut
            protein={calculatedMacros.protein}
            carbs={calculatedMacros.carbs}
            fat={calculatedMacros.fat}
            size={110}
          />

          <div className="flex-1 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Kalori</div>
              <div className="font-extrabold text-red-500 text-sm">{calculatedMacros.calories} kcal</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Protein</div>
              <div className="font-extrabold text-blue-500 text-sm">{calculatedMacros.protein}g</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Şeker</div>
              <div className="font-extrabold text-orange-500 text-sm">{calculatedMacros.sugar}g</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Karb</div>
              <div className="font-extrabold text-amber-500 text-sm">{calculatedMacros.carbs}g</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Yağ</div>
              <div className="font-extrabold text-emerald-500 text-sm">{calculatedMacros.fat}g</div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[var(--dark-surface)]/80">
              <div className="text-[10px] text-stone-400 font-bold">Kafein</div>
              <div className="font-extrabold text-purple-500 text-sm">{calculatedMacros.caffeine}mg</div>
            </div>
          </div>
        </div>

        {/* Builder Form Controls */}
        <div className="space-y-4 text-xs">
          
          {/* Recipe Name */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">
              Özel Tarif Adınız
            </label>
            <input
              type="text"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="Örn: Ahmet'in Fit Iced Oat Latte'si"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)] font-bold text-stone-900 dark:text-[var(--dark-text)]"
            />
          </div>

          {/* Size Choice */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">Boyut Seçimi</label>
            <div className="grid grid-cols-4 gap-2">
              {SIZE_OPTIONS.map(size => (
                <button
                  key={size.id}
                  onClick={() => setSizeId(size.id)}
                  className={`py-2 rounded-xl border font-bold ${sizeId === size.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
                >
                  {size.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Milk Choice */}
          <div>
            <label className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">Süt Türü</label>
            <select
              value={milkId}
              onChange={(e) => setMilkId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-[var(--dark-surface-elevated)] border border-stone-200 dark:border-[var(--dark-border)] font-semibold"
            >
              {MILK_OPTIONS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.calDelta > 0 ? `+${m.calDelta} kcal` : `${m.calDelta} kcal`})
                </option>
              ))}
            </select>
          </div>

          {/* Syrup & Extra Shots */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">
                Şurup Pompa Sayısı ({syrupPumps})
              </label>
              <input
                type="range"
                min={0}
                max={6}
                value={syrupPumps}
                onChange={(e) => setSyrupPumps(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-[var(--dark-text-muted)] mb-1">
                Espresso Shot ({extraEspressoShots})
              </label>
              <input
                type="range"
                min={1}
                max={4}
                value={extraEspressoShots}
                onChange={(e) => setExtraEspressoShots(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Extras */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setHasWhippedCream(!hasWhippedCream)}
              className={`p-2.5 rounded-xl border flex items-center justify-between font-bold ${hasWhippedCream ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200' : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
            >
              <span>Krema (+82 kcal)</span>
              {hasWhippedCream && <Check className="w-4 h-4 text-amber-500" />}
            </button>

            <button
              onClick={() => setHasColdFoam(!hasColdFoam)}
              className={`p-2.5 rounded-xl border flex items-center justify-between font-bold ${hasColdFoam ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200' : 'bg-stone-100 dark:bg-[var(--dark-surface-elevated)] text-stone-700 dark:text-[var(--dark-text-muted)]'}`}
            >
              <span>Cold Foam (+110 kcal)</span>
              {hasColdFoam && <Check className="w-4 h-4 text-amber-500" />}
            </button>
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
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tarifi Kaydet & Sepete Ekle</span>
          </button>
        </div>

      </div>
    </div>
  );
};
