// utils/scraper.js
import { chromium } from "playwright";

export async function scrapeRecipe(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Extract JSON-LD structured data
    const jsonLd = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    let recipeData = {};
    for (let block of jsonLd) {
      try {
        const data = JSON.parse(block);
        // Sometimes it's an array of objects
        if (Array.isArray(data)) {
          const r = data.find(obj => obj["@type"] === "Recipe");
          if (r) recipeData = r;
        } else if (data["@type"] === "Recipe") {
          recipeData = data;
        } else if (data["@graph"]) {
          const r = data["@graph"].find(obj => obj["@type"] === "Recipe");
          if (r) recipeData = r;
        }
      } catch (err) {
        // skip invalid JSON
      }
      if (recipeData["@type"] === "Recipe") break;
    }

    // Extract title
    const title = recipeData.name || (await page.title());

    // Extract image
    let image = "";
    if (recipeData.image) {
      if (typeof recipeData.image === "string") image = recipeData.image;
      else if (Array.isArray(recipeData.image)) image = recipeData.image[0];
      else if (recipeData.image.url) image = recipeData.image.url;
    }

    // Extract ingredients
    let ingredients = [];
    if (recipeData.recipeIngredient) {
      ingredients = recipeData.recipeIngredient.map(i => i.trim());
    } else if (recipeData.ingredients) {
      ingredients = recipeData.ingredients.map(i => i.trim());
    }

    // Extract instructions
    let instructions = [];
    if (recipeData.recipeInstructions) {
      if (Array.isArray(recipeData.recipeInstructions)) {
        instructions = recipeData.recipeInstructions
          .map(step => {
            if (typeof step === "string") return step.trim();
            if (step["@type"] === "HowToStep" && step.text) return step.text.trim();
            return "";
          })
          .filter(Boolean);
      } else if (typeof recipeData.recipeInstructions === "string") {
        instructions = [recipeData.recipeInstructions.trim()];
      }
    }

    // Fallback: scrape instructions from HTML if JSON-LD missing
    if (instructions.length === 0) {
      const instructionContainer = page.locator(
        'div[class*="instruction"], div[class*="steps"], div[class*="method"]'
      ).first();

      if (await instructionContainer.count()) {
        const paragraphs = await instructionContainer.locator("p").allInnerTexts();
        instructions = paragraphs.map((p) => p.trim()).filter(Boolean);
      }
    }

    await browser.close();

    if (!title || ingredients.length === 0) {
      throw new Error("Failed to extract recipe data.");
    }

    return {
      name: title,
      image,
      ingredients,
      instructions,
    };
  } catch (err) {
    await browser.close();
    console.error("Scraping error:", err.message);
    throw err;
  }
}