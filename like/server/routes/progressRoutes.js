// ============================================================================
// progressRoutes.js - ROUTES cho /api/progress 📊
// ============================================================================
// 🎯 MỤC ĐÍCH: Theo dõi tiến trình học tập (giống sổ điểm ở trường)
//
// 🔍 GIẢI THÍCH ĐƠN GIẢN (cho trẻ 5 tuổi):
// - Khi bạn học xong 1 bài → cô giáo đánh dấu ✓ vào sổ điểm
// - Khi bạn muốn xem mình đã học được bao nhiêu → cô mở sổ điểm cho bạn xem
// → File này giống như SỔ ĐIỂM ĐIỆN TỬ!
//
// 6 endpoints: updateLesson + getLessonProgress + getCourseProgress + getUserProgress + reset + bulk

const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// POST /api/progress/lesson - Update lesson progress
router.post('/lesson', progressController.updateLessonProgress);

// GET /api/progress/lesson/:userId/:courseId/:lessonId - Get lesson progress
router.get('/lesson/:userId/:courseId/:lessonId', progressController.getLessonProgress);

// GET /api/progress/course/:userId/:courseId - Get course progress summary
router.get('/course/:userId/:courseId', progressController.getCourseProgress);

// GET /api/progress/user/:userId - Get all user progress
router.get('/user/:userId', progressController.getUserProgress);

// DELETE /api/progress/reset/:userId/:courseId - Reset course progress
router.delete('/reset/:userId/:courseId', progressController.resetCourseProgress);

// POST /api/progress/bulk - Bulk update lessons progress
router.post('/bulk', progressController.bulkUpdateProgress);

module.exports = router;

// ============================================================================
// TÓM TẮT: Các đường đi (routes) cho theo dõi tiến trình học tập
// ============================================================================