'use client';

import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useTheme as useThemeHook } from '../hooks/useTheme';
import type { Theme, EffectiveTheme } from '../hooks/useTheme';

interface ThemeContextValue {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  systemTheme: EffectiveTheme;
  resolvedTheme: EffectiveTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'auto',
  storageKey = 'combined-theme-preference',
  enableSystem = true,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const themeState = useThemeHook();

  // Handle transition disabling
  React.useEffect(() => {
    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.appendChild(
        document.createTextNode(
          `* {
             -webkit-transition: none !important;
             -moz-transition: none !important;
             -o-transition: none !important;
             -ms-transition: none !important;
             transition: none !important;
          }`
        )
      );
      document.head.appendChild(css);

      // Force reflow
      (() => window.getComputedStyle(document.body))();

      // Remove the style after a frame
      setTimeout(() => {
        document.head.removeChild(css);
      }, 1);
    }
  }, [themeState.effectiveTheme, disableTransitionOnChange]);

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}

// Export a client-side only hook for components
export function useClientTheme() {
  const [mounted, setMounted] = React.useState(false);
  const theme = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      ...theme,
      theme: 'light' as Theme,
      effectiveTheme: 'light' as EffectiveTheme,
      isDark: false,
      resolvedTheme: 'light' as EffectiveTheme,
    };
  }

  return theme;
}