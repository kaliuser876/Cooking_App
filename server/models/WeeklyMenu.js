import mongoose from "mongoose";

const dayEntrySchema = new mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    manuallySelected: {
      type: Boolean,
      default: false,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    preferredCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
  },
  { _id: false }
);

const weeklyMenuSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    selectedCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
    days: {
      Monday: { type: dayEntrySchema, default: () => ({}) },
      Tuesday: { type: dayEntrySchema, default: () => ({}) },
      Wednesday: { type: dayEntrySchema, default: () => ({}) },
      Thursday: { type: dayEntrySchema, default: () => ({}) },
      Friday: { type: dayEntrySchema, default: () => ({}) },
      Saturday: { type: dayEntrySchema, default: () => ({}) },
      Sunday: { type: dayEntrySchema, default: () => ({}) },
    },
  },
  { timestamps: true }
);

export default mongoose.model("WeeklyMenu", weeklyMenuSchema);