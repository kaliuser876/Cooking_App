import mongoose from "mongoose";

const ingredientCategoryPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    originalName: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

ingredientCategoryPreferenceSchema.index(
  { userId: 1, normalizedName: 1 },
  { unique: true }
);

export default mongoose.model(
  "IngredientCategoryPreference",
  ingredientCategoryPreferenceSchema
);