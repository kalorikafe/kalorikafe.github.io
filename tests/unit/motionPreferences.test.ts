import { describe, expect, it } from 'vitest';
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from '../../src/utils/motionPreferences';

describe('motion preferences', () => {
  it('uses the standard reduced-motion media query', () => {
    let receivedQuery = '';
    const result = prefersReducedMotion(query => {
      receivedQuery = query;
      return { matches: true };
    });

    expect(receivedQuery).toBe(REDUCED_MOTION_QUERY);
    expect(result).toBe(true);
  });

  it('returns false when the preference does not match', () => {
    expect(prefersReducedMotion(() => ({ matches: false }))).toBe(false);
  });
});
