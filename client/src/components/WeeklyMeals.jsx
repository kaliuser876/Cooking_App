/*  WeeklyMeals.jsx
    A complete rewrite that works with the new WeeklyMenu backend model.
*/
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  Fragment,
} from "react";
import { useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;
import { useTheme } from "../context/ThemeContext";
import { getAuthHeaders } from "../context/AuthContext";

/* ---------- constants ---------- */
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* ---------- icons (same tiny SVG helpers you had) ---------- */
const Dice = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
    <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
const Shuffle = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);
const Cart = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

/* ---------- simple Toast (same as before) ---------- */
const Toast = ({ msg, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg =
    type === "error" ? "#f44336" : type === "info" ? "#2196f3" : "#4caf50";
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: bg,
        color: "#fff",
        padding: "14px 22px",
        borderRadius: 12,
        zIndex: 10000,
        boxShadow: "0 4px 18px rgba(0,0,0,.3)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <b>{msg}</b>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          fontSize: 20,
          cursor: "pointer",
          marginLeft: 8,
        }}
      >
        ×
      </button>
    </div>
  );
};

/* ---------- helper to fetch JSON with auth ---------- */
const jsonFetch = async (url, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

/* ************************************************************************** */
/*                                COMPONENT                                   */
/* ************************************************************************** */

const WeeklyMeals = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  /* ---------------- state ---------------- */
  const [menu, setMenu] = useState(null); // entire weeklyMenu doc
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectingDay, setSelectingDay] = useState(null); // day we're manually choosing
  const [allUserRecipes, setAllUserRecipes] = useState([]);
  const [pickerSearch, setPickerSearch] = useState("");

  /* ---------------- helpers ---------------- */
  const show = (msg, type = "success") => setToast({ msg, type });

  const reloadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [m, c] = await Promise.all([
        jsonFetch(`${API}/api/weekly-menu`),
        jsonFetch(`${API}/api/collections`),
      ]);
      setMenu(m);
      setCollections(c);
    } catch (err) {
      console.error(err);
      show(err.message || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- first load ---------------- */
  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  /* ---------------- generate ---------------- */
  const handleGenerate = async () => {
    if (!menu) return;
    try {
      setSaving(true);
      const data = await jsonFetch(`${API}/api/weekly-menu/generate`, {
        method: "POST",
        body: JSON.stringify({
          selectedCollections: menu.selectedCollections.map((c) => c._id),
        }),
      });
      setMenu(data);
      show("Weekly meals generated!");
    } catch (e) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- disable / enable day ---------------- */
  const toggleDay = async (day) => {
    if (!menu) return;
    const current = menu.days[day] || {};
    try {
      const data = await jsonFetch(
        `${API}/api/weekly-menu/day/${day}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            disabled: !current.disabled,
          }),
        }
      );
      setMenu(data);
    } catch (e) {
      show(e.message, "error");
    }
  };

  /* ---------------- open manual picker ---------------- */
  const openPicker = async (day) => {
    setPickerSearch("");
    setSelectingDay(day);
    // lazy load all recipes once
    if (allUserRecipes.length === 0) {
      try {
        const r = await jsonFetch(`${API}/api/recipes?limit=1000`);
        setAllUserRecipes(r.recipes || []);
      } catch (e) {
        show(e.message, "error");
      }
    }
  };

  /* ---------------- save chosen recipe ---------------- */
  const chooseRecipeForDay = async (day, recipe) => {
    try {
      const data = await jsonFetch(
        `${API}/api/weekly-menu/day/${day}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            recipe: recipe._id,
            disabled: false,
            manuallySelected: true,
          }),
        }
      );
      setMenu(data);
      show(`Set ${day} to ${recipe.name}`);
    } catch (e) {
      show(e.message, "error");
    } finally {
      setSelectingDay(null);
    }
  };

  /* ---------------- collection filter change ---------------- */
  const handleCollectionFilter = async (e) => {
    const selectedIds = Array.from(e.target.selectedOptions).map((o) => o.value);
    try {
      setSaving(true);
      const data = await jsonFetch(`${API}/api/weekly-menu`, {
        method: "PUT",
        body: JSON.stringify({
          ...menu,
          selectedCollections: selectedIds,
        }),
      });
      setMenu(data);
    } catch (err) {
      show(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- print ---------------- */
  const handlePrint = () => window.print();

  /* ---------------- utility ---------------- */
  const recipeFor = (day) => menu?.days?.[day]?.recipe;

  const disabled = (day) => menu?.days?.[day]?.disabled;

  const dayCard = (day) => {
    const rec = recipeFor(day);
    if (disabled(day))
      return (
        <div
          key={day}
          style={{
            background: theme.cardBackground,
            borderRadius: 16,
            padding: 24,
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            border: `2px solid ${theme.error || "#f44336"}`,
            color: theme.error || "#f44336",
            position: "relative",
          }}
        >
          <span style={{ fontSize: 48 }}>❌</span>
          <b style={{ marginTop: 8 }}>{day}</b>
          <button
            onClick={() => toggleDay(day)}
            style={{
              marginTop: 16,
              padding: "8px 14px",
              border: "none",
              borderRadius: 8,
              background: theme.buttonSuccess,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Reactivate
          </button>
        </div>
      );

    if (!rec)
      return (
        <div
          key={day}
          style={{
            background: theme.cardBackground,
            border: `2px dashed ${theme.border}`,
            borderRadius: 16,
            padding: 24,
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: theme.textMuted,
          }}
        >
          <span style={{ fontSize: 40, marginBottom: 8 }}>🍽️</span>
          <b>{day}</b>
          <small style={{ marginTop: 4 }}>No meal yet</small>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              onClick={() => handleGenerate()}
              style={{
                border: "none",
                background: theme.buttonPrimary,
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Fill
            </button>
            <button
              onClick={() => openPicker(day)}
              style={{
                border: "none",
                background: theme.buttonNeutral,
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Select
            </button>
            <button
              onClick={() => toggleDay(day)}
              style={{
                border: "none",
                background: theme.error || "#f44336",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Disable
            </button>
          </div>
        </div>
      );

    return (
      <div
        key={day}
        style={{
          background: theme.cardBackground,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: `0 4px 12px ${theme.shadow}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div
          style={{
            background: theme.buttonPrimary,
            color: "#fff",
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 600,
          }}
        >
          <span>{day}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => openPicker(day)}
              title="Choose another recipe"
              style={{
                border: "none",
                background: "rgba(255,255,255,.25)",
                color: "#fff",
                padding: "4px 6px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Pick
            </button>
            <button
              onClick={() => toggleDay(day)}
              title="Disable day"
              style={{
                border: "none",
                background: "rgba(255,255,255,.25)",
                color: "#fff",
                padding: "4px 6px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* image */}
        <div
          style={{
            width: "100%",
            paddingTop: "56%",
            position: "relative",
            background: theme.borderLight,
          }}
          onClick={() => navigate(`/recipes/${rec._id}`)}
        >
          <img
            src={
              rec.image ||
              "https://via.placeholder.com/600x338?text=No+Image+Available"
            }
            alt={rec.name}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* footer */}
        <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 16,
              lineHeight: 1.3,
              cursor: "pointer",
            }}
            onClick={() => navigate(`/recipes/${rec._id}`)}
          >
            {rec.name}
          </h3>
          <small style={{ color: theme.textMuted }}>
            {rec.ingredients?.length || 0} ingredients
          </small>
          <button
            onClick={() => navigate(`/recipes/${rec._id}`)}
            style={{
              marginTop: "auto",
              border: "none",
              background: theme.buttonPrimary,
              color: "#fff",
              padding: "10px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            View
          </button>
        </div>
      </div>
    );
  };

  /* ---------------- component JSX ---------------- */
  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center", color: theme.text }}>
        Loading...
      </div>
    );

  /* ----------- body ----------- */
  return (
    <>
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* header / controls */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <h2 style={{ marginTop: 24, marginBottom: 8, color: theme.text }}>
          📅 Weekly Meals
        </h2>

        <div
          style={{
            background: theme.toolbarBackground,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <button
            onClick={handleGenerate}
            disabled={saving}
            style={{
              padding: "10px 22px",
              background: theme.buttonPrimary,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
            }}
          >
            <Shuffle s={18} />
            {saving ? "Working..." : "Generate"}
          </button>

          {/* print */}
          <button
            onClick={handlePrint}
            style={{
              padding: "10px 22px",
              background: theme.buttonNeutral,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Print
          </button>

          {/* collection filter */}
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, color: theme.textSecondary }}>
              Filter by collection
            </span>
            <select
              multiple
              value={menu.selectedCollections.map((c) => c._id)}
              onChange={handleCollectionFilter}
              style={{
                minWidth: 200,
                padding: 6,
                borderRadius: 6,
                border: `1px solid ${theme.border}`,
                background: theme.cardBackground,
                color: theme.text,
              }}
            >
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* grid of day cards */}
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 20,
          }}
        >
          {DAYS.map(dayCard)}
        </div>
      </div>

      {/* -------------- manual picker modal -------------- */}
      {selectingDay && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setSelectingDay(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              background: theme.cardBackground,
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Select recipe for {selectingDay}</h3>

            <input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search recipes..."
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 12,
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.toolbarBackground,
                color: theme.text,
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                gap: 12,
              }}
            >
              {allUserRecipes
                .filter((r) =>
                  r.name.toLowerCase().includes(pickerSearch.toLowerCase())
                )
                .map((r) => (
                  <div
                    key={r._id}
                    onClick={() => chooseRecipeForDay(selectingDay, r)}
                    style={{
                      cursor: "pointer",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: theme.toolbarBackground,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        paddingTop: "56%",
                        position: "relative",
                        background: theme.borderLight,
                      }}
                    >
                      <img
                        src={
                          r.image ||
                          "https://via.placeholder.com/400x225?text=No+Image"
                        }
                        alt={r.name}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        padding: 8,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {r.name}
                    </span>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setSelectingDay(null)}
              style={{
                marginTop: 18,
                padding: "10px 20px",
                background: theme.buttonNeutral,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* -------------- print styles -------------- */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #root > * { visibility: hidden; }
          #root .print-area, #root .print-area * { visibility: visible; }
          #root .print-area { position: absolute; inset: 0; }
        }
      `}</style>
    </>
  );
};

export default WeeklyMeals;