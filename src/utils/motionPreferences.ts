export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type MatchMediaLike = (query: string) => { matches: boolean };

/**
 * Returns the user's OS/browser motion preference without assuming `window`
 * exists. The optional matcher keeps the helper deterministic in unit tests.
 */
export function prefersReducedMotion(matchMediaOverride?: MatchMediaLike): boolean {
  const matcher = matchMediaOverride
    ?? (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia.bind(window)
      : null);

  return matcher ? matcher(REDUCED_MOTION_QUERY).matches : false;
}
