import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useTheme } from "../context/ThemeContext";
import { useAuth, getAuthHeaders } from "../context/AuthContext";

const SharedRecipe = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/recipes/shared/${shareToken}`);

        if (!res.ok) {
          throw new Error("Recipe not found or no longer shared");
        }

        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [shareToken]);

  const handleCopyToMyRecipes = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setCopying(true);
    setAlreadyExists(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/copy/${shareToken}`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await res.json();

      if (res.status === 409) {
        setAlreadyExists(data);
        setCopying(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to copy recipe");
      }

      setCopied(true);

      setTimeout(() => {
        navigate(`/recipes/${data._id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setCopying(false);
    }
  };

  const handleViewExisting = () => {
    if (alreadyExists?.existingRecipeId) {
      navigate(`/recipes/${alreadyExists.existingRecipeId}`);
    }
  };

  const handleSaveAnyway = async () => {
    setCopying(true);
    setAlreadyExists(null);

    try {
      alert("Please rename the existing recipe first, then try again.");
      setCopying(false);
    } catch (err) {
      console.error(err);
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: theme.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.text,
        }}
      >
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: theme.background,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: theme.text,
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>😕</div>
        <h2>Recipe Not Found</h2>
        <p style={{ color: theme.textSecondary }}>{error}</p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <div
        style={{
          backgroundColor: theme.buttonPrimary,
          color: "white",
          padding: "12px 20px",
          textAlign: "center",
        }}
      >
        <span style={{ marginRight: "8px" }}>🔗</span>
        Shared Recipe
        {!user && (
          <span style={{ marginLeft: "16px", opacity: 0.9 }}>
            <a href="/login" style={{ color: "white", textDecoration: "underline" }}>
              Log in
            </a>{" "}
            to save this recipe
          </span>
        )}
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "16px" }}>{recipe.name}</h1>

        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.name}
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: "12px",
              marginBottom: "24px",
            }}
          />
        )}

        {alreadyExists && (
          <div
            style={{
              marginBottom: "24px",
              padding: "20px",
              backgroundColor: "#fff3e0",
              border: "1px solid #ffb74d",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", color: "#e65100" }}>
              {alreadyExists.duplicateName
                ? "Recipe Name Already Exists"
                : "Recipe Already Saved"}
            </h3>
            <p style={{ margin: "0 0 16px", color: "#f57c00" }}>
              {alreadyExists.message}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleViewExisting}
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
                View Existing Recipe
              </button>
              <button
                onClick={() => setAlreadyExists(null)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: theme.buttonNeutral,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!alreadyExists && (
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            {copied ? (
              <div
                style={{
                  padding: "16px 32px",
                  backgroundColor: theme.buttonSuccess,
                  color: "white",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 600,
                }}
              >
                ✅ Saved to your recipes!
              </div>
            ) : (
              <button
                onClick={handleCopyToMyRecipes}
                disabled={copying}
                style={{
                  padding: "16px 32px",
                  backgroundColor: theme.buttonSuccess,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: copying ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: copying ? 0.7 : 1,
                }}
              >
                {copying ? (
                  "Saving..."
                ) : (
                  <>
                    <span>📥</span>
                    {user ? "Save to My Recipes" : "Log in to Save"}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {recipe.tags && recipe.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "24px",
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
                  fontSize: "14px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              borderBottom: `2px solid ${theme.border}`,
              paddingBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🥕 Ingredients
          </h2>
          <ul style={{ lineHeight: 1.8 }}>
            {recipe.ingredients.map((ing, index) => (
              <li key={index}>{ing}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2
            style={{
              borderBottom: `2px solid ${theme.border}`,
              paddingBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📝 Instructions
          </h2>
          <ol style={{ lineHeight: 1.8 }}>
            {recipe.instructions.map((step, index) => (
              <li key={index} style={{ marginBottom: "12px" }}>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {user && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 24px",
                backgroundColor: theme.buttonNeutral,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              ← Back to My Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedRecipe;