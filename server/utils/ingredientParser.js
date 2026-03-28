// utils/ingredientParser.js

// Descriptors to ignore
const DESCRIPTORS = [
  "fresh", "chopped", "diced", "minced", "grated",
  "large", "small", "medium", "extra", "virgin",
  "finely", "roughly", "to taste", "for garnish",
  "freshly", "optional", "for", "garnish"
];

// Category keywords
const categoryKeywords = {
  Produce: ["onion", "garlic", "lemon", "carrot", "pepper", "parsley", "tomato", "spinach", "celery", "cucumber"],
  Dairy: ["milk", "butter", "cream", "cheese", "yogurt", "parmesan"],
  Meat: ["chicken", "beef", "pork", "bacon", "sausage", "turkey", "ham", "lamb"],
  Pantry: ["flour", "sugar", "salt", "rice", "oil", "vinegar", "wine", "stock", "broth", "pasta"],
  Spices: ["pepper", "oregano", "thyme", "paprika", "cumin", "cinnamon", "basil", "rosemary"],
};



// 🔹 CLEAN RAW STRING SAFELY
const cleanRawIngredient = (str) => {
  if (!str || typeof str !== "string") return "";

  let cleaned = str.toLowerCase();

  // Remove trailing junk like "X"
  cleaned = cleaned.replace(/x$/gi, "");

  // Remove ALL parentheses (even broken ones)
  cleaned = cleaned.replace(/\([^)]*$/g, "");   // remove open "(" with no close
  cleaned = cleaned.replace(/\(.*?\)/g, "");    // remove normal "(...)"

  // Remove weird punctuation but KEEP letters
  cleaned = cleaned.replace(/[^a-z0-9\s\/\.\-]/g, " ");

  // Normalize spacing
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Remove section headers
  if (cleaned.endsWith(":")) return "";

  return cleaned;
};



// 🔹 Normalize ingredient name
export const normalizeName = (name) => {
  if (!name) return "";

  let cleaned = name;

  // Remove descriptors
  DESCRIPTORS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  });

  // Remove filler words
  cleaned = cleaned.replace(/\band\b/g, " ");

  // Clean spaces again
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
};



// 🔹 Categorize ingredient
export const categorizeIngredient = (name) => {
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => name.includes(kw))) {
      return category;
    }
  }
  return "Other";
};



// 🔹 Parse ingredient
export const parseIngredient = (ingredient) => {
  if (!ingredient) return null;

  const cleaned = cleanRawIngredient(ingredient);

  // 🔥 NEW regex supports:
  // 1 1/2  |  1/2  |  1.5  |  1
  const regex = /^\s*((\d+\s+\d+\/\d+)|(\d+\/\d+)|(\d*\.\d+)|(\d+))?\s*(cups?|cup|tablespoons?|tablespoon|tbsp|teaspoons?|teaspoon|tsp|oz|ounces?|ounce|kg|grams?|gram|lb|pounds?|pound|ml|liters?|liter|cloves?|cans?|packages?|package)?\s*(.*)$/i;

  const match = cleaned.match(regex);

  let quantity = 1;
  let unit = "";
  let name = cleaned;

  if (match) {
    const [_, fullQty, mixed, fraction, decimal, whole, unitMatch, nameMatch] = match;

    // 🔥 HANDLE MIXED FRACTION (1 1/2)
    if (mixed) {
      const [wholeNum, frac] = mixed.split(" ");
      const [num, denom] = frac.split("/");
      quantity = parseInt(wholeNum) + (parseFloat(num) / parseFloat(denom));
    }
    // 🔥 HANDLE FRACTION (1/2)
    else if (fraction) {
      const [num, denom] = fraction.split("/");
      quantity = parseFloat(num) / parseFloat(denom);
    }
    // 🔥 DECIMAL (1.5)
    else if (decimal) {
      quantity = parseFloat(decimal);
    }
    // 🔥 WHOLE NUMBER (1)
    else if (whole) {
      quantity = parseFloat(whole);
    }

    unit = unitMatch || "";
    name = nameMatch || cleaned;
  }

  const normalizedName = normalizeName(name);

  return {
    name: normalizedName,
    quantity,
    unit,
    category: categorizeIngredient(normalizedName),
  };
};



// 🔹 Merge ingredients
export const mergeIngredients = (ingredients) => {
  const map = {};

  ingredients.forEach((item) => {
    let parsed = null;

    if (typeof item === "string") {
      parsed = parseIngredient(item);
    } else if (item && typeof item === "object") {
      const normalizedName = normalizeName(item.name || "");
      if (!normalizedName) return;

      parsed = {
        name: normalizedName,
        quantity: Number(item.quantity) || 1,
        unit: item.unit || "",
        category: item.category || categorizeIngredient(normalizedName),
      };
    }

    if (!parsed || !parsed.name) return;

    const key = `${parsed.name}|${parsed.unit}`;

    if (!map[key]) {
      map[key] = parsed;
    } else {
      map[key].quantity += parsed.quantity;
    }
  });

  return Object.values(map);
};