import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "cozy";

type ProfileSettingsData = {
  displayName: string;
  email: string;
  theme: Theme;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  dailyHabitGoal: number;
};

const STORAGE_KEY = "flowty-profile-settings";

const DEFAULT_SETTINGS: ProfileSettingsData = {
  displayName: "",
  email: "",
  theme: "cozy",
  notificationsEnabled: true,
  soundEnabled: true,
  dailyHabitGoal: 3,
};

function loadSettings(): ProfileSettingsData {
  const savedSettings = localStorage.getItem(STORAGE_KEY);

  if (!savedSettings) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const parsedSettings = JSON.parse(
      savedSettings
    ) as Partial<ProfileSettingsData>;

    return {
      ...DEFAULT_SETTINGS,
      ...parsedSettings,
    };
  } catch {
    console.error("Could not load saved profile settings.");
    return { ...DEFAULT_SETTINGS };
  }
}

function isValidEmail(email: string): boolean {
  const emailPattern =
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

  return emailPattern.test(email);
}

export default function ProfileSettings() {
  const [settings, setSettings] =
    useState<ProfileSettingsData>(loadSettings);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error">("success");

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    if (message === "") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  function clearMessage(): void {
    setMessage("");
  }

  function saveSettings(): void {
    const trimmedName = settings.displayName.trim();
    const trimmedEmail = settings.email.trim();

    if (trimmedName === "") {
      setMessageType("error");
      setMessage("Display name is required.");
      return;
    }

    if (trimmedEmail === "") {
      setMessageType("error");
      setMessage("Email is required.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setMessageType("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (
      !Number.isInteger(settings.dailyHabitGoal) ||
      settings.dailyHabitGoal < 1 ||
      settings.dailyHabitGoal > 20
    ) {
      setMessageType("error");
      setMessage("Daily habit goal must be between 1 and 20.");
      return;
    }

    const settingsToSave: ProfileSettingsData = {
      ...settings,
      displayName: trimmedName,
      email: trimmedEmail,
    };

    setSettings(settingsToSave);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settingsToSave)
    );

    setMessageType("success");
    setMessage("Settings saved successfully.");
  }

  function resetSettings(): void {
    const resetValues = { ...DEFAULT_SETTINGS };

    setSettings(resetValues);
    localStorage.removeItem(STORAGE_KEY);

    document.documentElement.dataset.theme =
      resetValues.theme;

    setMessageType("success");
    setMessage("Settings reset to defaults.");
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Profile &amp; Settings
        </h2>

        <p className="text-sm text-slate-500">
          Customize your Flowty experience.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="font-medium text-slate-800">
            Display name
          </span>

          <input
            type="text"
            value={settings.displayName}
            placeholder="Enter your name"
            className="rounded-lg border border-slate-300 px-3 py-2"
            onChange={(event) => {
              setSettings({
                ...settings,
                displayName: event.target.value,
              });

              clearMessage();
            }}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium text-slate-800">
            Email
          </span>

          <input
            type="email"
            value={settings.email}
            placeholder="name@example.com"
            className="rounded-lg border border-slate-300 px-3 py-2"
            onChange={(event) => {
              setSettings({
                ...settings,
                email: event.target.value,
              });

              clearMessage();
            }}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium text-slate-800">
            Theme
          </span>

          <select
            value={settings.theme}
            className="rounded-lg border border-slate-300 px-3 py-2"
            onChange={(event) => {
              setSettings({
                ...settings,
                theme: event.target.value as Theme,
              });

              clearMessage();
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="cozy">Cozy</option>
          </select>

          <span className="text-xs text-slate-500">
            Theme selection is prepared for application-wide
            styling.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium text-slate-800">
            Daily habit goal
          </span>

          <input
            type="number"
            min="1"
            max="20"
            step="1"
            value={settings.dailyHabitGoal}
            className="rounded-lg border border-slate-300 px-3 py-2"
            onChange={(event) => {
              setSettings({
                ...settings,
                dailyHabitGoal: Number(event.target.value),
              });

              clearMessage();
            }}
          />
        </label>
      </div>

      <div className="mt-6 space-y-3">
        <label className="flex items-center justify-between rounded-lg bg-slate-100 p-4">
          <div>
            <span className="block font-medium text-slate-800">
              Enable notifications
            </span>

            <span className="text-sm text-slate-500">
              Receive reminders about habits and goals.
            </span>
          </div>

          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            className="h-5 w-5"
            onChange={(event) => {
              setSettings({
                ...settings,
                notificationsEnabled: event.target.checked,
              });

              clearMessage();
            }}
          />
        </label>

        <label className="flex items-center justify-between rounded-lg bg-slate-100 p-4">
          <div>
            <span className="block font-medium text-slate-800">
              Enable application sounds
            </span>

            <span className="text-sm text-slate-500">
              Allow timer and completion sounds.
            </span>
          </div>

          <input
            type="checkbox"
            checked={settings.soundEnabled}
            className="h-5 w-5"
            onChange={(event) => {
              setSettings({
                ...settings,
                soundEnabled: event.target.checked,
              });

              clearMessage();
            }}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveSettings}
          className="rounded-lg bg-slate-900 px-5 py-2 font-semibold text-white transition hover:bg-slate-700"
        >
          Save Settings
        </button>

        <button
          type="button"
          onClick={resetSettings}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Reset
        </button>

        {message !== "" && (
          <p
            role="status"
            className={
              messageType === "success"
                ? "text-sm font-medium text-green-700"
                : "text-sm font-medium text-red-700"
            }
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}