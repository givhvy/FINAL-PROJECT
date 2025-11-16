// ============================================================================
// questionRoutes.js - ROUTES cho /api/questions ❓
// ============================================================================
// 🎯 MỤC ĐÍCH: Quản lý câu hỏi trong bài quiz
//
// 🔍 GIẢI THÍCH ĐƠN GIẢN (cho trẻ 5 tuổi):
// - Khi cô giáo ra đề kiểm tra → cô viết nhiều câu hỏi
// - Mỗi câu hỏi có: đề bài, đáp án A B C D, đáp án đúng
// → File này giống như TẬP CÂU HỎI của đề kiểm tra!
//
// 2 endpoints: createQuestion + getQuestionsByQuiz

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// POST /api/questions -> Tạo câu hỏi mới
router.post('/', questionController.createQuestion);

// GET /api/questions -> Lấy câu hỏi (theo quizId)
router.get('/', questionController.getQuestionsByQuiz);

module.exports = router;

// ============================================================================
// TÓM TẮT: Các đường đi (routes) cho quản lý câu hỏi quiz
// ============================================================================