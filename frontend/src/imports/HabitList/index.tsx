import { useState, useEffect, useCallback } from "react";
import * as habitsApi from "@/app/api/habits";
import type { HabitResponse } from "@/app/api/habits";

const FREQUENCIES = ["DAILY", "WEEKLY", "CUSTOM"];

export default function HabitList({ className }: { className?: string }) {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFrequency, setNewFrequency] = useState("DAILY");
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    try {
      const data = await habitsApi.getHabits();
      setHabits(data);
    } catch {
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleToggle = useCallback(async (id: number) => {
    try {
      const updated = await habitsApi.toggleHabitComplete(id);
      setHabits((prev: HabitResponse[]) =>
        prev.map((h: HabitResponse) => (h.id === id ? updated : h))
      );
    } catch {}
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await habitsApi.deleteHabit(id);
      setHabits((prev: HabitResponse[]) =>
        prev.filter((h: HabitResponse) => h.id !== id)
      );
    } catch {}
  }, []);

  const handleAdd = useCallback(async () => {
    if (!newName.trim()) {
      setError("Habit name is required");
      return;
    }
    setError(null);
    try {
      const created = await habitsApi.createHabit({
        name: newName.trim(),
        frequency: newFrequency,
      });
      setHabits((prev: HabitResponse[]) => [created, ...prev]);
      setNewName("");
      setNewFrequency("DAILY");
      setAdding(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.response?.data?.error ??
          "Could not save habit"
      );
    }
  }, [newName, newFrequency]);

  const closeForm = useCallback(() => {
    setAdding(false);
    setError(null);
    setNewName("");
    setNewFrequency("DAILY");
  }, []);

  const defaultClasses =
    "bg-[#e7e1af] border-[#1a1a2e] border-[1.5px] border-solid drop-shadow-[5px_3px_2px_rgba(0,0,0,0.6)] h-[355px] overflow-hidden relative rounded-[2px] shadow-[5px_3px_4px_0px_rgba(0,0,0,0.61)] w-[234px]";

  return (
    <div className={className || defaultClasses} data-name="Habit List">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <div
          className="bg-[#4bbec8] border-b-[#1a1a2e] border-b-[1.5px] border-solid content-stretch flex h-[34px] items-center px-[10px] relative shrink-0 w-full"
          data-name="Title"
        >
          <p className="font-['Permanent_Marker',sans-serif] leading-[13px] not-italic relative shrink-0 text-[#1a1a2e] text-[12px] whitespace-nowrap">
            HABITS
          </p>
          <div className="flex-[1_0_0] h-[20px] min-w-px relative" />
          <button
            onClick={() => (adding ? closeForm() : setAdding(true))}
            className="font-['Courier_Prime',sans-serif] leading-[10px] not-italic relative shrink-0 text-[#1a1a2e] text-[9px] bg-[#e7e1af] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[6px] py-[2px] hover:bg-[#d5cf9e] transition-colors"
            title="Add habit"
          >
            {adding ? "\u2715" : "+ Add"}
          </button>
        </div>

        {adding && (
          <div className="w-full px-[8px] py-[6px] border-b-[#1a1a2e] border-b-[1px] border-solid flex flex-col gap-[4px]">
            <input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="Habit name"
              maxLength={100}
              autoFocus
              className="font-['Courier_Prime',sans-serif] text-[9px] text-[#3a2a10] bg-[rgba(255,255,255,0.5)] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[4px] py-[2px] outline-none"
            />
            <div className="flex gap-[4px]">
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                className="flex-1 font-['Courier_Prime',sans-serif] text-[9px] text-[#3a2a10] bg-[rgba(255,255,255,0.5)] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[4px] py-[2px] outline-none"
              >
                {FREQUENCIES.map((f: string) => (
                  <option key={f} value={f}>
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                className="font-['Courier_Prime',sans-serif] text-[9px] text-[#1a1a2e] bg-[#c5f06a] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[8px] hover:opacity-80 transition-opacity"
              >
                Save
              </button>
            </div>
            {error && (
              <p className="font-['Courier_Prime',sans-serif] text-[8px] text-[#a33] leading-[10px]">
                {error}
              </p>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative w-full">
          {loading ? (
            <div className="content-stretch flex flex-col gap-[4px] p-[8px]">
              {Array.from({ length: 5 }).map((_, i: number) => (
                <div
                  key={i}
                  className="bg-[rgba(0,0,0,0.04)] h-[26px] rounded-[2px] shrink-0 w-full animate-pulse"
                />
              ))}
            </div>
          ) : habits.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="font-['Courier_Prime',sans-serif] leading-[14px] not-italic text-[#8a6a40] text-[10px]">
                No habits yet
              </p>
            </div>
          ) : (
            <div className="content-stretch flex flex-col pb-[4px] pt-[2px]">
              {habits.map((habit: HabitResponse, idx: number) => (
                <div
                  key={habit.id}
                  className={`h-[26px] relative shrink-0 w-full group ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-[rgba(0,0,0,0.02)]"
                  }`}
                  data-name="Row"
                >
                  <div
                    aria-hidden
                    className="absolute border border-[rgba(126,229,231,0.4)] border-solid inset-0 pointer-events-none"
                  />
                  <div className="content-stretch flex gap-[6px] items-center px-[10px] py-0 relative size-full w-full hover:bg-[rgba(0,0,0,0.03)] transition-colors">
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className="shrink-0 size-[14px] relative cursor-pointer"
                    >
                      <div
                        className={`absolute inset-0 rounded-[1.5px] border-[#1a1a2e] border-[1px] border-solid ${
                          habit.completed ? "bg-[#c5f06a]" : "bg-transparent"
                        }`}
                      />
                      {habit.completed && (
                        <svg
                          className="absolute inset-0 size-full p-[1px]"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M3 7L6 10L11 4"
                            stroke="#1a1a2e"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <span className="flex-1 min-w-0 text-left">
                      <p
                        className={`font-['Courier_Prime',sans-serif] leading-[12px] not-italic text-[#3a2a10] text-[9px] truncate ${
                          habit.completed ? "line-through opacity-50" : ""
                        }`}
                      >
                        {habit.name}
                      </p>
                    </span>
                    <span className="shrink-0">
                      <p className="font-['Courier_Prime',sans-serif] leading-[12px] not-italic text-[#8a6a40] text-[7px] text-right whitespace-nowrap">
                        {habit.frequency ? habit.frequency.charAt(0) : ""}
                      </p>
                    </span>
                    {habit.currentStreak > 0 && (
                      <span className="shrink-0 flex items-center gap-[2px]">
                        <span className="leading-[10px] text-[8px]">🔥</span>
                        <p className="font-['Courier_Prime',sans-serif] leading-[12px] not-italic text-[#d4780a] text-[8px] text-right whitespace-nowrap font-bold">
                          {habit.currentStreak}
                        </p>
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="shrink-0 font-['Courier_Prime',sans-serif] text-[#8a6a40] text-[9px] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#a33]"
                      title="Delete habit"
                    >
                      {"\u2715"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
