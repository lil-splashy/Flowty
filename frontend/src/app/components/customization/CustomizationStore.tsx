import { useEffect, useMemo, useState } from "react";

type Category = "background" | "widget" | "pomodoro";

type StoreItem = {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
};

type StoreState = {
  balance: number;
  ownedItems: string[];
  selectedBackground: string;
  selectedWidget: string;
  selectedPomodoro: string;
};

const STORAGE_KEY = "flowty-customization-store";

const DEFAULT_STATE: StoreState = {
  balance: 500,
  ownedItems: [
    "background-blueprint",
    "widget-default",
    "pomodoro-default",
  ],
  selectedBackground: "background-blueprint",
  selectedWidget: "widget-default",
  selectedPomodoro: "pomodoro-default",
};

const STORE_ITEMS: StoreItem[] = [
  {
    id: "background-blueprint",
    name: "Blueprint",
    category: "background",
    price: 0,
    description: "Default Flowty blueprint background",
  },
  {
    id: "background-night",
    name: "Night Sky",
    category: "background",
    price: 150,
    description: "Dark night-style dashboard background",
  },
  {
    id: "background-forest",
    name: "Forest",
    category: "background",
    price: 200,
    description: "Calm green forest dashboard background",
  },
  {
    id: "background-sunset",
    name: "Sunset",
    category: "background",
    price: 250,
    description: "Warm sunset dashboard background",
  },

  {
    id: "widget-default",
    name: "Classic Notes",
    category: "widget",
    price: 0,
    description: "Default Flowty widget appearance",
  },
  {
    id: "widget-dark",
    name: "Dark Notes",
    category: "widget",
    price: 125,
    description: "Dark theme for notes and widgets",
  },
  {
    id: "widget-paper",
    name: "Notebook Paper",
    category: "widget",
    price: 175,
    description: "Notebook-style widget appearance",
  },

  {
    id: "pomodoro-default",
    name: "Classic Timer",
    category: "pomodoro",
    price: 0,
    description: "Default Pomodoro appearance",
  },
  {
    id: "pomodoro-retro",
    name: "Retro Timer",
    category: "pomodoro",
    price: 150,
    description: "Retro-inspired Pomodoro appearance",
  },
  {
    id: "pomodoro-focus",
    name: "Focus Mode",
    category: "pomodoro",
    price: 225,
    description: "Minimal Pomodoro appearance for focused work",
  },
];

function loadStoreState(): StoreState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(saved) as StoreState;

    return {
      ...DEFAULT_STATE,
      ...parsed,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function CustomizationStore() {
  const [storeState, setStoreState] =
    useState<StoreState>(loadStoreState);

  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeState));
  }, [storeState]);

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [message]);

  const groupedItems = useMemo(() => {
    return {
      background: STORE_ITEMS.filter(
        (item) => item.category === "background"
      ),
      widget: STORE_ITEMS.filter(
        (item) => item.category === "widget"
      ),
      pomodoro: STORE_ITEMS.filter(
        (item) => item.category === "pomodoro"
      ),
    };
  }, []);

  function isOwned(itemId: string) {
    return storeState.ownedItems.includes(itemId);
  }

  function isSelected(item: StoreItem) {
    if (item.category === "background") {
      return storeState.selectedBackground === item.id;
    }

    if (item.category === "widget") {
      return storeState.selectedWidget === item.id;
    }

    return storeState.selectedPomodoro === item.id;
  }

  function purchaseItem(item: StoreItem) {
    if (isOwned(item.id)) return;

    if (storeState.balance < item.price) {
      setMessage("Not enough rewards to purchase this item.");
      return;
    }

    setStoreState((current) => ({
      ...current,
      balance: current.balance - item.price,
      ownedItems: [...current.ownedItems, item.id],
    }));

    setMessage(`${item.name} purchased successfully.`);
  }

  function selectItem(item: StoreItem) {
    if (!isOwned(item.id)) return;

    setStoreState((current) => {
      if (item.category === "background") {
        return {
          ...current,
          selectedBackground: item.id,
        };
      }

      if (item.category === "widget") {
        return {
          ...current,
          selectedWidget: item.id,
        };
      }

      return {
        ...current,
        selectedPomodoro: item.id,
      };
    });

    setMessage(`${item.name} selected.`);
  }

  function renderSection(title: string, items: StoreItem[]) {
    return (
      <section style={{ marginBottom: 24 }}>
        <h3
          style={{
            marginBottom: 10,
            fontSize: 18,
            color: "#1a1a2e",
          }}
        >
          {title}
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {items.map((item) => {
            const owned = isOwned(item.id);
            const selected = isSelected(item);

            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  border: "1px solid #1a1a2e",
                  borderRadius: 8,
                  background: "#f2edc7",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#1a1a2e",
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 3,
                      color: "#444",
                    }}
                  >
                    {item.description}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {!owned && (
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#1a1a2e",
                      }}
                    >
                      {item.price} 🪙
                    </span>
                  )}

                  {selected ? (
                    <button
                      disabled
                      style={{
                        padding: "7px 12px",
                        borderRadius: 6,
                        border: "1px solid #1a1a2e",
                        background: "#b7d5a5",
                      }}
                    >
                      Selected
                    </button>
                  ) : owned ? (
                    <button
                      onClick={() => selectItem(item)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 6,
                        border: "1px solid #1a1a2e",
                        background: "#e7e1af",
                        cursor: "pointer",
                      }}
                    >
                      Select
                    </button>
                  ) : (
                    <button
                      onClick={() => purchaseItem(item)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 6,
                        border: "1px solid #1a1a2e",
                        background: "#e7e1af",
                        cursor: "pointer",
                      }}
                    >
                      Purchase
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div
      style={{
        width: 440,
        maxHeight: 540,
        overflowY: "auto",
        padding: 18,
        background: "#fff8d6",
        border: "2px solid #1a1a2e",
        borderRadius: 12,
        boxShadow: "4px 4px 0 rgba(0,0,0,0.25)",
        fontFamily: "Courier Prime, monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#1a1a2e",
              fontSize: 24,
            }}
          >
            Customization Store
          </h2>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#555",
            }}
          >
            Purchase and select Flowty customizations
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            background: "#e7e1af",
            border: "1px solid #1a1a2e",
            borderRadius: 8,
            fontWeight: 700,
            color: "#1a1a2e",
          }}
        >
          🪙 {storeState.balance}
        </div>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 14,
            padding: 9,
            background: "#dfe8c5",
            border: "1px solid #1a1a2e",
            borderRadius: 6,
            fontSize: 13,
            color: "#1a1a2e",
          }}
        >
          {message}
        </div>
      )}

      {renderSection("Backgrounds", groupedItems.background)}

      {renderSection("Widgets / Notes", groupedItems.widget)}

      {renderSection("Pomodoro Timer", groupedItems.pomodoro)}
    </div>
  );
}