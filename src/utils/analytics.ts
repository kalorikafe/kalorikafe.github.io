export const ANALYTICS_EVENTS = [
  'chain_select',
  'filter_apply',
  'product_view',
  'share',
  'customizer_open',
  'basket_add',
  'compare_open',
  'compare_toggle',
  'favorite_toggle',
  'custom_recipe_save',
  'custom_recipe_delete',
] as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[number];
type SafeProperty = 'chain' | 'category' | 'surface' | 'action' | 'result' | 'count';
export type AnalyticsProperties = Partial<Record<SafeProperty, string | number | boolean>>;

declare global {
  interface Window {
    umami?: { track: (event: string, properties?: AnalyticsProperties) => void };
  }
}

const SAFE_PROPERTIES = new Set<SafeProperty>(['chain', 'category', 'surface', 'action', 'result', 'count']);

const isDoNotTrackEnabled = (): boolean =>
  typeof navigator !== 'undefined' && navigator.doNotTrack === '1';

export const initAnalytics = (): void => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL;
  if (!websiteId || !scriptUrl || isDoNotTrackEnabled()) return;
  if (document.querySelector('script[data-kalori-cafe-analytics]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = scriptUrl;
  script.dataset.websiteId = websiteId;
  script.dataset.excludeSearch = 'true';
  script.dataset.doNotTrack = 'true';
  script.dataset.performance = 'true';
  script.dataset.kaloriCafeAnalytics = 'true';
  document.head.append(script);
};

export const trackEvent = (event: AnalyticsEvent, properties: AnalyticsProperties = {}): void => {
  if (typeof window === 'undefined' || isDoNotTrackEnabled()) return;
  const sanitized: AnalyticsProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!SAFE_PROPERTIES.has(key as SafeProperty)) continue;
    if (typeof value === 'string') sanitized[key as SafeProperty] = value.slice(0, 48);
    else if (typeof value === 'number' && Number.isFinite(value)) sanitized[key as SafeProperty] = value;
    else if (typeof value === 'boolean') sanitized[key as SafeProperty] = value;
  }
  window.umami?.track(event, sanitized);
};
