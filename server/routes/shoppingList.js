import express from "express";
import ShoppingItem from "../models/ShoppingItem.js";
import { mergeIngredients } from "../utils/ingredientParser.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET all shopping items (sorted by order, then name)
router.get("/", async (req, res) => {
  try {
    const items = await ShoppingItem.find({ userId: req.user._id }).sort({
      order: 1,
      name: 1,
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// POST add ingredients to shopping list (merges duplicates)
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }

    const existingItems = await ShoppingItem.find({ userId: req.user._id });

    const combined = [
      ...existingItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        category: i.category,
      })),
      ...items,
    ];

    const merged = mergeIngredients(combined);

    // Preserve checked state and assign order
    const existingMap = {};
    existingItems.forEach((item) => {
      existingMap[`${item.name}|${item.unit}`] = {
        checked: item.checked,
        order: item.order,
      };
    });

    let maxOrder = Math.max(0, ...existingItems.map((i) => i.order || 0));

    const itemsWithMeta = merged.map((item) => {
      const key = `${item.name}|${item.unit}`;
      const existing = existingMap[key];

      return {
        ...item,
        userId: req.user._id,
        checked: existing?.checked || false,
        order: existing?.order ?? ++maxOrder,
      };
    });

    await ShoppingItem.deleteMany({ userId: req.user._id });
    const saved = await ShoppingItem.insertMany(itemsWithMeta);

    res.status(200).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to merge shopping list",
      error: err.message,
    });
  }
});

// POST add a single item manually (no merging)
router.post("/item", async (req, res) => {
  try {
    let { name, quantity, unit, category } = req.body;

    name = name?.trim();
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    quantity = Number(quantity) || 1;
    unit = unit?.trim() || "";
    category = category?.trim() || "Other";

    // Get max order for this user
    const maxOrderItem = await ShoppingItem.findOne({ userId: req.user._id }).sort({
      order: -1,
    });
    const order = (maxOrderItem?.order || 0) + 1;

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

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: req.user._id },
        update: { order: index },
      },
    }));

    await ShoppingItem.bulkWrite(bulkOps);

    const items = await ShoppingItem.find({ userId: req.user._id }).sort({
      order: 1,
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
      const trimmedName = name.trim();
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
      updateFields.unit = unit.trim();
    }

    if (category !== undefined) {
      updateFields.category = category.trim() || "Other";
    }

    if (checked !== undefined) {
      updateFields.checked = Boolean(checked);
    }

    if (order !== undefined) {
      updateFields.order = Number(order) || 0;
    }

    const updatedItem = await ShoppingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
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