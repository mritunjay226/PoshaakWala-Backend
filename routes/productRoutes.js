// routes/productRoutes.js

import express from 'express';
import upload from '../middlewares/multer.js';
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

// 🔼 Upload field names:
// - create: 'images'
// - update: 'newImages'

router.post('/', upload.array('images', 5), createProduct);
router.put('/:id', upload.array('newImages', 5), updateProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);

export default router;
