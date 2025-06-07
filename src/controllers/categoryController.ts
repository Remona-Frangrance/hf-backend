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
// Read All (with pagination, lean, field selection, and timing logs)
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    console.time("Fetch categories");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Fetch only necessary fields: name, description, coverImage
    const [categories, total] = await Promise.all([
      Category.find({}, 'name description coverImage').lean().skip(skip).limit(limit),
      Category.countDocuments()
    ]);

    console.timeEnd("Fetch categories");

    res.status(200).json({
      success: true,
      data: categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Update
export const updateCategory = async (req: Request, res: Response) => {
  try {
     console.log('req.file:', req.file);
    const { name, description } = req.body;
    const file = req.file as Express.Multer.File;
    const categoryId = req.params.id;

    const updateData: any = { name, description };

    if (file?.buffer) {
      // Upload using stream with buffer (like in createCategory)
    const uploadToCloudinary = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "categories" },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          console.log("Cloudinary upload success:", result.secure_url);
          resolve(result.secure_url);
        }
      }
    );
    stream.end(file.buffer); // <-- this must be executed
  });
};

      const imageUrl = await uploadToCloudinary();
      updateData.coverImage = imageUrl;
    }

    const updated = await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
    });

    res.status(200).json(updated);
  } catch (error: any) {
    console.error("Category update error:", error);
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
