import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String }, // Image URL from Cloudinary
}, { timestamps: true });

export default mongoose.model("Brand", BrandSchema);
