import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js'; 
import adminRoutes from './routes/adminRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import CartRoutes from './routes/cart.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // for parsing JSON
app.use(express.urlencoded({ extended: true })); // for parsing form-data

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/cart', CartRoutes);

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err);
  });

app.get('/', (req, res) => {
  res.send('🚀 Poshaakwala backend is live!');
});
