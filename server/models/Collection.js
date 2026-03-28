import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
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
    color: {
      type: String,
      default: "#4CAF50",
    },
    icon: {
      type: String,
      default: "📁",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Ensure unique collection names per user
collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("Collection", collectionSchema);