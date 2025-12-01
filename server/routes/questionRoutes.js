const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// POST /api/questions -> Tạo câu hỏi mới
router.post('/', questionController.createQuestion);

// GET /api/questions -> Lấy câu hỏi (theo quizId)
router.get('/', questionController.getQuestionsByQuiz);

module.exports = router; // cho server.js xài