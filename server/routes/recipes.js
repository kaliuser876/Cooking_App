import express from "express";
import crypto from "crypto";
import Recipe from "../models/Recipe.js";
import { scrapeRecipe } from "../utils/scraper.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC ROUTE: Get shared recipe (no auth required)
router.get("/shared/:shareToken", async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      shareToken: req.params.shareToken,
      isPublic: true,
    }).select("-userId"); // Don't expose user ID

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found or not shared" });
    }

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch shared recipe" });
  }
});

// All routes below require authentication
router.use(protect);

// GET all recipes with pagination, search, filtering, and collection filter
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      tag = "",
      collection = "",
      favoritesFirst = "true",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build query - filter by userId
    const query = { userId: req.user._id };

    if (search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    if (tag.trim()) {
      query.tags = tag.trim();
    }

    // NEW: Filter by collection
    if (collection.trim()) {
      query.collections = collection.trim();
    }

    // Build sort
    let sort = {};
    if (favoritesFirst === "true") {
      sort.favorite = -1;
    }
    sort.createdAt = -1;

    const [recipes, totalCount] = await Promise.all([
      Recipe.find(query).sort(sort).skip(skip).limit(limitNum),
      Recipe.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      recipes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});

// GET all unique tags for the current user
router.get("/tags", async (req, res) => {
  try {
    const tags = await Recipe.distinct("tags", { userId: req.user._id });
    res.json(tags.filter(Boolean).sort());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
});

// GET single recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("collections", "name color icon");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recipe" });
  }
});

// POST scrape a new recipe from URL
router.post("/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    const recipeData = await scrapeRecipe(url);
    res.json(recipeData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST save a recipe
router.post("/", async (req, res) => {
  try {
    const { name, title, image, ingredients, instructions, url, tags, collections } = req.body;

    // Check if user already has a recipe with this URL
    if (url) {
      const existingRecipe = await Recipe.findOne({
        userId: req.user._id,
        url: url,
      });

      if (existingRecipe) {
        return res.status(409).json({ message: "Recipe already saved" });
      }
    }

    const recipe = new Recipe({
      userId: req.user._id,
      name: name || title,
      image,
      ingredients,
      instructions,
      url,
      tags: tags || [],
      collections: collections || [],
      favorite: false,
    });

    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Recipe already saved" });
    }

    res.status(500).json({ message: "Failed to save recipe", error: err.message });
  }
});

// POST copy a shared recipe to user's account
router.post("/copy/:shareToken", async (req, res) => {
  try {
    const sharedRecipe = await Recipe.findOne({
      shareToken: req.params.shareToken,
      isPublic: true,
    });

    if (!sharedRecipe) {
      return res.status(404).json({ message: "Shared recipe not found" });
    }

    // Check if user already has this recipe (by URL if available)
    if (sharedRecipe.url) {
      const existingByUrl = await Recipe.findOne({
        userId: req.user._id,
        url: sharedRecipe.url,
      });

      if (existingByUrl) {
        return res.status(409).json({
          message: "You already have this recipe saved",
          existingRecipeId: existingByUrl._id,
        });
      }
    }

    // Check if user already has a recipe with the exact same name
    const existingByName = await Recipe.findOne({
      userId: req.user._id,
      name: sharedRecipe.name,
    });

    if (existingByName) {
      return res.status(409).json({
        message: "You already have a recipe with this name",
        existingRecipeId: existingByName._id,
        duplicateName: true,
      });
    }

    // Create a copy for the current user
    const newRecipe = new Recipe({
      userId: req.user._id,
      name: sharedRecipe.name,
      image: sharedRecipe.image,
      ingredients: sharedRecipe.ingredients,
      instructions: sharedRecipe.instructions,
      tags: sharedRecipe.tags,
      url: sharedRecipe.url || null, // Keep original URL for reference
      favorite: false,
      collections: [],
      isPublic: false,
      shareToken: null,
    });

    const saved = await newRecipe.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Recipe already exists in your library" });
    }

    res.status(500).json({ message: "Failed to copy recipe" });
  }
});

// PATCH update a recipe
router.patch("/:id", async (req, res) => {
  try {
    const { name, image, ingredients, instructions, favorite, tags, collections } = req.body;

    const updateFields = {};

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Name is required" });
      }
      updateFields.name = trimmedName;
    }

    if (image !== undefined) {
      updateFields.image = image;
    }

    if (ingredients !== undefined) {
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: "At least one ingredient is required" });
      }
      updateFields.ingredients = ingredients.map((i) => i.trim()).filter(Boolean);
    }

    if (instructions !== undefined) {
      if (!Array.isArray(instructions)) {
        return res.status(400).json({ message: "Instructions must be an array" });
      }
      updateFields.instructions = instructions.map((i) => i.trim()).filter(Boolean);
    }

    if (favorite !== undefined) {
      updateFields.favorite = Boolean(favorite);
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ message: "Tags must be an array" });
      }
      updateFields.tags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    }

    if (collections !== undefined) {
      if (!Array.isArray(collections)) {
        return res.status(400).json({ message: "Collections must be an array" });
      }
      updateFields.collections = collections;
    }

    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { new: true, runValidators: true }
    ).populate("collections", "name color icon");

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(updatedRecipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update recipe" });
  }
});

// PATCH toggle favorite
router.patch("/:id/favorite", async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    recipe.favorite = !recipe.favorite;
    await recipe.save();

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle favorite" });
  }
});

// PATCH toggle sharing / generate share link
router.patch("/:id/share", async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.isPublic) {
      // Turn off sharing
      recipe.isPublic = false;
      recipe.shareToken = null;
    } else {
      // Turn on sharing - generate token
      recipe.isPublic = true;
      recipe.shareToken = crypto.randomBytes(32).toString("hex");
    }

    await recipe.save();

    res.json({
      isPublic: recipe.isPublic,
      shareToken: recipe.shareToken,
      shareUrl: recipe.isPublic
        ? `${process.env.FRONTEND_URL}/shared/${recipe.shareToken}`
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update sharing settings" });
  }
});

// DELETE a recipe by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Recipe.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete recipe" });
  }
});

export default router;