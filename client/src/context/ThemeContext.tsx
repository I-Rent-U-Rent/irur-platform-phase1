import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('irur-theme', 'dark');
  }, []);

  return <>{children}</>;
}

export function useTheme() {
  return { theme: 'dark' as const };
}
