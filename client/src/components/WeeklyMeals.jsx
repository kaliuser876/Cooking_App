import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useTheme } from "../context/ThemeContext";

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

// Dice Icon for Reroll
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

// Shuffle Icon for Generate
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

// Cart Icon
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

// Toast Notification Component
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

// Empty Day Card Component
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
    <div
      style={{
        fontSize: "48px",
        marginBottom: "16px",
        opacity: 0.5,
      }}
    >
      🍽️
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

// Meal Day Card Component
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
      {/* Day Header */}
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

      {/* Image */}
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

      {/* Content */}
      <div
        style={{
          padding: "16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Recipe Name */}
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

        {/* Meta */}
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

        {/* Buttons */}
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

// Main Component
const WeeklyMeals = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [allRecipes, setAllRecipes] = useState([]);
  const [weeklyMeals, setWeeklyMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rerollingDay, setRerollingDay] = useState(null);
  const [addingToListDay, setAddingToListDay] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Load weekly meals from localStorage
  const loadWeeklyMeals = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error("Failed to load weekly meals:", err);
    }
    return {};
  };

  // Save weekly meals to localStorage
  const saveWeeklyMeals = (meals) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    } catch (err) {
      console.error("Failed to save weekly meals:", err);
    }
  };

  // Fetch all recipes
  const fetchAllRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/recipes?limit=1000`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const data = await res.json();
      setAllRecipes(data.recipes || []);
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
      showToast("Failed to load recipes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchAllRecipes();
    setWeeklyMeals(loadWeeklyMeals());
  }, []);

  // Select random recipes without duplicates (if possible)
  const selectRandomRecipes = useCallback(
    (count, excludeIds = []) => {
      if (allRecipes.length === 0) return [];

      const availableRecipes = allRecipes.filter(
        (r) => !excludeIds.includes(r._id)
      );

      const selected = [];
      const usedIds = new Set(excludeIds);

      // First pass: try to select unique recipes
      const shuffled = [...availableRecipes].sort(() => Math.random() - 0.5);

      for (const recipe of shuffled) {
        if (selected.length >= count) break;
        if (!usedIds.has(recipe._id)) {
          selected.push(recipe);
          usedIds.add(recipe._id);
        }
      }

      // Second pass: if we need more and have used all unique recipes,
      // allow duplicates but ensure all recipes are used at least once first
      if (selected.length < count) {
        // Determine which recipes haven't been used yet
        const unusedRecipes = allRecipes.filter((r) => !usedIds.has(r._id));

        // First add any unused recipes
        for (const recipe of unusedRecipes) {
          if (selected.length >= count) break;
          selected.push(recipe);
          usedIds.add(recipe._id);
        }

        // If still not enough, allow duplicates from all recipes
        if (selected.length < count) {
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

  // Generate all 7 meals
  const handleGenerate = useCallback(() => {
    if (allRecipes.length === 0) {
      showToast("No recipes available. Add some recipes first!", "error");
      return;
    }

    setGenerating(true);

    // Small delay for visual feedback
    setTimeout(() => {
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
  }, [allRecipes, selectRandomRecipes]);

  // Reroll a single day
  const handleReroll = useCallback(
    (day) => {
      if (allRecipes.length === 0) {
        showToast("No recipes available", "error");
        return;
      }

      setRerollingDay(day);

      setTimeout(() => {
        // Get IDs of currently selected recipes (excluding the day being rerolled)
        const currentIds = DAYS_OF_WEEK.filter((d) => d !== day && weeklyMeals[d])
          .map((d) => weeklyMeals[d]._id);

        // Try to select a recipe not currently used this week
        let availableRecipes = allRecipes.filter(
          (r) => !currentIds.includes(r._id)
        );

        // If current day has a recipe, also exclude it to ensure a different recipe
        if (weeklyMeals[day]) {
          availableRecipes = availableRecipes.filter(
            (r) => r._id !== weeklyMeals[day]._id
          );
        }

        // If no other recipes available, use any recipe except current
        if (availableRecipes.length === 0) {
          availableRecipes = allRecipes.filter(
            (r) => !weeklyMeals[day] || r._id !== weeklyMeals[day]._id
          );
        }

        // If still no recipes (only 1 recipe exists), just shuffle
        if (availableRecipes.length === 0) {
          availableRecipes = allRecipes;
        }

        // Select random recipe
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
    [allRecipes, weeklyMeals]
  );

  // View recipe detail
  const handleView = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
  };

  // Add single recipe to shopping list
  const handleAddToShoppingList = async (recipe, day) => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      showToast("This recipe has no ingredients", "error");
      return;
    }

    setAddingToListDay(day);

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: recipe.ingredients }),
      });

      if (!res.ok) throw new Error("Failed to add to shopping list");

      showToast(`Added ${recipe.name} ingredients to shopping list!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to add to shopping list", "error");
    } finally {
      setAddingToListDay(null);
    }
  };

  // Add all weekly meals to shopping list
  const handleAddAllToShoppingList = async () => {
    const mealsWithIngredients = DAYS_OF_WEEK.filter(
      (day) => weeklyMeals[day]?.ingredients?.length > 0
    ).map((day) => weeklyMeals[day]);

    if (mealsWithIngredients.length === 0) {
      showToast("No meals with ingredients to add", "error");
      return;
    }

    // Combine all ingredients
    const allIngredients = mealsWithIngredients.flatMap(
      (recipe) => recipe.ingredients
    );

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: allIngredients }),
      });

      if (!res.ok) throw new Error("Failed to add to shopping list");

      showToast(
        `Added ingredients from ${mealsWithIngredients.length} meals to shopping list!`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to add to shopping list", "error");
    }
  };

  // Clear all weekly meals
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
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
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

        {/* Action Buttons */}
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
            {generating ? "Generating..." : hasAnyMeals ? "Regenerate All" : "Generate Meals"}
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

        {/* Loading State */}
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
        ) : allRecipes.length === 0 ? (
          /* No Recipes State */
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
          /* Weekly Meals Grid */
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

        {/* Tips Section */}
        {!loading && allRecipes.length > 0 && !hasAnyMeals && (
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
            <h3 style={{ margin: "0 0 12px", color: theme.text }}>
              👆 Get Started
            </h3>
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