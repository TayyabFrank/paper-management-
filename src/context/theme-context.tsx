import React, { createContext, useContext, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceCard: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  accent: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  badgeBg: string;
  badgeText: string;
  readerBg: string;
  readerPaper: string;
  shadowColor: string;
}

export const lightColors: ThemeColors = {
  isDark: false,
  background: '#f4f7fb',
  surface: '#ffffff',
  surfaceElevated: '#f8fafc',
  surfaceCard: '#ffffff',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  primary: '#1b3569',
  primaryHover: '#2563eb',
  primaryLight: '#eff6ff',
  accent: '#2563eb',
  inputBg: '#f8fafc',
  inputBorder: '#cbd5e1',
  inputFocusBorder: '#2563eb',
  badgeBg: '#dbeafe',
  badgeText: '#1e40af',
  readerBg: '#f1f5f9',
  readerPaper: '#ffffff',
  shadowColor: '#0f172a',
};

export const darkColors: ThemeColors = {
  isDark: true,
  background: '#090d16',
  surface: '#111827',
  surfaceElevated: '#1a2337',
  surfaceCard: '#131d31',
  border: 'rgba(255, 255, 255, 0.09)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  primary: '#38bdf8',
  primaryHover: '#60a5fa',
  primaryLight: 'rgba(56, 189, 248, 0.12)',
  accent: '#38bdf8',
  inputBg: '#162033',
  inputBorder: '#27354f',
  inputFocusBorder: '#38bdf8',
  badgeBg: 'rgba(56, 189, 248, 0.18)',
  badgeText: '#7dd3fc',
  readerBg: '#0b0f19',
  readerPaper: '#141e33',
  shadowColor: '#000000',
};

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'light',
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function DocuVaultThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const isDark = themeMode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useDocuVaultTheme() {
  return useContext(ThemeContext);
}
