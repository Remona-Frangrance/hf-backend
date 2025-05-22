import { Request, Response } from "express";
import Subcategory from "../models/Subcategory";
import Category from "../models/Category";
import cloudinary from "../utils/cloudinary"; // Assuming cloudinary is properly set up
import multer from "multer";
import Image from "../models/image"; // Optional if you want to also save images in a separate collection

// Update multer to accept multiple images
const uploadMultiple = multer({ storage: multer.memoryStorage() }).array('images', 10); // limit 10 images

// Create Subcategory - Handles multiple image uploads
export const createSubcategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, category } = req.body;

    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Check if files are provided
    const files = req.files as Express.Multer.File[] | Express.Multer.File | undefined;
    
    if (!files || (Array.isArray(files) && files.length === 0)) {
      res.status(400).json({ error: "At least one image is required" });
      return;
    }

    // If files are an array, upload each file to Cloudinary
    const uploadToCloudinary = (files: Express.Multer.File[]): Promise<string[]> => {
      return Promise.all(files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "subcategories" },
            (error, result) => {
              if (error || !result) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          stream.end(file.buffer);
        });
      }));
    };

    // Handle single file or multiple files
    const imageUrls = Array.isArray(files) ? await uploadToCloudinary(files) : await uploadToCloudinary([files]);

    const subcategory = await Subcategory.create({
      name,
      description,
      category,
      coverImage: imageUrls[0], // First image as cover image
      images: imageUrls, // Store all image URLs
    });
    const populatedSubcategory = await subcategory.populate('category', 'name');

    res.status(201).json(populatedSubcategory);
  } catch (error: any) {
    console.error("Error creating subcategory:", error);
    if (error.code === 11000) {
      res.status(400).json({ error: "Subcategory with this name already exists in this category" });
    } else {
      res.status(500).json({ error: "Failed to create subcategory" });
    }
  }
};

export const getSubcategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const subcategories = await Subcategory.find()
      .populate('category', 'name _id') // populate category with only name and _id
      .sort({ createdAt: -1 });

    res.status(200).json(subcategories);
  } catch (error: any) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
};


// Get a single Subcategory by ID
export const getSubcategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate("category");
    if (!subcategory) {
      res.status(404).json({ error: "Subcategory not found" });
      return;
    }
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subcategory" });
  }
};

// Update Subcategory - Handles multiple image uploads
// Update Subcategory - Handles multiple image uploads
export const updateSubcategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, category } = req.body;
    const subcategoryId = req.params.id;

    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      res.status(404).json({ error: "Subcategory not found" });
      return;
    }

    const updateData: any = { name, description, category };

    const files = req.files as Express.Multer.File[] | Express.Multer.File | undefined;

    // Define the function for uploading to Cloudinary
    const uploadToCloudinary = (files: Express.Multer.File[]): Promise<string[]> => {
      return Promise.all(files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "subcategories" },
            (error, result) => {
              if (error || !result) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          stream.end(file.buffer);
        });
      }));
    };

    if (files && (Array.isArray(files) || files)) {
      // Handle multiple or single image upload
      const imageUrls = Array.isArray(files) ? await uploadToCloudinary(files) : await uploadToCloudinary([files]);
      updateData.images = imageUrls; // Update the images array
    }

    if (files && (Array.isArray(files) || files)) {
      // If new images were uploaded, update cover image
      updateData.coverImage = updateData.images[0]; // First image as cover image
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(subcategoryId, updateData, { new: true });
    res.status(200).json(updatedSubcategory);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update subcategory" });
  }
};
// Delete Subcategory - Handles image deletion from Cloudinary as well
export const deleteSubcategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const subcategoryId = req.params.id;
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      res.status(404).json({ error: "Subcategory not found" });
      return;
    }

    // Delete images from Cloudinary
    await Promise.all(subcategory.images.map(async (imageUrl) => {
      const publicId = imageUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId); // Delete from Cloudinary
      }
    }));

    // Delete the subcategory
    await Subcategory.findByIdAndDelete(subcategoryId);
    res.json({ message: "Subcategory and all related images deleted" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete subcategory" });
  }
};


// GET /api/subcategories/images/:categoryId
export const getAllSubcategoryImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    const subcategories = await Subcategory.find({ category: categoryId }, 'images'); // Filter by category

    const allImages = subcategories.reduce<string[]>((acc, subcat) => {
      return acc.concat(subcat.images || []);
    }, []);

    res.status(200).json({ images: allImages });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch images from subcategories" });
  }
};

// Get subcategories by category ID
export const getSubcategoriesByCategoryId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    const subcategories = await Subcategory.find({ category: categoryId }).populate("category");

    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subcategories for the category" });
  }
};
