// ThemeContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Định nghĩa loại theme có thể có
type Theme = 'light' | 'dark';

// Định nghĩa type cho context
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Tạo context với giá trị mặc định
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider để cung cấp theme cho toàn bộ ứng dụng
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Lưu trữ theme trong state
  const [theme, setTheme] = useState<Theme>('light');

  // Hàm chuyển đổi theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook sử dụng context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
