import { useEffect, useState } from "react";

const STORAGE_KEY = "flowty-customization-store";

/**
 * Returns the currently selected widget variant string.
 * Possible values: "classic" | "dark" | "paper"
 *
 * Reads `selectedWidget` from the customization store in localStorage
 * and listens for changes from the store panel.
 */
export function getSelectedWidgetVariant(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return "classic";
    const parsed = JSON.parse(saved) as { selectedWidget?: string };
    const id = parsed.selectedWidget ?? "widget-default";
    if (id === "widget-dark") return "dark";
    if (id === "widget-paper") return "paper";
    return "classic";
  } catch {
    return "classic";
  }
}

/**
 * React hook that tracks the selected widget variant and stays in sync
 * with the customization store. Returns the variant string.
 */
export function useWidgetVariant(): string {
  const [variant, setVariant] = useState<string>(getSelectedWidgetVariant);

  useEffect(() => {
    const handleChange = () => setVariant(getSelectedWidgetVariant());
    window.addEventListener("flowty:theme-change", handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("flowty:theme-change", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return variant;
}