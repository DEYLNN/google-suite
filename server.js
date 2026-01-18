import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import userMultiRoutes from "./routes/user-multi.js";

dotenv.config();
const app = express();
app.use(express.json());

// Static frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/static", express.static(path.join(__dirname, "client")));

// API routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/users", userMultiRoutes);

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});
app.get("/delete-users", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "delete.html"));
});
app.get("/static/delete.js", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "delete.js"));
});

app.listen(3000, () =>
  console.log("\uD83D\uDE80 Server running http://localhost:3000")
);
