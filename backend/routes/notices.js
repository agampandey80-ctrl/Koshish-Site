/**
 * Notice Routes
 */

const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getNotices);
router.post('/', authMiddleware, createNotice);
router.put('/:id', authMiddleware, updateNotice);
router.delete('/:id', authMiddleware, deleteNotice);

module.exports = router;
