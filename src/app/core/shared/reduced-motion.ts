const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * The browser's answer to whether the visitor asked for less motion, as a live
 * query (it can be listened to, for a visitor who changes the setting while the
 * page is open). `undefined` where the browser cannot say: during server
 * rendering, or in a test DOM without `matchMedia`.
 */
export function reducedMotionQuery(): MediaQueryList | undefined {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_MOTION)
    : undefined;
}

/** Whether the visitor asked for less motion; false where the browser cannot say. */
export function prefersReducedMotion(): boolean {
  return reducedMotionQuery()?.matches ?? false;
}
