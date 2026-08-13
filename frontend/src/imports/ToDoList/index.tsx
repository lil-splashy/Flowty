import { useState, useEffect, useCallback } from "react";
import * as choresApi from "@/app/api/chores";
import type { ChoreResponse } from "@/app/api/chores";

export default function ToDoList({ className }: { className?: string }) {
  const [chores, setChores] = useState<ChoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);

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
    async (id: number) => {
      try {
        const updated = await choresApi.toggleChoreComplete(id);
        setChores((prev) => prev.map((c) => (c.id === id ? updated : c)));
      } catch (err) {
        console.error("Failed to toggle chore:", err);
      }
    },
    []
  );

  const handleAdd = useCallback(async () => {
    const trimmed = newItem.trim();
    if (!trimmed || adding) return;
    setAdding(true);
    try {
      const created = await choresApi.createChore({ description: trimmed });
      setChores((prev) => [...prev, created]);
      setNewItem("");
    } catch {} finally {
      setAdding(false);
    }
  }, [newItem, adding]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleAdd();
      }
    },
    [handleAdd]
  );

  const defaultClasses =
    "bg-[var(--flowty-paper)] border-[var(--flowty-ink)] border-[1.5px] border-solid drop-shadow-[5px_3px_2px_rgba(0,0,0,0.6)] h-[355px] overflow-hidden relative rounded-[2px] shadow-[5px_3px_4px_0px_rgba(0,0,0,0.61)] w-[234px]";

  return (
    <div className={className || defaultClasses} data-name="ToDo List">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <div className="bg-[var(--flowty-title-bg)] border-b-[var(--flowty-ink)] border-b-[1.5px] border-solid content-stretch flex h-[34px] items-center px-[10px] relative shrink-0 w-full" data-name="Title">
          <p className="font-['Permanent_Marker',sans-serif] leading-[13px] not-italic relative shrink-0 text-[var(--flowty-ink)] text-[12px] whitespace-nowrap">
            To-Do LIST
          </p>
        </div>

        <div className="border-b-[var(--flowty-ink)] border-b-[1px] border-solid content-stretch flex gap-[4px] items-center px-[8px] py-[4px] shrink-0 w-full">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add item..."
            className="bg-[var(--flowty-surface)] border-[var(--flowty-ink)] border-[1px] border-solid flex-1 font-['Courier_Prime',sans-serif] leading-[12px] min-w-0 outline-none px-[4px] py-[2px] rounded-[2px] text-[var(--flowty-text)] text-[9px]"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newItem.trim()}
            className="bg-[var(--flowty-title-bg)] border-[var(--flowty-ink)] border-[1px] border-solid font-['Courier_Prime',sans-serif] leading-[10px] not-italic px-[6px] py-[2px] rounded-[2px] shrink-0 text-[var(--flowty-ink)] text-[9px] hover:bg-[var(--flowty-title-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative w-full">
          {loading ? (
            <div className="content-stretch flex flex-col gap-[4px] p-[8px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--flowty-row-alt)] h-[26px] rounded-[2px] shrink-0 w-full animate-pulse"
                />
              ))}
            </div>
          ) : chores.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="font-['Courier_Prime',sans-serif] leading-[14px] not-italic text-[var(--flowty-text-secondary)] text-[10px]">
                No items yet
              </p>
            </div>
          ) : (
            <div className="content-stretch flex flex-col pb-[4px] pt-[2px]">
              {chores.map((chore, idx) => (
                <div
                  key={chore.id}
                  className={`h-[26px] relative shrink-0 w-full ${idx % 2 === 0 ? "bg-transparent" : "bg-[var(--flowty-row-alt)]"}`}
                  data-name="Row"
                >
                  <div aria-hidden className="absolute border border-[var(--flowty-accent-border)] border-solid inset-0 pointer-events-none" />
                  <button
                    onClick={() => handleToggle(chore.id)}
                    className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[6px] items-center px-[10px] py-0 relative size-full w-full cursor-pointer hover:bg-[var(--flowty-row-hover)] transition-colors"
                  >
                    <span className="shrink-0 size-[14px] relative">
                      <div
                        className={`absolute inset-0 rounded-[1.5px] border-[var(--flowty-ink)] border-[1px] border-solid ${chore.completed ? "bg-[var(--flowty-accent)]" : "bg-transparent"}`}
                      />
                      {chore.completed && (
                        <svg className="absolute inset-0 size-full p-[1px]" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7L6 10L11 4" stroke="var(--flowty-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <p
                        className={`font-['Courier_Prime',sans-serif] leading-[12px] not-italic text-[var(--flowty-text)] text-[9px] truncate ${chore.completed ? "line-through opacity-50" : ""}`}
                      >
                        {chore.description}
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