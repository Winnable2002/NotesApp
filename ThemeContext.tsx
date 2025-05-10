// ThemeContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Loại theme hỗ trợ: 'light' hoặc 'dark'
type Theme = 'light' | 'dark';

// Định nghĩa kiểu dữ liệu cho context
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Tạo Context với giá trị khởi tạo undefined
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider bao bọc ứng dụng và cung cấp theme + hàm toggle
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook để sử dụng ThemeContext trong các component
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
