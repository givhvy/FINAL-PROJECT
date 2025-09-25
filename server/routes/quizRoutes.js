const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/api/quizzes', quizController.getQuizzes);
router.post('/api/quizzes', quizController.createQuiz);
router.get('/api/quizzes/:id', quizController.getQuizById);
router.put('/api/quizzes/:id', quizController.updateQuiz);
router.delete('/api/quizzes/:id', quizController.deleteQuiz);

module.exports = router; 