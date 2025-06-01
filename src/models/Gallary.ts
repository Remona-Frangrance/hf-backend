import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    subcategory: {type: String, required: true},
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
