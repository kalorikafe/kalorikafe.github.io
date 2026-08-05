import React from 'react';
import { CHAINS } from '../data/chains';
import { Layers } from 'lucide-react';

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
}) => {
  return (
    <section className="space-y-3 min-w-0 max-w-full overflow-hidden" aria-labelledby="chain-selector-title">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6F4E37]/15 flex items-center justify-center text-[#6F4E37] dark:text-[#D4B996]">
            <Layers className="w-4 h-4" />
          </div>
          <h2 id="chain-selector-title" className="text-sm font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider">
            Kafe Zincirleri ({CHAINS.length} Popüler Marka)
          </h2>
        </div>

        {selectedChainId && (
          <button
            onClick={() => onSelectChain(null)}
            className="text-xs font-bold text-[#6F4E37] dark:text-[#D4B996] hover:underline"
          >
            Tüm Zincirleri Göster
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Pills */}
      <div className="flex w-full max-w-full items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        
        {/* All Chains Badge */}
        <button
          onClick={() => onSelectChain(null)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black transition-all ${
            selectedChainId === null
              ? 'bg-[#2C221E] text-white dark:bg-[#FAF8F5] dark:text-[#2C221E] border-[#2C221E] dark:border-[#FAF8F5] shadow-md scale-105'
              : 'bg-white dark:bg-[#1C1816] border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-[#6F4E37]'
          }`}
        >
          <span>☕ Tüm Kafeler</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            selectedChainId === null ? 'bg-white/20 dark:bg-black/20 text-white dark:text-[#2C221E]' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* Chain Items */}
        {CHAINS.map(chain => {
          const isSelected = selectedChainId === chain.id;
          const count = chainCounts[chain.id] || 0;

          return (
            <button
              key={chain.id}
              onClick={() => onSelectChain(chain.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black transition-all ${
                isSelected
                  ? 'bg-[#2C221E] text-white dark:bg-[#FAF8F5] dark:text-[#2C221E] border-[#2C221E] dark:border-[#FAF8F5] shadow-md scale-105'
                  : 'bg-white dark:bg-[#1C1816] border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-[#6F4E37]'
              }`}
            >
              {chain.logo.startsWith('http') ? (
                <img src={chain.logo} alt={chain.name} className="w-5 h-5 object-contain rounded-full bg-white p-0.5" />
              ) : (
                <span>{chain.logo}</span>
              )}
              <span>{chain.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isSelected ? 'bg-[#6F4E37] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}

      </div>
    </section>
  );
};
