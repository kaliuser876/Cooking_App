// components/RecipeDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_URL;
import { useTheme } from "../context/ThemeContext";
import { getAuthHeaders } from "../context/AuthContext";
import CollectionSelector from "./CollectionSelector";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});
  const [sharing, setSharing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (!res.ok) throw new Error("Recipe not found");

        const data = await res.json();
        setRecipe(data);

        if (data.ingredients) {
          const initialCheckedState = {};
          data.ingredients.forEach((_, index) => {
            initialCheckedState[index] = false;
          });
          setCheckedItems(initialCheckedState);
        }
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleCheckboxChange = (index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddToShoppingList = async () => {
    if (!recipe?.ingredients?.length) return;

    const unchecked = recipe.ingredients.filter((_, index) => !checkedItems[index]);

    if (unchecked.length === 0) {
      showToast("No ingredients selected to add.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ items: unchecked }),
      });

      if (!res.ok) throw new Error("Failed to add items");

      showToast(`Added ${unchecked.length} ingredients to shopping list!`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to add to shopping list", "error");
    }
  };

  const handleEdit = () => {
    navigate(`/recipes/${id}/edit`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recipe?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error("Failed to delete recipe");

      showToast("Recipe deleted successfully!", "success");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error("Failed to delete recipe:", err);
      showToast("Failed to delete recipe", "error");
    }
  };

  const handleToggleShare = async () => {
    setSharing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/${id}/share`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error("Failed to update sharing");

      const data = await res.json();

      setRecipe((prev) => ({
        ...prev,
        isPublic: data.isPublic,
        shareToken: data.shareToken,
      }));

      if (data.shareUrl) {
        navigator.clipboard.writeText(data.shareUrl);
        showToast("Share link copied to clipboard!", "success");
      } else {
        showToast("Sharing disabled", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update sharing settings", "error");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!recipe?.shareToken) return;
    const link = `${window.location.origin}/shared/${recipe.shareToken}`;
    navigator.clipboard.writeText(link);
    showToast("Link copied to clipboard!", "success");
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/${id}/favorite`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error("Failed to toggle favorite");

      const updated = await res.json();
      setRecipe((prev) => ({ ...prev, favorite: updated.favorite }));
      showToast(
        updated.favorite ? "Added to favorites!" : "Removed from favorites",
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to update favorite", "error");
    }
  };

  const handleCollectionUpdate = (updatedRecipe) => {
    setRecipe(updatedRecipe);
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          color: theme.textSecondary,
        }}
      >
        Loading recipe...
      </div>
    );
  }

  if (!recipe) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          color: theme.textSecondary,
        }}
      >
        <p style={{ fontSize: "20px", marginBottom: "16px" }}>Recipe not found</p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 24px",
            backgroundColor: theme.buttonPrimary,
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor:
              toast.type === "success"
                ? "#4caf50"
                : toast.type === "error"
                ? "#f44336"
                : "#2196f3",
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
          <span style={{ fontSize: "20px" }}>
            {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
          </span>
          <span style={{ fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 18px",
              backgroundColor: theme.buttonNeutral,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Back
          </button>

          <button
            onClick={handleToggleFavorite}
            style={{
              padding: "10px 18px",
              backgroundColor: recipe.favorite ? "#ffc107" : theme.cardBackground,
              color: recipe.favorite ? "#333" : theme.text,
              border: `1px solid ${recipe.favorite ? "#ffc107" : theme.border}`,
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {recipe.favorite ? "⭐ Favorited" : "☆ Favorite"}
          </button>

          <CollectionSelector
            recipeId={id}
            currentCollections={recipe.collections || []}
            onUpdate={handleCollectionUpdate}
          />

          <button
            onClick={handleEdit}
            style={{
              padding: "10px 18px",
              backgroundColor: theme.buttonPrimary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ✏️ Edit
          </button>

          <button
            onClick={handleToggleShare}
            disabled={sharing}
            style={{
              padding: "10px 18px",
              backgroundColor: recipe.isPublic ? "#ff9800" : "#9c27b0",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: sharing ? "not-allowed" : "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: sharing ? 0.7 : 1,
            }}
          >
            {sharing ? "..." : recipe.isPublic ? "🔗 Shared" : "🔗 Share"}
          </button>

          <button
            onClick={handleDelete}
            style={{
              padding: "10px 18px",
              backgroundColor: theme.buttonDanger,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🗑️ Delete
          </button>
        </div>

        {recipe.isPublic && recipe.shareToken && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: theme.toolbarBackground,
              borderRadius: "12px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "20px" }}>🔗</span>
              <span style={{ fontWeight: 600, color: theme.text }}>
                This recipe is shared
              </span>
            </div>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "14px",
                color: theme.textSecondary,
              }}
            >
              Anyone with this link can view the recipe:
            </p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                value={`${window.location.origin}/shared/${recipe.shareToken}`}
                readOnly
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.inputBorder}`,
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  fontSize: "13px",
                }}
              />
              <button
                onClick={handleCopyShareLink}
                style={{
                  padding: "10px 16px",
                  backgroundColor: theme.buttonPrimary,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>
        )}

        <h1 style={{ textAlign: "center", marginBottom: "16px", color: theme.text }}>
          {recipe.name}
        </h1>

        {recipe.collections && recipe.collections.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            {recipe.collections.map((col) => (
              <span
                key={col._id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  backgroundColor: `${col.color}20`,
                  color: col.color,
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/collections/${col._id}`)}
              >
                {col.icon} {col.name}
              </span>
            ))}
          </div>
        )}

        {recipe.tags && recipe.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "4px 12px",
                  backgroundColor: theme.tagBackground,
                  color: theme.tagText,
                  borderRadius: "16px",
                  fontSize: "13px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <img
          src={recipe.image || "https://via.placeholder.com/600x400?text=No+Image"}
          alt={recipe.name}
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "cover",
            borderRadius: "12px",
            marginBottom: "24px",
          }}
        />

        {recipe.url && (
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme.buttonPrimary,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              📎 View Original Recipe
            </a>
          </div>
        )}

        <section
          style={{
            marginBottom: "32px",
            padding: "20px",
            backgroundColor: theme.cardBackground,
            borderRadius: "12px",
            border: `1px solid ${theme.border}`,
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              color: theme.text,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🥕 Ingredients
          </h2>

          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            <>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {recipe.ingredients.map((ing, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: "10px",
                      padding: "8px 0",
                      borderBottom:
                        index < recipe.ingredients.length - 1
                          ? `1px solid ${theme.borderLight}`
                          : "none",
                    }}
                  >
                    <label
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checkedItems[index] || false}
                        onChange={() => handleCheckboxChange(index)}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          accentColor: theme.buttonSuccess,
                        }}
                      />
                      <span
                        style={{
                          textDecoration: checkedItems[index] ? "line-through" : "none",
                          opacity: checkedItems[index] ? 0.5 : 1,
                          color: "inherit",
                          fontSize: "16px",
                        }}
                      >
                        {ing}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleAddToShoppingList}
                style={{
                  marginTop: "20px",
                  padding: "12px 20px",
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
                🛒 Add Unchecked to Shopping List
              </button>

              <p
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  color: theme.textMuted,
                }}
              >
                Check off items you already have, then add the rest to your shopping
                list.
              </p>
            </>
          ) : (
            <p style={{ color: theme.textMuted }}>No ingredients found.</p>
          )}
        </section>

        <section
          style={{
            padding: "20px",
            backgroundColor: theme.cardBackground,
            borderRadius: "12px",
            border: `1px solid ${theme.border}`,
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              color: theme.text,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📝 Instructions
          </h2>

          {recipe.instructions && recipe.instructions.length > 0 ? (
            <ol
              style={{
                margin: 0,
                paddingLeft: "24px",
                lineHeight: 1.8,
              }}
            >
              {recipe.instructions.map((step, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "16px",
                    paddingLeft: "8px",
                    color: theme.text,
                  }}
                >
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <p style={{ color: theme.textMuted }}>No instructions found.</p>
          )}
        </section>
      </div>
    </>
  );
};

export default RecipeDetail;