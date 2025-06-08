    import { Request, Response } from 'express';
import Category from '../models/Category';
import SubCategory from '../models/Subcategory'; // Assuming you have this

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const [totalCategories, totalSubcategories] = await Promise.all([
      Category.countDocuments(),
      SubCategory.countDocuments(),
    ]);

    res.status(200).json({ totalCategories, totalSubcategories });
  } catch (error) {
    console.error("Metrics fetch error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
