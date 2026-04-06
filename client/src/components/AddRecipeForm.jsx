import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AddRecipeForm = () => {
  const [url, setUrl] = useState("");
  const [recipe, setRecipe] = useState(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const resetForm = () => {
    setRecipe(null);
    setName("");
    setImage("");
    setIngredients([]);
    setInstructions([]);
  };

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
      setImage(data?.image || "");
      setIngredients(Array.isArray(data?.ingredients) ? data.ingredients : []);
      setInstructions(Array.isArray(data?.instructions) ? data.instructions : []);
      setUrl(trimmedUrl);
      setShowForm(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error scraping recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleAddManually = () => {
    setError("");
    setUrl("");
    resetForm();
    setShowForm(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedImage = image.trim();
    const trimmedUrl = url.trim();
    const cleanedIngredients = ingredients.map((item) => item.trim()).filter(Boolean);
    const cleanedInstructions = instructions.map((step) => step.trim()).filter(Boolean);

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
          image: trimmedImage,
          ingredients: cleanedIngredients,
          instructions: cleanedInstructions,
          url: trimmedUrl,
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

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Paste recipe URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: "1 1 400px", padding: "10px" }}
          disabled={loading || saving}
        />

        <button
          onClick={handleScrape}
          disabled={loading || saving || !url.trim()}
          style={{
            padding: "10px 16px",
            cursor: loading || saving || !url.trim() ? "not-allowed" : "pointer",
            opacity: loading || saving || !url.trim() ? 0.7 : 1,
          }}
        >
          {loading ? "Scraping..." : "Scrape"}
        </button>

        <button
          onClick={handleAddManually}
          disabled={loading || saving}
          style={{
            padding: "10px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading || saving ? "not-allowed" : "pointer",
            opacity: loading || saving ? 0.7 : 1,
          }}
        >
          Add Manually
        </button>
      </div>

      {showForm && (
        <div style={{ borderTop: "1px solid #ccc", paddingTop: "20px" }}>
          <h1 style={{ textAlign: "center" }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recipe Name"
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

          <div style={{ marginBottom: "20px" }}>
            <h3>Image URL</h3>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Paste image URL (optional)"
              style={{ width: "100%", padding: "10px" }}
              disabled={saving}
            />
          </div>

          {image && (
            <img
              src={image}
              alt="recipe preview"
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
              onError={(e) => {
                e.target.style.display = "none";
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
                )
              }
              rows={10}
              style={{ width: "100%", padding: "10px" }}
              placeholder="Enter one ingredient per line"
              disabled={saving}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3>Instructions</h3>
            <textarea
              value={instructions.join("\n")}
              onChange={(e) =>
                setInstructions(e.target.value.split("\n"))
              }
              rows={10}
              style={{ width: "100%", padding: "10px" }}
              placeholder="Enter one instruction step per line"
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