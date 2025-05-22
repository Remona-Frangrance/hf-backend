import { Request, Response } from 'express';
import Category from '../models/Category';
import cloudinary from '../utils/cloudinary';

  // Create
  export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log(req.body);
      const { name, description } = req.body;
  
      if (!req.file) {
        res.status(400).json({ message: "Image is required" });
        return;
      }
  
      // Convert cloudinary stream upload to a Promise
      const uploadToCloudinary = (): Promise<string> => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "categories" },
            (error, result) => {
              if (error || !result) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          stream.end(req.file!.buffer);
        });
      };
  
      const imageUrl = await uploadToCloudinary();
  
      const category = new Category({
        name,
        description,
        coverImage: imageUrl,
      });
  
      const saved = await category.save();
      res.status(201).json(saved);
    } catch (err) {
      console.error("Category create error:", err);
      res.status(500).json({ message: "Internal server error", error: err });
    }
  };

// Read All
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const file = req.file as Express.Multer.File;
    const categoryId = req.params.id;

    let updateData: any = { name, description };

    if (file?.path) {
      const result = await cloudinary.uploader.upload(file.path);
      updateData.coverImage = result.secure_url;
    }

    const updated = await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
    });

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    await Category.findByIdAndDelete(categoryId);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
