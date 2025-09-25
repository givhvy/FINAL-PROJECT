const express = require('express');
const router = express.Router();

// Import các hàm từ controller mà chúng ta đã sửa
const { 
    createCourse, 
    getCourses, 
    getCourseById, 
    updateCourse, 
    deleteCourse 
} = require('../controllers/courseController');

// --- ĐỊNH NGHĨA CÁC ROUTE CHO /api/courses ---

// GET /api/courses -> Lấy tất cả khóa học
router.get('/', getCourses);

// POST /api/courses -> Tạo khóa học mới
router.post('/', createCourse);

// GET /api/courses/:id -> Lấy 1 khóa học theo ID
router.get('/:id', getCourseById);

// PUT /api/courses/:id -> Cập nhật khóa học
// (Lưu ý: PUT hoặc PATCH đều được, PUT thường dùng để thay thế toàn bộ)
router.put('/:id', updateCourse);

// DELETE /api/courses/:id -> Xóa khóa học
router.delete('/:id', deleteCourse);


module.exports = router;