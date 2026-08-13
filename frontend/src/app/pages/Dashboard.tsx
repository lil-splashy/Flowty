import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import blueprintBg from "@/imports/blueprint-background.png";
import flowtyLogo from "@/imports/FlowtyLogo.png";
import ChoreTable from "@/imports/ChoreTable/index";
import D20, { type D20Ref } from "@/imports/D20/index";
import PomodoroTimer from "@/app/components/PomodoroTimer";
import Stampbook from "@/imports/Stampbook/index";
import StampCard1 from "@/imports/StampCard-1/index";
import ToDoList from "@/imports/ToDoList/index";
import HabitList from "@/imports/HabitList/index";
import { useAuth } from "@/app/context/AuthContext";
import { useNavigate } from "react-router";
import WhiteNoisePlayer from "@/app/components/whitenoise/WhiteNoisePlayer";
import CustomizationStore from "@/app/components/customization/CustomizationStore";
import * as authApi from "@/app/api/auth";
import Journal from "@/app/components/journal/Journal";
import ProfileSettings from "@/app/components/profile/ProfileSettings";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/app/components/ui/dialog";

const WIDGET_DEFAULTS: Record<string, { x: number; y: number; zIndex: number }> = {
  pomodoro: { x: 23, y: -58, zIndex: 10 },
  todo: { x: 87, y: 283, zIndex: 11 },
  habits: { x: 340, y: 283, zIndex: 16 },
  stampCard: { x: 732, y: 42, zIndex: 12 },
  stampCard1: { x: 718, y: 67, zIndex: 13 },
  chores: { x: 1098, y: 90, zIndex: 14 },
  d20: { x: 1257, y: 453, zIndex: 15 },
  whiteNoise: { x: 1030, y: 380, zIndex: 16 },
  journal: { x: 340, y: -200, zIndex: 17 },
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
      animate={{ x: placement.x, y: placement.y }}
      initial={{ x: placement.x, y: placement.y }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: placement.zIndex,
        cursor: "grab",
      }}
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
  const [isStoreOpen, setIsStoreOpen] = useState(false);

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
          onClick={() => setIsStoreOpen(true)}
          className="rounded px-3 py-1 bg-[#e7e1af] text-[#1a1a2e] text-sm font-['Courier_Prime'] border border-[#1a1a2e]"
        >
          Store
        </button>

        <button
          onClick={handleLogout}
          className="rounded px-3 py-1 bg-[#1a1a2e] text-[#e7e1af] text-sm font-['Special_Elite'] hover:bg-[#2a2a4e] transition-colors border border-[#1a1a2e]"
        >
          Logout
        </button>
      </div>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <div className="absolute top-3 right-4 z-50 flex items-center gap-4">
          <DialogTrigger asChild>
            <button className="bg-[#e7e1af] rounded px-3 py-1 border border-[#1a1a2e] cursor-pointer hover:brightness-95">
              <span className="text-[#1a1a2e] text-sm font-['Courier_Prime']">
                {user?.username}
              </span>
            </button>
          </DialogTrigger>
          <button
            onClick={handleLogout}
            className="rounded px-3 py-1 bg-[#1a1a2e] text-[#e7e1af] text-sm font-['Special_Elite'] hover:bg-[#2a2a4e] transition-colors border border-[#1a1a2e]"
          >
            Logout
          </button>
        </div>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto p-0">
          <ProfileSettings />
        </DialogContent>
      </Dialog>

      {isStoreOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
          }}
          onClick={() => setIsStoreOpen(false)}
        >
          <div
            style={{
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsStoreOpen(false)}
              style={{
                position: "absolute",
                top: 8,
                right: 10,
                zIndex: 10,
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "1px solid #1a1a2e",
                background: "#e7e1af",
                color: "#1a1a2e",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              aria-label="Close customization store"
            >
              ×
            </button>

            <CustomizationStore />
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-center">
            <Stampbook />
          </div>
        </DragItem>

        <DragItem placement={placements.chores} onDragEnd={handleDragEnd}>
          <ChoreTable />
        </DragItem>

        <DragItem placement={placements.d20} onDragEnd={handleDragEnd}>
          <D20 />
        </DragItem>

        <DragItem placement={placements.whiteNoise} onDragEnd={handleDragEnd}>
          <WhiteNoisePlayer />
<DragItem placement={placements.whiteNoise} onDragEnd={handleDragEnd}>
          <WhiteNoisePlayer />
        </DragItem>

        <DragItem placement={placements.journal} onDragEnd={handleDragEnd}>
          <Journal />
        </DragItem>
      </div>
    </div>
  );
}
