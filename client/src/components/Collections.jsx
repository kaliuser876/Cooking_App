import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useTheme } from "../context/ThemeContext";
import { getAuthHeaders } from "../context/AuthContext";

const ICON_OPTIONS = ["📁", "🍳", "🥗", "🍰", "🍝", "🌮", "🍜", "🥘", "🍕", "🥪", "☕", "🎉", "❤️", "⭐"];
const COLOR_OPTIONS = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0", "#00BCD4", "#FF5722", "#607D8B"];

// Collection Card Component
const CollectionCard = ({ collection, onEdit, onDelete, onView, theme }) => {
  return (
    <div
      onClick={() => onView(collection._id)}
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: "12px",
        padding: "20px",
        cursor: "pointer",
        boxShadow: `0 2px 8px ${theme.shadow}`,
        transition: "transform 0.2s, box-shadow 0.2s",
        borderLeft: `4px solid ${collection.color}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 4px 16px ${theme.shadow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 2px 8px ${theme.shadow}`;
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "32px" }}>{collection.icon}</span>
          <div>
            <h3 style={{ margin: "0 0 4px", color: theme.text, fontSize: "18px" }}>
              {collection.name}
            </h3>
            <p style={{ margin: 0, color: theme.textMuted, fontSize: "14px" }}>
              {collection.recipeCount} recipe{collection.recipeCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(collection);
            }}
            style={{
              padding: "6px 12px",
              backgroundColor: theme.buttonPrimary,
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(collection._id);
            }}
            style={{
              padding: "6px 12px",
              backgroundColor: theme.buttonDanger,
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Create/Edit Collection Modal
const CollectionModal = ({ collection, onSave, onClose, theme }) => {
  const [name, setName] = useState(collection?.name || "");
  const [icon, setIcon] = useState(collection?.icon || "📁");
  const [color, setColor] = useState(collection?.color || "#4CAF50");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Collection name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({ name: name.trim(), icon, color });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
          padding: "24px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: `0 10px 40px ${theme.shadow}`,
        }}
      >
        <h2 style={{ margin: "0 0 20px", color: theme.text }}>
          {collection ? "Edit Collection" : "New Collection"}
        </h2>

        {error && (
          <p style={{ color: theme.buttonDanger, marginBottom: "16px" }}>{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: theme.text, fontWeight: 600 }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Breakfast Recipes"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
                color: theme.text,
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: theme.text, fontWeight: 600 }}>
              Icon
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIcon(opt)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "20px",
                    border: icon === opt ? `2px solid ${theme.buttonPrimary}` : `1px solid ${theme.border}`,
                    borderRadius: "8px",
                    backgroundColor: icon === opt ? `${theme.buttonPrimary}20` : theme.cardBackground,
                    cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: theme.text, fontWeight: 600 }}>
              Color
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setColor(opt)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: opt,
                    border: color === opt ? "3px solid white" : "none",
                    boxShadow: color === opt ? `0 0 0 2px ${opt}` : "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 24px",
                backgroundColor: theme.buttonNeutral,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "12px 24px",
                backgroundColor: theme.buttonSuccess,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Collections Component
const Collections = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/collections`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch collections");

      const data = await res.json();
      setCollections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create collection");
    }

    const newCollection = await res.json();
    setCollections((prev) => [...prev, newCollection]);
  };

  const handleUpdate = async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/collections/${editingCollection._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update collection");
    }

    const updated = await res.json();
    setCollections((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this collection? Recipes will not be deleted.")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/collections/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error("Failed to delete collection");

      setCollections((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete collection");
    }
  };

  const handleView = (id) => {
    navigate(`/collections/${id}`);
  };

  const openCreateModal = () => {
    setEditingCollection(null);
    setShowModal(true);
  };

  const openEditModal = (collection) => {
    setEditingCollection(collection);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCollection(null);
  };

  return (
    <>
      {showModal && (
        <CollectionModal
          collection={editingCollection}
          onSave={editingCollection ? handleUpdate : handleCreate}
          onClose={closeModal}
          theme={theme}
        />
      )}

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: "2rem", color: theme.text }}>
              📂 Collections
            </h2>
            <p style={{ margin: 0, color: theme.textSecondary }}>
              Organize your recipes into collections
            </p>
          </div>

          <button
            onClick={openCreateModal}
            style={{
              padding: "12px 24px",
              backgroundColor: theme.buttonSuccess,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            ＋ New Collection
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: theme.textSecondary }}>
            Loading collections...
          </div>
        ) : collections.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              border: `1px dashed ${theme.border}`,
              borderRadius: "12px",
              backgroundColor: theme.toolbarBackground,
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📂</div>
            <p style={{ margin: "0 0 16px", fontSize: "20px", color: theme.text }}>
              No collections yet
            </p>
            <p style={{ margin: "0 0 20px", color: theme.textSecondary }}>
              Create collections to organize your recipes.
            </p>
            <button
              onClick={openCreateModal}
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
              ＋ Create First Collection
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {collections.map((collection) => (
              <CollectionCard
                key={collection._id}
                collection={collection}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onView={handleView}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Collections;