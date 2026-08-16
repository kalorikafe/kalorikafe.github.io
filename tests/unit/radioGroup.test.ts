import { describe, expect, it } from 'vitest';
import { getRadioNavigationIndex } from '../../src/utils/radioGroup';

describe('radio group keyboard navigation', () => {
  it('wraps forward and backward arrow navigation', () => {
    expect(getRadioNavigationIndex('ArrowRight', 2, 3)).toBe(0);
    expect(getRadioNavigationIndex('ArrowUp', 0, 3)).toBe(2);
  });

  it('supports Home and End without handling unrelated keys', () => {
    expect(getRadioNavigationIndex('Home', 2, 4)).toBe(0);
    expect(getRadioNavigationIndex('End', 0, 4)).toBe(3);
    expect(getRadioNavigationIndex('Tab', 0, 4)).toBeNull();
  });
});
