import React from 'react';
import type { MenuItem } from '../types/cafe';
import { calculateMacrosAndAllergens, ALLERGEN_MAP } from '../utils/macroCalculator';
import { SIZE_OPTIONS, MILK_OPTIONS } from '../data/modifiers';
import { X, Zap } from 'lucide-react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface NutritionLabelModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const NutritionLabelModal: React.FC<NutritionLabelModalProps> = ({ item, onClose }) => {
  const dialogRef = useModalAccessibility(Boolean(item), onClose);
  if (!item) return null;

  const defaultCustomization = {
    sizeId: item.defaultSizeId || 'tall',
    milkId: item.defaultMilkId || 'whole_milk',
    syrupPumps: item.defaultSyrupPumps || 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0
  };

  const { calculatedMacros, calculatedAllergens } = calculateMacrosAndAllergens(item, defaultCustomization);
  const sizeObj = SIZE_OPTIONS.find(s => s.id === item.defaultSizeId);
  const milkObj = MILK_OPTIONS.find(m => m.id === item.defaultMilkId);
  const source = item.nutritionSource;

  // Daily Value % calculation based on 2000 kcal diet
  const dvFat = Math.round((calculatedMacros.fat / 78) * 100);
  const dvSatFat = Math.round(((calculatedMacros.satFat || 0) / 20) * 100);
  const dvCarb = Math.round((calculatedMacros.carbs / 275) * 100);
  const dvSugar = Math.round((calculatedMacros.sugar / 50) * 100);
  const dvProtein = Math.round((calculatedMacros.protein / 50) * 100);
  const dvSodium = Math.round(((calculatedMacros.sodium || 0) / 2300) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="nutrition-title" tabIndex={-1} className="relative w-full max-w-sm rounded-3xl bg-white text-black shadow-2xl p-6 border-4 border-black space-y-4 font-sans">
        
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          aria-label="Besin değerlerini kapat"
          className="absolute top-4 right-4 p-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* FDA Style Header */}
        <div className="border-b-8 border-black pb-1">
          <h2 id="nutrition-title" className="text-2xl font-black tracking-tight leading-none">
            Besin Değerleri
          </h2>
          <div className="text-sm font-bold mt-1">
            Nutrition Facts
          </div>
          <div className="text-xs text-stone-600 font-semibold mt-0.5">
            Ürün: {item.name}
          </div>
        </div>

        {/* Serving Size info */}
        <div className="border-b-4 border-black pb-2 text-xs font-bold flex justify-between">
          <span>Porsiyon Miktarı:</span>
          <span>{sizeObj ? sizeObj.name : '1 Porsiyon'} {milkObj ? `(${milkObj.name})` : ''}</span>
        </div>

        {/* Calories Header */}
        <div className="border-b-8 border-black pb-1 flex items-baseline justify-between">
          <div>
            <div className="text-xs font-bold uppercase">Porsiyon Başına</div>
            <div className="text-2xl font-black tracking-tight">Kalori (kcal)</div>
          </div>
          <div className="text-4xl font-black">
            {calculatedMacros.calories}
          </div>
        </div>

        {/* Daily Value Header */}
        <div className="text-[11px] font-bold text-right border-b border-black pb-1">
          % Günlük Değer (*DV)
        </div>

        {/* Macro Lines */}
        <div className="space-y-1 text-xs divide-y divide-black/30 font-medium">
          
          <div className="flex justify-between pt-1">
            <span><strong>Toplam Yağ (Total Fat)</strong> {calculatedMacros.fat}g</span>
            <strong>{dvFat}%</strong>
          </div>

          <div className="flex justify-between pt-1 pl-4">
            <span>Doymuş Yağ (Saturated Fat) {calculatedMacros.satFat || 0}g</span>
            <strong>{dvSatFat}%</strong>
          </div>

          <div className="flex justify-between pt-1">
            <span><strong>Sodyum (Sodium)</strong> {calculatedMacros.sodium || 0}mg</span>
            <strong>{dvSodium}%</strong>
          </div>

          <div className="flex justify-between pt-1">
            <span><strong>Toplam Karbonhidrat</strong> {calculatedMacros.carbs}g</span>
            <strong>{dvCarb}%</strong>
          </div>

          <div className="flex justify-between pt-1 pl-4">
            <span>Toplam Şeker (Total Sugars) {calculatedMacros.sugar}g</span>
            <strong>{dvSugar}%</strong>
          </div>

          <div className="flex justify-between pt-1">
            <span><strong>Protein</strong> {calculatedMacros.protein}g</span>
            <strong>{dvProtein}%</strong>
          </div>

          <div className="flex justify-between pt-1 text-purple-900 font-bold">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-600" /> Kafein Oranı:
            </span>
            <span>{calculatedMacros.caffeine} mg</span>
          </div>

        </div>

        {/* Thick Border Divider */}
        <div className="border-t-4 border-black pt-2 text-[10px] text-stone-600 font-medium leading-tight">
          * Yüzdelik Günlük Değerler (%DV), 2.000 kalorilik bir diyeti temel almaktadır. Günlük gereksinimleriniz kişisel kalori ihtiyacınıza göre değişebilir.
        </div>

        {/* Allergen List section */}
        {calculatedAllergens.length > 0 && (
          <div className="pt-2 border-t border-stone-300">
            <div className="text-[10px] font-bold uppercase text-red-600">İçerdiği Alerjenler:</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {calculatedAllergens.map(a => (
                <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                  {ALLERGEN_MAP[a]?.icon} {ALLERGEN_MAP[a]?.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-stone-300 pt-2 text-[10px] leading-relaxed text-stone-600">
          <div className="font-black uppercase text-stone-800">Veri kaynağı</div>
          {source?.status === 'verified' ? (
            <div className="space-y-0.5">
              <p>
                Doğrulandı{source.verifiedAt ? ` · ${source.verifiedAt}` : ''}
                {source.servingBasis ? ` · ${source.servingBasis}` : ''}
              </p>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noreferrer" className="font-bold underline">
                  {source.label || 'Kaynağı aç'}
                </a>
              ) : source.label ? <p>{source.label}</p> : null}
            </div>
          ) : (
            <p>
              Kaynak doğrulaması bekleniyor. Bu değerleri referans kabul edin; resmi güncellik ve porsiyon eşleşmesi garanti edilmez.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
