// routes/cart.js
import express from 'express';
import Cart from '../models/Cart.js';
const router = express.Router();

// ✅ Add or update item
router.post('/add', async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;

  if (!userId || !productId) return res.status(400).json({ message: 'Missing fields' });

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [{ productId, quantity }] });
  } else {
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;

      // Optional: remove if quantity becomes 0
      if (existingItem.quantity <= 0) {
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      }
    } else {
      cart.items.push({ productId, quantity });
    }
  }

  await cart.save();
  const populatedCart = await Cart.findOne({ userId }).populate('items.productId');
  res.json(populatedCart);
});

// ✅ Get cart with populated items
router.get('/:userId', async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
  if (!cart) return res.json({ items: [] });
  res.json(cart);
});

// ✅ Remove item
router.post('/remove', async (req, res) => {
  const { userId, productId } = req.body;
  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  await cart.save();
  const populatedCart = await Cart.findOne({ userId }).populate('items.productId');
  res.json(populatedCart);
});

export default router;
