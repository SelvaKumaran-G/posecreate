import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('app-theme-color') as ThemeColor) || 'violet';
  });

  useEffect(() => {
    localStorage.setItem('app-theme-color', themeColor);
    
    // Remove previous theme classes
    document.documentElement.classList.remove(
      'theme-violet', 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-amber'
    );
    // Add new theme class
    document.documentElement.classList.add('theme-' + themeColor);
  }, [themeColor]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

