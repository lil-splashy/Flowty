import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_THEME_ID,
  isThemeId,
  type ThemeId,
} from "@/app/theme/themes";

const STORAGE_KEY = "flowty-customization-store";

function readSelectedTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_THEME_ID;
    const parsed = JSON.parse(saved) as { selectedTheme?: string };
    if (parsed.selectedTheme && isThemeId(parsed.selectedTheme)) {
      return parsed.selectedTheme;
    }
    return DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

function persistSelectedTheme(theme: ThemeId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const state = raw ? JSON.parse(raw) : {};
    state.selectedTheme = theme;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable
  }
}

function applyThemeToDocument(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
}

type ThemeContextType = {
  theme: ThemeId;
  applyTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const initial = readSelectedTheme();
    applyThemeToDocument(initial);
    return initial;
  });

  useEffect(() => {
    const handleChange = () => {
      const next = readSelectedTheme();
      setTheme(next);
      applyThemeToDocument(next);
    };

    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const applyTheme = useCallback((next: ThemeId) => {
    persistSelectedTheme(next);
    applyThemeToDocument(next);
    setTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
