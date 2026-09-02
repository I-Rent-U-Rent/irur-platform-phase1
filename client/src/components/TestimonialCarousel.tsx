import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export interface Testimonial {
  name: string;
  role: string;
  title: string;
  quote: string;
}

interface Props {
  items: Testimonial[];
  /** Autoplay interval in ms. */
  interval?: number;
}

function getPerPage() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

/**
 * Auto-playing, swipeable testimonial carousel. Pauses on hover/focus,
 * shows 1 / 2 / 3 cards depending on viewport width.
 */
export default function TestimonialCarousel({ items, interval = 5500 }: Props) {
  const [perPage, setPerPage] = useState(getPerPage);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const maxIndex = Math.max(0, items.length - perPage);
  const pages = maxIndex + 1;

  useEffect(() => {
    const onResize = () => setPerPage(getPerPage());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const go = useCallback(
    (i: number) => setIndex(((i % pages) + pages) % pages),
    [pages]
  );

  useEffect(() => {
    if (paused || pages <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), interval);
    return () => clearInterval(timer);
  }, [paused, pages, maxIndex, interval]);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    }
    touchStartX.current = null;
    setPaused(false);
  };

  const slideWidth = 100 / perPage;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <div
        className="overflow-hidden -mx-3 px-1 py-3 -my-3"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${index * slideWidth}%)` }}
        >
          {items.map((t, i) => {
            const visible = i >= index && i < index + perPage;
            return (
              <div
                key={`${t.name}-${i}`}
                className="flex-shrink-0 px-3"
                style={{ width: `${slideWidth}%` }}
                aria-hidden={!visible}
              >
                <article
                  className={`card-premium p-8 h-full flex flex-col justify-between transition-all duration-500 ${
                    visible ? 'opacity-100 hover-lift' : 'opacity-40 scale-[0.97]'
                  }`}
                  tabIndex={visible ? 0 : -1}
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-50 to-amber-50 dark:from-gold-950 dark:to-amber-950 border border-gold-200 dark:border-gold-800/60 flex items-center justify-center mb-4">
                      <Quote className="w-4 h-4 text-gold-500" />
                    </div>
                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-3">{t.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">{t.quote}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 text-white font-display font-black text-sm flex items-center justify-center flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-bold text-slate-900 dark:text-white text-sm truncate">{t.name}</div>
                      <div className="text-xs text-slate-400 font-medium truncate">{t.role}</div>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous testimonials"
            className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all hover:border-gold-500 hover:text-gold-500 hover:-translate-x-0.5 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial pages">
            {Array.from({ length: pages }).map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Go to testimonials ${i + 1}`}
                  onClick={() => go(i)}
                  className={`relative h-2 rounded-full overflow-hidden transition-all duration-300 ${
                    active ? 'w-8 bg-slate-300 dark:bg-slate-700' : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                  }`}
                >
                  {active && (
                    <span
                      key={`${index}-${paused ? 'p' : 'r'}`}
                      className={`absolute inset-0 rounded-full bg-gold-500 ${paused ? '' : 'dot-fill'}`}
                      style={{ '--dur': `${interval}ms` } as CSSProperties}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next testimonials"
            className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all hover:border-gold-500 hover:text-gold-500 hover:translate-x-0.5 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
