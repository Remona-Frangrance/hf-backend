import { Request, Response } from "express";
import cloudinary from "cloudinary";
import config from "../config/default";
import Image from "../models/image";
import Subcategory from "../models/Subcategory";

cloudinary.v2.config(config.cloudinary);

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !req.files.image) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const file = req.files.image as any;
    const { title, description, subcategoryId, tags } = req.body;
    
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      res.status(404).json({ error: "Subcategory not found" });
      return;
    }

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath);
    
    const newImage = await Image.create({ 
      url: result.secure_url, 
      public_id: result.public_id,
      title,
      description,
      subcategory: subcategoryId,
      tags: tags ? tags.split(",") : []
    });

    res.status(201).json(newImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const getImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subcategory } = req.query;
    const filter = subcategory ? { subcategory } : {};
    
    const images = await Image.find(filter).populate("subcategory");
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

export const getImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const image = await Image.findById(req.params.id).populate("subcategory");
    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch image" });
  }
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    await cloudinary.v2.uploader.destroy(image.public_id);
    await image.deleteOne();

    res.json({ message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ error: "Deletion failed" });
  }
};