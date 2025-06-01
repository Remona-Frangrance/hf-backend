import express from "express";
import {
  addGalleryImage,
  getAllGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
} from "../controllers/gallaryController";

const router = express.Router();

router.post("/add", addGalleryImage);
router.get("/", getAllGalleryImages);
router.put("/:id", updateGalleryImage);
router.delete("/:id", deleteGalleryImage);
    
export default router;
