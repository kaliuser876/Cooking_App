// components/CollectionSelector.jsx
import React, { useState, useEffect } from "react";
const API_BASE_URL = import.meta.env.VITE_API_URL;
import { useTheme } from "../context/ThemeContext";
import { getAuthHeaders } from "../context/AuthContext";

const CollectionSelector = ({ recipeId, currentCollections = [], onUpdate }) => {
  const { theme } = useTheme();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [updating, setUpdating] = useState(null);

  const currentCollectionIds = currentCollections.map((c) =>
    typeof c === "string" ? c : c._id
  );

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/collections`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCollections(data);
        }
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleAdd = async (collectionId) => {
    setUpdating(collectionId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/collections/${collectionId}/recipes/${recipeId}`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (!res.ok) throw new Error("Failed to add to collection");

      const updatedRecipe = await res.json();
      if (onUpdate) onUpdate(updatedRecipe);
    } catch (err) {
      console.error(err);
      alert("Failed to add to collection");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (collectionId) => {
    setUpdating(collectionId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/collections/${collectionId}/recipes/${recipeId}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (!res.ok) throw new Error("Failed to remove from collection");

      const updatedRecipe = await res.json();
      if (onUpdate) onUpdate(updatedRecipe);
    } catch (err) {
      console.error(err);
      alert("Failed to remove from collection");
    } finally {
      setUpdating(null);
    }
  };

  const handleToggle = (collectionId) => {
    if (currentCollectionIds.includes(collectionId)) {
      handleRemove(collectionId);
    } else {
      handleAdd(collectionId);
    }
  };

  if (loading) {
    return (
      <span style={{ color: theme.textMuted, fontSize: "14px" }}>
        Loading collections...
      </span>
    );
  }

  if (collections.length === 0) {
    return (
      <span style={{ color: theme.textMuted, fontSize: "14px" }}>
        No collections yet.{" "}
        <a href="/collections" style={{ color: theme.buttonPrimary }}>
          Create one
        </a>
      </span>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          padding: "10px 18px",
          backgroundColor: theme.cardBackground,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        📂 Collections
        {currentCollectionIds.length > 0 && (
          <span
            style={{
              backgroundColor: theme.buttonPrimary,
              color: "white",
              borderRadius: "10px",
              padding: "2px 8px",
              fontSize: "12px",
              marginLeft: "4px",
            }}
          >
            {currentCollectionIds.length}
          </span>
        )}
        <span style={{ marginLeft: "4px" }}>{showDropdown ? "▲" : "▼"}</span>
      </button>

      {showDropdown && (
        <>
          <div
            onClick={() => setShowDropdown(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "8px",
              backgroundColor: theme.cardBackground,
              border: `1px solid ${theme.border}`,
              borderRadius: "12px",
              boxShadow: `0 4px 20px ${theme.shadow}`,
              zIndex: 100,
              minWidth: "250px",
              maxHeight: "300px",
              overflow: "auto",
            }}
          >
            <div style={{ padding: "8px" }}>
              <p
                style={{
                  margin: "0 0 8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: theme.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Add to collection
              </p>

              {collections.map((collection) => {
                const isSelected = currentCollectionIds.includes(collection._id);
                const isUpdating = updating === collection._id;

                return (
                  <button
                    key={collection._id}
                    onClick={() => handleToggle(collection._id)}
                    disabled={isUpdating}
                    style={{
                      width: "100%",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: isSelected
                        ? `${collection.color}15`
                        : "transparent",
                      border: "none",
                      borderRadius: "8px",
                      cursor: isUpdating ? "not-allowed" : "pointer",
                      textAlign: "left",
                      opacity: isUpdating ? 0.5 : 1,
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = theme.toolbarBackground;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      } else {
                        e.currentTarget.style.backgroundColor = `${collection.color}15`;
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                        border: `2px solid ${isSelected ? collection.color : theme.border}`,
                        backgroundColor: isSelected ? collection.color : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "12px",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && "✓"}
                    </div>

                    <span style={{ fontSize: "20px" }}>{collection.icon}</span>

                    <span
                      style={{
                        flex: 1,
                        color: theme.text,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {collection.name}
                    </span>

                    <span style={{ fontSize: "12px", color: theme.textMuted }}>
                      {collection.recipeCount} recipes
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                borderTop: `1px solid ${theme.border}`,
                padding: "8px",
              }}
            >
              <a
                href="/collections"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px",
                  color: theme.buttonPrimary,
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.toolbarBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span>＋</span>
                <span>Create New Collection</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CollectionSelector;