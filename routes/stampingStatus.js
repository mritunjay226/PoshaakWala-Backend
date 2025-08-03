import express from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import dayjs from 'dayjs';
import { requireAuth } from '../middleware/requireAuth.js'; // You’ll define this

const router = express.Router();

router.get('/status', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await clerkClient.users.getUser(userId);
    const machines = user.publicMetadata.machines || [];

    const now = dayjs();

    const status = machines.map((m) => {
      const due = dayjs(m.lastStamped).add(1, 'year');
      const daysLeft = due.diff(now, 'day');

      return {
        id: m.id,
        name: m.name,
        daysLeft,
        expired: daysLeft < 0,
        warning: daysLeft <= 30 && daysLeft >= 0,
      };
    });

    res.json({ status });
  } catch (err) {
    console.error('Failed to get stamping status:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
