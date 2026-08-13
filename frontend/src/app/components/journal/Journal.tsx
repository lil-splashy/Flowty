import { useMemo, useState } from "react";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
};

const STORAGE_KEY = "flowty-journal-entries";
const MOODS = ["Focused", "Productive", "Calm", "Tired", "Stressed"];

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function loadEntries(): JournalEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

export default function Journal({ className }: { className?: string }) {
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("Focused");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.mood.toLowerCase().includes(q)
    );
  }, [entries, search]);

  function saveEntries(updated: JournalEntry[]): void {
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function clearForm(): void {
    setTitle("");
    setContent("");
    setMood("Focused");
    setEditingId(null);
    setAdding(false);
  }

  function saveEntry(): void {
    if (!title.trim()) {
      setMessage("Entry title is required.");
      return;
    }
    if (!content.trim()) {
      setMessage("Journal content is required.");
      return;
    }
    if (editingId) {
      saveEntries(
        entries.map((e) =>
          e.id === editingId
            ? { ...e, title: title.trim(), content: content.trim(), mood }
            : e
        )
      );
      setMessage("Journal entry updated.");
    } else {
const newEntry: JournalEntry = {
        id: generateId(),
        title: title.trim(),
        content: content.trim(),
        mood,
        createdAt: new Date().toISOString(),
      };
      saveEntries([newEntry, ...entries]);
      setMessage("Journal entry saved.");
    }
    clearForm();
    window.setTimeout(() => setMessage(""), 3000);
  }

  function editEntry(entry: JournalEntry): void {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setMessage("");
    setAdding(true);
  }

  function deleteEntry(id: string): void {
    saveEntries(entries.filter((e) => e.id !== id));
    if (editingId === id) clearForm();
    setMessage("Journal entry deleted.");
    window.setTimeout(() => setMessage(""), 3000);
  }

  const defaultClasses =
    "bg-[#e7e1af] border-[#1a1a2e] border-[1.5px] border-solid drop-shadow-[5px_3px_2px_rgba(0,0,0,0.6)] h-[500px] overflow-hidden relative rounded-[2px] shadow-[5px_3px_4px_0px_rgba(0,0,0,0.61)] w-[468px]";

  return (
    <div className={className || defaultClasses} data-name="Journal">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <div
          className="bg-[#4bbec8] border-b-[#1a1a2e] border-b-[1.5px] border-solid content-stretch flex h-[34px] items-center px-[10px] relative shrink-0 w-full"
          data-name="Title"
        >
          <p className="font-['Permanent_Marker',sans-serif] leading-[13px] not-italic relative shrink-0 text-[#1a1a2e] text-[12px] whitespace-nowrap">
            JOURNAL
          </p>
          <div className="flex-[1_0_0] h-[20px] min-w-px relative" />
          <button
            onClick={() => (adding ? clearForm() : setAdding(true))}
            className="font-['Courier_Prime',sans-serif] leading-[10px] not-italic relative shrink-0 text-[#1a1a2e] text-[9px] bg-[#e7e1af] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[6px] py-[2px] hover:bg-[#d5cf9e] transition-colors"
          >
            {adding ? "\u2715" : "+ Add Entry"}
          </button>
        </div>

        {adding && (
          <div className="w-full px-[8px] py-[6px] border-b-[#1a1a2e] border-b-[1px] border-solid flex flex-col gap-[4px]">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (message) setMessage("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && content.trim()) saveEntry();
              }}
              placeholder="Entry title"
              maxLength={200}
              autoFocus
              className="font-['Courier_Prime',sans-serif] text-[9px] text-[#3a2a10] bg-[rgba(255,255,255,0.5)] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[4px] py-[2px] outline-none"
            />
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="font-['Courier_Prime',sans-serif] text-[9px] text-[#3a2a10] bg-[rgba(255,255,255,0.5)] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[4px] py-[2px] outline-none"
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (message) setMessage("");
              }}
              placeholder="Write your thoughts here..."
              rows={4}
              className="font-['Courier_Prime',sans-serif] text-[9px] text-[#3a2a10] bg-[rgba(255,255,255,0.5)] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[4px] py-[2px] outline-none resize-none"
            />
            <div className="flex gap-[4px] items-center">
              <button
                onClick={saveEntry}
                className="font-['Courier_Prime',sans-serif] text-[9px] text-[#1a1a2e] bg-[#c5f06a] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[8px] py-[2px] hover:opacity-80 transition-opacity"
              >
                {editingId ? "Update" : "Save"}
              </button>
              {editingId && (
                <button
                  onClick={clearForm}
                  className="font-['Courier_Prime',sans-serif] text-[9px] text-[#1a1a2e] bg-[#e7e1af] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[8px] py-[2px] hover:bg-[#d5cf9e] transition-colors"
                >
                  Cancel
                </button>
              )}
              {message && (
                <p className="font-['Courier_Prime',sans-serif] text-[8px] text-[#4bbec8] leading-[10px]">
                  {message}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="w-full px-[8px] py-[4px] border-b-[#1a1a2e] border-b-[1px] border-solid">
          <input
            type="search"
            value={search}
            placeholder="Search entries..."
            className="w-full font-['Courier_Prime',sans-serif] text-[9px] text-[#3a2a10] bg-[rgba(255,255,255,0.5)] border-[#1a1a2e] border-[1px] border-solid rounded-[2px] px-[4px] py-[2px] outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative w-full max-h-[420px]">
          {filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center h-[100px]">
              <p className="font-['Courier_Prime',sans-serif] leading-[14px] not-italic text-[#8a6a40] text-[10px]">
                {search ? "No matching entries" : "No entries yet"}
              </p>
            </div>
          ) : (
            <div className="content-stretch flex flex-col pb-[4px] pt-[2px]">
              {filteredEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`relative shrink-0 w-full group border-b border-[rgba(126,229,231,0.4)] border-solid ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-[rgba(0,0,0,0.02)]"
                  }`}
                  data-name="Entry"
                >
                  <div className="content-stretch flex flex-col gap-[2px] px-[10px] py-[6px] relative w-full hover:bg-[rgba(0,0,0,0.03)] transition-colors">
                    <div className="flex items-center gap-[6px]">
                      <p className="flex-1 font-['Courier_Prime',sans-serif] leading-[12px] not-italic text-[#3a2a10] text-[9px] font-bold truncate">
                        {entry.title}
                      </p>
                      <span className="shrink-0 font-['Courier_Prime',sans-serif] leading-[10px] not-italic text-[#8a6a40] text-[7px]">
                        {entry.mood}
                      </span>
                      <span className="shrink-0 font-['Courier_Prime',sans-serif] leading-[10px] not-italic text-[#8a6a40] text-[7px]">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => editEntry(entry)}
                        className="shrink-0 font-['Courier_Prime',sans-serif] text-[#8a6a40] text-[9px] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#1a1a2e] leading-[10px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="shrink-0 font-['Courier_Prime',sans-serif] text-[#8a6a40] text-[9px] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#a33] leading-[10px]"
                      >
                        {"\u2715"}
                      </button>
                    </div>
                    <p className="font-['Courier_Prime',sans-serif] leading-[14px] not-italic text-[#3a2a10] text-[9px] whitespace-pre-wrap line-clamp-3">
                      {entry.content}
                    </p>
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