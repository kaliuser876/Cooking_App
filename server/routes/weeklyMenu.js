import express from "express";
import WeeklyMenu from "../models/WeeklyMenu.js";
import Recipe from "../models/Recipe.js";
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
  Monday: {
    recipe: null,
    disabled: false,
    manuallySelected: false,
    locked: false,
    preferredCollections: [],
  },
  Tuesday: {
    recipe: null,
    disabled: false,
    manuallySelected: false,
    locked: false,
    preferredCollections: [],
  },
  Wednesday: {
    recipe: null,
    disabled: false,
    manuallySelected: false,
    locked: false,
    preferredCollections: [],
  },
  Thursday: {
    recipe: null,
    disabled: false,
    manuallySelected: false,
    locked: false,
    preferredCollections: [],
  },
  Friday: {
    recipe: null,
    disabled: false,
    manuallySelected: false,
    locked: false,
    preferredCollections: [],
  },
  Saturday: {
    recipe: null,
    disabled: false,
    manuallySelected: false,
    locked: false,
    preferredCollections: [],
  },
  Sunday: {
    recipe: null,
    disabled: false,
    manuallySelected: false,
    locked: false,
    preferredCollections: [],
  },
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

const normalizeDay = (day = {}) => ({
  recipe: day.recipe || null,
  disabled: Boolean(day.disabled),
  manuallySelected: Boolean(day.manuallySelected),
  locked: Boolean(day.locked),
  preferredCollections: Array.isArray(day.preferredCollections)
    ? day.preferredCollections
    : [],
});

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

router.put("/", async (req, res) => {
  try {
    const { selectedCollections = [], days = {} } = req.body;

    const mergedDays = getDefaultDays();

    for (const day of DAYS_OF_WEEK) {
      if (days[day]) {
        mergedDays[day] = normalizeDay(days[day]);
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

    const existingDaysRaw =
      typeof existingMenu.days?.toObject === "function"
        ? existingMenu.days.toObject()
        : existingMenu.days || {};

    const nextDays = getDefaultDays();

    for (const day of DAYS_OF_WEEK) {
      nextDays[day] = {
        ...nextDays[day],
        ...normalizeDay(existingDaysRaw[day] || {}),
      };
    }

    const usedIds = new Set();

    for (const day of DAYS_OF_WEEK) {
      const current = nextDays[day];

      if (current.disabled) continue;

      if ((current.locked || current.manuallySelected) && current.recipe) {
        usedIds.add(String(current.recipe));
      }
    }

    for (const day of DAYS_OF_WEEK) {
      const current = nextDays[day];

      if (current.disabled) {
        nextDays[day] = {
          recipe: null,
          disabled: true,
          manuallySelected: false,
          locked: false,
          preferredCollections: current.preferredCollections || [],
        };
        continue;
      }

      if ((current.locked || current.manuallySelected) && current.recipe) {
        continue;
      }

      let dayPool = allRecipes;

      if (
        Array.isArray(current.preferredCollections) &&
        current.preferredCollections.length > 0
      ) {
        dayPool = allRecipes.filter((recipe) =>
          Array.isArray(recipe.collections) &&
          recipe.collections.some((c) =>
            current.preferredCollections.some(
              (pc) => String(pc) === String(c)
            )
          )
        );
      }

      if (!dayPool.length) {
        dayPool = allRecipes;
      }

      let available = dayPool.filter(
        (recipe) => !usedIds.has(String(recipe._id))
      );

      if (!available.length) {
        available = dayPool;
      }

      const picked =
        available[Math.floor(Math.random() * available.length)] || null;

      nextDays[day] = {
        recipe: picked ? picked._id : null,
        disabled: false,
        manuallySelected: false,
        locked: false,
        preferredCollections: current.preferredCollections || [],
      };

      if (picked) {
        usedIds.add(String(picked._id));
      }
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

router.patch("/day/:day", async (req, res) => {
  try {
    const day = req.params.day;

    if (!DAYS_OF_WEEK.includes(day)) {
      return res.status(400).json({ message: "Invalid day" });
    }

    const {
      recipe,
      disabled = false,
      manuallySelected = false,
      locked = false,
      preferredCollections = [],
    } = req.body;

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
      locked: Boolean(!disabled && locked),
      preferredCollections: Array.isArray(preferredCollections)
        ? preferredCollections
        : [],
    };

    await menu.save();

    const populated = await populateMenu(menu);
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update day" });
  }
});

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