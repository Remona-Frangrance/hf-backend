
import express from "express";
import multer from "multer";
import {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand
} from "../controllers/brandController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), createBrand);
router.get("/", getBrands);
router.get("/:id", getBrand);
router.put("/:id", upload.single("image"), updateBrand);
router.delete("/:id", deleteBrand);

export default router;
