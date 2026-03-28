import express from "express";
import Collection from "../models/Collection.js";
import Recipe from "../models/Recipe.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET all collections for current user
router.get("/", async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.user._id }).sort({
      order: 1,
      name: 1,
    });

    // Get recipe count for each collection
    const collectionsWithCount = await Promise.all(
      collections.map(async (collection) => {
        const recipeCount = await Recipe.countDocuments({
          userId: req.user._id,
          collections: collection._id,
        });
        return {
          ...collection.toObject(),
          recipeCount,
        };
      })
    );

    res.json(collectionsWithCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch collections" });
  }
});

// GET single collection with its recipes
router.get("/:id", async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const recipes = await Recipe.find({
      userId: req.user._id,
      collections: collection._id,
    }).sort({ createdAt: -1 });

    res.json({
      collection,
      recipes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch collection" });
  }
});

// POST create new collection
router.post("/", async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Collection name is required" });
    }

    // Get max order for this user
    const maxOrderCollection = await Collection.findOne({
      userId: req.user._id,
    }).sort({ order: -1 });

    const order = (maxOrderCollection?.order || 0) + 1;

    const collection = new Collection({
      userId: req.user._id,
      name: name.trim(),
      color: color || "#4CAF50",
      icon: icon || "📁",
      order,
    });

    const saved = await collection.save();
    res.status(201).json({ ...saved.toObject(), recipeCount: 0 });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Collection with this name already exists" });
    }

    res.status(500).json({ message: "Failed to create collection" });
  }
});

// PATCH update collection
router.patch("/:id", async (req, res) => {
  try {
    const { name, color, icon, order } = req.body;

    const updateFields = {};

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Collection name is required" });
      }
      updateFields.name = trimmedName;
    }

    if (color !== undefined) {
      updateFields.color = color;
    }

    if (icon !== undefined) {
      updateFields.icon = icon;
    }

    if (order !== undefined) {
      updateFields.order = Number(order) || 0;
    }

    const updated = await Collection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { returnDocument: "after", runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Get recipe count
    const recipeCount = await Recipe.countDocuments({
      userId: req.user._id,
      collections: updated._id,
    });

    res.json({ ...updated.toObject(), recipeCount });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Collection with this name already exists" });
    }

    res.status(500).json({ message: "Failed to update collection" });
  }
});

// DELETE collection
router.delete("/:id", async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Remove this collection from all recipes
    await Recipe.updateMany(
      { userId: req.user._id, collections: req.params.id },
      { $pull: { collections: req.params.id } }
    );

    res.json({ message: "Collection deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete collection" });
  }
});

// POST add recipe to collection
router.post("/:id/recipes/:recipeId", async (req, res) => {
  try {
    // Verify collection belongs to user
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Add collection to recipe
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.recipeId, userId: req.user._id },
      { $addToSet: { collections: req.params.id } },
      { returnDocument: "after" }
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add recipe to collection" });
  }
});

// DELETE remove recipe from collection
router.delete("/:id/recipes/:recipeId", async (req, res) => {
  try {
    // Verify collection belongs to user
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Remove collection from recipe
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.recipeId, userId: req.user._id },
      { $pull: { collections: req.params.id } },
      { returnDocument: "after" }
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove recipe from collection" });
  }
});

export default router;