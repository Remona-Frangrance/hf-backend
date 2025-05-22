import { Request, Response } from "express";
import Brand from "../models/Brands";
import cloudinary from "../utils/cloudinary";
import { Express } from 'express';

// Upload brand image to Cloudinary
const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "brands" },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

// CREATE brand
export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!req.file) {
      res.status(400).json({ error: "Image is required" });
      return;
    }

    const imageUrl = await uploadToCloudinary(req.file);

    const brand = await Brand.create({ name, image: imageUrl });
    res.status(201).json(brand);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create brand" });
  }
};

// GET all brands
export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
};

// GET single brand
export const getBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brand" });
  }
};

// UPDATE brand
export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    let imageUrl = brand.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    brand.name = name || brand.name;
    brand.image = imageUrl;

    const updated = await brand.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update brand" });
  }
};

// DELETE brand
export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    // Optional: Delete image from Cloudinary (not mandatory unless needed)

    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: "Brand deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete brand" });
  }
};
