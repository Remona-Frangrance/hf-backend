import { Request, Response } from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary";
import Gallery from "../models/Gallary";

// Multer setup
const upload = multer({ storage: multer.memoryStorage() }).single("image");

// Upload helper
const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "gallery" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};


// ✅ Add new gallery image
export const addGalleryImage = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err || !req.file) {
      return res.status(400).json({ error: "Image upload failed" });
    }

    try {
      const imageUrl = await uploadToCloudinary(req.file);
      const { title, description, subcategory } = req.body;

      const newImage = await Gallery.create({
        imageUrl,
        title,
        description,
        subcategory,
      });

      res.status(201).json(newImage);
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: "Failed to upload gallery image" });
    }
  });
};

// ✅ Get all images (with optional filtering by subcategory)
export const getAllGalleryImages = async (req: Request, res: Response) => {
  try {
    const { subcategory } = req.query;

    const filter = subcategory ? { subcategory } : {};
    const images = await Gallery.find(filter).sort({ createdAt: -1 });

    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gallery images" });
  }
};

// ✅ Update gallery image (with optional image replacement & subcategory update)
export const updateGalleryImage = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: "Image upload failed" });
    }

    try {
      const { id } = req.params;
      const { title, description, subcategory } = req.body;

      const gallery = await Gallery.findById(id);
      if (!gallery) return res.status(404).json({ error: "Image not found" });

      // Optional image replacement
      if (req.file) {
        const publicId = getCloudinaryPublicId(gallery.imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
        const newImageUrl = await uploadToCloudinary(req.file);
        gallery.imageUrl = newImageUrl;
      }

      // Update fields if provided
      gallery.title = title ?? gallery.title;
      gallery.description = description ?? gallery.description;
      gallery.subcategory = subcategory ?? gallery.subcategory;

      await gallery.save();
      res.status(200).json(gallery);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update gallery image" });
    }
  });
};


// Delete gallery image
export const deleteGalleryImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findById(id);

    if (!gallery) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    const publicId = getCloudinaryPublicId(gallery.imageUrl);
    if (publicId) await cloudinary.uploader.destroy(publicId);

    await Gallery.findByIdAndDelete(id);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete gallery image" });
  }
};

// Extract Cloudinary Public ID
const getCloudinaryPublicId = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    const publicIdWithExt = parts.slice(uploadIndex + 1).join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
    return publicId;
  } catch {
    return null;
  }
};
