import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getAuthHeaders } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  maxHeight = "320px",
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
            maxHeight: maxHeight || "320px",
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

const MealPickerModal = ({ open, slotLabel, recipes, onClose, onSelect, theme }) => {
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
            <h3 style={{ margin: 0, color: theme.text }}>
              Select Recipe for {slotLabel}
            </h3>
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

const EmptyRecipeCard = ({ slotLabel, theme, onSelectMeal, onReroll }) => (
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
      {slotLabel}
    </h3>
    <p style={{ margin: "0 0 18px", color: theme.textMuted, fontSize: "14px" }}>
      No recipe selected
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

const DeletedRecipeCard = ({ slotLabel, theme, onReactivate }) => (
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
      {slotLabel}
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
      Reactivate
    </button>
  </div>
);

const RecipeCard = ({
  slotLabel,
  entry,
  onReroll,
  onView,
  onAddToShoppingList,
  onDelete,
  onSelectMeal,
  onToggleLock,
  collections,
  onCollectionChange,
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
        overflow: "visible",
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
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
        }}
      >
        <span>{slotLabel}</span>
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
          alt={recipe?.name || slotLabel}
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
            label="Card Collections"
            items={collections}
            selectedIds={entry?.preferredCollections || []}
            onChange={onCollectionChange}
            theme={theme}
            allLabel="Use all recipes for this card"
            maxHeight="320px"
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
            onClick={onDelete}
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
            Delete
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
            {entry?.locked ? "Unlock Card" : "Lock Card"}
          </button>
        </div>
      </div>
    </div>
  );
};

const createEmptyEntry = (index) => ({
  id: `slot-${index + 1}`,
  label: `Recipe ${index + 1}`,
  recipe: null,
  disabled: false,
  manuallySelected: false,
  locked: false,
  preferredCollections: [],
});

const RandomRecipe = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [allRecipes, setAllRecipes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [recipeCountInput, setRecipeCountInput] = useState("7");
  const [recipeSlots, setRecipeSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [rerollingSlotId, setRerollingSlotId] = useState(null);
  const [addingToListSlotId, setAddingToListSlotId] = useState(null);
  const [toast, setToast] = useState(null);
  const [pickerSlotId, setPickerSlotId] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const fetchAllRecipes = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/recipes?limit=5000`, {
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

  const loadPageData = useCallback(async () => {
    try {
      setLoading(true);
      setCollectionsLoading(true);
      setError("");

      const [recipes, collectionsData] = await Promise.all([
        fetchAllRecipes(),
        fetchCollections(),
      ]);

      setAllRecipes(recipes);
      setCollections(collectionsData);

      const initialCount = 7;
      setRecipeSlots(Array.from({ length: initialCount }, (_, index) => createEmptyEntry(index)));
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load random recipes");
      showToast(err?.message || "Failed to load random recipes", "error");
    } finally {
      setLoading(false);
      setCollectionsLoading(false);
    }
  }, [fetchAllRecipes, fetchCollections, showToast]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const parsedRecipeCount = useMemo(() => {
    const n = Number(recipeCountInput);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(100, Math.floor(n)));
  }, [recipeCountInput]);

  const filteredRecipes = selectedCollections.length
    ? allRecipes.filter((recipe) =>
        Array.isArray(recipe.collections) &&
        recipe.collections.some((id) =>
          selectedCollections.includes(typeof id === "string" ? id : id._id)
        )
      )
    : allRecipes;

  const pickerRecipes = filteredRecipes;

  const activeSlots = recipeSlots.filter((slot) => !slot.disabled && slot.recipe);
  const hasAnyMeals = activeSlots.length > 0;

  const applyRecipeCount = () => {
    const count = parsedRecipeCount;

    setRecipeSlots((prev) => {
      if (count === prev.length) return prev;

      if (count < prev.length) {
        return prev.slice(0, count).map((slot, index) => ({
          ...slot,
          label: `Recipe ${index + 1}`,
          id: `slot-${index + 1}`,
        }));
      }

      const next = [...prev];
      for (let i = prev.length; i < count; i += 1) {
        next.push(createEmptyEntry(i));
      }

      return next.map((slot, index) => ({
        ...slot,
        label: `Recipe ${index + 1}`,
        id: `slot-${index + 1}`,
      }));
    });
  };

  const updateSlot = useCallback((slotId, updater) => {
    setRecipeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? typeof updater === "function"
            ? updater(slot)
            : { ...slot, ...updater }
          : slot
      )
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (allRecipes.length === 0) {
      showToast("No recipes available. Add some recipes first!", "error");
      return;
    }

    if (parsedRecipeCount === 0) {
      setRecipeSlots([]);
      showToast("Set the number of recipes above 0 to generate.", "error");
      return;
    }

    setGenerating(true);

    try {
      const nextSlots = Array.from({ length: parsedRecipeCount }, (_, index) =>
        createEmptyEntry(index)
      );

      let availablePool = [...filteredRecipes];

      if (availablePool.length === 0) {
        throw new Error("No recipes available for the selected collections");
      }

      const generated = nextSlots.map((slot) => {
        if (availablePool.length === 0) {
          availablePool = [...filteredRecipes];
        }

        const randomIndex = Math.floor(Math.random() * availablePool.length);
        const randomRecipe = availablePool[randomIndex];

        availablePool.splice(randomIndex, 1);

        return {
          ...slot,
          recipe: randomRecipe || null,
          disabled: false,
          manuallySelected: false,
          locked: false,
          preferredCollections: [],
        };
      });

      setRecipeSlots(generated);
      showToast("Random recipes generated!", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to generate recipes", "error");
    } finally {
      setGenerating(false);
    }
  }, [allRecipes.length, filteredRecipes, parsedRecipeCount, showToast]);

  const handleReroll = useCallback(
    async (slotId) => {
      const currentSlot = recipeSlots.find((slot) => slot.id === slotId);
      if (!currentSlot) return;

      if (currentSlot.locked) {
        showToast(`${currentSlot.label} is locked`, "error");
        return;
      }

      let recipePool = filteredRecipes;

      if (
        Array.isArray(currentSlot.preferredCollections) &&
        currentSlot.preferredCollections.length > 0
      ) {
        recipePool = allRecipes.filter((recipe) =>
          Array.isArray(recipe.collections) &&
          recipe.collections.some((c) =>
            currentSlot.preferredCollections.some(
              (pc) => String(pc) === String(typeof c === "string" ? c : c._id)
            )
          )
        );
      }

      if (recipePool.length === 0) {
        showToast("No recipes available for this card filter", "error");
        return;
      }

      setRerollingSlotId(slotId);

      try {
        const usedIds = recipeSlots
          .filter((slot) => slot.id !== slotId)
          .map((slot) => slot.recipe?._id)
          .filter(Boolean);

        let available = recipePool.filter(
          (recipe) =>
            !usedIds.includes(recipe._id) &&
            recipe._id !== currentSlot?.recipe?._id
        );

        if (available.length === 0) {
          available = recipePool.filter(
            (recipe) => recipe._id !== currentSlot?.recipe?._id
          );
        }

        if (available.length === 0) {
          available = recipePool;
        }

        const randomRecipe = available[Math.floor(Math.random() * available.length)];

        updateSlot(slotId, {
          recipe: randomRecipe,
          disabled: false,
          manuallySelected: false,
        });

        showToast(`${currentSlot.label} updated!`, "success");
      } catch (err) {
        console.error(err);
        showToast(err?.message || "Failed to reroll recipe", "error");
      } finally {
        setRerollingSlotId(null);
      }
    },
    [allRecipes, filteredRecipes, recipeSlots, showToast, updateSlot]
  );

  const handleView = useCallback(
    (recipeId) => {
      navigate(`/recipes/${recipeId}`);
    },
    [navigate]
  );

  const handleAddToShoppingList = async (recipe, slotId) => {
    if (!recipe?.ingredients || recipe.ingredients.length === 0) {
      showToast("This recipe has no ingredients", "error");
      return;
    }

    setAddingToListSlotId(slotId);

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
      setAddingToListSlotId(null);
    }
  };

  const handleAddAllToShoppingList = async () => {
    const mealsWithIngredients = recipeSlots
      .filter((slot) => slot?.recipe?.ingredients?.length > 0 && !slot?.disabled)
      .map((slot) => slot.recipe);

    if (mealsWithIngredients.length === 0) {
      showToast("No recipes with ingredients to add", "error");
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
        `Added ingredients from ${mealsWithIngredients.length} recipes to shopping list!`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to add to shopping list", "error");
    }
  };

  const handleDeleteSlot = (slotId) => {
    updateSlot(slotId, {
      recipe: null,
      disabled: true,
      manuallySelected: false,
      locked: false,
      preferredCollections: [],
    });

    const slot = recipeSlots.find((s) => s.id === slotId);
    if (slot) showToast(`${slot.label} removed from rotation`, "success");
  };

  const handleReactivateSlot = (slotId) => {
    updateSlot(slotId, {
      recipe: null,
      disabled: false,
      manuallySelected: false,
      locked: false,
    });

    const slot = recipeSlots.find((s) => s.id === slotId);
    if (slot) showToast(`${slot.label} reactivated`, "success");
  };

  const handleSelectMeal = (recipe) => {
    if (!pickerSlotId || !recipe?._id) return;

    updateSlot(pickerSlotId, {
      recipe,
      disabled: false,
      manuallySelected: true,
    });

    const slot = recipeSlots.find((s) => s.id === pickerSlotId);
    if (slot) showToast(`${slot.label} recipe selected`, "success");

    setPickerSlotId(null);
  };

  const handleToggleLock = (slotId) => {
    const slot = recipeSlots.find((s) => s.id === slotId);
    if (!slot) return;

    const nextLocked = !slot.locked;

    updateSlot(slotId, { locked: nextLocked });
    showToast(nextLocked ? `${slot.label} locked` : `${slot.label} unlocked`, "success");
  };

  const handleSlotCollectionChange = (slotId, updatedCollections) => {
    updateSlot(slotId, { preferredCollections: updatedCollections });

    const slot = recipeSlots.find((s) => s.id === slotId);
    if (!slot) return;

    showToast(
      updatedCollections.length
        ? `${slot.label} collection filter updated`
        : `${slot.label} collection filter cleared`,
      "success"
    );
  };

  const handleClear = () => {
    if (!window.confirm("Clear all random recipe cards?")) return;
    setRecipeSlots((prev) =>
      prev.map((slot, index) => ({
        ...createEmptyEntry(index),
        id: slot.id,
        label: `Recipe ${index + 1}`,
      }))
    );
    showToast("Random recipes cleared", "success");
  };

  const handleBulkCollectionUpdate = (updatedCollections) => {
    setSelectedCollections(updatedCollections);
  };

  const handlePrint = () => {
    const printableSlots = recipeSlots.filter((slot) => slot?.recipe && !slot?.disabled);

    if (printableSlots.length === 0) {
      showToast("No recipes available to print", "error");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
      showToast("Popup blocked. Please allow popups to print.", "error");
      return;
    }

    const cardsHtml = printableSlots
      .map(
        (slot) => `
          <div class="meal-card">
            <img src="${slot.recipe.image || "https://via.placeholder.com/400x225?text=No+Image"}" alt="${slot.recipe.name}" />
            <div class="meal-content">
              <div class="meal-day">${slot.label}</div>
              <div class="meal-name">${slot.recipe.name}</div>
            </div>
          </div>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Random Recipes</title>
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
          <h1>Random Recipes</h1>
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

  const pickerSlot = recipeSlots.find((slot) => slot.id === pickerSlotId);

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
        open={Boolean(pickerSlotId)}
        slotLabel={pickerSlot?.label || "Recipe"}
        recipes={pickerRecipes}
        onClose={() => setPickerSlotId(null)}
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
              🎲 Random Recipe
            </h2>
            <p style={{ margin: 0, color: theme.textSecondary }}>
              Generate as many random recipe cards as you want
              {hasAnyMeals && ` • ${activeSlots.length}/${recipeSlots.length} active cards filled`}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                color: theme.text,
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Number of Recipes
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={recipeCountInput}
              onChange={(e) => setRecipeCountInput(e.target.value)}
              style={{
                width: "100px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.cardBackground,
                color: theme.text,
                fontSize: "14px",
              }}
            />

            <button
              onClick={applyRecipeCount}
              disabled={loading || generating}
              style={{
                padding: "10px 16px",
                backgroundColor: theme.buttonNeutral,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading || generating ? "not-allowed" : "pointer",
                opacity: loading || generating ? 0.7 : 1,
                fontWeight: 600,
              }}
            >
              Apply Count
            </button>
          </div>

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
            {generating ? "Generating..." : "Generate Meals"}
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
                label="Filter recipe generation by collection"
                items={collections}
                selectedIds={selectedCollections}
                onChange={handleBulkCollectionUpdate}
                theme={theme}
                allLabel="Use all recipes"
                maxHeight="320px"
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
            <p style={{ fontSize: "18px" }}>Loading random recipes...</p>
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
              Failed to load random recipes
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
              Add some recipes first to generate random recipe cards.
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
        ) : recipeSlots.length === 0 ? (
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
              Enter a number from <strong>0 to 100</strong>, click <strong>Apply Count</strong>,
              then click <strong>Generate Meals</strong>.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {recipeSlots.map((slot) => {
              if (slot?.disabled) {
                return (
                  <DeletedRecipeCard
                    key={slot.id}
                    slotLabel={slot.label}
                    theme={theme}
                    onReactivate={() => handleReactivateSlot(slot.id)}
                  />
                );
              }

              if (!slot?.recipe) {
                return (
                  <EmptyRecipeCard
                    key={slot.id}
                    slotLabel={slot.label}
                    theme={theme}
                    onSelectMeal={() => setPickerSlotId(slot.id)}
                    onReroll={() => handleReroll(slot.id)}
                  />
                );
              }

              return (
                <RecipeCard
                  key={slot.id}
                  slotLabel={slot.label}
                  entry={slot}
                  onReroll={() => handleReroll(slot.id)}
                  onView={handleView}
                  onAddToShoppingList={(recipe) => handleAddToShoppingList(recipe, slot.id)}
                  onDelete={() => handleDeleteSlot(slot.id)}
                  onSelectMeal={() => setPickerSlotId(slot.id)}
                  onToggleLock={() => handleToggleLock(slot.id)}
                  collections={collections}
                  onCollectionChange={(updated) =>
                    handleSlotCollectionChange(slot.id, updated)
                  }
                  isRerolling={rerollingSlotId === slot.id}
                  isAddingToList={addingToListSlotId === slot.id}
                  theme={theme}
                />
              );
            })}
          </div>
        )}

        {!loading && !error && allRecipes.length > 0 && recipeSlots.length > 0 && !hasAnyMeals && (
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
              Click <strong>"Generate Meals"</strong> to fill your recipe cards, or
              manually select recipes for specific cards.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default RandomRecipe;