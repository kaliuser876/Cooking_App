// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import recipeRoutes from "./routes/recipes.js";
import shoppingListRoutes from "./routes/shoppingList.js";
import authRoutes from "./routes/auth.js";
import collectionRoutes from "./routes/collections.js"; // NEW

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URI || "mongodb://db:27017/recipes";

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://www.snackthat.store",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/collections", collectionRoutes); // NEW

app.get("/", (req, res) => {
  res.send("API is running");
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));