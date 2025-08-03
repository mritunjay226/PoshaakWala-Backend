// middlewares/multer.js
import multer from 'multer';

const storage = multer.memoryStorage(); // ✅ Store files in memory (RAM)

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WEBP images are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
    files: 5,
  },
  fileFilter,
});

export default upload;
