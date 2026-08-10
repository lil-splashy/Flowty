import { useMemo, useState } from "react";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
};

const STORAGE_KEY = "flowty-journal-entries";

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
  const savedEntries = localStorage.getItem(STORAGE_KEY);

  if (!savedEntries) {
    return [];
  }

  try {
    return JSON.parse(savedEntries) as JournalEntry[];
  } catch {
    return [];
  }
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("Focused");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filteredEntries = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (searchValue === "") {
      return entries;
    }

    return entries.filter((entry) => {
      return (
        entry.title.toLowerCase().includes(searchValue) ||
        entry.content.toLowerCase().includes(searchValue) ||
        entry.mood.toLowerCase().includes(searchValue)
      );
    });
  }, [entries, search]);

  function saveEntries(updatedEntries: JournalEntry[]): void {
    setEntries(updatedEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  }

  function clearForm(): void {
    setTitle("");
    setContent("");
    setMood("Focused");
    setEditingId(null);
  }

  function saveEntry(): void {
    if (title.trim() === "") {
      setMessage("Entry title is required.");
      return;
    }

    if (content.trim() === "") {
      setMessage("Journal content is required.");
      return;
    }

    if (editingId) {
      const updatedEntries = entries.map((entry) =>
        entry.id === editingId
          ? {
              ...entry,
              title: title.trim(),
              content: content.trim(),
              mood,
            }
          : entry
      );

      saveEntries(updatedEntries);
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

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function editEntry(entry: JournalEntry): void {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setMessage("");
  }

  function deleteEntry(id: string): void {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    saveEntries(updatedEntries);

    if (editingId === id) {
      clearForm();
    }

    setMessage("Journal entry deleted.");

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  return (
    <section className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Notebook &amp; Journal
        </h2>

        <p className="text-sm text-slate-500">
          Record reflections, goals, and daily accomplishments.
        </p>
      </div>

      <div className="rounded-xl bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          Daily prompt: What did you accomplish today?
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <input
          type="text"
          value={title}
          placeholder="Entry title"
          className="rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => {
            setTitle(event.target.value);
            setMessage("");
          }}
        />

        <select
          value={mood}
          className="rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setMood(event.target.value)}
        >
          <option value="Focused">Focused</option>
          <option value="Productive">Productive</option>
          <option value="Calm">Calm</option>
          <option value="Tired">Tired</option>
          <option value="Stressed">Stressed</option>
        </select>

        <textarea
          value={content}
          placeholder="Write your thoughts here..."
          className="min-h-40 rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => {
            setContent(event.target.value);
            setMessage("");
          }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveEntry}
            className="rounded-lg bg-slate-900 px-5 py-2 font-semibold text-white"
          >
            {editingId ? "Update Entry" : "Save Entry"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg border border-slate-300 px-5 py-2 font-semibold text-slate-700"
            >
              Cancel Edit
            </button>
          )}

          {message && (
            <p className="text-sm font-medium text-slate-700">
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <input
          type="search"
          value={search}
          placeholder="Search journal entries..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="mt-5 space-y-4">
        {filteredEntries.length === 0 ? (
          <p className="rounded-lg bg-slate-100 p-4 text-center text-slate-500">
            No journal entries yet.
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {entry.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Mood: {entry.mood}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => editEntry(entry)}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-slate-700">
                {entry.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}