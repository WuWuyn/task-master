import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'app-theme';

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    // Inform UA widgets (scrollbars, form controls)
    root.style.colorScheme = mode;
  }, [mode]);

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    isDark: mode === 'dark',
    toggleTheme: () => setMode(prev => (prev === 'dark' ? 'light' : 'dark')),
    setTheme: (m: ThemeMode) => setMode(m),
  }), [mode]);

  const algorithm = mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm,
          token: {
            colorPrimary: mode === 'dark' ? '#60A5FA' : '#3B82F6',
            colorSuccess: mode === 'dark' ? '#4ADE80' : '#22C55E',
            colorWarning: mode === 'dark' ? '#FBBF24' : '#F59E0B',
            colorError: mode === 'dark' ? '#F87171' : '#EF4444',
            colorInfo: mode === 'dark' ? '#34D399' : '#10B981',
            borderRadius: 8,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}


