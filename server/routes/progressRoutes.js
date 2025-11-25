const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// POST /api/progress/lesson - Update lesson progress
router.post('/lesson', progressController.updateLessonProgress);

// GET /api/progress/lesson/:userId/:courseId/:lessonId - Get lesson progress
router.get('/lesson/:userId/:courseId/:lessonId', progressController.getLessonProgress);

// GET /api/progress/course/:userId/:courseId - Get course progress summary
router.get('/course/:userId/:courseId', progressController.getCourseProgress);

// GET /api/progress/completed/:userId/:courseId - Get completed lessons
router.get('/completed/:userId/:courseId', progressController.getCompletedLessons);

// GET /api/progress/user/:userId - Get all user progress
router.get('/user/:userId', progressController.getUserProgress);

// DELETE /api/progress/reset/:userId/:courseId - Reset course progress
router.delete('/reset/:userId/:courseId', progressController.resetCourseProgress);

// POST /api/progress/bulk - Bulk update lessons progress
router.post('/bulk', progressController.bulkUpdateProgress);

module.exports = router;