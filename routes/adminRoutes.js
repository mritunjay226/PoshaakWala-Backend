// routes/adminRoutes.js
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const response = await axios.get('https://api.clerk.com/v1/users', {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    const users = response.data.map((user) => ({
      id: user.id,
      email: user.email_addresses?.[0]?.email_address,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      imageUrl: user.image_url || 'https://i.pravatar.cc/100',
      createdAt: user.created_at,
    }));

    res.json(users);
  } catch (err) {
    console.error('❌ Clerk fetch error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
