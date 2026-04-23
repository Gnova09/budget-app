import { createContext, useContext } from 'react';

export const darkColors = {
  surface: '#09090b',
  surfaceBright: '#18181b',
  onSurface: '#ffffff',
  onSurfaceVariant: '#a1a1aa',
  primary: '#6366f1',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  zinc600: '#52525b',
  zinc800: '#27272a',
  indigo400: '#818cf8',
  rose400: '#fb7185',
  error: '#fb7185',
  emerald400: '#34d399',
  emerald500: '#10b981',
  amber400: '#fbbf24',
  amber500: '#f59e0b',
  white10: 'rgba(255,255,255,0.1)',
  white5: 'rgba(255,255,255,0.05)',
  white60: 'rgba(255,255,255,0.6)',
  cardBg: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.1)',
  navBg: 'rgba(24,24,27,0.9)',
  progressBg: 'rgba(255,255,255,0.1)',
  statusBar: 'light-content' as const,
};

export const lightColors = {
  surface: '#f5f5f7',
  surfaceBright: '#ffffff',
  onSurface: '#1a1a1a',
  onSurfaceVariant: '#6b7280',
  primary: '#6366f1',
  zinc400: '#9ca3af',
  zinc500: '#6b7280',
  zinc600: '#9ca3af',
  zinc800: '#d1d5db',
  indigo400: '#6366f1',
  rose400: '#e11d48',
  error: '#e11d48',
  emerald400: '#34d399',
  emerald500: '#10b981',
  amber400: '#fbbf24',
  amber500: '#f59e0b',
  white10: 'rgba(0,0,0,0.06)',
  white5: 'rgba(0,0,0,0.03)',
  white60: 'rgba(0,0,0,0.5)',
  cardBg: '#ffffff',
  cardBorder: 'rgba(0,0,0,0.08)',
  navBg: 'rgba(255,255,255,0.95)',
  progressBg: 'rgba(0,0,0,0.08)',
  statusBar: 'dark-content' as const,
};

export type ThemeColors = Omit<typeof darkColors, 'statusBar'> & { statusBar: 'light-content' | 'dark-content' };

export const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
  c: ThemeColors;
}>({ isDark: true, toggleTheme: () => {}, c: darkColors });

export const useTheme = () => useContext(ThemeContext);
