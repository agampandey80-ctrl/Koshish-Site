/**
 * Notes Routes
 */
const express = require('express');
const router = express.Router();
const { getNotes, upsertNote, deleteNote } = require('../controllers/notesController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getNotes);
router.post('/', authMiddleware, upsertNote);
router.delete('/:id', authMiddleware, deleteNote);

module.exports = router;
