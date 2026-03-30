import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { getAuthHeaders } from "../context/AuthContext";

const AddRecipeForm = () => {
  const [url, setUrl] = useState("");
  const [recipe, setRecipe] = useState(null);

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleScrape = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to scrape recipe");
      }

      setRecipe(data);
      setName(data?.name || data?.title || "");
      setIngredients(Array.isArray(data?.ingredients) ? data.ingredients : []);
      setInstructions(Array.isArray(data?.instructions) ? data.instructions : []);
      setUrl(trimmedUrl);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error scraping recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const cleanedIngredients = ingredients.map((item) => item.trim()).filter(Boolean);
    const cleanedInstructions = instructions.map((step) => step.trim()).filter(Boolean);

    if (!recipe) {
      setError("Please scrape a recipe first.");
      return;
    }

    if (!trimmedName || cleanedIngredients.length === 0) {
      setError("Recipe must have a name and at least one ingredient.");
      return;
    }

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: trimmedName,
          image: recipe?.image || "",
          ingredients: cleanedIngredients,
          instructions: cleanedInstructions,
          url: url.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save recipe");
      }

      navigate(`/recipes/${data._id}`);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error saving recipe");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2>Add Recipe</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Paste recipe URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "70%", padding: "10px" }}
          disabled={loading || saving}
        />
        <button
          onClick={handleScrape}
          disabled={loading || saving || !url.trim()}
          style={{
            padding: "10px",
            marginLeft: "10px",
            cursor: loading || saving || !url.trim() ? "not-allowed" : "pointer",
            opacity: loading || saving || !url.trim() ? 0.7 : 1,
          }}
        >
          {loading ? "Scraping..." : "Scrape"}
        </button>
      </div>

      {recipe && (
        <div style={{ borderTop: "1px solid #ccc", paddingTop: "20px" }}>
          <h1 style={{ textAlign: "center" }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                fontSize: "24px",
                textAlign: "center",
                width: "100%",
                border: "none",
                outline: "none",
              }}
              disabled={saving}
            />
          </h1>

          {recipe.image && (
            <img
              src={recipe.image}
              alt="recipe"
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            />
          )}

          <div style={{ marginBottom: "20px" }}>
            <h3>Ingredients</h3>
            <textarea
              value={ingredients.join("\n")}
              onChange={(e) =>
                setIngredients(
                  e.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                )
              }
              rows={10}
              style={{ width: "100%", padding: "10px" }}
              disabled={saving}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3>Instructions</h3>
            <textarea
              value={instructions.join("\n")}
              onChange={(e) =>
                setInstructions(
                  e.target.value.split("\n")
                )
              }
              rows={10}
              style={{ width: "100%", padding: "10px" }}
              disabled={saving}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              padding: "12px 20px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: saving || loading ? "not-allowed" : "pointer",
              opacity: saving || loading ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Recipe"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddRecipeForm;