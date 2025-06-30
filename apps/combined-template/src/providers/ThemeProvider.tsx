'use client';

import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
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

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'auto' }: ThemeProviderProps) {
  const themeData = useTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

// Re-export for convenience
export { useTheme } from '../hooks/useTheme';
export type { Theme, EffectiveTheme } from '../hooks/useTheme';

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