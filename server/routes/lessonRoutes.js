const express = require('express');
const router = express.Router();

// Import các hàm từ controller
const {
    createLesson,
    getLessons,
    getLessonById,
    updateLesson,
    deleteLesson
} = require('../controllers/lessonController');

// --- ĐỊNH NGHĨA CÁC ROUTE CHO /api/lessons ---

// GET /api/lessons
router.get('/', getLessons);

// POST /api/lessons
router.post('/', createLesson);

// GET /api/lessons/:id
router.get('/:id', getLessonById);

// PUT /api/lessons/:id
router.put('/:id', updateLesson);

// DELETE /api/lessons/:id
router.delete('/:id', deleteLesson);

module.exports = router;