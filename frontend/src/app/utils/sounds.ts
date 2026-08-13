let audioCtx: AudioContext | null = null;

/** Plays a short "bubble pop" sound using WebAudio (no audio file needed). */
export function playPopSound() {
  try {
    audioCtx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === "suspended") void audioCtx.resume();

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    // Quick rising chirp = bubble pop
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  } catch {
    // Audio unavailable (e.g. autoplay restrictions before first interaction)
  }
}
