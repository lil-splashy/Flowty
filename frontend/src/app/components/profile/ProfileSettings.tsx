import { useEffect, useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { THEMES, type ThemeId } from "@/app/theme/themes";

type ProfileSettingsData = {
  displayName: string;
  email: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  dailyHabitGoal: number;
};

const STORAGE_KEY = "flowty-profile-settings";

const DEFAULT_SETTINGS: ProfileSettingsData = {
  displayName: "",
  email: "",
  notificationsEnabled: true,
  soundEnabled: true,
  dailyHabitGoal: 3,
};

function loadSettings(): ProfileSettingsData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(saved) as Partial<ProfileSettingsData>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

function CustomCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="shrink-0 size-[14px] relative cursor-pointer"
    >
      <div
        className={`absolute inset-0 rounded-[1.5px] border-[var(--flowty-ink)] border-[1px] border-solid ${
          checked ? "bg-[var(--flowty-accent)]" : "bg-transparent"
        }`}
      />
      {checked && (
        <svg
          className="absolute inset-0 size-full p-[1px]"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M3 7L6 10L11 4"
            stroke="var(--flowty-ink)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

export default function ProfileSettings() {
  const { theme, applyTheme } = useTheme();
  const [settings, setSettings] = useState<ProfileSettingsData>(loadSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(id);
  }, [message]);

  function clearMessage(): void {
    setMessage("");
  }

  function saveSettings(): void {
    const trimmedName = settings.displayName.trim();
    const trimmedEmail = settings.email.trim();

    if (!trimmedName) {
      setMessage("Display name is required.");
      return;
    }
    if (!trimmedEmail) {
      setMessage("Email is required.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    if (
      !Number.isInteger(settings.dailyHabitGoal) ||
      settings.dailyHabitGoal < 1 ||
      settings.dailyHabitGoal > 20
    ) {
      setMessage("Daily habit goal must be between 1 and 20.");
      return;
    }

    const toSave: ProfileSettingsData = {
      ...settings,
      displayName: trimmedName,
      email: trimmedEmail,
    };
    setSettings(toSave);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setMessage("Settings saved.");
  }

  function resetSettings(): void {
    const reset = { ...DEFAULT_SETTINGS };
    setSettings(reset);
    localStorage.removeItem(STORAGE_KEY);
    setMessage("Settings reset to defaults.");
  }

  const inputClass =
    "font-['Courier_Prime',sans-serif] text-[10px] text-[var(--flowty-text)] bg-[var(--flowty-input-bg)] border-[var(--flowty-ink)] border-[1px] border-solid rounded-[2px] px-[6px] py-[4px] outline-none w-full";
  const labelClass =
    "font-['Courier_Prime',sans-serif] leading-[12px] not-italic text-[var(--flowty-text)] text-[10px] font-bold";
  const hintClass =
    "font-['Courier_Prime',sans-serif] leading-[12px] not-italic text-[var(--flowty-text-secondary)] text-[8px]";

  return (
    <div className="bg-[var(--flowty-paper)] rounded-[inherit] overflow-hidden">
      <div className="bg-[var(--flowty-title-bg)] border-b-[var(--flowty-ink)] border-b-[1.5px] border-solid content-stretch flex h-[34px] items-center px-[10px] relative shrink-0 w-full">
        <p className="font-['Permanent_Marker',sans-serif] leading-[13px] not-italic relative shrink-0 text-[var(--flowty-ink)] text-[12px] whitespace-nowrap">
          PROFILE & SETTINGS
        </p>
      </div>

      <div className="p-[12px] flex flex-col gap-[12px]">
        <div className="grid gap-[8px] grid-cols-2">
          <label className="flex flex-col gap-[3px]">
            <span className={labelClass}>Display name</span>
            <input
              type="text"
              value={settings.displayName}
              placeholder="Enter your name"
              className={inputClass}
              onChange={(e) => {
                setSettings({ ...settings, displayName: e.target.value });
                clearMessage();
              }}
            />
          </label>

          <label className="flex flex-col gap-[3px]">
            <span className={labelClass}>Email</span>
            <input
              type="email"
              value={settings.email}
              placeholder="name@example.com"
              className={inputClass}
              onChange={(e) => {
                setSettings({ ...settings, email: e.target.value });
                clearMessage();
              }}
            />
          </label>

          <label className="flex flex-col gap-[3px]">
            <span className={labelClass}>Theme</span>
            <select
              value={theme}
              className={inputClass}
              onChange={(e) => {
                applyTheme(e.target.value as ThemeId);
                clearMessage();
              }}
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <span className={hintClass}>Applied across the application.</span>
          </label>

          <label className="flex flex-col gap-[3px]">
            <span className={labelClass}>Daily habit goal</span>
            <input
              type="number"
              min="1"
              max="20"
              step="1"
              value={settings.dailyHabitGoal}
              className={inputClass}
              onChange={(e) => {
                setSettings({ ...settings, dailyHabitGoal: Number(e.target.value) });
                clearMessage();
              }}
            />
          </label>
        </div>

        <div className="border-t border-[var(--flowty-accent-border)] border-solid pt-[8px] flex flex-col gap-[6px]">
          <label className="flex items-center justify-between px-[8px] py-[6px] rounded-[2px] hover:bg-[var(--flowty-row-hover)] transition-colors cursor-pointer">
            <div className="flex flex-col gap-[1px]">
              <span className={labelClass}>Enable notifications</span>
              <span className={hintClass}>Receive reminders about habits and goals.</span>
            </div>
            <CustomCheckbox
              checked={settings.notificationsEnabled}
              onChange={(checked) => {
                setSettings({ ...settings, notificationsEnabled: checked });
                clearMessage();
              }}
            />
          </label>

          <label className="flex items-center justify-between px-[8px] py-[6px] rounded-[2px] hover:bg-[var(--flowty-row-hover)] transition-colors cursor-pointer">
            <div className="flex flex-col gap-[1px]">
              <span className={labelClass}>Enable application sounds</span>
              <span className={hintClass}>Allow timer and completion sounds.</span>
            </div>
            <CustomCheckbox
              checked={settings.soundEnabled}
              onChange={(checked) => {
                setSettings({ ...settings, soundEnabled: checked });
                clearMessage();
              }}
            />
          </label>
        </div>

        <div className="flex items-center gap-[8px] pt-[4px]">
          <button
            type="button"
            onClick={saveSettings}
            className="font-['Courier_Prime',sans-serif] text-[9px] text-[var(--flowty-ink)] bg-[var(--flowty-accent)] border-[var(--flowty-ink)] border-[1px] border-solid rounded-[2px] px-[8px] py-[2px] hover:opacity-80 transition-opacity"
          >
            Save Settings
          </button>

          <button
            type="button"
            onClick={resetSettings}
            className="font-['Courier_Prime',sans-serif] text-[9px] text-[var(--flowty-ink)] bg-[var(--flowty-paper)] border-[var(--flowty-ink)] border-[1px] border-solid rounded-[2px] px-[8px] py-[2px] hover:bg-[var(--flowty-paper-hover)] transition-colors"
          >
            Reset
          </button>

          {message && (
            <p className="font-['Courier_Prime',sans-serif] text-[9px] text-[var(--flowty-title-bg)] leading-[12px]">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}