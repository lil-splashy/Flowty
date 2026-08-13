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
    file: "/audio/white-noice.mp3",
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
  const [selectedSoundId, setSelectedSoundId] =
    useState<SoundId>(() => loadSavedSettings().selectedSoundId);

  const [volume, setVolume] = useState(() => loadSavedSettings().volume);
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
    <section className="bg-[var(--flowty-paper)] border-[var(--flowty-ink)] border-[1.5px] border-solid rounded-[2px] shadow-[5px_3px_4px_0px_rgba(0,0,0,0.61)] w-[320px] overflow-hidden">
      <div className="bg-[var(--flowty-title-bg)] border-b-[var(--flowty-ink)] border-b-[1.5px] border-solid flex h-[34px] items-center px-[10px]">
        <h2 className="font-['Permanent_Marker',sans-serif] leading-[13px] text-[var(--flowty-ink)] text-[12px] whitespace-nowrap">
          White Noise Player
        </h2>
      </div>

      <div className="p-[10px]">
        <p className="font-['Courier_Prime',sans-serif] leading-[12px] text-[var(--flowty-text-secondary)] text-[9px]">
          Choose a calming background sound while studying or journaling.
        </p>

        <div className="grid gap-[4px] grid-cols-2 mt-[8px]">
          {SOUND_OPTIONS.map((sound) => {
            const isSelected = sound.id === selectedSoundId;

            return (
              <button
                key={sound.id}
                type="button"
                onClick={() => selectSound(sound.id)}
                className={`border border-solid px-[6px] py-[4px] rounded-[2px] text-left transition-colors ${
                  isSelected
                    ? "bg-[var(--flowty-accent)] border-[var(--flowty-ink)]"
                    : "bg-[var(--flowty-surface)] border-[var(--flowty-ink)] hover:bg-[var(--flowty-paper-hover)]"
                }`}
              >
                <span className="block font-['Courier_Prime',sans-serif] font-bold leading-[11px] text-[var(--flowty-ink)] text-[9px]">
                  {sound.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="bg-[var(--flowty-surface)] border-[var(--flowty-ink)] border-[1px] border-solid mt-[8px] p-[8px] rounded-[2px]">
          <div className="flex flex-wrap items-center justify-between gap-[6px]">
            <p className="font-['Courier_Prime',sans-serif] leading-[12px] text-[var(--flowty-text-secondary)] text-[9px]">
              Selected
            </p>

            <p className="font-['Courier_Prime',sans-serif] font-bold leading-[12px] text-[var(--flowty-ink)] text-[10px]">
              {selectedSound.name}
            </p>
          </div>

          <div className="flex flex-wrap gap-[4px] mt-[6px]">
            <button
              type="button"
              onClick={togglePlayback}
              className="bg-[var(--flowty-title-bg)] border-[var(--flowty-ink)] border-[1px] border-solid font-['Courier_Prime',sans-serif] leading-[10px] px-[8px] py-[3px] rounded-[2px] text-[var(--flowty-ink)] text-[9px] hover:bg-[var(--flowty-title-hover)] transition-colors"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button
              type="button"
              onClick={stopPlayback}
              className="bg-[var(--flowty-paper)] border-[var(--flowty-ink)] border-[1px] border-solid font-['Courier_Prime',sans-serif] leading-[10px] px-[8px] py-[3px] rounded-[2px] text-[var(--flowty-text)] text-[9px] hover:bg-[var(--flowty-paper-hover)] transition-colors"
            >
              Stop
            </button>

            <button
              type="button"
              onClick={resetPlayer}
              className="bg-[var(--flowty-paper)] border-[var(--flowty-ink)] border-[1px] border-solid font-['Courier_Prime',sans-serif] leading-[10px] px-[8px] py-[3px] rounded-[2px] text-[var(--flowty-text)] text-[9px] hover:bg-[var(--flowty-paper-hover)] transition-colors"
            >
              Reset
            </button>
          </div>

          <label className="block mt-[8px]">
            <div className="flex items-center justify-between">
              <span className="font-['Courier_Prime',sans-serif] leading-[11px] text-[var(--flowty-text)] text-[9px]">
                Volume
              </span>

              <span className="font-['Courier_Prime',sans-serif] leading-[11px] text-[var(--flowty-text-secondary)] text-[9px]">
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
              className="w-full h-[4px] mt-[2px] appearance-none bg-[var(--flowty-paper-hover)] rounded-[2px] outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[12px] [&::-webkit-slider-thumb]:h-[12px] [&::-webkit-slider-thumb]:rounded-[1px] [&::-webkit-slider-thumb]:bg-[var(--flowty-title-bg)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--flowty-ink)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </label>

          <div className="flex items-center gap-[4px] mt-[6px]">
            <span
              className={`block h-[8px] w-[8px] rounded-full shrink-0 ${
                isPlaying ? "bg-[var(--flowty-accent)]" : "bg-[var(--flowty-text-secondary)]"
              }`}
            />

            <span className="font-['Courier_Prime',sans-serif] leading-[11px] text-[var(--flowty-text-secondary)] text-[9px]">
              {isPlaying
                ? `${selectedSound.name} is playing`
                : "Player is paused"}
            </span>
          </div>

          {message !== "" && (
            <p
              role="status"
              className="font-['Courier_Prime',sans-serif] leading-[11px] mt-[6px] text-[var(--flowty-text-secondary)] text-[9px]"
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}