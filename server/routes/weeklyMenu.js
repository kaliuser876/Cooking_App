import express from "express";
import WeeklyMenu from "../models/WeeklyMenu.js";
import Recipe from "../models/Recipe.js";
import Collection from "../models/Collection.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getDefaultDays = () => ({
  Monday: { recipe: null, disabled: false, manuallySelected: false },
  Tuesday: { recipe: null, disabled: false, manuallySelected: false },
  Wednesday: { recipe: null, disabled: false, manuallySelected: false },
  Thursday: { recipe: null, disabled: false, manuallySelected: false },
  Friday: { recipe: null, disabled: false, manuallySelected: false },
  Saturday: { recipe: null, disabled: false, manuallySelected: false },
  Sunday: { recipe: null, disabled: false, manuallySelected: false },
});

const populateMenu = async (menu) => {
  return WeeklyMenu.findById(menu._id)
    .populate("selectedCollections", "name color icon")
    .populate("days.Monday.recipe")
    .populate("days.Tuesday.recipe")
    .populate("days.Wednesday.recipe")
    .populate("days.Thursday.recipe")
    .populate("days.Friday.recipe")
    .populate("days.Saturday.recipe")
    .populate("days.Sunday.recipe");
};

// GET current user's weekly menu
router.get("/", async (req, res) => {
  try {
    let menu = await WeeklyMenu.findOne({ userId: req.user._id });

    if (!menu) {
      menu = await WeeklyMenu.create({
        userId: req.user._id,
        selectedCollections: [],
        days: getDefaultDays(),
      });
    }

    const populated = await populateMenu(menu);
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch weekly menu" });
  }
});

// PUT replace/save full weekly menu
router.put("/", async (req, res) => {
  try {
    const { selectedCollections = [], days = {} } = req.body;

    const mergedDays = getDefaultDays();

    for (const day of DAYS_OF_WEEK) {
      if (days[day]) {
        mergedDays[day] = {
          recipe: days[day].recipe || null,
          disabled: Boolean(days[day].disabled),
          manuallySelected: Boolean(days[day].manuallySelected),
        };
      }
    }

    const menu = await WeeklyMenu.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        selectedCollections,
        days: mergedDays,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    const populated = await populateMenu(menu);
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save weekly menu" });
  }
});

// POST generate weekly menu
router.post("/generate", async (req, res) => {
  try {
    const { selectedCollections = [] } = req.body;

    const recipeQuery = { userId: req.user._id };

    if (Array.isArray(selectedCollections) && selectedCollections.length > 0) {
      recipeQuery.collections = { $in: selectedCollections };
    }

    const allRecipes = await Recipe.find(recipeQuery);

    if (!allRecipes.length) {
      return res.status(400).json({ message: "No recipes available for generation" });
    }

    let existingMenu = await WeeklyMenu.findOne({ userId: req.user._id });

    if (!existingMenu) {
      existingMenu = await WeeklyMenu.create({
        userId: req.user._id,
        selectedCollections,
        days: getDefaultDays(),
      });
    }

    const nextDays = { ...getDefaultDays(), ...existingMenu.days.toObject?.() };

    const activeDays = DAYS_OF_WEEK.filter((day) => !nextDays[day]?.disabled);
    const shuffled = [...allRecipes].sort(() => Math.random() - 0.5);

    const usedIds = new Set();
    for (const day of activeDays) {
      const current = nextDays[day];

      if (current?.manuallySelected && current?.recipe) {
        usedIds.add(String(current.recipe));
      }
    }

    for (const day of activeDays) {
      const current = nextDays[day];

      if (current?.manuallySelected && current?.recipe) {
        continue;
      }

      let picked = shuffled.find((recipe) => !usedIds.has(String(recipe._id)));

      if (!picked) {
        picked = shuffled[Math.floor(Math.random() * shuffled.length)];
      }

      nextDays[day] = {
        recipe: picked ? picked._id : null,
        disabled: false,
        manuallySelected: false,
      };

      if (picked) {
        usedIds.add(String(picked._id));
      }
    }

    for (const day of DAYS_OF_WEEK.filter((day) => nextDays[day]?.disabled)) {
      nextDays[day] = {
        recipe: null,
        disabled: true,
        manuallySelected: false,
      };
    }

    const menu = await WeeklyMenu.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        selectedCollections,
        days: nextDays,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    const populated = await populateMenu(menu);
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate weekly menu" });
  }
});

// PATCH one day
router.patch("/day/:day", async (req, res) => {
  try {
    const day = req.params.day;

    if (!DAYS_OF_WEEK.includes(day)) {
      return res.status(400).json({ message: "Invalid day" });
    }

    const { recipe, disabled = false, manuallySelected = false } = req.body;

    if (recipe) {
      const foundRecipe = await Recipe.findOne({
        _id: recipe,
        userId: req.user._id,
      });

      if (!foundRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
    }

    let menu = await WeeklyMenu.findOne({ userId: req.user._id });

    if (!menu) {
      menu = await WeeklyMenu.create({
        userId: req.user._id,
        selectedCollections: [],
        days: getDefaultDays(),
      });
    }

    menu.days[day] = {
      recipe: disabled ? null : recipe || null,
      disabled: Boolean(disabled),
      manuallySelected: Boolean(!disabled && manuallySelected),
    };

    await menu.save();

    const populated = await populateMenu(menu);
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update day" });
  }
});

// POST clear menu
router.post("/clear", async (req, res) => {
  try {
    const menu = await WeeklyMenu.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        selectedCollections: [],
        days: getDefaultDays(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    const populated = await populateMenu(menu);
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear weekly menu" });
  }
});

export default router;