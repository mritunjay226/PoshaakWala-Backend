import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🛠️ Upload image buffer to Cloudinary
const uploadFromBuffer = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'products' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      category,
      description,
      tags,
      imageTags,
      productLinks,
      brand,
      type,
    } = req.body;

    // 🧠 Safe Parsing
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags || '[]') : tags || [];
    const parsedCategory = typeof category === 'string' ? JSON.parse(category || '[]') : category || [];
    const parsedProductLinks = typeof productLinks === 'string' ? JSON.parse(productLinks || '[]') : productLinks || [];
    const parsedImageTags = typeof imageTags === 'string' ? JSON.parse(imageTags || '[]') : imageTags || [];

    const sanitizeTag = (input) =>
      typeof input === 'object' && input !== null ? input.tag : input;

    const images = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadFromBuffer(req.files[i].buffer);
        images.push({
          url: result.secure_url,
          public_id: result.public_id,
          tag: sanitizeTag(parsedImageTags?.[i]) || 'extra', // ✅ Always a string
        });
      }
    }

    const product = new Product({
      title,
      price,
      category: parsedCategory,
      description,
      tags: parsedTags,
      images,
      productLinks: parsedProductLinks,
      brand,
      type,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      category,
      description,
      productLinks,
      tags,
      existingImages,
      removedImageIds,
      newImageTags,
      capacity,
      brand,
      type,
    } = req.body;

    // 🧠 Safe Parsing
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags || '[]') : tags || [];
    const parsedExistingImagesRaw = typeof existingImages === 'string' ? JSON.parse(existingImages || '[]') : existingImages || [];
    const parsedRemovedIds = typeof removedImageIds === 'string' ? JSON.parse(removedImageIds || '[]') : removedImageIds || [];
    const parsedNewImageTags = typeof newImageTags === 'string' ? JSON.parse(newImageTags || '[]') : newImageTags || [];
    const parsedCategory = typeof category === 'string' ? JSON.parse(category || '[]') : category || [];
    const parsedProductLinks = typeof productLinks === 'string' ? JSON.parse(productLinks || '[]') : productLinks || [];

    // 🧼 Sanitize tag values to ensure they're strings
    const sanitizeTag = (t) =>
      typeof t === 'object' && t !== null ? t.tag : t;

    const parsedExistingImages = parsedExistingImagesRaw.map((img) => ({
      ...img,
      tag: sanitizeTag(img.tag)
    }));

    // 🔥 Delete removed images from Cloudinary
    for (const public_id of parsedRemovedIds) {
      if (public_id) {
        try {
          await cloudinary.uploader.destroy(public_id);
        } catch (err) {
          console.warn(`⚠️ Failed to delete image ${public_id}`, err.message);
        }
      }
    }

    // 🖼️ Preserve only those existing images which are not in removedImageIds and have public_id
    const preservedImages = parsedExistingImages
      .filter((img) => img?.public_id && !parsedRemovedIds.includes(img.public_id))
      .map(({ public_id, url, tag }) => ({
        public_id,
        url,
        tag: sanitizeTag(tag) || 'extra',
      }));

    // 📥 Upload new images and add to final image list
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadFromBuffer(req.files[i].buffer);
        preservedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
          tag: sanitizeTag(parsedNewImageTags?.[i]) || 'extra',
        });
      }
    }

    // ✏️ Update Product Document
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        price,
        category: parsedCategory,
        description,
        tags: parsedTags,
        images: preservedImages,
        productLinks: parsedProductLinks,
        capacity,
        brand,
        type,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(updated);
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Get All Products (with optional search)
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, tags, type, sort, latest } = req.query;

    const query = {};

    // 🔍 Full-text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { capacity: { $regex: search, $options: 'i' } },
        { productLinks: { $regex: search, $options: 'i' } },
      ];
    }

    // 🎯 Category filter
    if (category) {
      query.category = Array.isArray(category)
        ? { $in: category }
        : { $regex: category, $options: 'i' };
    }

    // 🏷️ Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    // 👟 Type filter
    if (type) {
      query.type = { $regex: type, $options: 'i' };
    }

    let mongoQuery = Product.find(query);

    // ⏳ Sorting logic
    if (latest) {
      mongoQuery = mongoQuery.sort({ createdAt: -1 });
    } else if (sort === 'price_asc') {
      mongoQuery = mongoQuery.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      mongoQuery = mongoQuery.sort({ price: -1 });
    }

    const products = await mongoQuery.limit(100).exec();
    res.status(200).json(products);
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    console.error('❌ Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Promise.all(
      product.images.map(async (img) => {
        if (img.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
          } catch (err) {
            console.warn(`⚠️ Failed to delete image ${img.public_id}:`, err.message);
          }
        }
      })
    );

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product and images deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

