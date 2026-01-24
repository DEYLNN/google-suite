import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import userMultiRoutes from "./routes/user-multi.js";

dotenv.config();
const app = express();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";

app.use(express.json());

// Static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/static", express.static(path.join(__dirname, "client")));
app.use(express.static(path.join(__dirname, "client")));

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// API routes
app.use("/auth", authRoutes);
app.use("/users", verifyToken, userRoutes);
app.use("/users", verifyToken, userMultiRoutes);

// Serve frontend
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "login.html"));
});

app.get("/check", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "check.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "check.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.get("/delete", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "delete.html"));
});

app.get("/delete-users", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "delete.html"));
});
app.get("/static/delete.js", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "delete.js"));
});

app.listen(3000, () =>
  console.log("\uD83D\uDE80 Server running http://localhost:3000"),
);
