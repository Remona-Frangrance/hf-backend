import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  coverImage: { type: String },
  images: [{ type: String }], // Array to store multiple image URLs
}, { timestamps: true });

// Ensure unique combination of name and category
SubcategorySchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model("Subcategory", SubcategorySchema);
