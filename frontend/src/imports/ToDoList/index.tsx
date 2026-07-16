import { useState, useEffect, useCallback } from "react";
import * as choresApi from "@/app/api/chores";
import type { ChoreResponse } from "@/app/api/chores";

export default function ToDoList({ className }: { className?: string }) {
  const [chores, setChores] = useState<ChoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const fetchChores = useCallback(async () => {
    try {
      const data = await choresApi.getChores();
      setChores(data);
    } catch {
      setChores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChores();
  }, [fetchChores]);

  const handleToggle = useCallback(
    async (id: string) => {
      try {
        const updated = await choresApi.toggleChoreComplete(id);
        setChores((prev) => prev.map((c) => (c.id === id ? updated : c)));
      } catch {}
    },
    []
  );

  const handleRoll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    let count = 0;
    const maxTicks = 10 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      setRollResult(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count >= maxTicks) {
        clearInterval(interval);
        setRolling(false);
      }
    }, 80);
  }, [rolling]);

  const defaultClasses =
    "bg-[#e7e1af] border-[#1a1a2e] border-[1.5px] border-solid drop-shadow-[5px_3px_2px_rgba(0,0,0,0.6)] h-[355px] overflow-hidden relative rounded-[2px] shadow-[5px_3px_4px_0px_rgba(0,0,0,0.61)] w-[234px]";

  return (
    <div className={className || defaultClasses} data-name="ToDo List">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <div className="bg-[#4bbec8] border-b-[#1a1a2e] border-b-[1.5px] border-solid content-stretch flex h-[34px] items-center px-[10px] relative shrink-0 w-full" data-name="Title">
          <p className="font-['Permanent_Marker',sans-serif] leading-[13px] not-italic relative shrink-0 text-[#1a1a2e] text-[12px] whitespace-nowrap">
            To-Do LIST
          </p>
          <div className="flex-[1_0_0] h-[20px] min-w-px relative" />
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="font-['Courier_Prime',sans-serif] leading-[10px] not-italic relative shrink-0 text-[#1a1a2e] text-[9px] bg-[#e7e1af] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[6px] py-[2px] hover:bg-[#d5cf9e] transition-colors"
            title="Roll D20"
          >
            {rolling ? (
              <span className="inline-block animate-pulse">{rollResult ?? "🎲"}</span>
            ) : (
              "🎲 Roll"
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative w-full">
          {loading ? (
            <div className="content-stretch flex flex-col gap-[4px] p-[8px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[rgba(0,0,0,0.04)] h-[26px] rounded-[2px] shrink-0 w-full animate-pulse"
                />
              ))}
            </div>
          ) : chores.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="font-['Courier_Prime',sans-serif] leading-[14px] not-italic text-[#8a6a40] text-[10px]">
                No chores yet
              </p>
            </div>
          ) : (
            <div className="content-stretch flex flex-col pb-[4px] pt-[2px]">
              {chores.map((chore, idx) => (
                <div
                  key={chore.id}
                  className={`h-[26px] relative shrink-0 w-full ${idx % 2 === 0 ? "bg-transparent" : "bg-[rgba(0,0,0,0.02)]"}`}
                  data-name="Row"
                >
                  <div aria-hidden className="absolute border border-[rgba(126,229,231,0.4)] border-solid inset-0 pointer-events-none" />
                  <button
                    onClick={() => handleToggle(chore.id)}
                    className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center px-[10px] py-0 relative size-full w-full cursor-pointer hover:bg-[rgba(0,0,0,0.03)] transition-colors"
                  >
                    <span className="shrink-0 size-[14px] relative">
                      <div
                        className={`absolute inset-0 rounded-[1.5px] border-[#1a1a2e] border-[1px] border-solid ${chore.completed ? "bg-[#c5f06a]" : "bg-transparent"}`}
                      />
                      {chore.completed && (
                        <svg className="absolute inset-0 size-full p-[1px]" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7L6 10L11 4" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <p
                        className={`font-['Courier_Prime',sans-serif] leading-[12px] not-italic text-[#3a2a10] text-[9px] truncate ${chore.completed ? "line-through opacity-50" : ""}`}
                      >
                        {chore.description}
                      </p>
                    </span>
                    <span className="shrink-0">
                      <p className="font-['Courier_Prime',sans-serif] leading-[12px] not-italic text-[#8a6a40] text-[7px] text-right whitespace-nowrap">
                        #{chore.rollNumber}
                      </p>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}