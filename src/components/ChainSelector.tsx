import React from 'react';
import { Layers } from 'lucide-react';
import { CHAINS } from '../data/chains';

interface ChainSelectorProps {
  selectedChainId: string | null;
  onSelectChain: (id: string | null) => void;
  chainCounts: Record<string, number>;
  totalCount: number;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChainId,
  onSelectChain,
  chainCounts,
  totalCount,
}) => (
  <section className="flex min-w-0 max-w-full flex-wrap items-end gap-3" aria-labelledby="chain-selector-title">
    <div className="min-w-56 flex-1">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6F4E37]/15 text-[#6F4E37] dark:text-[#D4B996]">
          <Layers className="h-4 w-4" />
        </div>
        <h2 id="chain-selector-title" className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-[var(--dark-text)]">Kafe zinciri</h2>
      </div>
      <label className="sr-only" htmlFor="chain-filter">Kafe zinciri seç</label>
      <select
        id="chain-filter"
        value={selectedChainId ?? ''}
        onChange={event => onSelectChain(event.target.value || null)}
        className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-bold text-stone-900 dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface)] dark:text-[var(--dark-text)]"
      >
        <option value="">Tüm kafeler ({totalCount})</option>
        {CHAINS.map(chain => (
          <option key={chain.id} value={chain.id}>{chain.name} ({chainCounts[chain.id] || 0})</option>
        ))}
      </select>
    </div>
    {selectedChainId && (
      <button type="button" onClick={() => onSelectChain(null)} className="min-h-11 rounded-xl px-3 text-xs font-black text-[#6F4E37] underline dark:text-[#D4B996]">
        Tümünü göster
      </button>
    )}
  </section>
);
