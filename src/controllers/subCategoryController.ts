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
    const {
      name,
      description,
      category,
      keepExistingImages = 'true',
      existingImagesToKeep = []
    } = req.body;

    const subcategoryId = req.params.id;
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      res.status(404).json({ error: "Subcategory not found" });
      return;
    }

    const updateData: any = { name, description, category };
    const files = req.files as Express.Multer.File[] | Express.Multer.File | undefined;

    // Upload new images
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

    let newImageUrls: string[] = [];
    if (files && (Array.isArray(files) || files)) {
      newImageUrls = Array.isArray(files)
        ? await uploadToCloudinary(files)
        : await uploadToCloudinary([files]);
    }

    const shouldKeepExisting = keepExistingImages === 'true';
    const existingImagesArray = Array.isArray(existingImagesToKeep)
      ? existingImagesToKeep
      : [existingImagesToKeep];

    if (shouldKeepExisting) {
      // Delete images not in existingImagesToKeep
      const imagesToDelete = subcategory.images.filter(img => !existingImagesArray.includes(img));
      await Promise.all(imagesToDelete.map(async (imageUrl) => {
        const publicId = imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`subcategories/${publicId}`);
        }
      }));

      updateData.images = [...existingImagesArray, ...newImageUrls];
    } else {
      // Delete all old images
      await Promise.all((subcategory.images || []).map(async (imageUrl) => {
        const publicId = imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`subcategories/${publicId}`);
        }
      }));

      updateData.images = newImageUrls;
    }

    // Set new cover image if needed
    const allImages = updateData.images || [];
    if (!allImages.includes(subcategory.coverImage)) {
      updateData.coverImage = allImages[0] || null;
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      subcategoryId,
      updateData,
      { new: true }
    ).populate("category");

    res.status(200).json(updatedSubcategory);
  } catch (error: any) {
    console.error("Error updating subcategory:", error);
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
      const publicId = getCloudinaryPublicId(imageUrl);
      console.log("🚀 ~ awaitPromise.all ~ publicId:", publicId)
       if (publicId) {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("🗑️ Cloudinary delete result:", result);
  } else {
    console.log("⚠️ Failed to extract publicId from:", imageUrl);
  }
    }));

    // Delete the subcategory
    await Subcategory.findByIdAndDelete(subcategoryId);
    res.json({ message: "Subcategory and all related images deleted" });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete subcategory" });
  }
};

const getCloudinaryPublicId = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname; // e.g., /demo/image/upload/v1234567890/folder/image.jpg
    const parts = pathname.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Get everything after 'upload/' and before extension
    const publicIdWithVersion = parts.slice(uploadIndex + 1).join('/');
    const publicId = publicIdWithVersion.replace(/\.[^/.]+$/, ""); // remove extension
    console.log("🚀 ~ publicId:", publicId)
    return publicId;
  } catch {
    return null;
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
