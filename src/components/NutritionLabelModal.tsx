import React from 'react';
import type { MenuItem, NutritionField, NutritionFieldStatus } from '../types/cafe';
import { calculateMacrosAndAllergens, ALLERGEN_MAP } from '../utils/macroCalculator';
import { SIZE_OPTIONS, MILK_OPTIONS } from '../data/modifiers';
import { ExternalLink, X, Zap } from 'lucide-react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface NutritionLabelModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

const RI = { fat: 70, satFat: 20, carbs: 260, sugar: 90, protein: 50, salt: 6 } as const;
const FIELD_STATUS_LABELS: Record<NutritionFieldStatus, string> = {
  official: 'resmî', derived: 'türetilmiş', estimated: 'tahmini', unknown: 'bilinmiyor',
};

const fieldStatus = (item: MenuItem, field: NutritionField): string | undefined => {
  const status = item.nutritionSource?.fieldStatus?.[field];
  return status ? FIELD_STATUS_LABELS[status] : undefined;
};

export const NutritionLabelModal: React.FC<NutritionLabelModalProps> = ({ item, onClose }) => {
  const dialogRef = useModalAccessibility(Boolean(item), onClose);
  if (!item) return null;

  const defaultCustomization = {
    sizeId: item.defaultSizeId || 'standard',
    milkId: item.defaultMilkId || 'none',
    syrupPumps: item.defaultSyrupPumps || 0,
    hasWhippedCream: false,
    hasColdFoam: false,
    extraEspressoShots: 0,
  };
  const { calculatedMacros, calculatedAllergens } = calculateMacrosAndAllergens(item, defaultCustomization);
  const size = SIZE_OPTIONS.find(option => option.id === item.defaultSizeId);
  const milk = MILK_OPTIONS.find(option => option.id === item.defaultMilkId);
  const source = item.nutritionSource;
  const salt = ((calculatedMacros.sodium || 0) * 2.5) / 1000;

  const rows: Array<{ label: string; value: string; percent?: number; field: NutritionField; indent?: boolean }> = [
    { label: 'Toplam yağ', value: `${calculatedMacros.fat} g`, percent: Math.round(calculatedMacros.fat / RI.fat * 100), field: 'fat' },
    { label: 'Doymuş yağ', value: `${calculatedMacros.satFat || 0} g`, percent: Math.round((calculatedMacros.satFat || 0) / RI.satFat * 100), field: 'satFat', indent: true },
    { label: 'Tuz', value: `${salt.toFixed(2)} g`, percent: Math.round(salt / RI.salt * 100), field: 'sodium' },
    { label: 'Karbonhidrat', value: `${calculatedMacros.carbs} g`, percent: Math.round(calculatedMacros.carbs / RI.carbs * 100), field: 'carbs' },
    { label: 'Şekerler', value: `${calculatedMacros.sugar} g`, percent: Math.round(calculatedMacros.sugar / RI.sugar * 100), field: 'sugar', indent: true },
    { label: 'Protein', value: `${calculatedMacros.protein} g`, percent: Math.round(calculatedMacros.protein / RI.protein * 100), field: 'protein' },
  ];

  const sourceHeading = source?.status === 'verified'
    ? 'Resmî besin verisi'
    : source?.status === 'mixed'
      ? 'Resmî ve tahmini alanlar birlikte'
      : source?.status === 'estimated'
        ? 'Tahmini besin verisi'
        : 'Doğrulama bekleniyor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm motion-safe:animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="nutrition-title" tabIndex={-1} className="relative max-h-[92vh] w-full max-w-md space-y-4 overflow-y-auto rounded-3xl border-4 border-black bg-white p-6 font-sans text-black shadow-2xl">
        <button onClick={onClose} aria-label="Besin değerlerini kapat" className="absolute right-3 top-3 min-h-11 min-w-11 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"><X className="mx-auto h-5 w-5" /></button>

        <header className="border-b-8 border-black pb-2 pr-10">
          <h2 id="nutrition-title" className="text-2xl font-black tracking-tight">Besin değerleri</h2>
          <p className="mt-1 text-xs font-bold text-stone-600">{item.name}</p>
        </header>

        <div className="flex justify-between gap-4 border-b-4 border-black pb-2 text-xs font-bold">
          <span>Porsiyon</span>
          <span className="text-right">{source?.servingBasis || size?.name || 'Standart porsiyon'}{milk ? ` · ${milk.name}` : ''}</span>
        </div>

        <div className="flex items-end justify-between border-b-8 border-black pb-2">
          <div><div className="text-xs font-bold uppercase">Porsiyon başına</div><div className="text-2xl font-black">Enerji</div></div>
          <div className="text-right"><div className="text-4xl font-black">{calculatedMacros.calories}</div><div className="text-xs font-bold">kcal {fieldStatus(item, 'calories') && `· ${fieldStatus(item, 'calories')}`}</div></div>
        </div>

        <div className="border-b border-black pb-1 text-right text-[11px] font-bold">% Referans Alım</div>
        <dl className="divide-y divide-black/30 text-xs">
          {rows.map(row => (
            <div key={row.field} className={`grid grid-cols-[1fr_auto] gap-3 py-1.5 ${row.indent ? 'pl-4' : ''}`}>
              <dt><strong>{row.label}</strong> {row.value} {fieldStatus(item, row.field) && <span className="text-[9px] font-bold text-stone-500">({fieldStatus(item, row.field)})</span>}</dt>
              <dd className="font-black">{row.percent}%</dd>
            </div>
          ))}
          <div className="flex justify-between py-2 font-black text-purple-900">
            <dt className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Kafein</dt>
            <dd>{calculatedMacros.caffeine} mg {fieldStatus(item, 'caffeine') && <span className="text-[9px] text-stone-500">({fieldStatus(item, 'caffeine')})</span>}</dd>
          </div>
        </dl>

        <p className="border-t-4 border-black pt-2 text-[10px] leading-relaxed text-stone-600">
          Referans Alım: 2.000 kcal; yağ 70 g, doymuş yağ 20 g, karbonhidrat 260 g, şeker 90 g, protein 50 g ve tuz 6 g. Tuz, sodyum değerinden ×2,5 ile hesaplanır. Kafein için Referans Alım yüzdesi verilmez.
        </p>

        <section className="border-t border-stone-300 pt-3 text-[10px]">
          <h3 className="font-black uppercase text-red-700">Alerjen değerlendirmesi</h3>
          {calculatedAllergens.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {calculatedAllergens.map(allergen => <span key={allergen} className="rounded bg-red-100 px-2 py-1 font-bold text-red-800">{ALLERGEN_MAP[allergen]?.icon} {ALLERGEN_MAP[allergen]?.name}</span>)}
            </div>
          ) : <p className="mt-1">{item.allergenSource?.status === 'official' ? 'Kaynakta bildirilen alerjen yok.' : 'Alerjen bilgisi bulunmuyor veya doğrulanmadı; “alerjen yok” anlamına gelmez.'}</p>}
          {item.containsLactose && <p className="mt-1 font-bold">Laktoz içerir.</p>}
          {item.crossContactRisks?.includes('celiac_oat_risk') && <p className="mt-1 font-bold">Yulaf/glüten çapraz temas riski olabilir.</p>}
        </section>

        <section className="border-t border-stone-300 pt-3 text-[10px] leading-relaxed text-stone-600">
          <h3 className="font-black uppercase text-stone-800">Veri kaynağı</h3>
          <p className="font-bold">{sourceHeading}{source?.verifiedAt ? ` · ${source.verifiedAt}` : ''}</p>
          {source?.notes && <p className="mt-1">{source.notes}</p>}
          {source?.url && <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1 font-black underline">{source.label || 'Kaynağı aç'} <ExternalLink className="h-3 w-3" /></a>}
        </section>
      </div>
    </div>
  );
};
