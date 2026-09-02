import { useEffect } from 'react';

/**
 * One document-level listener that feeds the cursor position into every
 * `.card-premium` as CSS variables, powering the radial spotlight in index.css.
 * No per-card handlers needed.
 */
export default function CursorSpotlight() {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    let raf = 0;
    let last: MouseEvent | null = null;

    const apply = () => {
      raf = 0;
      const e = last;
      if (!e) return;
      const target = e.target as Element | null;
      const card = target?.closest?.('.card-premium') as HTMLElement | null;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };

    const onMove = (e: MouseEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
