import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    image: { type: String, default: "" },
    url: { type: String, sparse: true },
    favorite: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    
    // NEW: Collections this recipe belongs to
    collections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    }],
    
    // NEW: Sharing fields
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

// Compound index for unique URL per user
recipeSchema.index({ userId: 1, url: 1 }, { unique: true, sparse: true });

// Index for search performance
recipeSchema.index({ name: "text" });

export default mongoose.model("Recipe", recipeSchema);