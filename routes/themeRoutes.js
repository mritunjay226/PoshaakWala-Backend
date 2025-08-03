import express from 'express';
import { getTheme, updateTheme } from '../controllers/themeController.js';

const router = express.Router();

router.get('/', getTheme);
router.put('/', updateTheme);

export default router;
