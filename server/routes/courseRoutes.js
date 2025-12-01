const express = require('express');
const router = express.Router();

// Import các hàm từ controller mà chúng ta đã sửa
const {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCourseLessons,
    getCourseQuizzes
} = require('../controllers/courseController');

// --- ĐỊNH NGHĨA CÁC ROUTE CHO /api/courses ---

// GET /api/courses -> Lấy tất cả khóa học
router.get('/', getCourses);

// POST /api/courses -> Tạo khóa học mới
router.post('/', createCourse);

// GET /api/courses/:id -> Lấy 1 khóa học theo ID
router.get('/:id', getCourseById);

// PUT /api/courses/:id -> Cập nhật khóa học
router.put('/:id', updateCourse);

// DELETE /api/courses/:id -> Xóa khóa học
router.delete('/:id', deleteCourse);

// Get course content
router.get('/:id/lessons', getCourseLessons);
router.get('/:id/quizzes', getCourseQuizzes);

// POST /api/courses/:id/enroll -> Enroll user in course
router.post('/:id/enroll', async (req, res) => {
    try {
        const Enrollment = require('../models/Enrollment');
        const { userId } = req.body;
        const courseId = req.params.id;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            userId,
            courseId,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            enrollment
        });
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; // cho server.js xài