import express from "express";
import ShoppingItem from "../models/ShoppingItem.js";
import ShoppingCategory from "../models/ShoppingCategory.js";
import IngredientCategoryPreference from "../models/IngredientCategoryPreference.js";
import { mergeIngredients } from "../utils/ingredientParser.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

const DEFAULT_CATEGORIES = ["Produce", "Dairy", "Meat", "Pantry", "Spices", "Other"];

const normalizeIngredientName = (name = "") =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeIncomingIngredient = (item) => {
  if (typeof item === "string") {
    return {
      name: item.trim(),
      quantity: 1,
      unit: "",
      category: "",
    };
  }

  if (!item || typeof item !== "object") {
    return {
      name: "",
      quantity: 1,
      unit: "",
      category: "",
    };
  }

  return {
    name: String(item.name || "").trim(),
    quantity:
      item.quantity !== undefined && !Number.isNaN(Number(item.quantity))
        ? Number(item.quantity)
        : 1,
    unit: String(item.unit || "").trim(),
    category: String(item.category || "").trim(),
  };
};

const ensureCategoryExists = async (userId, categoryName) => {
  const trimmed = String(categoryName || "").trim();
  if (!trimmed) return null;

  const existing = await ShoppingCategory.findOne({ userId, name: trimmed });
  if (existing) return existing;

  const maxOrderCategory = await ShoppingCategory.findOne({ userId }).sort({ order: -1 });
  const order = (maxOrderCategory?.order ?? -1) + 1;

  return ShoppingCategory.create({
    userId,
    name: trimmed,
    order,
  });
};

const ensureDefaultCategories = async (userId) => {
  const existing = await ShoppingCategory.find({ userId }).select("name");
  const existingNames = new Set(existing.map((c) => c.name));

  const missing = DEFAULT_CATEGORIES.filter((name) => !existingNames.has(name));
  if (missing.length === 0) return;

  const maxOrderCategory = await ShoppingCategory.findOne({ userId }).sort({ order: -1 });
  let nextOrder = (maxOrderCategory?.order ?? -1) + 1;

  await ShoppingCategory.insertMany(
    missing.map((name) => ({
      userId,
      name,
      order: nextOrder++,
    }))
  );
};

const getRememberedCategory = async (userId, name) => {
  const normalizedName = normalizeIngredientName(name);
  if (!normalizedName) return null;

  const pref = await IngredientCategoryPreference.findOne({
    userId,
    normalizedName,
  });

  return pref?.category || null;
};

const saveCategoryPreference = async (userId, name, category) => {
  const normalizedName = normalizeIngredientName(name);
  const trimmedCategory = String(category || "").trim();

  if (!normalizedName || !trimmedCategory) return;

  await ensureCategoryExists(userId, trimmedCategory);

  await IngredientCategoryPreference.findOneAndUpdate(
    { userId, normalizedName },
    {
      userId,
      normalizedName,
      originalName: String(name || "").trim(),
      category: trimmedCategory,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// GET all shopping items
router.get("/", async (req, res) => {
  try {
    const items = await ShoppingItem.find({ userId: req.user._id }).sort({
      order: 1,
      createdAt: 1,
      name: 1,
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// GET shopping categories
router.get("/categories", async (req, res) => {
  try {
    await ensureDefaultCategories(req.user._id);

    const categories = await ShoppingCategory.find({ userId: req.user._id }).sort({
      order: 1,
      name: 1,
    });

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// POST create category
router.post("/categories", async (req, res) => {
  try {
    let { name } = req.body;
    name = String(name || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await ShoppingCategory.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const maxOrderCategory = await ShoppingCategory.findOne({ userId: req.user._id }).sort({
      order: -1,
    });

    const category = await ShoppingCategory.create({
      userId: req.user._id,
      name,
      order: (maxOrderCategory?.order ?? -1) + 1,
    });

    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create category" });
  }
});

// PATCH reorder categories
router.patch("/categories/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: req.user._id },
        update: { order: index },
      },
    }));

    if (bulkOps.length > 0) {
      await ShoppingCategory.bulkWrite(bulkOps);
    }

    const categories = await ShoppingCategory.find({ userId: req.user._id }).sort({
      order: 1,
      name: 1,
    });

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reorder categories" });
  }
});

// DELETE category
router.delete("/categories/:id", async (req, res) => {
  try {
    const category = await ShoppingCategory.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (DEFAULT_CATEGORIES.includes(category.name)) {
      return res.status(400).json({ message: "Default categories cannot be deleted" });
    }

    await ShoppingItem.updateMany(
      { userId: req.user._id, category: category.name },
      { category: "Other" }
    );

    await IngredientCategoryPreference.updateMany(
      { userId: req.user._id, category: category.name },
      { category: "Other" }
    );

    await ShoppingCategory.deleteOne({ _id: category._id });

    const categories = await ShoppingCategory.find({ userId: req.user._id }).sort({
      order: 1,
      name: 1,
    });

    res.json({
      message: "Category deleted",
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete category" });
  }
});

// GET ingredient category preferences
router.get("/category-preferences", async (req, res) => {
  try {
    const preferences = await IngredientCategoryPreference.find({
      userId: req.user._id,
    }).sort({ updatedAt: -1 });

    res.json(preferences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch category preferences" });
  }
});

// POST/UPSERT ingredient category preference
router.post("/category-preferences", async (req, res) => {
  try {
    let { name, category } = req.body;

    name = String(name || "").trim();
    category = String(category || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Ingredient name is required" });
    }

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    await saveCategoryPreference(req.user._id, name, category);

    const normalizedName = normalizeIngredientName(name);
    const preference = await IngredientCategoryPreference.findOne({
      userId: req.user._id,
      normalizedName,
    });

    res.json(preference);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save category preference" });
  }
});

// POST add ingredients to shopping list (merges duplicates)
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }

    await ensureDefaultCategories(req.user._id);

    const existingItems = await ShoppingItem.find({ userId: req.user._id });

    const normalizedIncoming = await Promise.all(
      items.map(async (rawItem) => {
        const item = normalizeIncomingIngredient(rawItem);
        const rememberedCategory = await getRememberedCategory(req.user._id, item.name);

        return {
          name: item.name,
          quantity:
            item.quantity !== undefined && !Number.isNaN(Number(item.quantity))
              ? Number(item.quantity)
              : 1,
          unit: item.unit || "",
          category: item.category || rememberedCategory || "Other",
        };
      })
    );

    const validIncoming = normalizedIncoming.filter((item) => item.name);

    if (validIncoming.length === 0) {
      return res.status(400).json({ message: "No valid ingredients were provided" });
    }

    const combined = [
      ...existingItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        category: i.category,
      })),
      ...validIncoming,
    ];

    const merged = mergeIngredients(combined);

    const existingMap = {};
    existingItems.forEach((item) => {
      existingMap[`${normalizeIngredientName(item.name)}|${item.unit}`] = {
        checked: item.checked,
        order: item.order,
      };
    });

    let maxOrder = Math.max(-1, ...existingItems.map((i) => i.order ?? -1));

    const itemsWithMeta = [];
    for (const item of merged) {
      const rememberedCategory = await getRememberedCategory(req.user._id, item.name);
      const finalCategory = String(item.category || rememberedCategory || "Other").trim() || "Other";

      await ensureCategoryExists(req.user._id, finalCategory);
      await saveCategoryPreference(req.user._id, item.name, finalCategory);

      const key = `${normalizeIngredientName(item.name)}|${item.unit || ""}`;
      const existing = existingMap[key];

      itemsWithMeta.push({
        name: String(item.name || "").trim(),
        quantity:
          item.quantity !== undefined && !Number.isNaN(Number(item.quantity))
            ? Number(item.quantity)
            : 1,
        unit: String(item.unit || "").trim(),
        category: finalCategory,
        userId: req.user._id,
        checked: existing?.checked || false,
        order: existing?.order ?? ++maxOrder,
      });
    }

    await ShoppingItem.deleteMany({ userId: req.user._id });
    const saved = await ShoppingItem.insertMany(itemsWithMeta);

    const sorted = [...saved].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.status(200).json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to merge shopping list",
      error: err.message,
    });
  }
});

// POST add a single item manually
router.post("/item", async (req, res) => {
  try {
    let { name, quantity, unit, category } = req.body;

    name = String(name || "").trim();
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    quantity = Number(quantity) || 1;
    unit = String(unit || "").trim();

    const rememberedCategory = await getRememberedCategory(req.user._id, name);
    category = String(category || rememberedCategory || "Other").trim() || "Other";

    await ensureCategoryExists(req.user._id, category);

    const maxOrderItem = await ShoppingItem.findOne({ userId: req.user._id }).sort({
      order: -1,
    });
    const order = (maxOrderItem?.order ?? -1) + 1;

    const newItem = new ShoppingItem({
      userId: req.user._id,
      name,
      quantity,
      unit,
      category,
      checked: false,
      order,
    });

    const saved = await newItem.save();
    await saveCategoryPreference(req.user._id, name, category);

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

// PATCH uncheck all items
router.patch("/uncheck-all", async (req, res) => {
  try {
    await ShoppingItem.updateMany({ userId: req.user._id }, { checked: false });
    const items = await ShoppingItem.find({ userId: req.user._id }).sort({
      order: 1,
      createdAt: 1,
      name: 1,
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to uncheck all items" });
  }
});

// PATCH reorder items
router.patch("/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }

    const userItems = await ShoppingItem.find({ userId: req.user._id }).select("_id");
    const validIds = new Set(userItems.map((item) => String(item._id)));
    const filteredIds = orderedIds.filter((id) => validIds.has(String(id)));

    const bulkOps = filteredIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: req.user._id },
        update: { order: index },
      },
    }));

    if (bulkOps.length > 0) {
      await ShoppingItem.bulkWrite(bulkOps);
    }

    const items = await ShoppingItem.find({ userId: req.user._id }).sort({
      order: 1,
      createdAt: 1,
      name: 1,
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reorder items" });
  }
});

// DELETE all checked items
router.delete("/checked", async (req, res) => {
  try {
    const result = await ShoppingItem.deleteMany({
      userId: req.user._id,
      checked: true,
    });
    res.json({
      message: "Checked items deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete checked items" });
  }
});

// PATCH single item
router.patch("/:id", async (req, res) => {
  try {
    let { name, quantity, unit, category, checked, order } = req.body;

    const updateFields = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Name is required" });
      }
      updateFields.name = trimmedName;
    }

    if (quantity !== undefined) {
      const parsedQty = Number(quantity);
      if (Number.isNaN(parsedQty) || parsedQty < 0) {
        return res.status(400).json({ message: "Quantity must be a valid number" });
      }
      updateFields.quantity = parsedQty;
    }

    if (unit !== undefined) {
      updateFields.unit = String(unit).trim();
    }

    if (category !== undefined) {
      const finalCategory = String(category).trim() || "Other";
      await ensureCategoryExists(req.user._id, finalCategory);
      updateFields.category = finalCategory;
    }

    if (checked !== undefined) {
      updateFields.checked = Boolean(checked);
    }

    if (order !== undefined) {
      const parsedOrder = Number(order);
      updateFields.order = Number.isNaN(parsedOrder) ? 0 : parsedOrder;
    }

    const updatedItem = await ShoppingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (updateFields.name || updateFields.category) {
      await saveCategoryPreference(
        req.user._id,
        updatedItem.name,
        updatedItem.category || "Other"
      );
    }

    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update item" });
  }
});

// DELETE single item
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ShoppingItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

// DELETE all items
router.delete("/", async (req, res) => {
  try {
    await ShoppingItem.deleteMany({ userId: req.user._id });
    res.json({ message: "Shopping list cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear list" });
  }
});

export default router;