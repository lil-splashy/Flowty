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
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={{ x: initialX, y: initialY }}
      style={{ position: "absolute", top: 0, left: 0, zIndex, cursor: "grab" }}
      whileDrag={{ cursor: "grabbing", zIndex: 100 }}
      className={className}
    >
      {children}
    </motion.div>
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
          <D20 />
        </DragItem>

        <DragItem initialX={1030} initialY={380} zIndex={16}>
          <WhiteNoisePlayer />
          </DragItem>

     </div>
    </div>
  );
}