import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, forgotPassword, resendVerification } = useAuth();
  const { theme } = useTheme();

  const [mode, setMode] = useState("login"); // login, register, forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Check for messages from URL
  const verified = searchParams.get("verified");
  const resetSuccess = searchParams.get("reset");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/");
      } else if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        const result = await register(email, password);
        setSuccess(result.message || "Check your email to verify your account!");
        setMode("login");
      } else if (mode === "forgot") {
        await forgotPassword(email);
        setSuccess("If an account exists with this email, a reset link has been sent.");
      }
    } catch (err) {
      setError(err.message);

      // If needs verification, offer to resend
      if (err.message?.includes("verify")) {
        setMode("verify-prompt");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setLoading(true);
    try {
      await resendVerification(email);
      setSuccess("Verification email sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "8px",
    border: `1px solid ${theme.inputBorder}`,
    backgroundColor: theme.inputBackground,
    color: theme.text,
    fontSize: "16px",
    boxSizing: "border-box",
    marginBottom: "16px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    backgroundColor: theme.buttonPrimary,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
  };

  const linkStyle = {
    color: theme.buttonPrimary,
    cursor: "pointer",
    textDecoration: "underline",
    background: "none",
    border: "none",
    fontSize: "14px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: `0 4px 20px ${theme.shadow}`,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "8px",
            color: theme.text,
            fontSize: "28px",
          }}
        >
          🍳 Recipe App
        </h1>

        <h2
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: theme.textSecondary,
            fontSize: "18px",
            fontWeight: 400,
          }}
        >
          {mode === "login" && "Welcome back!"}
          {mode === "register" && "Create an account"}
          {mode === "forgot" && "Reset your password"}
          {mode === "verify-prompt" && "Verify your email"}
        </h2>

        {/* Success Messages */}
        {(success || verified || resetSuccess) && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {success || (verified && "Email verified! You can now log in.") || (resetSuccess && "Password reset! You can now log in.")}
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Verify Prompt */}
        {mode === "verify-prompt" ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: theme.textSecondary, marginBottom: "20px" }}>
              Your email hasn't been verified yet. Would you like us to send another verification email?
            </p>
            <button
              onClick={handleResendVerification}
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </button>
            <button
              onClick={() => setMode("login")}
              style={{ ...linkStyle, marginTop: "16px", display: "block", width: "100%" }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
              autoComplete="email"
            />

            {mode !== "forgot" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            )}

            {mode === "register" && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                required
                autoComplete="new-password"
              />
            )}

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Log In"
                : mode === "register"
                ? "Create Account"
                : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Mode Switches */}
        {mode !== "verify-prompt" && (
          <div
            style={{
              marginTop: "24px",
              textAlign: "center",
              color: theme.textSecondary,
              fontSize: "14px",
            }}
          >
            {mode === "login" && (
              <>
                <button onClick={() => setMode("forgot")} style={linkStyle}>
                  Forgot password?
                </button>
                <p style={{ marginTop: "12px" }}>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      setError("");
                      setSuccess("");
                    }}
                    style={linkStyle}
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}

            {mode === "register" && (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  style={linkStyle}
                >
                  Log in
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                style={linkStyle}
              >
                Back to Login
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;