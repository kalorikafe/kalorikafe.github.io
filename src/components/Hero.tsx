import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  onSelectQuickFilter: (filter: string) => void;
  itemCount: number;
}

const QUICK_FILTERS = [
  { label: '☕ Starbucks', filter: 'Starbucks' },
  { label: '☕ Caffè Nero', filter: 'Nero' },
  { label: '🌾 Glutensiz', filter: 'Glutensiz' },
  { label: '🧊 Soğuk kahve', filter: 'Soğuk Kahve' },
] as const;

export const Hero: React.FC<HeroProps> = ({ onSelectQuickFilter, itemCount }) => (
  <div className="relative mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
    <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-gradient-to-r from-stone-50 via-white to-[#F5EBE6] p-5 text-left shadow-sm dark:border-[var(--dark-border)]/90 dark:from-[#241E1A] dark:via-[#1C1816] dark:to-[#171412] md:p-7">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#6F4E37]/20 bg-white/90 px-3 py-1 text-[11px] font-black tracking-wide text-[#6F4E37] dark:border-[#D4B996]/30 dark:bg-[var(--dark-surface-elevated)]/90 dark:text-[#D4B996]">
        <Sparkles className="h-4 w-4" />
        <span>{itemCount} ürün · 10 zincir · kaynak durumu açık</span>
      </div>

      <h1 className="mt-3 max-w-3xl text-2xl font-black leading-tight tracking-tight text-stone-900 dark:text-[var(--dark-text)] sm:text-3xl">
        Kahveni ve atıştırmalığını <span className="text-[#6F4E37] dark:text-[#D4B996]">veriye göre seç</span>
      </h1>
      <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-stone-600 dark:text-[var(--dark-text-muted)]">
        Kalori, makro, kafein ve alerjen bilgisini karşılaştır; resmî alanla tahmini alanı aynı sanma.
      </p>
      <p className="mt-2 max-w-4xl text-[11px] leading-relaxed text-stone-500 dark:text-[var(--dark-text-muted)]">
        Besin değerleri ürün kartındaki güven düzeyine göre resmî, karma veya tahminidir. Alerjen bilgisi tıbbi tavsiye değildir; ciddi alerjilerde markadan ve şubeden teyit alın.{' '}
        <Link to="/metodoloji/" className="inline-flex min-h-11 items-center font-black text-amber-700 underline dark:text-amber-300">Metodolojiyi incele</Link>
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        {QUICK_FILTERS.map(pill => (
          <button
            key={pill.filter}
            type="button"
            onClick={() => onSelectQuickFilter(pill.filter)}
            className="min-h-11 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition hover:border-[#6F4E37] hover:bg-[#6F4E37] hover:text-white dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface-elevated)]/90 dark:text-[var(--dark-text)] dark:hover:border-[#D4B996] dark:hover:bg-[#D4B996] dark:hover:text-[#2C221E]"
          >
            {pill.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);
