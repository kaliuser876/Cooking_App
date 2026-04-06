import mongoose from "mongoose";

const shoppingCategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

shoppingCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("ShoppingCategory", shoppingCategorySchema);