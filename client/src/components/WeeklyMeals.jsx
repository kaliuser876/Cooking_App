import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useTheme } from "../context/ThemeContext";
import { getAuthHeaders } from "../context/AuthContext";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STORAGE_KEY = "weeklyMeals";

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
        animation: "slideInRight 0.3s ease-out",
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
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

const EmptyDayCard = ({ day, theme }) => (
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
    <p
      style={{
        margin: 0,
        color: theme.textMuted,
        fontSize: "14px",
      }}
    >
      No meal planned
    </p>
  </div>
);

const MealDayCard = ({
  day,
  recipe,
  onReroll,
  onView,
  onAddToShoppingList,
  isRerolling,
  isAddingToList,
  theme,
}) => {
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
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 8px 24px ${theme.shadow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 12px ${theme.shadow}`;
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
        }}
      >
        <span>{day}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReroll();
          }}
          disabled={isRerolling}
          title="Reroll this meal"
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: isRerolling ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "white",
            fontSize: "12px",
            fontWeight: 500,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isRerolling) {
              e.currentTarget.style.background = "rgba(255,255,255,0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          }}
        >
          <DiceIcon size={14} />
          {isRerolling ? "..." : "Reroll"}
        </button>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "56%",
          backgroundColor: theme.borderLight,
          cursor: "pointer",
        }}
        onClick={() => onView(recipe._id)}
      >
        <img
          src={
            imageError || !recipe.image
              ? "https://via.placeholder.com/400x225?text=No+Image"
              : recipe.image
          }
          alt={recipe.name}
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
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => onView(recipe._id)}
        >
          {recipe.name}
        </h3>

        <div
          style={{
            fontSize: "13px",
            color: theme.textMuted,
            marginBottom: "12px",
            marginTop: "auto",
          }}
        >
          {recipe.ingredients?.length || 0} ingredients
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onView(recipe._id)}
            style={{
              flex: 1,
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
              flex: 1,
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
        </div>
      </div>
    </div>
  );
};

const WeeklyMeals = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [allRecipes, setAllRecipes] = useState([]);
  const [weeklyMeals, setWeeklyMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [rerollingDay, setRerollingDay] = useState(null);
  const [addingToListDay, setAddingToListDay] = useState(null);
  const [toast, setToast] = useState(null);

  const generateTimeoutRef = useRef(null);
  const rerollTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const loadWeeklyMeals = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return {};

      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (err) {
      console.error("Failed to load weekly meals:", err);
      return {};
    }
  }, []);

  const saveWeeklyMeals = useCallback((meals) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    } catch (err) {
      console.error("Failed to save weekly meals:", err);
    }
  }, []);

  const fetchAllRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/recipes?limit=1000`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch recipes");
      }

      setAllRecipes(Array.isArray(data?.recipes) ? data.recipes : []);
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
      setAllRecipes([]);
      setError(err?.message || "Failed to load recipes");
      showToast(err?.message || "Failed to load recipes", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllRecipes();
    setWeeklyMeals(loadWeeklyMeals());

    return () => {
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current);
      }
      if (rerollTimeoutRef.current) {
        clearTimeout(rerollTimeoutRef.current);
      }
    };
  }, [fetchAllRecipes, loadWeeklyMeals]);

  const selectRandomRecipes = useCallback(
    (count, excludeIds = []) => {
      if (allRecipes.length === 0) return [];

      const availableRecipes = allRecipes.filter((r) => !excludeIds.includes(r._id));
      const selected = [];
      const usedIds = new Set(excludeIds);
      const shuffled = [...availableRecipes].sort(() => Math.random() - 0.5);

      for (const recipe of shuffled) {
        if (selected.length >= count) break;
        if (!usedIds.has(recipe._id)) {
          selected.push(recipe);
          usedIds.add(recipe._id);
        }
      }

      if (selected.length < count) {
        const unusedRecipes = allRecipes.filter((r) => !usedIds.has(r._id));

        for (const recipe of unusedRecipes) {
          if (selected.length >= count) break;
          selected.push(recipe);
          usedIds.add(recipe._id);
        }

        if (selected.length < count && allRecipes.length > 0) {
          const allShuffled = [...allRecipes].sort(() => Math.random() - 0.5);
          let index = 0;
          while (selected.length < count) {
            selected.push(allShuffled[index % allShuffled.length]);
            index++;
          }
        }
      }

      return selected;
    },
    [allRecipes]
  );

  const handleGenerate = useCallback(() => {
    if (allRecipes.length === 0) {
      showToast("No recipes available. Add some recipes first!", "error");
      return;
    }

    setGenerating(true);

    if (generateTimeoutRef.current) {
      clearTimeout(generateTimeoutRef.current);
    }

    generateTimeoutRef.current = setTimeout(() => {
      const selectedRecipes = selectRandomRecipes(7);
      const newWeeklyMeals = {};

      DAYS_OF_WEEK.forEach((day, index) => {
        if (selectedRecipes[index]) {
          newWeeklyMeals[day] = selectedRecipes[index];
        }
      });

      setWeeklyMeals(newWeeklyMeals);
      saveWeeklyMeals(newWeeklyMeals);
      setGenerating(false);
      showToast("Weekly meals generated!", "success");
    }, 500);
  }, [allRecipes, selectRandomRecipes, saveWeeklyMeals, showToast]);

  const handleReroll = useCallback(
    (day) => {
      if (allRecipes.length === 0) {
        showToast("No recipes available", "error");
        return;
      }

      setRerollingDay(day);

      if (rerollTimeoutRef.current) {
        clearTimeout(rerollTimeoutRef.current);
      }

      rerollTimeoutRef.current = setTimeout(() => {
        const currentIds = DAYS_OF_WEEK.filter((d) => d !== day && weeklyMeals[d]).map(
          (d) => weeklyMeals[d]._id
        );

        let availableRecipes = allRecipes.filter((r) => !currentIds.includes(r._id));

        if (weeklyMeals[day]) {
          availableRecipes = availableRecipes.filter(
            (r) => r._id !== weeklyMeals[day]._id
          );
        }

        if (availableRecipes.length === 0) {
          availableRecipes = allRecipes.filter(
            (r) => !weeklyMeals[day] || r._id !== weeklyMeals[day]._id
          );
        }

        if (availableRecipes.length === 0) {
          availableRecipes = allRecipes;
        }

        const randomIndex = Math.floor(Math.random() * availableRecipes.length);
        const newRecipe = availableRecipes[randomIndex];

        const newWeeklyMeals = {
          ...weeklyMeals,
          [day]: newRecipe,
        };

        setWeeklyMeals(newWeeklyMeals);
        saveWeeklyMeals(newWeeklyMeals);
        setRerollingDay(null);
        showToast(`${day}'s meal updated!`, "success");
      }, 300);
    },
    [allRecipes, weeklyMeals, saveWeeklyMeals, showToast]
  );

  const handleView = useCallback(
    (recipeId) => {
      navigate(`/recipes/${recipeId}`);
    },
    [navigate]
  );

  const handleAddToShoppingList = async (recipe, day) => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
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
    const mealsWithIngredients = DAYS_OF_WEEK.filter(
      (day) => weeklyMeals[day]?.ingredients?.length > 0
    ).map((day) => weeklyMeals[day]);

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

  const handleClear = () => {
    if (!window.confirm("Clear all weekly meals?")) return;

    setWeeklyMeals({});
    saveWeeklyMeals({});
    showToast("Weekly meals cleared", "success");
  };

  const hasAnyMeals = DAYS_OF_WEEK.some((day) => weeklyMeals[day]);
  const mealCount = DAYS_OF_WEEK.filter((day) => weeklyMeals[day]).length;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
              {hasAnyMeals && ` • ${mealCount}/7 days planned`}
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
                  backgroundColor: theme.buttonNeutral,
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

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: theme.textSecondary,
            }}
          >
            <span>📚</span>
            <span>{allRecipes.length} recipes available</span>
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
            <p style={{ fontSize: "18px" }}>Loading recipes...</p>
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
              Failed to load recipes
            </p>
            <p style={{ margin: "0 0 20px", color: theme.textSecondary }}>{error}</p>
            <button
              onClick={fetchAllRecipes}
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
              const recipe = weeklyMeals[day];

              if (!recipe) {
                return <EmptyDayCard key={day} day={day} theme={theme} />;
              }

              return (
                <MealDayCard
                  key={day}
                  day={day}
                  recipe={recipe}
                  onReroll={() => handleReroll(day)}
                  onView={handleView}
                  onAddToShoppingList={(r) => handleAddToShoppingList(r, day)}
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
              Click the <strong>"Generate Meals"</strong> button above to randomly
              fill your week with delicious recipes!
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default WeeklyMeals;