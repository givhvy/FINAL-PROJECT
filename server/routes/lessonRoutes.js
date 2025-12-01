const express = require('express');
const router = express.Router();

// Import các hàm từ controller
const {
    createLesson,
    getLessons,
    getLessonById,
    updateLesson,
    deleteLesson,
    reorderContent
} = require('../controllers/lessonController');

// --- ĐỊNH NGHĨA CÁC ROUTE CHO /api/lessons ---

// GET /api/lessons
router.get('/', getLessons);

// POST /api/lessons
router.post('/', createLesson);

// POST /api/lessons/reorder - Bulk reorder content
router.post('/reorder', reorderContent);

// GET /api/lessons/:id
router.get('/:id', getLessonById);

// PUT /api/lessons/:id
router.put('/:id', updateLesson);

// DELETE /api/lessons/:id
router.delete('/:id', deleteLesson);

module.exports = router; // cho server.js xài