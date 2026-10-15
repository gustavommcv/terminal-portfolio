import { afterEach, describe, expect, it, vi } from 'vitest';

import { prefersReducedMotion, reducedMotionQuery } from './reduced-motion';

describe('reduced motion', () => {
  const original = window.matchMedia;

  afterEach(() => {
    window.matchMedia = original;
  });

  describe('where the browser has matchMedia', () => {
    it('asks for the setting by its media query, and hands back the live query', () => {
      const query = { matches: true } as MediaQueryList;
      const matchMedia = vi.fn().mockReturnValue(query);
      window.matchMedia = matchMedia;

      expect(reducedMotionQuery()).toBe(query);
      expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('prefers reduced motion when the visitor asked for it', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });

      expect(prefersReducedMotion()).toBe(true);
    });

    it('does not when the visitor did not', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });

      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe('where the browser cannot say (no matchMedia)', () => {
    it('has no query, and assumes motion is fine', () => {
      window.matchMedia = undefined as unknown as typeof window.matchMedia;

      expect(reducedMotionQuery()).toBeUndefined();
      expect(prefersReducedMotion()).toBe(false);
    });
  });
});
