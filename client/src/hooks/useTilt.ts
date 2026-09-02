import { useCallback, useRef } from 'react';
import type { MouseEvent } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Subtle 3D tilt that follows the cursor. Attach `ref`, `onMouseMove`
 * and `onMouseLeave` to the element (add the `tilt-card` class for easing).
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxDeg = 8, lift = 6) {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent<T>) => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (-y * maxDeg).toFixed(2);
      const ry = (x * maxDeg).toFixed(2);
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-${lift}px)`;
    },
    [maxDeg, lift]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = '';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
