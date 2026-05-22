/**
 * Event Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getEvents,
  uploadEventPhoto,
  deleteEventPhoto,
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

// Multer memory storage (no disk writes — buffer goes to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  },
});

router.get('/', getEvents);
router.post('/upload', authMiddleware, upload.single('file'), uploadEventPhoto);
router.delete('/:id', authMiddleware, deleteEventPhoto);

module.exports = router;
