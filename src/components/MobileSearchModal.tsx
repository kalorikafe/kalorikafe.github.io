import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useModalAccessibility(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(t);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobil arama"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-3 shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-stone-400 dark:text-stone-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            aria-label="Mobil aramada ara"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kahve, kafe adı veya filtre ara..."
            className="flex-1 min-w-0 bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm font-bold focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Aramayı temizle"
              className="shrink-0 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-black p-1"
            >
              ✕
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Aramayı kapat"
            className="shrink-0 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-black hover:bg-stone-200 dark:hover:bg-stone-700"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
