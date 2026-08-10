import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import blueprintBg from "@/imports/blueprint-background.png";
import ChoreTable from "@/imports/ChoreTable/index";
import D20 from "@/imports/D20/index";
import PomodoroTimer from "@/app/components/PomodoroTimer";
import StampCard from "@/imports/StampCard/index";
import StampCard1 from "@/imports/StampCard-1/index";
import ToDoList from "@/imports/ToDoList/index";
import HabitList from "@/imports/HabitList/index";
import { useAuth } from "@/app/context/AuthContext";
import { useNavigate } from "react-router";
import WhiteNoisePlayer from "@/app/components/whitenoise/WhiteNoisePlayer";
import * as authApi from "@/app/api/auth";

const WIDGET_DEFAULTS: Record<string, { x: number; y: number; zIndex: number }> = {
  pomodoro: { x: 23, y: -58, zIndex: 10 },
  todo: { x: 87, y: 283, zIndex: 11 },
  habits: { x: 340, y: 283, zIndex: 16 },
  stampCard: { x: 732, y: 42, zIndex: 12 },
  stampCard1: { x: 718, y: 67, zIndex: 13 },
  chores: { x: 1098, y: 90, zIndex: 14 },
  d20: { x: 1257, y: 453, zIndex: 15 },
  whiteNoise: { x: 1030, y: 380, zIndex: 16 },
};

type Placement = {
  widgetId: string;
  x: number;
  y: number;
  zIndex: number;
};

function DragItem({
  children,
  placement,
  onDragEnd,
  className,
}: {
  children: React.ReactNode;
  placement: Placement;
  onDragEnd: (placement: Placement) => void;
  className?: string;
}) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      animate={{ x: placement.x, y: placement.y }}
      initial={{ x: placement.x, y: placement.y }}
      style={{ position: "absolute", top: 0, left: 0, zIndex: placement.zIndex, cursor: "grab" }}
      whileDrag={{ cursor: "grabbing", zIndex: 100 }}
      onDragEnd={(_event, info) => {
        onDragEnd({
          widgetId: placement.widgetId,
          x: placement.x + info.offset.x,
          y: placement.y + info.offset.y,
          zIndex: placement.zIndex,
        });
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [placements, setPlacements] = useState<Record<string, Placement>>(() =>
    Object.entries(WIDGET_DEFAULTS).reduce((acc, [widgetId, defaults]) => {
      acc[widgetId] = { widgetId, ...defaults };
      return acc;
    }, {} as Record<string, Placement>)
  );

  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    authApi
      .getWidgetPlacements()
      .then((saved) => {
        if (cancelled) return;

        setPlacements((current) => {
          const next = { ...current };
          saved.forEach((p) => {
            next[p.widgetId] = p;
          });
          return next;
        });
      })
      .catch(() => {
        // Leave defaults in place if the profile cannot be loaded.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function persistPlacements(nextPlacements: Record<string, Placement>) {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      authApi.updateWidgetPlacements(Object.values(nextPlacements)).catch(() => {
        // Silently fail; user can retry on next drag.
      });
    }, 500);
  }

  function handleDragEnd(updated: Placement) {
    setPlacements((current) => {
      const next = { ...current, [updated.widgetId]: updated };
      persistPlacements(next);
      return next;
    });
  }

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
        <DragItem placement={placements.pomodoro} onDragEnd={handleDragEnd}>
          <PomodoroTimer />
        </DragItem>

        <DragItem placement={placements.todo} onDragEnd={handleDragEnd}>
          <ToDoList />
        </DragItem>

        <DragItem placement={placements.habits} onDragEnd={handleDragEnd}>
          <HabitList />
        </DragItem>

        <DragItem placement={placements.stampCard} onDragEnd={handleDragEnd}>
          <div className="flex h-[276.482px] w-[343.487px] items-center justify-center">
            <div className="flex-none rotate-[13.44deg] h-full w-full">
              <StampCard />
            </div>
          </div>
        </DragItem>

        <DragItem placement={placements.stampCard1} onDragEnd={handleDragEnd}>
          <StampCard1 />
        </DragItem>

        <DragItem placement={placements.chores} onDragEnd={handleDragEnd}>
          <ChoreTable />
        </DragItem>

        <DragItem placement={placements.d20} onDragEnd={handleDragEnd}>
          <D20 />
        </DragItem>

        <DragItem placement={placements.whiteNoise} onDragEnd={handleDragEnd}>
          <WhiteNoisePlayer />
        </DragItem>
      </div>
    </div>
  );
}
