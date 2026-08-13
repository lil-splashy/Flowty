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
const THEME_CHANGE_EVENT = "flowty:theme-change";

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

    // "storage" fires in other tabs/windows; the custom event fires
    // immediately within this tab so changes feel live.
    window.addEventListener("storage", handleChange);
    window.addEventListener(THEME_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
    };
  }, []);

  const applyTheme = useCallback((next: ThemeId) => {
    persistSelectedTheme(next);
    applyThemeToDocument(next);
    setTheme(next);
    // Notify any other listeners in this tab (and any future code that
    // persists to the shared customization store without this context).
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT));
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
