import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import VerifyEmail from "./components/VerifyEmail";
import ResetPassword from "./components/ResetPassword";
import Footer from "./components/Footer";
import AddRecipeForm from "./components/AddRecipeForm";
import SavedRecipes from "./components/SavedRecipes";
import RecipeDetail from "./components/RecipeDetail";
import ShoppingList from "./components/ShoppingList";
import WeeklyMeals from "./components/WeeklyMeals";
import RandomRecipe from "./components/RandomRecipe";
import EditRecipe from "./components/EditRecipe";
import Collections from "./components/Collections";
import SharedRecipe from "./components/SharedRecipe";
import CollectionDetail from "./components/CollectionDetail";

import "./App.css";

const NavLink = ({ to, children, mobile }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        color: isActive ? theme.buttonSuccess : theme.buttonPrimary,
        textDecoration: "none",
        fontWeight: isActive ? 600 : 500,
        padding: mobile ? "10px 12px" : "8px 12px",
        borderRadius: "8px",
        backgroundColor: isActive ? `${theme.buttonSuccess}15` : "transparent",
        transition: "all 0.2s",
        fontSize: mobile ? "14px" : "15px",
        textAlign: "center",
        minWidth: mobile ? "120px" : "auto",
      }}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  const { darkMode, theme, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user) return null;

  return (
    <header
      style={{
        backgroundColor: theme.toolbarBackground,
        borderBottom: `1px solid ${theme.border}`,
        padding: isMobile ? "14px 12px" : "16px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: isMobile ? "12px" : "16px",
          marginBottom: "12px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: theme.text,
            fontSize: isMobile ? "1.25rem" : "1.5rem",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          🍳 My Recipe App
        </h1>

        <button
          onClick={toggleDarkMode}
          style={{
            padding: isMobile ? "10px 14px" : "8px 14px",
            backgroundColor: darkMode ? "#ffc107" : "#333",
            color: darkMode ? "#333" : "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "14px",
            minWidth: isMobile ? "140px" : "auto",
          }}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <nav
        style={{
          display: "flex",
          gap: isMobile ? "8px" : "10px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <NavLink to="/" mobile={isMobile}>Home</NavLink>
        <NavLink to="/collections" mobile={isMobile}>Collections</NavLink>
        <NavLink to="/weekly-meals" mobile={isMobile}>Weekly Meals</NavLink>
        <NavLink to="/random-recipe" mobile={isMobile}>Random Recipe</NavLink>
        <NavLink to="/add" mobile={isMobile}>Add Recipe</NavLink>
        <NavLink to="/shopping-list" mobile={isMobile}>Shopping List</NavLink>
      </nav>
    </header>
  );
};

const AppContent = () => {
  const { theme } = useTheme();
  const { user, loading } = useAuth();

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
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        backgroundColor: theme.background,
        color: theme.text,
        transition: "background-color 0.3s, color 0.3s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <main style={{ padding: user ? "24px 16px" : "0", flex: 1 }}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/shared/:shareToken" element={<SharedRecipe />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SavedRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections/:id"
            element={
              <ProtectedRoute>
                <CollectionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly-meals"
            element={
              <ProtectedRoute>
                <WeeklyMeals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/random-recipe"
            element={
              <ProtectedRoute>
                <RandomRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <AddRecipeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/:id"
            element={
              <ProtectedRoute>
                <RecipeDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/:id/edit"
            element={
              <ProtectedRoute>
                <EditRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingList />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to={user ? "/" : "/login"} replace />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;