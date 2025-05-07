'use client';

import { createContext, useContext, ReactNode } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Sempre usar o tema dark
  const theme: Theme = 'dark';

  // Aplicar classe de tema ao documento no lado do cliente
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light-theme');
    document.documentElement.classList.add('dark-theme');
  }

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
