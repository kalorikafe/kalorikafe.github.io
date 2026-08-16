import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from '../../src/utils/analytics';

describe('privacy-safe analytics events', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('passes only allow-listed, bounded properties to the analytics client', () => {
    const track = vi.fn();
    vi.stubGlobal('window', { umami: { track } });
    vi.stubGlobal('navigator', { doNotTrack: '0' });

    trackEvent('share', {
      chain: 'caffe_nero',
      category: 'espresso_hot',
      surface: 'x'.repeat(80),
      query: 'sensitive search text',
      allergens: 'milk',
    } as never);

    expect(track).toHaveBeenCalledWith('share', {
      chain: 'caffe_nero',
      category: 'espresso_hot',
      surface: 'x'.repeat(48),
    });
  });

  it('does not emit when Do Not Track is enabled', () => {
    const track = vi.fn();
    vi.stubGlobal('window', { umami: { track } });
    vi.stubGlobal('navigator', { doNotTrack: '1' });
    trackEvent('product_view', { chain: 'starbucks' });
    expect(track).not.toHaveBeenCalled();
  });
});

