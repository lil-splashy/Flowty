import { useState, useEffect, useRef, useCallback } from "react";

const VECTOR_PATHS = {
  body: "M3.98046 495.103C-20.0195 362.104 68.9805 213.104 150.98 175.104C152.647 160.437 157.18 128.104 161.98 116.104C166.202 112.91 170.371 109.931 174.48 107.153C173.28 104.353 171.98 94.6035 171.98 91.6035C183.147 80.6035 216.18 58.3035 258.98 57.1035C261.78 60.7035 264.814 68.4775 265.98 71.9145C277.993 71.0692 287.242 72.2628 292.98 74.1035C303.647 81.7702 326.18 98.9035 330.98 106.103C462.98 84.1035 592.981 175.104 642.981 232.104C772.981 401.104 678.981 576.104 655.981 612.104C553.981 754.104 392.98 784.104 312.98 776.104C90.9804 752.104 34.9805 602.104 3.98046 495.103Z",
  strapL: "M148.48 95.6036C145.647 82.2703 143.68 50.7036 158.48 31.1036C182.98 1.60359 205.48 0.603594 211.98 0.103594C218.48 -0.396406 257.48 -0.396404 279.98 32.6036C282.98 37.6035 286.98 45.1035 286.48 48.1035C285.98 51.1035 275.48 69.1035 264.48 65.1035C262.48 62.3035 259.647 58.9368 258.48 57.6035C251.314 56.7702 223.98 62.4035 171.98 91.6035V99.6035C167.147 102.77 155.68 106.404 148.48 95.6036Z",
  strapR: "M192.48 64.1035C182.08 68.9035 159.147 87.1035 148.98 95.6035C153.78 105.204 166.647 102.937 172.48 100.604C172.98 101.604 174.18 104.204 174.98 106.604C203.78 84.6035 247.98 74.4368 266.48 72.1035C265.98 70.6035 264.78 67.2035 263.98 65.6035C278.98 67.1035 285.98 50.6035 285.98 48.1035C268.98 46.6035 263.48 46.6035 251.98 46.6035C223.48 48.1035 205.48 58.1035 192.48 64.1035Z",
  bottom: "M342.98 780.604C181.48 760.604 142.197 715.604 122.748 700.104C52.4804 644.104 -6.44655 522.397 0.980422 430.104L0.987252 430.019C2.4838 411.421 4.72433 383.578 12.4804 367.104C26.3138 367.104 55.8805 388.804 59.4805 455.604C78.4805 578.604 128.162 619.104 140.748 635.104C170.248 672.604 241.748 704.604 281.748 715.604C321.749 726.604 384.748 724.104 424.248 715.604C466.48 704.604 491.48 690.604 533.748 662.604C582.98 616.104 590.796 612.104 614.48 562.104C632.48 524.104 638.98 490.437 642.48 475.104C666.48 451.104 713.848 418.904 714.248 430.104C714.648 441.304 704.082 497.437 698.748 524.104C660.248 630.104 626.748 649.104 564.248 704.604C546.901 720.008 475.984 780.604 342.98 780.604Z",
  crown: "M170.98 167.104L150.98 177.104H146.98L160.98 116.104C170.814 109.437 192.78 95.0035 201.98 90.6035C198.48 93.6035 185.98 116.104 181.98 126.104C178.78 134.104 173.314 156.77 170.98 167.104Z",
};

const PLAY_PATH =
  "M49.0479 0.594727C77.502 -1.11878 101.965 20.5438 103.707 48.9961C105.449 77.4485 83.8118 101.933 55.3613 103.704C26.8703 105.477 2.34344 83.8025 0.598633 55.3096C-1.14608 26.8167 20.5532 2.31088 49.0479 0.594727ZM60.7773 1.38672C58.5194 0.819908 56.148 0.397888 53.7734 1.10156C26.4948 0.259464 3.43639 21.1633 1.61523 48.4033C-0.207416 75.6694 19.9035 99.4765 47.0908 102.235C74.2781 104.994 98.7621 85.7129 102.454 58.6367C106.12 31.7506 87.9753 6.78151 61.3506 1.9082C61.3237 1.84885 61.2889 1.77991 61.2422 1.71387C61.1544 1.58975 61.0065 1.44425 60.7773 1.38672ZM39.2637 15.501C40.8383 15.3336 42.1626 15.8055 43.4082 16.582C44.3731 17.1835 45.2542 17.9413 46.167 18.7178L47.0947 19.4961L55.2852 26.2754L55.2891 26.2783L68.543 37.0283C71.5204 39.4447 75.3337 42.2006 77.9297 45.457C80.5033 48.6855 81.7991 52.3029 79.8887 56.4834C79.0071 58.4125 77.6859 59.3379 76.082 60.6934L75.3779 61.3047C71.3822 64.8784 67.3409 68.401 63.2549 71.8711L63.2461 71.8789C61.9338 73.0475 58.5346 76.1088 55.1631 79C53.477 80.4459 51.8024 81.8457 50.4023 82.9424C49.702 83.4909 49.074 83.9599 48.5508 84.3203C48.018 84.6874 47.6236 84.9203 47.3799 85.0186C45.625 85.7263 43.8113 85.8527 42.1006 85.1025C40.6901 84.4839 39.4595 83.1161 38.918 81.6602C38.4802 80.483 38.3722 79.0998 38.3672 77.6377C38.3623 76.2213 38.4578 74.6564 38.3936 73.3135H38.3945L37.3145 46.416L37.3135 46.4092L36.4346 29.8398V29.8389C36.2937 27.2376 36.0561 24.668 36.0273 22.1064C36.0093 20.4971 36.0726 19.1144 36.5186 17.9932C36.9435 16.9249 37.7311 16.0592 39.2637 15.501ZM45.0166 7.17773C45.2146 7.20595 45.3633 7.26703 45.4795 7.39258C45.4524 7.46736 45.4211 7.51546 45.3896 7.54785C45.3341 7.60498 45.2455 7.65738 45.0986 7.69727C44.9489 7.73791 44.7662 7.75879 44.5469 7.77051C44.4387 7.77628 44.3284 7.77942 44.2119 7.7832C44.1057 7.78665 43.9941 7.78951 43.8838 7.7959C43.711 7.78678 43.4955 7.78547 43.3125 7.78027C43.1005 7.77425 42.8984 7.76274 42.7197 7.73438C42.6271 7.71967 42.5506 7.70129 42.4883 7.68164C42.4253 7.66174 42.3662 7.63925 42.3086 7.60938C42.2101 7.55991 42.1123 7.49074 42.0176 7.38574";

const RESET_PATH =
  "M45.8877 1.08398C51.0016 0.366629 56.0825 0.282075 61.1631 0.988281L61.375 1.12988C61.3934 1.14218 61.4122 1.15378 61.4307 1.16602L61.4072 1.32812L61.6328 1.50781C61.9972 1.79761 62.5219 1.86044 62.9453 1.82031C63.2905 1.78758 63.6874 1.67225 63.9922 1.43652C64.284 1.45562 64.6868 1.51843 65.1709 1.62012C65.7536 1.74252 66.4216 1.91199 67.0967 2.09863C68.4467 2.47188 69.805 2.90692 70.5273 3.14551H70.5283C81.0338 6.5916 90.2091 13.1945 96.792 22.0449L96.793 22.0469C105.396 33.4958 109.036 47.8974 106.903 62.0371C104.76 76.1304 97.1109 88.81 85.6211 97.3125C74.1421 105.654 59.7898 109.078 45.7607 106.821H45.7568C31.8789 104.69 19.3915 97.2565 10.9355 86.1162L10.5361 85.583C1.96283 73.9 -1.0162 59.2888 1.21094 45.0703C3.44142 31.2754 11.1167 18.9401 22.5293 10.8096L22.5322 10.8066C28.3902 6.55452 35.1067 3.76192 42.1289 2.125C42.7383 1.98294 43.4258 1.75267 44.0693 1.5498C44.73 1.34155 45.3516 1.15919 45.8877 1.08398ZM105.45 42.7148C99.4164 14.7092 71.9157 -3.27564 43.7139 2.33398C15.5117 7.94378 -2.94154 35.0699 2.29102 63.2354C7.50616 91.3061 34.3196 110.029 62.5654 105.394C62.7249 105.552 62.9102 105.664 63.125 105.717C63.4282 105.791 63.7138 105.729 63.9375 105.652C64.1562 105.577 64.3839 105.462 64.5576 105.38C64.7501 105.289 64.9025 105.226 65.0391 105.195V105.194C65.3703 105.121 65.7007 105.054 66.082 104.857L66.6748 104.551C94.1873 97.7682 111.421 70.4227 105.45 42.7148ZM70.0869 20.6611C70.3168 20.5987 70.6053 20.6623 70.8486 20.8223C70.8827 20.9881 70.8704 21.2683 70.7559 21.6943C70.623 22.1886 70.386 22.7695 70.1084 23.3848C69.8232 24.0168 69.5348 24.6009 69.2588 25.2021C68.9985 25.7692 68.7625 26.3244 68.6592 26.7666L68.5508 27.2305L69.0088 27.3613C77.3583 29.7455 85.7171 35.7547 90.2324 43.165C99.8449 58.9402 93.277 77.8141 77.9287 87.2939V87.2949C67.8411 93.5434 55.6573 95.5015 44.1074 92.7305L44.1064 92.7295L43.2412 92.5156C25.1561 87.843 12.1418 72.0976 16.7363 53.0937C16.823 52.7653 16.9183 52.4393 17.0205 52.1152C17.2931 51.2528 18.1358 49";

const PULSE_KEYFRAMES = `
@keyframes pomo-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}`;

function parseTime(str: string): number {
  const parts = str.split(":").map(Number);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 3)
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  const n = parseInt(str, 10);
  return isNaN(n) ? 3600 : n;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const WATCH_W = 360;
const WATCH_H = Math.round(WATCH_W * (780.604 / 714.259));
const FACE_W = Math.round(WATCH_W * 0.8);
const FACE_H = Math.round(FACE_W * (583 / 588));
const FACE_LEFT = Math.round((WATCH_W - FACE_W) / 2);
const FACE_TOP = Math.round(WATCH_H * 0.14);

const RING_SIZE = FACE_W - 12;
const RING_LEFT = FACE_LEFT + 6;
const RING_TOP = FACE_TOP + 6;
const STROKE_W = 7;
const R = (RING_SIZE - STROKE_W) / 2;
const CIRC = 2 * Math.PI * R;

const BUBBLE_FONT = "'Bubblegum Sans', cursive";

export function PomodoroTimer() {
  const [workTotal, setWorkTotal] = useState(60 * 60);
  const [workRemaining, setWorkRemaining] = useState(60 * 60);
  const [breakTotal, setBreakTotal] = useState(5 * 60);
  const [breakRemaining, setBreakRemaining] = useState(5 * 60);

  const [mode, setMode] = useState<"work" | "break">("work");
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [completedSessions, setCompletedSessions] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const isBreak = mode === "break";
  const remaining = isBreak ? breakRemaining : workRemaining;
  const total = isBreak ? breakTotal : workTotal;
  const progress = total > 0 ? remaining / total : 0;
  const dashOffset = CIRC * (1 - progress);

  const faceColor = isBreak ? "#65C98B" : "#C96565";

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const currentMode = modeRef.current;
      if (currentMode === "work") {
        setWorkRemaining((prev) => {
          if (prev <= 1) {
            setCompletedSessions((s) => (s + 1) % 4);
            setMode("break");
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBreakRemaining((prev) => {
          if (prev <= 1) {
            setMode("work");
            setWorkRemaining(workTotal);
            setBreakRemaining(breakTotal);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, workTotal, breakTotal]);

  useEffect(() => {
    if (!isRunning && mode === "work") setWorkRemaining(workTotal);
  }, [workTotal]);

  useEffect(() => {
    if (!isRunning && mode === "break") setBreakRemaining(breakTotal);
  }, [breakTotal]);

  const handlePlayPause = useCallback(() => {
    setIsRunning((v) => !v);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    if (mode === "work") {
      setWorkRemaining(workTotal);
    } else {
      setMode("work");
      setWorkRemaining(workTotal);
      setBreakRemaining(breakTotal);
    }
  }, [mode, workTotal, breakTotal]);

  const handleClearSessions = useCallback(() => {
    setCompletedSessions(0);
  }, []);

  const handleTimeClick = () => {
    if (isRunning) return;
    setEditValue(formatTime(remaining));
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const secs = Math.max(1, Math.min(parseTime(editValue), 99 * 60 + 59));
    if (mode === "work") {
      setWorkTotal(secs);
      setWorkRemaining(secs);
    } else {
      setBreakTotal(secs);
      setBreakRemaining(secs);
    }
    setIsEditing(false);
  };

  const timeCenterY = FACE_TOP + FACE_H * 0.38;
  const bubbleCenterY = FACE_TOP + FACE_H * 0.58;
  const btnCenterY = FACE_TOP + FACE_H * 0.76;

  const btnResetStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "transform 0.15s",
  };

  const btnPlayStyle: React.CSSProperties = {
    width: 56,
    height: 56,
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "transform 0.15s",
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bubblegum+Sans&display=swap');${PULSE_KEYFRAMES}`}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
        <div style={{ position: "relative", width: WATCH_W, height: WATCH_H }}>

          <div style={{ position: "absolute", inset: 0 }}>
            <svg fill="none" preserveAspectRatio="none" viewBox="0 0 714.259 780.604" style={{ display: "block", width: "100%", height: "100%" }}>
              <g>
                <path d={VECTOR_PATHS.body} fill="#C0BBBB" />
                <path d={VECTOR_PATHS.strapL} fill="#7B7B7B" />
                <path d={VECTOR_PATHS.strapR} fill="#989898" />
                <path d={VECTOR_PATHS.bottom} fill="#686868" fillOpacity="0.6" />
                <path d={VECTOR_PATHS.crown} fill="#8F8E8E" />
              </g>
            </svg>
          </div>

          <div
            style={{
              position: "absolute",
              top: FACE_TOP,
              left: FACE_LEFT,
              width: FACE_W,
              height: FACE_H,
              opacity: isRunning ? 0.75 : 0.45,
              transition: "opacity 0.6s ease",
              pointerEvents: "none",
            }}
          >
            <svg fill="none" preserveAspectRatio="none" viewBox="0 0 588 583" style={{ display: "block", width: "100%", height: "100%" }}>
              <ellipse cx="294" cy="291.5" fill={faceColor} opacity="0.69" rx="294" ry="291.5" />
            </svg>
          </div>

          <svg
            style={{ position: "absolute", top: RING_TOP, left: RING_LEFT, width: RING_SIZE, height: RING_SIZE, pointerEvents: "none" }}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          >
            <circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R}
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE_W}
            />
            <circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R}
              fill="none"
              stroke={isBreak ? "rgba(101,201,139,0.85)" : "rgba(255,255,255,0.82)"}
              strokeWidth={STROKE_W}
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              style={{
                transition: isRunning
                  ? "stroke-dashoffset 1s linear, stroke 0.6s ease"
                  : "stroke-dashoffset 0.35s ease, stroke 0.6s ease",
              }}
            />
          </svg>

          {isBreak && (
            <div
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                left: FACE_LEFT,
                width: FACE_W,
                top: FACE_TOP + 18,
                height: 20,
              }}
            >
              <span
                style={{
                  fontFamily: BUBBLE_FONT,
                  color: "rgba(101,201,139,0.85)",
                  fontSize: 12,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                }}
              >
                break
              </span>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              left: FACE_LEFT,
              width: FACE_W,
              top: timeCenterY - 36,
              height: 72,
            }}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                autoFocus
                style={{
                  fontFamily: BUBBLE_FONT,
                  fontSize: 54,
                  width: 190,
                  lineHeight: 1,
                  textAlign: "center",
                  background: "transparent",
                  outline: "none",
                  border: "none",
                  borderBottom: "2px solid rgba(255,255,255,0.5)",
                  color: "#fff",
                }}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                placeholder="MM:SS"
              />
            ) : (
              <button
                onClick={handleTimeClick}
                title={isRunning ? undefined : "Click to edit time"}
                style={{
                  fontFamily: BUBBLE_FONT,
                  fontSize: 54,
                  cursor: isRunning ? "default" : "text",
                  color: "#fff",
                  lineHeight: 1,
                  background: "none",
                  border: "none",
                  padding: 0,
                  letterSpacing: "0.02em",
                  textShadow: isBreak
                    ? "0 0 32px rgba(101,201,139,0.6), 0 2px 8px rgba(0,0,0,0.5)"
                    : "0 0 32px rgba(255,160,160,0.6), 0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                {formatTime(remaining)}
              </button>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              left: FACE_LEFT,
              width: FACE_W,
              top: bubbleCenterY - 10,
              height: 20,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => {
              const filled = i < completedSessions;
              const isNext = !isBreak && i === completedSessions;
              const partial = isNext ? 1 - progress : 0;
              return (
                <button
                  key={i}
                  onClick={handleClearSessions}
                  title="Clear sessions"
                  style={{ position: "relative", width: 18, height: 18, background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  aria-label={`Session ${i + 1}${filled ? " complete" : ""}`}
                >
                  <svg viewBox="0 0 18 18" fill="none" style={{ position: "absolute", inset: 0 }}>
                    <circle cx="9" cy="9" r="8" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                  </svg>
                  {(filled || (isNext && partial > 0)) && (
                    <svg viewBox="0 0 18 18" fill="none" style={{ position: "absolute", inset: 0 }}>
                      <circle
                        cx="9" cy="9" r="7"
                        fill={filled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)"}
                        style={{
                          clipPath: filled ? undefined : `inset(${(1 - partial) * 100}% 0 0 0)`,
                          transition: "clip-path 1s linear",
                        }}
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 40,
              left: FACE_LEFT,
              width: FACE_W,
              top: btnCenterY - 28,
              height: 56,
            }}
          >
            <button
              onClick={handleReset}
              style={btnResetStyle}
              title="Reset"
              aria-label="Reset timer"
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
            >
              <svg fill="none" preserveAspectRatio="none" viewBox="0 0 108 108" style={{ display: "block", width: "100%", height: "100%" }}>
                <path d={RESET_PATH} fill="#fff" fillOpacity="0.94" />
              </svg>
            </button>
            <button
              onClick={handlePlayPause}
              style={btnPlayStyle}
              title={isRunning ? "Pause" : "Start"}
              aria-label={isRunning ? "Pause" : "Start"}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
            >
              {isRunning ? (
                <svg viewBox="0 0 104 104" fill="none" style={{ display: "block", width: "100%", height: "100%" }}>
                  <rect x="18" y="16" width="24" height="72" rx="5" fill="white" fillOpacity="0.95" />
                  <rect x="62" y="16" width="24" height="72" rx="5" fill="white" fillOpacity="0.95" />
                </svg>
              ) : (
                <svg fill="none" preserveAspectRatio="none" viewBox="0 0 104.305 104.305" style={{ display: "block", width: "100%", height: "100%" }}>
                  <path d={PLAY_PATH} fill="#fff" fillOpacity="0.97" />
                </svg>
              )}
            </button>
          </div>

          {isBreak && breakRemaining === 0 && (
            <div
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                left: FACE_LEFT,
                width: FACE_W,
                top: btnCenterY + 36,
                height: 24,
              }}
            >
              <span
                style={{
                  fontFamily: BUBBLE_FONT,
                  color: "rgba(101,201,139,0.85)",
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  animation: "pomo-pulse 1.5s ease-in-out infinite",
                }}
              >
                break over
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PomodoroTimer;