import express from 'express';
import upload from '../utils/upload';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';

const router = express.Router();

router.post('/', upload.single('coverImage'), createCategory);
router.get('/', getAllCategories);
router.put('/:id', upload.single('coverImage'), updateCategory);
router.delete('/:id', deleteCategory);

export default router;  
  