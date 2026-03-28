import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useTheme } from "../context/ThemeContext";

const RECIPES_PER_PAGE = 20;

// Star Icon Component
const StarIcon = ({ filled, onClick, size = 24, theme }) => (
  <svg
    onClick={onClick}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? theme.starActive : "none"}
    stroke={filled ? theme.starActive : theme.starInactive}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      cursor: "pointer",
      transition: "all 0.3s ease",
      filter: filled ? `drop-shadow(0 0 6px ${theme.starActive})` : "none",
    }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Cart Icon Component
const CartIcon = ({ size = 20 }) => (
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

// Tag Component
const Tag = ({ tag, onRemove, theme, removable = true }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      backgroundColor: theme.tagBackground,
      color: theme.tagText,
      borderRadius: "16px",
      fontSize: "12px",
      fontWeight: 500,
    }}
  >
    {tag}
    {removable && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(tag);
        }}
        style={{
          background: "none",
          border: "none",
          color: theme.tagText,
          cursor: "pointer",
          padding: 0,
          fontSize: "14px",
          lineHeight: 1,
          opacity: 0.7,
        }}
      >
        ×
      </button>
    )}
  </span>
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

// Recipe Card Component
const RecipeCard = ({
  recipe,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddToShoppingList,
  theme,
  isAddingToList,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: `0 4px 12px ${theme.shadow}`,
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={() => onView(recipe._id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 8px 24px ${theme.shadow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 12px ${theme.shadow}`;
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "66%",
          backgroundColor: theme.borderLight,
        }}
      >
        <img
          src={
            imageError || !recipe.image
              ? "https://via.placeholder.com/400x300?text=No+Image"
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

        {/* Favorite Star */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "50%",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe._id);
          }}
        >
          <StarIcon filled={recipe.favorite} theme={theme} size={20} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Title */}
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
          }}
        >
          {recipe.name}
        </h3>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            {recipe.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} tag={tag} theme={theme} removable={false} />
            ))}
            {recipe.tags.length > 3 && (
              <span
                style={{
                  fontSize: "12px",
                  color: theme.textMuted,
                  alignSelf: "center",
                }}
              >
                +{recipe.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Add to Shopping List Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToShoppingList(recipe);
            }}
            disabled={isAddingToList}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: theme.buttonSuccess,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isAddingToList ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: isAddingToList ? 0.7 : 1,
            }}
          >
            <CartIcon size={18} />
            {isAddingToList ? "Adding..." : "Add to List"}
          </button>

          {/* Edit and Delete Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(recipe);
              }}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: theme.buttonPrimary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe._id);
              }}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: theme.buttonDanger,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ pagination, onPageChange, theme }) => {
  const { currentPage, totalPages, totalCount, limit, hasNextPage, hasPrevPage } =
    pagination;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        marginTop: "32px",
        padding: "20px",
        backgroundColor: theme.toolbarBackground,
        borderRadius: "12px",
        border: `1px solid ${theme.border}`,
      }}
    >
      <div style={{ fontSize: "14px", color: theme.textSecondary }}>
        Showing {startItem}-{endItem} of {totalCount} recipes
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          style={{
            padding: "10px 16px",
            backgroundColor: hasPrevPage ? theme.buttonPrimary : theme.borderLight,
            color: hasPrevPage ? "white" : theme.textMuted,
            border: "none",
            borderRadius: "8px",
            cursor: hasPrevPage ? "pointer" : "not-allowed",
            fontWeight: 500,
          }}
        >
          ← Prev
        </button>

        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              style={{ padding: "10px 8px", color: theme.textMuted }}
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                padding: "10px 16px",
                backgroundColor:
                  page === currentPage ? theme.buttonPrimary : theme.cardBackground,
                color: page === currentPage ? "white" : theme.text,
                border: `1px solid ${page === currentPage ? theme.buttonPrimary : theme.border}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: page === currentPage ? 600 : 400,
              }}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          style={{
            padding: "10px 16px",
            backgroundColor: hasNextPage ? theme.buttonPrimary : theme.borderLight,
            color: hasNextPage ? "white" : theme.textMuted,
            border: "none",
            borderRadius: "8px",
            cursor: hasNextPage ? "pointer" : "not-allowed",
            fontWeight: 500,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

// Main Component
const SavedRecipes = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allTags, setAllTags] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Track which recipe is being added to shopping list
  const [addingToListId, setAddingToListId] = useState(null);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Fetch tags
  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/tags`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAllTags(data);
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  // Fetch recipes
  const fetchRecipes = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: RECIPES_PER_PAGE.toString(),
          favoritesFirst: "true",
        });

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        if (selectedTag) {
          params.set("tag", selectedTag);
        }

        const res = await fetch(`${API_BASE_URL}/api/recipes?${params.toString()}`, { credentials: "include" });

        if (!res.ok) throw new Error("Failed to fetch recipes");

        const data = await res.json();
        setRecipes(data.recipes);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedTag]
  );

  useEffect(() => {
    fetchRecipes(1);
    fetchTags();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipes(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTag]);

  // Handlers
  const handleView = (id) => {
    navigate(`/recipes/${id}`);
  };

  // Navigate to the edit page instead of opening a modal
  const handleEdit = (recipe) => {
    navigate(`/recipes/${recipe._id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete recipe");

      setRecipes((prev) => prev.filter((r) => r._id !== id));

      if (recipes.length === 1 && pagination?.currentPage > 1) {
        fetchRecipes(pagination.currentPage - 1);
      }

      showToast("Recipe deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete recipe", "error");
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/${id}/favorite`, {
        credentials: "include",
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Failed to toggle favorite");

      const updatedRecipe = await res.json();

      setRecipes((prev) =>
        prev.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
      );

      showToast(
        updatedRecipe.favorite ? "Added to favorites!" : "Removed from favorites",
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to update favorite", "error");
    }
  };

  // Add recipe ingredients to shopping list
  const handleAddToShoppingList = async (recipe) => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      showToast("This recipe has no ingredients", "error");
      return;
    }

    setAddingToListId(recipe._id);

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: recipe.ingredients }),
      });

      if (!res.ok) {
        throw new Error("Failed to add ingredients to shopping list");
      }

      showToast(
        `Added ${recipe.ingredients.length} ingredients from "${recipe.name}" to shopping list!`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to add ingredients to shopping list", "error");
    } finally {
      setAddingToListId(null);
    }
  };

  const handlePageChange = (page) => {
    fetchRecipes(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTag("");
  };

  const favoriteCount = recipes.filter((r) => r.favorite).length;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
              📖 My Recipes
            </h2>
            <p style={{ margin: 0, color: theme.textSecondary }}>
              {pagination?.totalCount || 0} recipes saved
              {favoriteCount > 0 && ` • ${favoriteCount} favorites`}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            background: theme.toolbarBackground,
            border: `1px solid ${theme.border}`,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: "1 1 300px",
              minWidth: "200px",
            }}
          >
            <span style={{ fontSize: "18px" }}>🔍</span>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
                color: theme.text,
                fontSize: "14px",
              }}
            />
          </div>

          {/* Tag Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: 600, fontSize: "14px", color: theme.text }}>
              Tag:
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
                color: theme.text,
                fontSize: "14px",
                minWidth: "150px",
              }}
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedTag) && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: "12px 16px",
                backgroundColor: theme.buttonNeutral,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Content */}
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
        ) : recipes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              border: `1px dashed ${theme.border}`,
              borderRadius: "12px",
              backgroundColor: theme.toolbarBackground,
            }}
          >
            {searchQuery || selectedTag ? (
              <>
                <p style={{ margin: "0 0 16px", fontSize: "20px", color: theme.text }}>
                  No recipes match your filters
                </p>
                <p style={{ margin: "0 0 20px", color: theme.textSecondary }}>
                  Try adjusting your search or tag filter.
                </p>
                <button
                  onClick={handleClearFilters}
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
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 16px", fontSize: "20px", color: theme.text }}>
                  No saved recipes yet
                </p>
                <p style={{ margin: "0 0 20px", color: theme.textSecondary }}>
                  Start by adding a recipe from a URL.
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
                  ＋ Add First Recipe
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Recipe Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToShoppingList={handleAddToShoppingList}
                  theme={theme}
                  isAddingToList={addingToListId === recipe._id}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                theme={theme}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SavedRecipes;