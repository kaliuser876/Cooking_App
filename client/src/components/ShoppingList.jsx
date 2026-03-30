import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { API_BASE_URL } from "../config";
import { useTheme } from "../context/ThemeContext";
import { getAuthHeaders } from "../context/AuthContext";

const CATEGORY_OPTIONS = [
  "All",
  "Produce",
  "Dairy",
  "Meat",
  "Pantry",
  "Spices",
  "Other",
];

const CATEGORY_ORDER = ["Produce", "Dairy", "Meat", "Pantry", "Spices", "Other"];

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
    </div>
  );
};

// Celebration Overlay Component
const CelebrationOverlay = ({ onDismiss }) => {
  const [confetti, setConfetti] = useState([]);

  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#ffe66d",
    "#95e1d3",
    "#f38181",
    "#aa96da",
    "#fcbad3",
    "#a8d8ea",
    "#ff9a9e",
    "#fecfef",
    "#feada6",
    "#f5576c",
    "#4facfe",
    "#43e97b",
  ];

  const shapes = ["square", "circle", "triangle"];

  useEffect(() => {
    const pieces = [];
    for (let i = 0; i < 150; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 12,
        shape,
        rotation: Math.random() * 360,
      });
    }
    setConfetti(pieces);
  }, []);

  const getShapeStyle = (piece) => {
    const base = {
      backgroundColor: piece.color,
      width: `${piece.size}px`,
      height: `${piece.size}px`,
    };

    switch (piece.shape) {
      case "circle":
        return { ...base, borderRadius: "50%" };
      case "triangle":
        return {
          width: 0,
          height: 0,
          backgroundColor: "transparent",
          borderLeft: `${piece.size / 2}px solid transparent`,
          borderRight: `${piece.size / 2}px solid transparent`,
          borderBottom: `${piece.size}px solid ${piece.color}`,
        };
      default:
        return { ...base, borderRadius: "2px" };
    }
  };

  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      {confetti.map((piece) => (
        <div
          key={piece.id}
          style={{
            position: "absolute",
            left: `${piece.left}%`,
            top: "-20px",
            animation: `confettiFall ${piece.duration}s ease-in-out ${piece.delay}s infinite`,
            transform: `rotate(${piece.rotation}deg)`,
            ...getShapeStyle(piece),
          }}
        />
      ))}

      <div
        style={{
          textAlign: "center",
          zIndex: 10001,
          animation: "celebrationBounce 0.6s ease-out",
        }}
      >
        <div
          style={{
            fontSize: "80px",
            marginBottom: "20px",
            animation: "emojiPop 0.5s ease-out",
          }}
        >
          🎉🛒🎊
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 8vw, 4rem)",
            fontWeight: 800,
            color: "#ffffff",
            textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            margin: "0 0 16px 0",
            animation: "textGlow 1.5s ease-in-out infinite alternate",
          }}
        >
          Whooohooo!
        </h1>

        <h2
          style={{
            fontSize: "clamp(1.2rem, 4vw, 2rem)",
            fontWeight: 600,
            color: "#4caf50",
            margin: "0 0 30px 0",
            animation: "slideUp 0.6s ease-out 0.2s both",
          }}
        >
          You're done shopping! 🥳
        </h2>

        <p
          style={{
            fontSize: "clamp(1rem, 3vw, 1.3rem)",
            color: "#aaaaaa",
            margin: "0 0 40px 0",
            animation: "slideUp 0.6s ease-out 0.4s both",
          }}
        >
          Time to put those groceries away! 📦
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "30px",
            animation: "starSpin 2s linear infinite",
          }}
        >
          <span style={{ fontSize: "30px", animation: "twinkle 1s ease-in-out infinite" }}>
            ⭐
          </span>
          <span style={{ fontSize: "40px", animation: "twinkle 1s ease-in-out 0.3s infinite" }}>
            ✨
          </span>
          <span style={{ fontSize: "30px", animation: "twinkle 1s ease-in-out 0.6s infinite" }}>
            ⭐
          </span>
        </div>

        <button
          onClick={onDismiss}
          style={{
            padding: "16px 40px",
            fontSize: "18px",
            fontWeight: 600,
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(76, 175, 80, 0.4)",
            animation: "buttonPulse 2s ease-in-out infinite",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          🎯 Awesome!
        </button>

        <p
          style={{
            marginTop: "20px",
            fontSize: "14px",
            color: "#666666",
            animation: "fadeIn 1s ease-out 1s both",
          }}
        >
          Click anywhere to close
        </p>
      </div>

      <style>
        {`
          @keyframes confettiFall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes celebrationBounce {
            0% { transform: scale(0.3) translateY(50px); opacity: 0; }
            50% { transform: scale(1.1) translateY(-10px); }
            70% { transform: scale(0.95) translateY(5px); }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes emojiPop {
            0% { transform: scale(0); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }
          @keyframes textGlow {
            0% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
            100% { text-shadow: 0 0 40px rgba(255, 255, 255, 0.6), 0 0 60px rgba(76, 175, 80, 0.4); }
          }
          @keyframes slideUp {
            0% { transform: translateY(30px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes twinkle {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
          }
          @keyframes starSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes buttonPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

const SortableItem = ({
  item,
  isEditing,
  editForm,
  setEditForm,
  savingEdit,
  onToggleChecked,
  onEditClick,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  theme,
  categoryOptions,
  formatItemText,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : item.checked ? 0.75 : 1,
    backgroundColor: item.checked ? theme.cardBackgroundChecked : theme.cardBackground,
    border: `1px solid ${item.checked ? theme.borderLight : theme.border}`,
    borderRadius: "12px",
    padding: "14px",
    boxShadow: item.checked ? "none" : `0 2px 8px ${theme.shadow}`,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {isEditing ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ingredient name"
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
                color: theme.text,
              }}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={editForm.quantity}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, quantity: e.target.value }))
              }
              placeholder="Quantity"
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
                color: theme.text,
              }}
            />
            <input
              type="text"
              value={editForm.unit}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, unit: e.target.value }))
              }
              placeholder="Unit"
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
                color: theme.text,
              }}
            />
            <select
              value={editForm.category}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, category: e.target.value }))
              }
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: `1px solid ${theme.inputBorder}`,
                backgroundColor: theme.inputBackground,
                color: theme.text,
              }}
            >
              {categoryOptions
                .filter((c) => c !== "All")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={onCancelEdit}
              disabled={savingEdit}
              style={{
                padding: "8px 14px",
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
              onClick={() => onSaveEdit(item._id)}
              disabled={savingEdit}
              style={{
                padding: "8px 14px",
                backgroundColor: theme.buttonSuccess,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {savingEdit ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
              minWidth: "220px",
            }}
          >
            <div
              {...attributes}
              {...listeners}
              style={{
                cursor: "grab",
                padding: "8px",
                color: theme.textMuted,
                display: "flex",
                alignItems: "center",
                touchAction: "none",
              }}
              title="Drag to reorder"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="2" />
                <circle cx="15" cy="6" r="2" />
                <circle cx="9" cy="12" r="2" />
                <circle cx="15" cy="12" r="2" />
                <circle cx="9" cy="18" r="2" />
                <circle cx="15" cy="18" r="2" />
              </svg>
            </div>

            <input
              type="checkbox"
              checked={item.checked || false}
              onChange={() => onToggleChecked(item)}
              style={{
                width: "22px",
                height: "22px",
                cursor: "pointer",
                accentColor: theme.categoryAccent,
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: item.checked ? theme.textMuted : theme.text,
                  textDecoration: item.checked ? "line-through" : "none",
                  marginBottom: "4px",
                }}
              >
                {formatItemText(item)}
              </div>
              <div style={{ fontSize: "13px", color: theme.textMuted }}>
                {item.category || "Other"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => onEditClick(item)}
              style={{
                padding: "8px 12px",
                backgroundColor: theme.buttonPrimary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              style={{
                padding: "8px 12px",
                backgroundColor: theme.buttonDanger,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ShoppingList = () => {
  const { theme } = useTheme();

  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hideChecked, setHideChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    quantity: 1,
    unit: "",
    category: "Other",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    quantity: 1,
    unit: "",
    category: "Other",
  });
  const [addingItem, setAddingItem] = useState(false);

  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);

  const [toast, setToast] = useState(null);

  const printRef = useRef();

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const totalCount = items.length;
    const checkedCount = items.filter((item) => item.checked).length;

    if (totalCount > 0 && checkedCount === totalCount && !hasShownCelebration) {
      setShowCelebration(true);
      setHasShownCelebration(true);
    }

    if (checkedCount < totalCount) {
      setHasShownCelebration(false);
    }
  }, [items, hasShownCelebration]);

  const handleDismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/shopping-list`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch shopping list");
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch shopping list:", err);
      setItems([]);
      setError(err?.message || "Failed to load shopping list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleToggleChecked = async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ checked: !item.checked }),
      });

      const updatedItem = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(updatedItem?.message || "Failed to update item");
      }

      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? updatedItem : i))
      );
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to update item", "error");
    }
  };

  const handleUncheckAll = async () => {
    const hasChecked = items.some((item) => item.checked);
    if (!hasChecked) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list/uncheck-all`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
        },
      });

      const updatedItems = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(updatedItems?.message || "Failed to uncheck all");
      }

      setItems(Array.isArray(updatedItems) ? updatedItems : []);
      showToast("All items unchecked", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to uncheck all items", "error");
    }
  };

  const handleDeleteChecked = async () => {
    const checkedItems = items.filter((item) => item.checked);
    if (checkedItems.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${checkedItems.length} checked item${checkedItems.length !== 1 ? "s" : ""}?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list/checked`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete checked items");
      }

      setItems((prev) => prev.filter((item) => !item.checked));

      if (editingId && checkedItems.some((item) => item._id === editingId)) {
        handleCancelEdit();
      }

      showToast("Checked items deleted", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to delete checked items", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this item?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete item");
      }

      setItems((prev) => prev.filter((item) => item._id !== id));
      if (editingId === id) handleCancelEdit();

      showToast("Item deleted", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to delete item", "error");
    }
  };

  const handleClear = async () => {
    const confirmed = window.confirm("Clear the entire shopping list?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/shopping-list`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to clear list");
      }

      setItems([]);
      handleCancelEdit();
      showToast("Shopping list cleared", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to clear shopping list", "error");
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name || "",
      quantity: item.quantity ?? 1,
      unit: item.unit || "",
      category: item.category || "Other",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", quantity: 1, unit: "", category: "Other" });
  };

  const handleSaveEdit = async (id) => {
    const trimmedName = editForm.name.trim();
    if (!trimmedName) {
      showToast("Item name is required.", "error");
      return;
    }

    const payload = {
      name: trimmedName,
      quantity: Number(editForm.quantity) || 1,
      unit: editForm.unit.trim(),
      category: editForm.category || "Other",
    };

    try {
      setSavingEdit(true);

      const res = await fetch(`${API_BASE_URL}/api/shopping-list/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const updatedItem = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(updatedItem?.message || "Failed to update item");
      }

      setItems((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item))
      );

      handleCancelEdit();
      showToast("Item updated", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to update item", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    const trimmedName = addForm.name.trim();
    if (!trimmedName) {
      showToast("Item name is required.", "error");
      return;
    }

    const payload = {
      name: trimmedName,
      quantity: Number(addForm.quantity) || 1,
      unit: addForm.unit.trim(),
      category: addForm.category || "Other",
    };

    try {
      setAddingItem(true);

      const res = await fetch(`${API_BASE_URL}/api/shopping-list/item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const newItem = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(newItem?.message || "Failed to add item");
      }

      setItems((prev) => [...prev, newItem]);
      setAddForm({ name: "", quantity: 1, unit: "", category: "Other" });
      setShowAddForm(false);
      showToast("Item added", "success");
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Failed to add item", "error");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item._id === active.id);
    const newIndex = items.findIndex((item) => item._id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      const orderedIds = newItems.map((item) => item._id);
      const res = await fetch(`${API_BASE_URL}/api/shopping-list/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ orderedIds }),
      });

      if (!res.ok) {
        throw new Error("Failed to save order");
      }
    } catch (err) {
      console.error("Failed to save order:", err);
      showToast("Failed to save item order", "error");
      fetchItems();
    }
  };

  const formatQuantity = (qty) => {
    if (qty == null) return "";
    return Number.isInteger(qty) ? String(qty) : String(Number(qty.toFixed(2)));
  };

  const formatItemText = (item) => {
    return [formatQuantity(item.quantity), item.unit, item.name]
      .filter(Boolean)
      .join(" ");
  };

  const generateListText = () => {
    const grouped = items.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    let text = "🛒 SHOPPING LIST\n";
    text += "═".repeat(30) + "\n\n";

    CATEGORY_ORDER.forEach((category) => {
      if (grouped[category] && grouped[category].length > 0) {
        text += `📦 ${category.toUpperCase()}\n`;
        text += "─".repeat(20) + "\n";
        grouped[category].forEach((item) => {
          const check = item.checked ? "✓" : "○";
          const qty = formatQuantity(item.quantity);
          const line = [qty, item.unit, item.name].filter(Boolean).join(" ");
          text += `${check} ${line}\n`;
        });
        text += "\n";
      }
    });

    return text;
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = generateListText();
      await navigator.clipboard.writeText(text);
      showToast("Shopping list copied to clipboard!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const generatePrintHTML = () => {
    const grouped = items.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shopping List</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }
          h1 {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          h2 {
            color: #4caf50;
            margin-top: 20px;
            border-left: 4px solid #4caf50;
            padding-left: 10px;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid #333;
            border-radius: 3px;
            display: inline-block;
          }
          .checked {
            text-decoration: line-through;
            color: #888;
          }
          .checked .checkbox {
            background: #4caf50;
            border-color: #4caf50;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>🛒 Shopping List</h1>
    `;

    CATEGORY_ORDER.forEach((category) => {
      if (grouped[category] && grouped[category].length > 0) {
        html += `<h2>${category}</h2><ul>`;
        grouped[category].forEach((item) => {
          const qty = formatQuantity(item.quantity);
          const line = [qty, item.unit, item.name].filter(Boolean).join(" ");
          const checkedClass = item.checked ? "checked" : "";
          html += `<li class="${checkedClass}"><span class="checkbox"></span>${line}</li>`;
        });
        html += `</ul>`;
      }
    });

    html += `</body></html>`;
    return html;
  };

  const handlePrint = () => {
    const printContent = generatePrintHTML();
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showToast("Unable to open print window", "error");
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (hideChecked) {
      result = result.filter((item) => !item.checked);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        (item.name || "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [items, selectedCategory, hideChecked, searchQuery]);

  const groupedEntries = useMemo(() => {
    const grouped = filteredItems.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});

    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return (a.order || 0) - (b.order || 0);
      });
    });

    return Object.entries(grouped).sort(
      ([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
    );
  }, [filteredItems]);

  const checkedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const progressPercent =
    totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showCelebration && (
        <CelebrationOverlay onDismiss={handleDismissCelebration} />
      )}

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: "2rem", color: theme.text }}>
            🛒 Shopping List
          </h2>
          <p style={{ margin: 0, color: theme.textSecondary }}>
            Check off items as you shop
          </p>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: theme.textSecondary,
            }}
          >
            <p style={{ fontSize: "18px" }}>Loading shopping list...</p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              border: `1px dashed ${theme.border}`,
              borderRadius: "12px",
              backgroundColor: theme.toolbarBackground,
              marginBottom: "24px",
            }}
          >
            <p style={{ margin: "0 0 8px", fontSize: "20px", color: theme.text }}>
              Failed to load shopping list
            </p>
            <p style={{ margin: "0 0 20px", color: theme.textSecondary }}>{error}</p>
            <button
              onClick={fetchItems}
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
              Retry
            </button>
          </div>
        ) : (
          <>
            {totalCount > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 600, color: theme.text }}>
                    Shopping Progress
                  </span>
                  <span style={{ fontSize: "14px", color: theme.textSecondary }}>
                    {checkedCount} of {totalCount} items ({progressPercent}%)
                  </span>
                </div>
                <div
                  style={{
                    height: "12px",
                    backgroundColor: theme.progressBackground,
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      backgroundColor:
                        progressPercent === 100
                          ? "#4caf50"
                          : progressPercent >= 50
                          ? "#8bc34a"
                          : "#ffc107",
                      borderRadius: "6px",
                      transition: "width 0.3s ease, background-color 0.3s ease",
                    }}
                  />
                </div>
                {progressPercent === 100 && (
                  <p
                    style={{
                      textAlign: "center",
                      marginTop: "12px",
                      fontSize: "16px",
                      color: "#4caf50",
                      fontWeight: 600,
                    }}
                  >
                    🎉 All done! Great job!
                  </p>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                background: theme.toolbarBackground,
                border: `1px solid ${theme.border}`,
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                  flex: 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      fontSize: "14px",
                      width: "150px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontWeight: 600, fontSize: "14px", color: theme.text }}>
                    Category:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      fontSize: "14px",
                    }}
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: theme.text,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hideChecked}
                    onChange={(e) => setHideChecked(e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      accentColor: theme.buttonPrimary,
                    }}
                  />
                  Hide checked
                </label>
              </div>

              <div style={{ fontSize: "14px", color: theme.textSecondary }}>
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} shown
              </div>
            </div>

            {totalCount > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: theme.buttonSuccess,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  {showAddForm ? "✕ Cancel" : "＋ Add Item"}
                </button>

                <button
                  onClick={handleUncheckAll}
                  disabled={checkedCount === 0}
                  style={{
                    padding: "10px 16px",
                    backgroundColor:
                      checkedCount === 0 ? theme.borderLight : theme.buttonWarning,
                    color: checkedCount === 0 ? theme.textMuted : "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: checkedCount === 0 ? "not-allowed" : "pointer",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  ↩ Uncheck All ({checkedCount})
                </button>

                <button
                  onClick={handleDeleteChecked}
                  disabled={checkedCount === 0}
                  style={{
                    padding: "10px 16px",
                    backgroundColor:
                      checkedCount === 0 ? theme.borderLight : theme.buttonDanger,
                    color: checkedCount === 0 ? theme.textMuted : "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: checkedCount === 0 ? "not-allowed" : "pointer",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  🗑 Delete Checked ({checkedCount})
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: theme.buttonPrimary,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  📋 Copy List
                </button>

                <button
                  onClick={handlePrint}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: theme.buttonNeutral,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  🖨 Print
                </button>
              </div>
            )}

            {showAddForm && (
              <form
                onSubmit={handleAddItem}
                style={{
                  background: theme.toolbarBackground,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", color: theme.text }}>
                  Add New Item
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Item name *"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      fontSize: "14px",
                    }}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Quantity"
                    value={addForm.quantity}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, quantity: e.target.value }))
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      fontSize: "14px",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g., cups, lbs)"
                    value={addForm.unit}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      fontSize: "14px",
                    }}
                  />
                  <select
                    value={addForm.category}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      fontSize: "14px",
                    }}
                  >
                    {CATEGORY_OPTIONS.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={addingItem}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: theme.buttonSuccess,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: addingItem ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {addingItem ? "Adding..." : "Add Item"}
                </button>
              </form>
            )}

            {!loading && totalCount === 0 && !showAddForm && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  border: `1px dashed ${theme.border}`,
                  borderRadius: "12px",
                  backgroundColor: theme.toolbarBackground,
                }}
              >
                <p style={{ margin: "0 0 16px", fontSize: "20px", color: theme.text }}>
                  Your shopping list is empty
                </p>
                <p style={{ margin: "0 0 20px", color: theme.textSecondary }}>
                  Add ingredients from a recipe or add items manually.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
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
                  ＋ Add First Item
                </button>
              </div>
            )}

            {totalCount > 0 && filteredItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  border: `1px dashed ${theme.border}`,
                  borderRadius: "12px",
                  backgroundColor: theme.toolbarBackground,
                }}
              >
                <p style={{ margin: "0 0 8px", fontSize: "18px", color: theme.text }}>
                  No items match your filters
                </p>
                <p style={{ margin: 0, color: theme.textSecondary }}>
                  Try changing the category, search, or showing checked items.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div ref={printRef}>
                  {groupedEntries.map(([category, categoryItems]) => {
                    const categoryChecked = categoryItems.filter((i) => i.checked).length;
                    const categoryIds = categoryItems.map((item) => item._id);

                    return (
                      <section key={category} style={{ marginBottom: "28px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1.2rem",
                              color: theme.text,
                              borderLeft: `5px solid ${theme.categoryAccent}`,
                              paddingLeft: "10px",
                            }}
                          >
                            {category}
                          </h3>
                          <span style={{ fontSize: "13px", color: theme.textMuted }}>
                            {categoryChecked}/{categoryItems.length} checked
                          </span>
                        </div>

                        <SortableContext
                          items={categoryIds}
                          strategy={verticalListSortingStrategy}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                            }}
                          >
                            {categoryItems.map((item) => (
                              <SortableItem
                                key={item._id}
                                item={item}
                                isEditing={editingId === item._id}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                savingEdit={savingEdit}
                                onToggleChecked={handleToggleChecked}
                                onEditClick={handleEditClick}
                                onCancelEdit={handleCancelEdit}
                                onSaveEdit={handleSaveEdit}
                                onDelete={handleDelete}
                                theme={theme}
                                categoryOptions={CATEGORY_OPTIONS}
                                formatItemText={formatItemText}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </section>
                    );
                  })}
                </div>

                {totalCount > 0 && (
                  <div
                    style={{
                      marginTop: "30px",
                      paddingTop: "20px",
                      borderTop: `1px solid ${theme.border}`,
                    }}
                  >
                    <button
                      onClick={handleClear}
                      style={{
                        width: "100%",
                        padding: "14px",
                        backgroundColor: theme.buttonDark,
                        color: theme.buttonDark === "#e0e0e0" ? "#111" : "#fff",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "15px",
                        fontWeight: 600,
                      }}
                    >
                      Clear Entire List
                    </button>
                  </div>
                )}
              </DndContext>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ShoppingList;