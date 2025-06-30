import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type EffectiveTheme = 'light' | 'dark';

interface UseThemeReturn {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  // Doctor-Dok compatibility
  isDark: boolean;
  systemTheme: EffectiveTheme;
  resolvedTheme: EffectiveTheme;
  // Bootstrap compatibility
  isBootstrapTheme: boolean;
}

const THEME_KEY = 'combined-theme';

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>('light');
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

  // Initialize theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
      setThemeState(storedTheme);
    }

    // Get system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for system theme changes
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Calculate effective theme
  useEffect(() => {
    const resolved = theme === 'auto' ? systemTheme : theme as EffectiveTheme;
    setEffectiveTheme(resolved);

    // Apply theme to document for Bootstrap compatibility
    document.documentElement.setAttribute('data-bs-theme', resolved);
    
    // Apply theme class for Doctor-Dok compatibility
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);

    // Apply color-scheme for native browser elements
    document.documentElement.style.colorScheme = resolved;
  }, [theme, systemTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [effectiveTheme, setTheme]);

  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    // Doctor-Dok compatibility
    isDark: effectiveTheme === 'dark',
    systemTheme,
    resolvedTheme: effectiveTheme,
    // Bootstrap compatibility
    isBootstrapTheme: true,
  };
}