// components/EditRecipe.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_URL;
import { getAuthHeaders } from "../context/AuthContext";

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (!res.ok) throw new Error("Recipe not found");

        const data = await res.json();
        setName(data.name || "");
        setImage(data.image || "");
        setIngredients(data.ingredients?.length ? data.ingredients : [""]);
        setInstructions(data.instructions?.length ? data.instructions : [""]);
        setTags(data.tags || []);
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleIngredientChange = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index) => {
    if (instructions.length === 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const cleanedIngredients = ingredients.filter((ing) => ing.trim() !== "");
    const cleanedInstructions = instructions.filter((inst) => inst.trim() !== "");

    if (!name.trim()) {
      setError("Recipe name is required");
      setSaving(false);
      return;
    }

    if (cleanedIngredients.length === 0) {
      setError("At least one ingredient is required");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: name.trim(),
          image: image.trim(),
          ingredients: cleanedIngredients,
          instructions: cleanedInstructions,
          tags,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update recipe");
      }

      alert("Recipe updated successfully!");
      navigate(`/recipes/${id}`);
    } catch (err) {
      console.error("Failed to update recipe:", err);
      setError(err.message || "Failed to update recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
    backgroundColor: "inherit",
    color: "inherit",
  };

  const buttonStyle = (bgColor, disabled = false) => ({
    padding: "8px 15px",
    backgroundColor: disabled ? "#ccc" : bgColor,
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: disabled ? "not-allowed" : "pointer",
  });

  if (loading) return <p>Loading recipe...</p>;
  if (error && !name) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate(`/recipes/${id}`)}
          style={buttonStyle("#6c757d")}
        >
          &larr; Cancel
        </button>
      </div>

      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Edit Recipe</h1>

      {error && (
        <p style={{ color: "#dc3545", textAlign: "center", marginBottom: "20px" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Recipe Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter recipe name"
            style={inputStyle}
            required
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Image URL
          </label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={inputStyle}
          />
          {image && (
            <img
              src={image}
              alt="Preview"
              style={{
                marginTop: "10px",
                maxWidth: "200px",
                maxHeight: "150px",
                objectFit: "cover",
                borderRadius: "5px",
              }}
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Tags
          </label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag and press Enter"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              style={buttonStyle("#28a745")}
            >
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "0",
                    fontSize: "16px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
            Ingredients *
          </label>
          {ingredients.map((ing, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
            >
              <input
                type="text"
                value={ing}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
                style={buttonStyle("#dc3545", ingredients.length === 1)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            style={buttonStyle("#28a745")}
          >
            + Add Ingredient
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
            Instructions
          </label>
          {instructions.map((inst, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
            >
              <span style={{ padding: "10px 0", minWidth: "30px" }}>
                {index + 1}.
              </span>
              <textarea
                value={inst}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                rows={2}
                style={{
                  ...inputStyle,
                  flex: 1,
                  resize: "vertical",
                }}
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                disabled={instructions.length === 1}
                style={{
                  ...buttonStyle("#dc3545", instructions.length === 1),
                  alignSelf: "flex-start",
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            style={buttonStyle("#28a745")}
          >
            + Add Step
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: saving ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "18px",
            cursor: saving ? "not-allowed" : "pointer",
            marginTop: "20px",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditRecipe;