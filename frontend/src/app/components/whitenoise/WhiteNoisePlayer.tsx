import { useEffect, useRef, useState } from "react";

type SoundId =
  | "rain"
  | "ocean"
  | "forest"
  | "fireplace"
  | "white-noise";

type SoundOption = {
  id: SoundId;
  name: string;
  icon: string;
  file: string;
  description: string;
};

type SavedPlayerSettings = {
  selectedSoundId: SoundId;
  volume: number;
};

const SETTINGS_KEY = "flowty-white-noise-settings";

const SOUND_OPTIONS: SoundOption[] = [
  {
    id: "rain",
    name: "Rain",
    icon: "🌧️",
    file: "/audio/rain.mp3",
    description: "Steady rainfall for calm focus.",
  },
  {
    id: "ocean",
    name: "Ocean",
    icon: "🌊",
    file: "/audio/ocean.mp3",
    description: "Gentle waves and coastal ambience.",
  },
  {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    file: "/audio/forest.mp3",
    description: "Soft wind, leaves, and nature sounds.",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    icon: "🔥",
    file: "/audio/fireplace.mp3",
    description: "Warm fireplace crackling.",
  },
  {
    id: "white-noise",
    name: "White Noise",
    icon: "🎧",
    file: "/audio/white-noise.mp3",
    description: "Consistent background noise for concentration.",
  },
];

function loadSavedSettings(): SavedPlayerSettings {
  const savedSettings = localStorage.getItem(SETTINGS_KEY);

  if (!savedSettings) {
    return {
      selectedSoundId: "rain",
      volume: 0.5,
    };
  }

  try {
    const parsedSettings = JSON.parse(
      savedSettings
    ) as Partial<SavedPlayerSettings>;

    const selectedSoundExists = SOUND_OPTIONS.some(
      (sound) => sound.id === parsedSettings.selectedSoundId
    );

    const safeVolume =
      typeof parsedSettings.volume === "number"
        ? Math.min(1, Math.max(0, parsedSettings.volume))
        : 0.5;

    return {
      selectedSoundId: selectedSoundExists
        ? (parsedSettings.selectedSoundId as SoundId)
        : "rain",
      volume: safeVolume,
    };
  } catch {
    return {
      selectedSoundId: "rain",
      volume: 0.5,
    };
  }
}

export default function WhiteNoisePlayer() {
  const savedSettings = loadSavedSettings();

  const [selectedSoundId, setSelectedSoundId] =
    useState<SoundId>(savedSettings.selectedSoundId);

  const [volume, setVolume] = useState(savedSettings.volume);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedSound =
    SOUND_OPTIONS.find((sound) => sound.id === selectedSoundId) ??
    SOUND_OPTIONS[0];

  useEffect(() => {
    const audio = new Audio(selectedSound.file);

    audio.loop = true;
    audio.volume = volume;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [selectedSound.file]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        selectedSoundId,
        volume,
      })
    );
  }, [selectedSoundId, volume]);

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

  async function togglePlayback(): Promise<void> {
    const audio = audioRef.current;

    if (!audio) {
      setMessage("Audio is not available.");
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      await audio.play();
      setIsPlaying(true);
    } catch {
      setMessage(
        "Unable to play this sound. Make sure the audio file exists."
      );
      setIsPlaying(false);
    }
  }

  function selectSound(soundId: SoundId): void {
    if (soundId === selectedSoundId) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsPlaying(false);
    setSelectedSoundId(soundId);
    setMessage("");
  }

  function stopPlayback(): void {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }

  function resetPlayer(): void {
    stopPlayback();
    setSelectedSoundId("rain");
    setVolume(0.5);
    localStorage.removeItem(SETTINGS_KEY);
    setMessage("Player settings reset.");
  }

  return (
    <section className="mx-auto max-w-4xl rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          White Noise Player
        </h2>

        <p className="mt-1 text-sm text-slate-300">
          Choose a calming background sound while studying,
          journaling, or using the Pomodoro timer.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {SOUND_OPTIONS.map((sound) => {
          const isSelected = sound.id === selectedSoundId;

          return (
            <button
              key={sound.id}
              type="button"
              onClick={() => selectSound(sound.id)}
              className={
                isSelected
                  ? "rounded-xl border border-white bg-white p-4 text-left text-slate-900 transition"
                  : "rounded-xl border border-slate-700 bg-slate-800 p-4 text-left text-white transition hover:bg-slate-700"
              }
            >
              <span className="block text-3xl">
                {sound.icon}
              </span>

              <span className="mt-3 block font-semibold">
                {sound.name}
              </span>

              <span
                className={
                  isSelected
                    ? "mt-1 block text-xs text-slate-600"
                    : "mt-1 block text-xs text-slate-400"
                }
              >
                {sound.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl bg-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Currently selected
            </p>

            <p className="text-lg font-bold">
              {selectedSound.icon} {selectedSound.name}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="rounded-lg bg-white px-5 py-2 font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button
              type="button"
              onClick={stopPlayback}
              className="rounded-lg border border-slate-600 px-5 py-2 font-semibold text-white transition hover:bg-slate-700"
            >
              Stop
            </button>

            <button
              type="button"
              onClick={resetPlayer}
              className="rounded-lg border border-slate-600 px-5 py-2 font-semibold text-white transition hover:bg-slate-700"
            >
              Reset
            </button>
          </div>
        </div>

        <label className="mt-6 block">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Volume
            </span>

            <span className="text-sm text-slate-400">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) =>
              setVolume(Number(event.target.value))
            }
            className="w-full"
          />
        </label>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          <span
            className={
              isPlaying
                ? "h-2.5 w-2.5 rounded-full bg-green-400"
                : "h-2.5 w-2.5 rounded-full bg-slate-500"
            }
          />

          <span>
            {isPlaying
              ? `${selectedSound.name} is playing`
              : "Player is paused"}
          </span>
        </div>

        {message !== "" && (
          <p
            role="status"
            className="mt-4 text-sm font-medium text-amber-300"
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}