import { motion } from "motion/react";
import blueprintBg from "@/imports/blueprint-background.png";
import ChoreTable from "@/imports/ChoreTable/index";
import D20, { type D20Ref } from "@/imports/D20/index";
import PomodoroTimer from "@/app/components/PomodoroTimer";
import StampCard from "@/imports/StampCard/index";
import StampCard1 from "@/imports/StampCard-1/index";
import ToDoList from "@/imports/ToDoList/index";
import HabitList from "@/imports/HabitList/index";
import { useAuth } from "@/app/context/AuthContext";
import { useNavigate } from "react-router";
import WhiteNoisePlayer from "@/app/components/whitenoise/WhiteNoisePlayer";
import { useRef, useState, useCallback } from "react";

function DragItem({
  children,
  initialX,
  initialY,
  zIndex = 10,
  className,
}: {
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  zIndex?: number;
  className?: string;
}) {
  const [dragEnabled, setDragEnabled] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);

  const handlePointerEnter = useCallback(() => {
    hoverTimerRef.current = window.setTimeout(() => {
      setDragEnabled(true);
    }, 500);
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setDragEnabled(false);
  }, []);

  return (
    <motion.div
      drag={dragEnabled}
      dragMomentum={false}
      dragElastic={0}
      initial={{ x: initialX, y: initialY }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{ position: "absolute", top: 0, left: 0, zIndex, cursor: dragEnabled ? "grab" : "default" }}
      whileDrag={{ cursor: "grabbing", zIndex: 100 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function D20Widget() {
  const d20Ref = useRef<D20Ref>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only roll on a genuine click/tap, not a drag.
    if (distance < 5) {
      d20Ref.current?.roll();
    }
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Roll a D20"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          d20Ref.current?.roll();
        }
      }}
      className="cursor-pointer focus:outline-none select-none touch-manipulation"
    >
      <D20 ref={d20Ref} />
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div
      className="min-h-screen w-full overflow-auto"
      style={{
        backgroundImage: `url(${blueprintBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-3 right-4 z-50 flex items-center gap-4">
        <div className="bg-[#e7e1af] rounded px-3 py-1 border border-[#1a1a2e]">
          <span className="text-[#1a1a2e] text-sm font-['Courier_Prime']">
            {user?.username}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="Log out"
        >
          Logout
        </button>
      </div>

      <div className="relative mx-auto" style={{ width: 1366, height: 638 }}>
        <DragItem initialX={23} initialY={-58} zIndex={10}>
          <PomodoroTimer />
        </DragItem>

        <DragItem initialX={87} initialY={283} zIndex={11}>
          <ToDoList />
        </DragItem>

        <DragItem initialX={340} initialY={283} zIndex={16}>
          <HabitList />
        </DragItem>

        <DragItem initialX={732} initialY={42} zIndex={12}>
          <div className="flex h-[276.482px] w-[343.487px] items-center justify-center">
            <div className="flex-none rotate-[13.44deg] h-full w-full">
              <StampCard />
            </div>
          </div>
        </DragItem>

        <DragItem initialX={718} initialY={67} zIndex={13}>
          <StampCard1 />
        </DragItem>

        <DragItem initialX={1098} initialY={90} zIndex={14}>
          <ChoreTable />
        </DragItem>

        <DragItem initialX={1257} initialY={453} zIndex={15}>
          <D20Widget />
        </DragItem>

        <DragItem initialX={1030} initialY={380} zIndex={16}>
          <WhiteNoisePlayer />
          </DragItem>

     </div>
    </div>
  );
}