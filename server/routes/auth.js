import express from "express";
import User from "../models/User.js";
import { generateToken, generateRandomToken, protect } from "../middleware/auth.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (!existingUser.isVerified) {
        const verificationToken = generateRandomToken();
        existingUser.verificationToken = verificationToken;
        existingUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        await existingUser.save();

        await sendVerificationEmail(existingUser.email, verificationToken);

        return res.status(200).json({
          message: "Account exists but not verified. A new verification email has been sent.",
          needsVerification: true,
        });
      }

      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const verificationToken = generateRandomToken();

    const user = new User({
      email: email.toLowerCase(),
      password,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    res.status(201).json({
      message: "Account created! Please check your email to verify your account.",
      needsVerification: true,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Failed to create account." });
  }
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required." });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    const jwtToken = generateToken(user._id);

    res.json({
      message: "Email verified successfully!",
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ message: "Failed to verify email." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      const verificationToken = generateRandomToken();
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();

      await sendVerificationEmail(user.email, verificationToken);

      return res.status(403).json({
        message: "Please verify your email first. A new verification email has been sent.",
        needsVerification: true,
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Logged in successfully!",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Failed to log in." });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully." });
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
    },
  });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = generateRandomToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to process request." });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully! You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password." });
  }
});

// POST /api/auth/resend-verification
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ message: "If the account exists, a verification email has been sent." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "This email is already verified." });
    }

    const verificationToken = generateRandomToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);

    res.json({ message: "Verification email sent!" });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ message: "Failed to send verification email." });
  }
});

export default router;