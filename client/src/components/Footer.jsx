import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  if (!user) return null;

  return (
    <footer
      style={{
        backgroundColor: theme.toolbarBackground,
        borderTop: `1px solid ${theme.border}`,
        padding: "20px",
        textAlign: "center",
        marginTop: "auto",
      }}
    >
      <p style={{ color: theme.textSecondary, marginBottom: "12px", fontSize: "14px" }}>
        Logged in as <strong style={{ color: theme.text }}>{user.email}</strong>
      </p>
      <button
        onClick={logout}
        style={{
          padding: "10px 24px",
          backgroundColor: theme.buttonDanger,
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 500,
          fontSize: "14px",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.target.style.opacity = "1")}
      >
        🚪 Log Out
      </button>
    </footer>
  );
};

export default Footer;