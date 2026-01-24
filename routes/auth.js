import express from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { getAuthUrl, saveToken } from "../auth/oauth.js";
import { configDotenv } from "dotenv";
configDotenv();

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check real credentials from .env
    const realEmail = process.env.EMAIL;
    const realPassword = process.env.PASSWORD_SECRET;

    if (!realEmail || !realPassword) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    if (email === realEmail && password === realPassword) {
      const token = jwt.sign(
        { email: email, userId: "admin-user" },
        JWT_SECRET,
        { expiresIn: "24h" },
      );

      return res.json({
        success: true,
        token,
        user: { email: email, name: "Admin" },
      });
    }

    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Token validation endpoint
router.post("/validate", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, error: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.json({ valid: false, error: "Invalid or expired token" });
  }
});

router.get("/login", (req, res) => {
  res.redirect(getAuthUrl());
});

router.get("/callback", async (req, res) => {
  try {
    await saveToken(req.query.code);

    // After Google auth, create JWT token
    const token = jwt.sign(
      { email: "google-user@domain.com", userId: "google-oauth" },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.redirect(`/check?token=${token}`);
  } catch (error) {
    res.status(500).send("Authentication failed");
  }
});

export default router;
