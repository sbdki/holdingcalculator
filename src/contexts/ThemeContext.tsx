import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Theme Context
 * 
 * Purpose: Global theme state management (light/dark mode)
 * Features:
 * - Persists theme preference to localStorage
 * - Automatically detects system preference on first load
 * - Provides theme toggle functionality
 */

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) return savedTheme;
    
    // Default to light theme
    return "light";
  });

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    root.classList.remove("dark"); // Always start with removing dark
    if (theme === "dark") {
      root.classList.add("dark");
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Ensure light theme on mount
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
