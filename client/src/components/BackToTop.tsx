import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** Floating "back to top" button that appears once the user has scrolled a bit. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`hidden lg:flex fixed bottom-6 right-6 z-40 w-11 h-11 items-center justify-center rounded-full bg-slate-900/90 dark:bg-slate-800/90 text-gold-400 border border-gold-500/30 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-gold-500 hover:text-slate-950 hover:border-gold-500 hover:-translate-y-1 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
