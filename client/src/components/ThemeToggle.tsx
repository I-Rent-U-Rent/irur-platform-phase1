import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  /** Sitting on a transparent bar over the hero, so force light-on-dark styling. */
  onDark?: boolean;
  className?: string;
}

/**
 * Light/dark switch. The icon cross-fades and rotates so the change reads
 * as a deliberate transition rather than a swap.
 */
export default function ThemeToggle({ onDark = false, className = '' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 focus-visible-ring ${
        onDark
          ? 'text-white/80 hover:text-[#D2A66F] hover:bg-white/10'
          : 'text-slate-500 hover:text-gold-600 hover:bg-slate-900/5 dark:text-[#D7DDE0] dark:hover:text-[#D2A66F] dark:hover:bg-white/10'
      } ${className}`}
    >
      <Sun
        className={`absolute w-5 h-5 transition-all duration-300 ${
          isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
      <Moon
        className={`absolute w-5 h-5 transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
      />
    </button>
  );
}
