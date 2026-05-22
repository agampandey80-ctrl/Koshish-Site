/**
 * Content Routes
 */

const express = require('express');
const router = express.Router();
const { getContent, updateContent } = require('../controllers/contentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getContent);
router.put('/:key', authMiddleware, updateContent);

module.exports = router;
