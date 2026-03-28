import React from "react";
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
import EditRecipe from "./components/EditRecipe";
import Collections from "./components/Collections"; // NEW
import SharedRecipe from "./components/SharedRecipe"; // NEW
import CollectionDetail from "./components/CollectionDetail";

import "./App.css";

// NavLink component with active state
const NavLink = ({ to, children }) => {
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
        padding: "8px 12px",
        borderRadius: "6px",
        backgroundColor: isActive ? `${theme.buttonSuccess}15` : "transparent",
        transition: "all 0.2s",
      }}
    >
      {children}
    </Link>
  );
};

// Header component - mobile-friendly centered version
const Header = () => {
  const { darkMode, theme, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header
      style={{
        backgroundColor: theme.toolbarBackground,
        borderBottom: `1px solid ${theme.border}`,
        padding: "16px 24px",
      }}
    >
      {/* Top row: Title centered, toggle absolute right */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          marginBottom: "12px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: theme.text,
            fontSize: "1.5rem",
            textAlign: "center",
          }}
        >
          🍳 My Recipe App
        </h1>

        {/* Dark mode toggle - positioned absolute right */}
        <button
          onClick={toggleDarkMode}
          style={{
            position: "absolute",
            right: 0,
            padding: "8px 14px",
            backgroundColor: darkMode ? "#ffc107" : "#333",
            color: darkMode ? "#333" : "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
          }}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Navigation - centered - UPDATED with Collections */}
      <nav
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <NavLink to="/">Home</NavLink>
        <NavLink to="/collections">Collections</NavLink>
        <NavLink to="/weekly-meals">Weekly Meals</NavLink>
        <NavLink to="/add">Add Recipe</NavLink>
        <NavLink to="/shopping-list">Shopping List</NavLink>
      </nav>
    </header>
  );
};

// Main app content with protected routes
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
          {/* Public routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* NEW: Public shared recipe route */}
          <Route path="/shared/:shareToken" element={<SharedRecipe />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SavedRecipes />
              </ProtectedRoute>
            }
          />
          {/* NEW: Collections route */}
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
          

          {/* Catch all */}
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