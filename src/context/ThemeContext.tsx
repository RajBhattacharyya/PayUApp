import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DarkTheme, LightTheme, AppTheme } from '../theme/colors';
import { saveTheme, loadTheme } from '../utils/storage';

interface ThemeContextType {
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  theme: DarkTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme().then(setIsDark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      saveTheme(!prev);
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme: isDark ? DarkTheme : LightTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);