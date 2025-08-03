import fs from 'fs';
import path from 'path';

const THEME_FILE = path.resolve('theme.json');

export const getTheme = (req, res) => {
  try {
    if (!fs.existsSync(THEME_FILE)) {
      fs.writeFileSync(THEME_FILE, JSON.stringify({}));
    }
    const theme = JSON.parse(fs.readFileSync(THEME_FILE));
    res.json(theme);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load theme.' });
  }
};

export const updateTheme = (req, res) => {
  try {
    fs.writeFileSync(THEME_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save theme.' });
  }
};
