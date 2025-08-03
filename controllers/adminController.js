// routes/admin.js
import express from 'express';
import clerk from '@clerk/clerk-sdk-node'; // ✅ Correct

import dotenv from 'dotenv';

dotenv.config();

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * GET /users
 *
 * Fetches the list of all users in the Clerk instance.
 *
 * @param {http.IncomingMessage} req - The request object.
 * @param {http.ServerResponse} res - The response object.
 *
/*******  af5903b6-a761-47b8-9af6-6994b23bfb68  *******/const router = express.Router();

const clerk = new Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

router.get('/users', async (req, res) => {
  try {
    const users = await clerk.users.getUserList();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users from Clerk:", err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
