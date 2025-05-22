import express from "express";
import { 
  createSubcategory, 
  getSubcategories, 
  getSubcategory, 
  updateSubcategory, 
  deleteSubcategory, 
  getAllSubcategoryImages,
  getSubcategoriesByCategoryId
} from "../controllers/subCategoryController";
import multer from "multer";

// Update multer for multiple images
const uploadMultiple = multer({ storage: multer.memoryStorage() }).array('images', 10);

const router = express.Router();

router.post("/", uploadMultiple, createSubcategory);
router.put("/:id", uploadMultiple, updateSubcategory);
router.get("/", getSubcategories);
router.get("/:id", getSubcategory);
router.delete("/:id", deleteSubcategory);
router.get("/images/:categoryId", getAllSubcategoryImages);
router.get("/category/:categoryId", getSubcategoriesByCategoryId);

  
export default router;
