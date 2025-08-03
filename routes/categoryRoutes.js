import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// ✅ GET /api/categories — list all unique categories
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}, { category: 1 });
    const allCategories = products.flatMap(p => Array.isArray(p.category) ? p.category : [p.category]);
    const uniqueCategories = [...new Set(allCategories.filter(Boolean).map(c => c.trim().toLowerCase()))];
    res.json(uniqueCategories);
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/categories/grouped — group products by category
router.get('/grouped', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    const grouped = {};

    for (const product of products) {
      const categories = Array.isArray(product.category)
        ? product.category
        : [product.category];

      for (const cat of categories) {
        const cleaned = typeof cat === 'string' ? cat.trim().toLowerCase() : null;
        if (!cleaned) continue;

        if (!grouped[cleaned]) grouped[cleaned] = [];
        grouped[cleaned].push(product);
      }
    }

    res.json(grouped);
  } catch (err) {
    console.error('Error fetching grouped products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ GET /api/categories/products?category=xyz
// ✅ GET /api/categories/products?category=xyz&type=abc
router.get('/products', async (req, res) => {
  try {
    const { category, type } = req.query;
    const query = {};

    if (category) {
      query.category = { $in: [new RegExp(`^${category}$`, 'i')] };
    }

    if (type) {
      query.type = { $regex: new RegExp(`^${type}$`, 'i') }; // case-insensitive type match
    }

    const products = await Product.find(query).lean();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products by category/type:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;
