import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// Theme definitions
export const themes = {
  light: {
    background: "#ffffff",
    cardBackground: "#ffffff",
    cardBackgroundChecked: "#f5f5f5",
    text: "#222222",
    textSecondary: "#666666",
    textMuted: "#999999",
    border: "#e5e5e5",
    borderLight: "#eeeeee",
    toolbarBackground: "#f7f7f7",
    inputBackground: "#ffffff",
    inputBorder: "#cccccc",
    buttonPrimary: "#1976d2",
    buttonDanger: "#d32f2f",
    buttonSuccess: "#2e7d32",
    buttonWarning: "#ff9800",
    buttonNeutral: "#757575",
    buttonDark: "#111111",
    progressBackground: "#e0e0e0",
    categoryAccent: "#4caf50",
    shadow: "rgba(0,0,0,0.08)",
    overlay: "rgba(0,0,0,0.5)",
    starActive: "#ffc107",
    starInactive: "#ccc",
    tagBackground: "#e3f2fd",
    tagText: "#1565c0",
  },
  dark: {
    background: "#1a1a1a",
    cardBackground: "#2d2d2d",
    cardBackgroundChecked: "#252525",
    text: "#e0e0e0",
    textSecondary: "#aaaaaa",
    textMuted: "#777777",
    border: "#404040",
    borderLight: "#353535",
    toolbarBackground: "#252525",
    inputBackground: "#333333",
    inputBorder: "#555555",
    buttonPrimary: "#2196f3",
    buttonDanger: "#f44336",
    buttonSuccess: "#43a047",
    buttonWarning: "#ffa726",
    buttonNeutral: "#888888",
    buttonDark: "#e0e0e0",
    progressBackground: "#404040",
    categoryAccent: "#66bb6a",
    shadow: "rgba(0,0,0,0.3)",
    overlay: "rgba(0,0,0,0.7)",
    starActive: "#ffd54f",
    starInactive: "#555",
    tagBackground: "#1e3a5f",
    tagText: "#90caf9",
  },
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("appDarkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const theme = darkMode ? themes.dark : themes.light;

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("appDarkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, theme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};