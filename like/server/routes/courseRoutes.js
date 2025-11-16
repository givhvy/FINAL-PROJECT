// ============================================================================
// courseRoutes.js - ROUTES cho /api/courses
// ============================================================================
// File này map HTTP requests → courseController functions
// 7 endpoints: CRUD courses + getCourseLessons + getCourseQuizzes

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

module.exports = router;

// ============================================================================
// TÓM TẮT: REST API endpoints cho courses
// ============================================================================