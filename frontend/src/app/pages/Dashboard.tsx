import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import blueprintBg from "@/imports/blueprint-background.png";
import forestBg from "@/imports/ForestBackground.png";
import sunsetBg from "@/imports/SunsetBackground.png";
import nightSkyBg from "@/imports/NightSkyBackground.png";
import flowtyLogo from "@/imports/FlowtyLogo.png";
import ChoreTable from "@/imports/ChoreTable/index";
import D20 from "@/imports/D20/index";
import PomodoroTimer from "@/app/components/PomodoroTimer";
import Stampbook from "@/imports/Stampbook/index";
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

const STORAGE_KEY = "flowty-customization-store";

const BACKGROUND_MAP: Record<string, string> = {
  "background-blueprint": blueprintBg,
  "background-forest": forestBg,
  "background-sunset": sunsetBg,
  "background-night": nightSkyBg,
};

function getSelectedBackground(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return "background-blueprint";
    const parsed = JSON.parse(saved) as { selectedBackground?: string };
    return parsed.selectedBackground ?? "background-blueprint";
  } catch {
    return "background-blueprint";
  }
}

const WIDGET_DEFAULTS: Record<string, { x: number; y: number; zIndex: number }> = {
  pomodoro: { x: 23, y: -58, zIndex: 10 },
  todo: { x: 87, y: 283, zIndex: 11 },
  habits: { x: 340, y: 283, zIndex: 16 },
  stampCard: { x: 732, y: 42, zIndex: 12 },
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
  return (
    <motion.div
      drag
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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  const [selectedBackground, setSelectedBackground] = useState(getSelectedBackground);

  useEffect(() => {
    const handleChange = () => setSelectedBackground(getSelectedBackground());
    window.addEventListener("flowty:theme-change", handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("flowty:theme-change", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const bgUrl = BACKGROUND_MAP[selectedBackground] ?? blueprintBg;

  const [placements, setPlacements] = useState<Record<string, Placement>>(() =>
    Object.entries(WIDGET_DEFAULTS).reduce((acc, [widgetId, defaults]) => {
      acc[widgetId] = { widgetId, ...defaults };
      return acc;
    }, {} as Record<string, Placement>)
  );

  const saveTimeoutRef = useRef<number | null>(null);
  const zIndexCounterRef = useRef(100);

  useEffect(() => {
    let cancelled = false;

    authApi
      .getWidgetPlacements()
      .then((saved) => {
        if (cancelled) return;

        if (saved.length > 0) {
          const maxZ = Math.max(...saved.map((p) => p.zIndex));
          if (maxZ > zIndexCounterRef.current) {
            zIndexCounterRef.current = maxZ;
          }
        }

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
      zIndexCounterRef.current += 1;
      const promoted = { ...updated, zIndex: zIndexCounterRef.current };
      const next = { ...current, [updated.widgetId]: promoted };
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
        backgroundImage: `url(${bgUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-3 left-4 z-50">
        <img src={flowtyLogo} alt="Flowty" className="h-14 w-auto" />
      </div>

      <div className="absolute top-3 right-4 z-50 flex items-center gap-4">
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogTrigger asChild>
            <button className="bg-[var(--flowty-paper)] rounded px-3 py-1 border border-[var(--flowty-ink)] cursor-pointer hover:brightness-95">
              <span className="text-[var(--flowty-ink)] text-sm font-['Courier_Prime']">
                {user?.username}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto p-0">
            <ProfileSettings />
          </DialogContent>
        </Dialog>

        <button
          onClick={() => setIsStoreOpen(true)}
          className="rounded px-3 py-1 bg-[var(--flowty-paper)] text-[var(--flowty-ink)] text-sm font-['Courier_Prime'] border border-[var(--flowty-ink)]"
        >
          Store
        </button>

        <button
          onClick={handleLogout}
          className="rounded px-3 py-1 bg-[var(--flowty-ink)] text-[var(--flowty-paper)] text-sm font-['Special_Elite'] hover:bg-[var(--flowty-title-hover)] transition-colors border border-[var(--flowty-ink)]"
        >
          Logout
        </button>
      </div>

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
                border: "1px solid var(--flowty-ink)",
                background: "var(--flowty-paper)",
                color: "var(--flowty-ink)",
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
        </DragItem>

        <DragItem placement={placements.journal} onDragEnd={handleDragEnd}>
          <Journal />
        </DragItem>
      </div>
    </div>
  );
}