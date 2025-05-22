import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Image", ImageSchema);