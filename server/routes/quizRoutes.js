const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// GET /api/quizzes
router.get('/', quizController.getQuizzes);
// POST /api/quizzes
router.post('/', quizController.createQuiz);
// GET /api/quizzes/:id
router.get('/:id', quizController.getQuizById);
// PUT /api/quizzes/:id
router.put('/:id', quizController.updateQuiz);
// DELETE /api/quizzes/:id
router.delete('/:id', quizController.deleteQuiz);

module.exports = router; // cho server.js xài