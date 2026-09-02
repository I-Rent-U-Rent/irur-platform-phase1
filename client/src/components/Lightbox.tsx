import { useEffect, useRef } from 'react';
import type { TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  photos: string[];
  index: number;
  title?: string;
  onClose: () => void;
  onChange: (index: number) => void;
}

/**
 * Full-screen photo viewer. Supports Escape / arrow keys, swipe, thumbnails,
 * and click-outside to close. Rendered in a portal so page transforms never
 * interfere with its fixed positioning.
 */
export default function Lightbox({ photos, index, title, onClose, onChange }: Props) {
  const touchStartX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const count = photos.length;

  const prev = () => onChange((index - 1 + count) % count);
  const next = () => onChange((index + 1) % count);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onChange((index - 1 + count) % count);
      else if (e.key === 'ArrowRight') onChange((index + 1) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [index, count, onClose, onChange]);

  // Preload neighbours so arrowing through feels instant.
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      const src = photos[(i + count) % count];
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [index, photos, count]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    const strip = thumbsRef.current;
    const active = strip?.children[index] as HTMLElement | undefined;
    active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md backdrop-in flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} photo gallery` : 'Photo gallery'}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-semibold text-white/70 tabular-nums">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div
        className="flex-1 relative flex items-center justify-center px-4 sm:px-20 min-h-0"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={photos[index]}
          src={photos[index]}
          alt={title ? `${title} photo ${index + 1}` : `Photo ${index + 1}`}
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl zoom-in select-none"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-gold-500 text-white hover:text-slate-950 flex items-center justify-center transition-all backdrop-blur-sm hover:scale-105"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-gold-500 text-white hover:text-slate-950 flex items-center justify-center transition-all backdrop-blur-sm hover:scale-105"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="px-4 sm:px-6 py-4 overflow-x-auto scrollbar-none" onClick={(e) => e.stopPropagation()}>
          <div ref={thumbsRef} className="flex gap-2 w-max mx-auto">
            {photos.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => onChange(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  i === index
                    ? 'border-gold-500 opacity-100 scale-105'
                    : 'border-transparent opacity-50 hover:opacity-90'
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
