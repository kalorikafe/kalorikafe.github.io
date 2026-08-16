import type React from 'react';

export function getRadioNavigationIndex(key: string, currentIndex: number, itemCount: number): number | null {
  if (itemCount <= 0) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return itemCount - 1;
  if (key === 'ArrowRight' || key === 'ArrowDown') return (currentIndex + 1) % itemCount;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (currentIndex - 1 + itemCount) % itemCount;
  return null;
}

/** Implements the WAI-ARIA radio-group arrow-key and roving-focus contract. */
export function handleRadioGroupKeyDown<T extends HTMLElement>(
  event: React.KeyboardEvent<T>,
  currentIndex: number,
  itemCount: number,
  onSelect: (nextIndex: number) => void,
) {
  const nextIndex = getRadioNavigationIndex(event.key, currentIndex, itemCount);
  if (nextIndex === null) return;

  event.preventDefault();
  const group = event.currentTarget.closest('[role="radiogroup"]');
  onSelect(nextIndex);
  window.requestAnimationFrame(() => {
    group?.querySelectorAll<HTMLElement>('[role="radio"]')[nextIndex]?.focus();
  });
}
