import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getAuthHeaders } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DiceIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
    <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

const ShuffleIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

const CartIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const PrintIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const backgroundColor =
    type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#2196f3";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        backgroundColor,
        color: "white",
        padding: "16px 24px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "90vw",
      }}
    >
      <span style={{ fontSize: "20px" }}>
        {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      </span>
      <span style={{ fontWeight: 500 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: "18px",
          padding: "0 0 0 8px",
          opacity: 0.8,
        }}
      >
        ×
      </button>
    </div>
  );
};

const MultiSelectDropdown = ({
  label,
  items,
  selectedIds,
  onChange,
  theme,
  width = "100%",
  allLabel = "Use all recipes",
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleWindowClick = () => setOpen(false);
    if (open) {
      window.addEventListener("click", handleWindowClick);
    }
    return () => window.removeEventListener("click", handleWindowClick);
  }, [open]);

  return (
    <div
      style={{ position: "relative", width }}
      onClick={(e) => e.stopPropagation()}
    >
      {label && (
        <div
          style={{
            marginBottom: "8px",
            color: theme.textSecondary,
            fontWeight: 700,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "10px",
          border: `1px solid ${theme.border}`,
          backgroundColor: theme.cardBackground,
          color: theme.text,
          cursor: "pointer",
          fontWeight: 500,
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        <span>
          {selectedIds.length === 0
            ? "All recipes"
            : `${selectedIds.length} collection${
                selectedIds.length > 1 ? "s" : ""
              } selected`}
        </span>
        <span style={{ fontSize: "12px", opacity: 0.7 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "100%",
            backgroundColor: theme.cardBackground,
            border: `1px solid ${theme.border}`,
            borderRadius: "12px",
            boxShadow: `0 10px 24px ${theme.shadow}`,
            zIndex: 1000,
            maxHeight: "320px",
            overflowY: "auto",
            padding: "8px",
          }}
        >
          <button
            onClick={() => {
              onChange([]);
              setOpen(false);
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "none",
              background:
                selectedIds.length === 0 ? theme.toolbarBackground : "transparent",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              color: theme.text,
              fontWeight: selectedIds.length === 0 ? 700 : 500,
              marginBottom: "6px",
            }}
          >
            ✅ {allLabel}
          </button>

          {items.map((item) => {
            const checked = selectedIds.includes(item._id);

            return (
              <label
                key={item._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: checked
                    ? theme.toolbarBackground
                    : "transparent",
                  color: theme.text,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const updated = checked
                      ? selectedIds.filter((id) => id !== item._id)
                      : [...selectedIds, item._id];

                    onChange(updated);
                  }}
                />
                <span>
                  {item.icon || "📁"} {item.name}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MealPickerModal = ({ open, day, recipes, onClose, onSelect, theme }) => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  if (!open) return null;

  const filtered = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1100px",
          maxHeight: "90vh",
          overflow: "hidden",
          background: theme.cardBackground,
          borderRadius: "16px",
          boxShadow: `0 12px 40px ${theme.shadow}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${theme.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: theme.text }}>Select Meal for {day}</h3>
            <p style={{ margin: "6px 0 0", color: theme.textSecondary, fontSize: "14px" }}>
              Choose from your available recipes
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "24px",
              cursor: "pointer",
              color: theme.text,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: `1px solid ${theme.border}`,
              background: theme.inputBackground || theme.cardBackground,
              color: theme.text,
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            overflowY: "auto",
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "32px",
                textAlign: "center",
                color: theme.textSecondary,
              }}
            >
              No matching recipes found
            </div>
          ) : (
            filtered.map((recipe) => (
              <button
                key={recipe._id}
                onClick={() => onSelect(recipe)}
                style={{
                  border: `1px solid ${theme.border}`,
                  background: theme.toolbarBackground,
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  minHeight: "140px",
                }}
              >
                <div style={{ height: "100%", background: theme.borderLight }}>
                  <img
                    src={recipe.image || "https://via.placeholder.com/400x225?text=No+Image"}
                    alt={recipe.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      color: theme.text,
                      fontWeight: 700,
                      fontSize: "16px",
                      lineHeight: 1.4,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {recipe.name}
                  </div>
                  <div style={{ color: theme.textSecondary, fontSize: "13px", marginTop: "12px" }}>
                    {recipe.ingredients?.length || 0} ingredients
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyDayCard = ({ day, theme, onSelectMeal, onReroll }) => (
  <div
    style={{
      backgroundColor: theme.cardBackground,
      borderRadius: "16px",
      border: `2px dashed ${theme.border}`,
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "280px",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>🍽️</div>
    <h3
      style={{
        margin: "0 0 8px 0",
        color: theme.text,
        fontSize: "18px",
        fontWeight: 600,
      }}
    >
      {day}
    </h3>
    <p style={{ margin: "0 0 18px", color: theme.textMuted, fontSize: "14px" }}>
      No meal planned
    </p>
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
      <button
        onClick={onSelectMeal}
        style={{
          padding: "10px 14px",
          backgroundColor: theme.buttonPrimary,
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Select Meal
      </button>
      <button
        onClick={onReroll}
        style={{
          padding: "10px 14px",
          backgroundColor: "#ff9800",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Reroll
      </button>
    </div>
  </div>
);

const DisabledDayCard = ({ day, theme, onReactivate }) => (
  <div
    style={{
      backgroundColor: theme.cardBackground,
      borderRadius: "16px",
      border: `2px dashed #d32f2f`,
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "280px",
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontSize: "88px",
        lineHeight: 1,
        color: "#d32f2f",
        fontWeight: 900,
        marginBottom: "16px",
      }}
    >
      ✕
    </div>
    <h3
      style={{
        margin: "0 0 8px 0",
        color: theme.text,
        fontSize: "18px",
        fontWeight: 600,
      }}
    >
      {day}
    </h3>
    <p style={{ margin: "0 0 18px", color: theme.textMuted, fontSize: "14px" }}>
      Removed from rotation
    </p>
    <button
      onClick={onReactivate}
      style={{
        padding: "10px 14px",
        backgroundColor: theme.buttonSuccess,
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      Reactivate Day
    </button>
  </div>
);

const MealDayCard = ({
  day,
  entry,
  onReroll,
  onView,
  onAddToShoppingList,
  onDeleteDay,
  onSelectMeal,
  onToggleLock,
  collections,
  onDayCollectionChange,
  isRerolling,
  isAddingToList,
  theme,
}) => {
  const recipe = entry?.recipe;
  const [imageError, setImageError] = useState(false);

  return (
    <div
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: `0 4px 12px ${theme.shadow}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: theme.buttonPrimary,
          color: "white",
          padding: "12px 16px",
          fontWeight: 600,
          fontSize: "14px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <span>{day}</span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {entry?.manuallySelected && (
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: "6px",
                padding: "6px 8px",
                fontSize: "11px",
              }}
            >
              MANUAL
            </span>
          )}
          {entry?.locked && (
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: "6px",
                padding: "6px 8px",
                fontSize: "11px",
              }}
            >
              LOCKED
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReroll();
            }}
            disabled={isRerolling || entry?.locked}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: isRerolling || entry?.locked ? "not-allowed" : "pointer",
              color: "white",
              fontSize: "12px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: entry?.locked ? 0.65 : 1,
            }}
          >
            <DiceIcon size={14} />
            {isRerolling ? "..." : "Reroll"}
          </button>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "56%",
          backgroundColor: theme.borderLight,
          cursor: "pointer",
        }}
        onClick={() => recipe?._id && onView(recipe._id)}
      >
        <img
          src={
            imageError || !recipe?.image
              ? "https://via.placeholder.com/400x225?text=No+Image"
              : recipe.image
          }
          alt={recipe?.name || day}
          onError={() => setImageError(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div
        style={{
          padding: "16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: 600,
            color: theme.text,
            lineHeight: 1.3,
            cursor: "pointer",
          }}
          onClick={() => recipe?._id && onView(recipe._id)}
        >
          {recipe?.name || "No recipe selected"}
        </h3>

        <div
          style={{
            fontSize: "13px",
            color: theme.textMuted,
            marginBottom: "12px",
          }}
        >
          {recipe?.ingredients?.length || 0} ingredients
        </div>

        <div style={{ marginBottom: "12px" }}>
          <MultiSelectDropdown
            label="Day Collections"
            items={collections}
            selectedIds={entry?.preferredCollections || []}
            onChange={(updated) => onDayCollectionChange(day, updated)}
            theme={theme}
            allLabel="Use all recipes for this day"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "8px",
            marginTop: "auto",
          }}
        >
          <button
            onClick={() => recipe?._id && onView(recipe._id)}
            style={{
              padding: "10px",
              backgroundColor: theme.buttonPrimary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            View
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToShoppingList(recipe);
            }}
            disabled={isAddingToList}
            style={{
              padding: "10px",
              backgroundColor: theme.buttonSuccess,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isAddingToList ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              opacity: isAddingToList ? 0.7 : 1,
            }}
          >
            <CartIcon size={14} />
            {isAddingToList ? "..." : "Add"}
          </button>

          <button
            onClick={onSelectMeal}
            style={{
              padding: "10px",
              backgroundColor: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            Select Meal
          </button>

          <button
            onClick={onDeleteDay}
            style={{
              padding: "10px",
              backgroundColor: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            Delete Day
          </button>

          <button
            onClick={onToggleLock}
            style={{
              gridColumn: "1 / -1",
              padding: "10px",
              backgroundColor: entry?.locked ? "#6d4c41" : "#546e7a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            {entry?.locked ? "Unlock Day" : "Lock Day"}
          </button>
        </div>
      </div>
    </div>
  );
};

const WeeklyMeals = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [allRecipes, setAllRecipes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [rerollingDay, setRerollingDay] = useState(null);
  const [addingToListDay, setAddingToListDay] = useState(null);
  const [toast, setToast] = useState(null);
  const [pickerDay, setPickerDay] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const fetchAllRecipes = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/recipes?limit=1000`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "Failed to fetch recipes");
    return Array.isArray(data?.recipes) ? data.recipes : [];
  }, []);

  const fetchCollections = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/collections`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "Failed to fetch collections");
    return Array.isArray(data) ? data : [];
  }, []);

  const fetchWeeklyMenu = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/weekly-menu`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "Failed to fetch weekly menu");
    return data;
  }, []);

  const loadPageData = useCallback(async () => {
    try {
      setLoading(true);
      setCollectionsLoading(true);
      setError("");

      const [recipes, collectionsData, menu] = await Promise.all([
        fetchAllRecipes(),
        fetchCollections(),
        fetchWeeklyMenu(),
      ]);

      setAllRecipes(recipes);
      setCollections(collectionsData);
      setWeeklyMenu(menu);
      setSelectedCollections(
        Array.isArray(menu?.selectedCollections)
          ? menu.selectedCollections.map((c) => (typeof c === "string" ? c : c._id))
          : []
      );
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load weekly meals");
      showToast(err?.message || "Failed to load weekly meals", "error");
    } finally {
      setLoading(false);
      setCollectionsLoading(false);
    }
  }, [fetchAllRecipes, fetchCollections, fetchWeeklyMenu, showToast]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const getDayEntry = useCallback(
    (day) =>
      weeklyMenu?.days?.[day] || {
        recipe: null,
        disabled: false,
        manuallySelected: false,
        locked: false,
        preferredCollections: [],
      },
    [weeklyMenu]
  );

  const filteredRecipes = selectedCollections.length
    ? allRecipes.filter((recipe) =>
        Array.isArray(recipe.collections) &&
        recipe.collections.some((id) =>
          selectedCollections.includes(typeof id === "string" ? id : id._id)
        )
      )
    : allRecipes;

  const saveDay = useCallback(
    async (day, payload, successMessage) => {
      const current = getDayEntry(day);

      const res = await fetch(`${API_BASE_URL}/api/weekly-menu/day/${day}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          recipe:
            payload.recipe !== undefined
              ? payload.recipe
              : current?.recipe?._id || null,
          disabled:
            payload.disabled !== undefined ? payload.disabled : Boolean(current?.disabled),
          manuallySelected:
            payload.manuallySelected !== undefined
              ? payload.manuallySelected
              : Boolean(current?.manuallySelected),
          locked:
            payload.locked !== undefined ? payload.locked : Boolean(current?.locked),
          preferredCollections:
            payload.preferredCollections !== undefined
              ? payload.preferredCollections
              : current?.preferredCollections || [],
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || `Failed to update ${day}`);
      }

      setWeeklyMenu(data);

      if (successMessage) showToast(successMessage, "success");
    },
    [getDayEntry, showToast]
  );

  const handleGenerate = useCallback(async () => {
    if (allRecipes.length === 0) {
      showToast("No recipes available. Add some recipes first!", "error");
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/weekly-menu/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ selectedCollections }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to generate weekly menu");
      }

      setWeeklyMenu(data);
      setSelectedCollections(
        Array.isArray(data?.selectedCollections)
          ? data.selectedCollections.map((c) => (typeof c === "string" ? c : c._id))
          : []
      );

      showToast("Weekly meals generated!", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to generate weekly menu", "error");
    } finally {
      setGenerating(false);
    }
  }, [allRecipes.length, selectedCollections, showToast]);

  const handleReroll = useCallback(
    async (day) => {
      const currentEntry = getDayEntry(day);

      if (currentEntry?.locked) {
        showToast(`${day} is locked`, "error");
        return;
      }

      let recipePool = filteredRecipes;

      if (
        Array.isArray(currentEntry?.preferredCollections) &&
        currentEntry.preferredCollections.length > 0
      ) {
        recipePool = allRecipes.filter((recipe) =>
          Array.isArray(recipe.collections) &&
          recipe.collections.some((c) =>
            currentEntry.preferredCollections.some(
              (pc) => String(pc) === String(typeof c === "string" ? c : c._id)
            )
          )
        );
      }

      if (recipePool.length === 0) {
        showToast("No recipes available for this day filter", "error");
        return;
      }

      setRerollingDay(day);

      try {
        const usedIds = DAYS_OF_WEEK.filter((d) => d !== day)
          .map((d) => getDayEntry(d)?.recipe?._id)
          .filter(Boolean);

        let available = recipePool.filter(
          (recipe) =>
            !usedIds.includes(recipe._id) &&
            recipe._id !== currentEntry?.recipe?._id
        );

        if (available.length === 0) {
          available = recipePool.filter(
            (recipe) => recipe._id !== currentEntry?.recipe?._id
          );
        }

        if (available.length === 0) {
          available = recipePool;
        }

        const randomRecipe = available[Math.floor(Math.random() * available.length)];

        await saveDay(
          day,
          {
            recipe: randomRecipe._id,
            disabled: false,
            manuallySelected: false,
          },
          `${day}'s meal updated!`
        );
      } catch (err) {
        console.error(err);
        showToast(err?.message || "Failed to reroll meal", "error");
      } finally {
        setRerollingDay(null);
      }
    },
    [allRecipes, filteredRecipes, getDayEntry, saveDay, showToast]
  );

  const handleView = useCallback(
    (recipeId) => {
      navigate(`/recipes/${recipeId}`);
    },
    [navigate]
  );

  const handleAddToShoppingList = async (recipe, day) => {
    if (!recipe?.ingredients || recipe.ingredients.length === 0) {
      showToast("This recipe has no ingredients", "error");
      return;
    }

    setAddingToListDay(day);

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ items: recipe.ingredients }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to add to shopping list");
      }

      showToast(`Added ${recipe.name} ingredients to shopping list!`, "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to add to shopping list", "error");
    } finally {
      setAddingToListDay(null);
    }
  };

  const handleAddAllToShoppingList = async () => {
    const mealsWithIngredients = DAYS_OF_WEEK.map((day) => getDayEntry(day))
      .filter((entry) => entry?.recipe?.ingredients?.length > 0 && !entry?.disabled)
      .map((entry) => entry.recipe);

    if (mealsWithIngredients.length === 0) {
      showToast("No meals with ingredients to add", "error");
      return;
    }

    const allIngredients = mealsWithIngredients.flatMap((recipe) => recipe.ingredients);

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ items: allIngredients }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to add to shopping list");
      }

      showToast(
        `Added ingredients from ${mealsWithIngredients.length} meals to shopping list!`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to add to shopping list", "error");
    }
  };

  const handleDeleteDay = async (day) => {
    try {
      await saveDay(
        day,
        {
          recipe: null,
          disabled: true,
          manuallySelected: false,
          locked: false,
          preferredCollections: [],
        },
        `${day} removed from rotation`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactivateDay = async (day) => {
    try {
      await saveDay(
        day,
        {
          recipe: null,
          disabled: false,
          manuallySelected: false,
          locked: false,
        },
        `${day} reactivated`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectMeal = async (recipe) => {
    if (!pickerDay || !recipe?._id) return;

    try {
      await saveDay(
        pickerDay,
        {
          recipe: recipe._id,
          disabled: false,
          manuallySelected: true,
        },
        `${pickerDay}'s meal selected`
      );
      setPickerDay(null);
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to select meal", "error");
    }
  };

  const handleToggleLock = async (day) => {
    const entry = getDayEntry(day);
    const nextLocked = !entry?.locked;

    try {
      await saveDay(
        day,
        { locked: nextLocked },
        nextLocked ? `${day} locked` : `${day} unlocked`
      );
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to update lock", "error");
    }
  };

  const handleDayCollectionChange = async (day, updatedCollections) => {
    try {
      await saveDay(
        day,
        { preferredCollections: updatedCollections },
        updatedCollections.length
          ? `${day} collection filter updated`
          : `${day} collection filter cleared`
      );
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to update day collection", "error");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear all weekly meals?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/weekly-menu/clear`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to clear weekly menu");
      }

      setWeeklyMenu(data);
      setSelectedCollections([]);
      showToast("Weekly meals cleared", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to clear weekly menu", "error");
    }
  };

  const handleBulkCollectionUpdate = async (updatedCollections) => {
    setSelectedCollections(updatedCollections);

    try {
      const currentDays = {};
      DAYS_OF_WEEK.forEach((day) => {
        const entry = getDayEntry(day);
        currentDays[day] = {
          recipe: entry?.recipe?._id || null,
          disabled: Boolean(entry?.disabled),
          manuallySelected: Boolean(entry?.manuallySelected),
          locked: Boolean(entry?.locked),
          preferredCollections: entry?.preferredCollections || [],
        };
      });

      const res = await fetch(`${API_BASE_URL}/api/weekly-menu`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          selectedCollections: updatedCollections,
          days: currentDays,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update collection filters");
      }

      setWeeklyMenu(data);
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to update collection filters", "error");
    }
  };

  const handlePrint = () => {
    const printableDays = DAYS_OF_WEEK.map((day) => ({
      day,
      entry: getDayEntry(day),
    })).filter(({ entry }) => entry?.recipe && !entry?.disabled);

    if (printableDays.length === 0) {
      showToast("No meals available to print", "error");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
      showToast("Popup blocked. Please allow popups to print.", "error");
      return;
    }

    const cardsHtml = printableDays
      .map(
        ({ day, entry }) => `
          <div class="meal-card">
            <img src="${entry.recipe.image || "https://via.placeholder.com/400x225?text=No+Image"}" alt="${entry.recipe.name}" />
            <div class="meal-content">
              <div class="meal-day">${day}</div>
              <div class="meal-name">${entry.recipe.name}</div>
            </div>
          </div>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Weekly Meal Plan</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 24px;
              color: #222;
            }
            h1 {
              margin: 0 0 8px;
            }
            p {
              margin: 0 0 24px;
              color: #666;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 20px;
            }
            .meal-card {
              border: 1px solid #ddd;
              border-radius: 12px;
              overflow: hidden;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .meal-card img {
              width: 100%;
              height: 220px;
              object-fit: cover;
              display: block;
            }
            .meal-content {
              padding: 12px;
            }
            .meal-day {
              font-weight: 700;
              margin-bottom: 6px;
            }
            .meal-name {
              font-size: 16px;
              line-height: 1.35;
            }
            @media print {
              body {
                margin: 12px;
              }
            }
          </style>
        </head>
        <body>
          <h1>Weekly Meal Plan</h1>
          <p>Printed from SnackThat</p>
          <div class="grid">${cardsHtml}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const activeDays = DAYS_OF_WEEK.filter((day) => {
    const entry = getDayEntry(day);
    return !entry?.disabled && entry?.recipe;
  });

  const hasAnyMeals = activeDays.length > 0;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <MealPickerModal
        open={Boolean(pickerDay)}
        day={pickerDay}
        recipes={filteredRecipes}
        onClose={() => setPickerDay(null)}
        onSelect={handleSelectMeal}
        theme={theme}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: "2rem", color: theme.text }}>
              📅 Weekly Meals
            </h2>
            <p style={{ margin: 0, color: theme.textSecondary }}>
              Plan your meals for the week
              {hasAnyMeals && ` • ${activeDays.length}/7 active days planned`}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: theme.toolbarBackground,
            borderRadius: "12px",
            border: `1px solid ${theme.border}`,
            alignItems: "center",
          }}
        >
          <button
            onClick={handleGenerate}
            disabled={loading || generating || allRecipes.length === 0}
            style={{
              padding: "12px 24px",
              backgroundColor:
                loading || allRecipes.length === 0
                  ? theme.borderLight
                  : theme.buttonPrimary,
              color:
                loading || allRecipes.length === 0 ? theme.textMuted : "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                loading || generating || allRecipes.length === 0
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 600,
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShuffleIcon size={20} />
            {generating
              ? "Generating..."
              : hasAnyMeals
              ? "Regenerate All"
              : "Generate Meals"}
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: "12px 20px",
              backgroundColor: theme.buttonNeutral,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PrintIcon size={18} />
            Print Menu
          </button>

          {hasAnyMeals && (
            <>
              <button
                onClick={handleAddAllToShoppingList}
                style={{
                  padding: "12px 24px",
                  backgroundColor: theme.buttonSuccess,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CartIcon size={18} />
                Add All to List
              </button>

              <button
                onClick={handleClear}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#d32f2f",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "15px",
                }}
              >
                Clear All
              </button>
            </>
          )}

          <div style={{ width: "100%", marginTop: "8px", maxWidth: "420px" }}>
            {collectionsLoading ? (
              <div style={{ color: theme.textSecondary, fontSize: "14px" }}>
                Loading collections...
              </div>
            ) : collections.length === 0 ? (
              <div style={{ color: theme.textSecondary, fontSize: "14px" }}>
                No collections available
              </div>
            ) : (
              <MultiSelectDropdown
                label="Filter meal generation by collection"
                items={collections}
                selectedIds={selectedCollections}
                onChange={handleBulkCollectionUpdate}
                theme={theme}
                allLabel="Use all recipes"
              />
            )}
          </div>

          <div
            style={{
              width: "100%",
              marginTop: "8px",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "14px",
              color: theme.textSecondary,
            }}
          >
            <span>📚 {allRecipes.length} recipes available</span>
            <span>
              {selectedCollections.length > 0
                ? `${filteredRecipes.length} recipes in selected collections`
                : "Using all recipes"}
            </span>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: theme.textSecondary,
            }}
          >
            <p style={{ fontSize: "18px" }}>Loading weekly meals...</p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              border: `1px dashed ${theme.border}`,
              borderRadius: "12px",
              backgroundColor: theme.toolbarBackground,
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <p style={{ margin: "0 0 16px", fontSize: "20px", color: theme.text }}>
              Failed to load weekly meals
            </p>
            <p style={{ margin: "0 0 20px", color: theme.textSecondary }}>{error}</p>
            <button
              onClick={loadPageData}
              style={{
                padding: "12px 24px",
                backgroundColor: theme.buttonPrimary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        ) : allRecipes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              border: `1px dashed ${theme.border}`,
              borderRadius: "12px",
              backgroundColor: theme.toolbarBackground,
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📖</div>
            <p style={{ margin: "0 0 16px", fontSize: "20px", color: theme.text }}>
              No recipes saved yet
            </p>
            <p style={{ margin: "0 0 20px", color: theme.textSecondary }}>
              Add some recipes first to generate your weekly meal plan.
            </p>
            <button
              onClick={() => navigate("/add")}
              style={{
                padding: "12px 24px",
                backgroundColor: theme.buttonSuccess,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ＋ Add Recipe
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {DAYS_OF_WEEK.map((day) => {
              const entry = getDayEntry(day);

              if (entry?.disabled) {
                return (
                  <DisabledDayCard
                    key={day}
                    day={day}
                    theme={theme}
                    onReactivate={() => handleReactivateDay(day)}
                  />
                );
              }

              if (!entry?.recipe) {
                return (
                  <EmptyDayCard
                    key={day}
                    day={day}
                    theme={theme}
                    onSelectMeal={() => setPickerDay(day)}
                    onReroll={() => handleReroll(day)}
                  />
                );
              }

              return (
                <MealDayCard
                  key={day}
                  day={day}
                  entry={entry}
                  onReroll={() => handleReroll(day)}
                  onView={handleView}
                  onAddToShoppingList={(recipe) => handleAddToShoppingList(recipe, day)}
                  onDeleteDay={() => handleDeleteDay(day)}
                  onSelectMeal={() => setPickerDay(day)}
                  onToggleLock={() => handleToggleLock(day)}
                  collections={collections}
                  onDayCollectionChange={handleDayCollectionChange}
                  isRerolling={rerollingDay === day}
                  isAddingToList={addingToListDay === day}
                  theme={theme}
                />
              );
            })}
          </div>
        )}

        {!loading && !error && allRecipes.length > 0 && !hasAnyMeals && (
          <div
            style={{
              marginTop: "32px",
              padding: "24px",
              backgroundColor: theme.toolbarBackground,
              borderRadius: "12px",
              border: `1px solid ${theme.border}`,
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 12px", color: theme.text }}>👆 Get Started</h3>
            <p style={{ margin: 0, color: theme.textSecondary }}>
              Click <strong>"Generate Meals"</strong> to build your weekly plan, or
              manually select meals for specific days.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default WeeklyMeals;