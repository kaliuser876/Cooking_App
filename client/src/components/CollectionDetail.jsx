// components/CollectionDetail.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useTheme } from "../context/ThemeContext";
import { getAuthHeaders } from "../context/AuthContext";

// Recipe Selection Modal
const AddRecipesModal = ({ collectionId, currentRecipeIds, onClose, onAdd, theme }) => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all user's recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/recipes?limit=1000`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setAllRecipes(data.recipes || []);
        }
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Filter recipes not already in collection
  const availableRecipes = allRecipes.filter(
    (recipe) => !currentRecipeIds.includes(recipe._id)
  );

  // Filter by search
  const filteredRecipes = availableRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle selection
  const toggleSelection = (recipeId) => {
    setSelectedIds((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  // Select all visible
  const selectAll = () => {
    const visibleIds = filteredRecipes.map((r) => r._id);
    setSelectedIds(visibleIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Add selected recipes
  const handleAdd = async () => {
    if (selectedIds.length === 0) return;

    setAdding(true);
    try {
      for (const recipeId of selectedIds) {
        const res = await fetch(
          `${API_BASE_URL}/api/collections/${collectionId}/recipes/${recipeId}`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to add recipe to collection");
        }
      }

      onAdd(selectedIds.length);
      onClose();
    } catch (err) {
      console.error("Failed to add recipes:", err);
      alert("Failed to add some recipes");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.overlay,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: `0 10px 40px ${theme.shadow}`,
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, color: theme.text }}>Add Recipes</h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: theme.textMuted,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginTop: "16px" }}>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
                color: theme.text,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {filteredRecipes.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "12px",
                alignItems: "center",
              }}
            >
              <button
                onClick={selectAll}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "transparent",
                  color: theme.buttonPrimary,
                  border: `1px solid ${theme.buttonPrimary}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "transparent",
                  color: theme.textMuted,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Clear
              </button>
              <span style={{ color: theme.textSecondary, fontSize: "13px", marginLeft: "auto" }}>
                {selectedIds.length} selected
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "12px",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: theme.textSecondary }}>
              Loading recipes...
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: theme.textSecondary }}>
              {availableRecipes.length === 0
                ? "All your recipes are already in this collection!"
                : "No recipes match your search"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredRecipes.map((recipe) => {
                const isSelected = selectedIds.includes(recipe._id);

                return (
                  <div
                    key={recipe._id}
                    onClick={() => toggleSelection(recipe._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "10px",
                      backgroundColor: isSelected ? `${theme.buttonPrimary}15` : "transparent",
                      border: `1px solid ${isSelected ? theme.buttonPrimary : theme.border}`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        border: `2px solid ${isSelected ? theme.buttonPrimary : theme.border}`,
                        backgroundColor: isSelected ? theme.buttonPrimary : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && "✓"}
                    </div>

                    <img
                      src={recipe.image || "https://via.placeholder.com/60x60?text=🍽️"}
                      alt=""
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: theme.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {recipe.name}
                      </div>
                      <div style={{ fontSize: "13px", color: theme.textMuted }}>
                        {recipe.ingredients?.length || 0} ingredients
                      </div>
                    </div>

                    {recipe.favorite && <span style={{ fontSize: "16px" }}>⭐</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${theme.border}`,
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              backgroundColor: theme.buttonNeutral,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedIds.length === 0 || adding}
            style={{
              padding: "12px 24px",
              backgroundColor:
                selectedIds.length === 0 ? theme.borderLight : theme.buttonSuccess,
              color: selectedIds.length === 0 ? theme.textMuted : "white",
              border: "none",
              borderRadius: "8px",
              cursor: selectedIds.length === 0 || adding ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {adding
              ? "Adding..."
              : `Add ${selectedIds.length} Recipe${selectedIds.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Recipe Card in Collection
const CollectionRecipeCard = ({ recipe, onRemove, onView, removing, theme }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: `0 2px 8px ${theme.shadow}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        onClick={() => onView(recipe._id)}
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "66%",
          backgroundColor: theme.borderLight,
          cursor: "pointer",
        }}
      >
        <img
          src={
            imageError || !recipe.image
              ? "https://via.placeholder.com/300x200?text=No+Image"
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

        {recipe.favorite && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: "50%",
              padding: "6px",
              fontSize: "14px",
            }}
          >
            ⭐
          </div>
        )}
      </div>

      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3
          onClick={() => onView(recipe._id)}
          style={{
            margin: "0 0 8px",
            fontSize: "15px",
            fontWeight: 600,
            color: theme.text,
            cursor: "pointer",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
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
              padding: "8px",
              backgroundColor: theme.buttonPrimary,
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            View
          </button>
          <button
            onClick={() => onRemove(recipe._id)}
            disabled={removing}
            style={{
              padding: "8px 12px",
              backgroundColor: theme.buttonDanger,
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: removing ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontSize: "13px",
              opacity: removing ? 0.7 : 1,
            }}
          >
            {removing ? "..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [collection, setCollection] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/collections/${id}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error("Collection not found");

      const data = await res.json();
      setCollection(data.collection);
      setRecipes(data.recipes);
    } catch (err) {
      console.error("Failed to fetch collection:", err);
      setCollection(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleRemoveRecipe = async (recipeId) => {
    setRemovingId(recipeId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/collections/${id}/recipes/${recipeId}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (!res.ok) throw new Error("Failed to remove recipe");

      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
      showToast("Recipe removed from collection", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to remove recipe", "error");
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewRecipe = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
  };

  const handleRecipesAdded = (count) => {
    fetchCollection();
    showToast(`Added ${count} recipe${count !== 1 ? "s" : ""} to collection!`, "success");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: theme.textSecondary }}>
        Loading collection...
      </div>
    );
  }

  if (!collection) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ fontSize: "20px", color: theme.text, marginBottom: "16px" }}>
          Collection not found
        </p>
        <button
          onClick={() => navigate("/collections")}
          style={{
            padding: "12px 24px",
            backgroundColor: theme.buttonPrimary,
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Back to Collections
        </button>
      </div>
    );
  }

  const currentRecipeIds = recipes.map((r) => r._id);

  return (
    <>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: toast.type === "success" ? "#4caf50" : "#f44336",
            color: "white",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          <span style={{ fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}

      {showAddModal && (
        <AddRecipesModal
          collectionId={id}
          currentRecipeIds={currentRecipeIds}
          onClose={() => setShowAddModal(false)}
          onAdd={handleRecipesAdded}
          theme={theme}
        />
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/collections")}
            style={{
              padding: "10px 18px",
              backgroundColor: theme.buttonNeutral,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            ← Back
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span
                style={{
                  fontSize: "40px",
                  width: "60px",
                  height: "60px",
                  backgroundColor: `${collection.color}20`,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {collection.icon}
              </span>
              <div>
                <h1 style={{ margin: 0, color: theme.text, fontSize: "1.8rem" }}>
                  {collection.name}
                </h1>
                <p style={{ margin: "4px 0 0", color: theme.textSecondary }}>
                  {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: "14px 28px",
              backgroundColor: theme.buttonSuccess,
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: `0 4px 12px ${theme.buttonSuccess}40`,
            }}
          >
            <span style={{ fontSize: "20px" }}>＋</span>
            Add Recipes
          </button>
        </div>

        {recipes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              border: `2px dashed ${theme.border}`,
              borderRadius: "16px",
              backgroundColor: theme.toolbarBackground,
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📂</div>
            <p style={{ margin: "0 0 12px", fontSize: "20px", color: theme.text }}>
              This collection is empty
            </p>
            <p style={{ margin: "0 0 24px", color: theme.textSecondary }}>
              Add recipes to organize them in this collection.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: "14px 28px",
                backgroundColor: theme.buttonSuccess,
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "20px" }}>＋</span>
              Add Your First Recipe
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {recipes.map((recipe) => (
              <CollectionRecipeCard
                key={recipe._id}
                recipe={recipe}
                onRemove={handleRemoveRecipe}
                onView={handleViewRecipe}
                removing={removingId === recipe._id}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CollectionDetail;