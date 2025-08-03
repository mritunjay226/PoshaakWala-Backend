import { verifySessionToken } from '@clerk/clerk-sdk-node';

export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const session = await verifySessionToken(token);
    req.auth = session;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
