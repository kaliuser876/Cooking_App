// Run with: node scripts/cleanupDb.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/recipes";

async function cleanup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete all recipes without userId
    const recipesResult = await mongoose.connection.collection("recipes").deleteMany({
      userId: { $exists: false },
    });
    console.log(`Deleted ${recipesResult.deletedCount} recipes without userId`);

    // Delete all shopping items without userId
    const shoppingResult = await mongoose.connection
      .collection("shoppingitems")
      .deleteMany({
        userId: { $exists: false },
      });
    console.log(`Deleted ${shoppingResult.deletedCount} shopping items without userId`);

    console.log("Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

cleanup();