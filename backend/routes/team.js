/**
 * Team Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getTeam,
  addMember,
  updateMember,
  deleteMember,
} = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  },
});

router.get('/', getTeam);
router.post('/', authMiddleware, upload.single('photo'), addMember);
router.put('/:id', authMiddleware, upload.single('photo'), updateMember);
router.delete('/:id', authMiddleware, deleteMember);

module.exports = router;
