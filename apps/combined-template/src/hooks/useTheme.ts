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
}

const THEME_STORAGE_KEY = 'combined-theme-preference';

// Get system theme preference
const getSystemTheme = (): EffectiveTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get stored theme or default to 'auto'
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return (stored as Theme) || 'auto';
};

// Apply theme to document
const applyTheme = (theme: EffectiveTheme) => {
  if (typeof document === 'undefined') return;
  
  const html = document.documentElement;
  
  // Apply Bootstrap theme attribute
  html.setAttribute('data-bs-theme', theme);
  
  // Apply Doctor-Dok class for Tailwind
  html.classList.remove('light', 'dark');
  html.classList.add(theme);
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
  }
};

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>(getSystemTheme);
  
  // Calculate effective theme
  const effectiveTheme: EffectiveTheme = theme === 'auto' ? systemTheme : theme;
  
  // Update theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);
  
  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [effectiveTheme, setTheme]);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  // Apply theme when it changes
  useEffect(() => {
    applyTheme(effectiveTheme);
  }, [effectiveTheme]);
  
  // Initialize theme on mount
  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    const systemPref = getSystemTheme();
    setSystemTheme(systemPref);
    applyTheme(stored === 'auto' ? systemPref : stored);
  }, []);
  
  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    // Doctor-Dok compatibility
    isDark: effectiveTheme === 'dark',
    systemTheme,
    resolvedTheme: effectiveTheme,
  };
}