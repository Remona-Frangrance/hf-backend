import express from "express";
import { 
  uploadImage, 
  getImages, 
  getImage, 
  deleteImage 
} from "../controllers/imageController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/upload", auth, uploadImage);
router.get("/", getImages);
router.get("/:id", getImage);
router.delete("/:id", auth, deleteImage);

export default router;