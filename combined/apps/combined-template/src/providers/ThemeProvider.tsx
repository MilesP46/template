'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme, EffectiveTheme } from '../hooks/useTheme';

interface ThemeContextValue {
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
  // Additional theme options
  primaryColor?: string;
  setPrimaryColor?: (color: string) => void;
  fontScale?: number;
  setFontScale?: (scale: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = 'combined-theme';
const PRIMARY_COLOR_KEY = 'combined-primary-color';
const FONT_SCALE_KEY = 'combined-font-scale';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'auto',
  storageKey = THEME_KEY,
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>('light');
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');
  const [primaryColor, setPrimaryColorState] = useState<string>('#0d6efd');
  const [fontScale, setFontScaleState] = useState<number>(1);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    const storedPrimaryColor = localStorage.getItem(PRIMARY_COLOR_KEY);
    const storedFontScale = localStorage.getItem(FONT_SCALE_KEY);

    if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
      setThemeState(storedTheme);
    }

    if (storedPrimaryColor) {
      setPrimaryColorState(storedPrimaryColor);
    }

    if (storedFontScale) {
      setFontScaleState(parseFloat(storedFontScale));
    }

    setIsHydrated(true);

    // Get system theme preference
    if (enableSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

      // Listen for system theme changes
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [storageKey, enableSystem]);

  // Calculate effective theme
  useEffect(() => {
    if (!isHydrated) return;

    const resolved = theme === 'auto' && enableSystem ? systemTheme : theme as EffectiveTheme;
    setEffectiveTheme(resolved);

    // Disable transitions during theme change if requested
    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.appendChild(
        document.createTextNode(
          '* { -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important; }'
        )
      );
      document.head.appendChild(css);

      // Force a reflow
      (() => window.getComputedStyle(document.body))();

      // Remove the transition blocker after a tick
      setTimeout(() => {
        document.head.removeChild(css);
      }, 1);
    }

    // Apply theme to document for Bootstrap compatibility
    document.documentElement.setAttribute('data-bs-theme', resolved);
    
    // Apply theme class for Doctor-Dok compatibility
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);

    // Apply color-scheme for native browser elements
    document.documentElement.style.colorScheme = resolved;

    // Apply primary color as CSS variable
    document.documentElement.style.setProperty('--bs-primary', primaryColor);
    document.documentElement.style.setProperty('--primary', primaryColor);

    // Apply font scale
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
    document.documentElement.style.fontSize = `${fontScale * 16}px`;
  }, [theme, systemTheme, effectiveTheme, primaryColor, fontScale, enableSystem, disableTransitionOnChange, isHydrated]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem(PRIMARY_COLOR_KEY, color);
  };

  const setFontScale = (scale: number) => {
    setFontScaleState(scale);
    localStorage.setItem(FONT_SCALE_KEY, scale.toString());
  };

  const value: ThemeContextValue = {
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
    // Additional theme options
    primaryColor,
    setPrimaryColor,
    fontScale,
    setFontScale,
  };

  // Prevent flash of unstyled content
  if (!isHydrated) {
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('${storageKey}') || '${defaultTheme}';
                var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                var resolved = theme === 'auto' ? systemTheme : theme;
                
                document.documentElement.setAttribute('data-bs-theme', resolved);
                document.documentElement.classList.add(resolved);
                document.documentElement.style.colorScheme = resolved;
                
                var primaryColor = localStorage.getItem('${PRIMARY_COLOR_KEY}') || '${primaryColor}';
                document.documentElement.style.setProperty('--bs-primary', primaryColor);
                document.documentElement.style.setProperty('--primary', primaryColor);
                
                var fontScale = localStorage.getItem('${FONT_SCALE_KEY}') || '1';
                document.documentElement.style.setProperty('--font-scale', fontScale);
                document.documentElement.style.fontSize = parseFloat(fontScale) * 16 + 'px';
              })();
            `,
          }}
        />
        {children}
      </>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}