const Question = require('../models/Question');

// Tạo câu hỏi mới
exports.createQuestion = async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      // Support both camelCase and snake_case
      quizId: req.body.quizId || req.body.quiz_id,
      quiz_id: req.body.quiz_id || req.body.quizId,
      questionText: req.body.questionText || req.body.question_text,
      question_text: req.body.question_text || req.body.questionText,
      questionType: req.body.questionType || req.body.question_type,
      question_type: req.body.question_type || req.body.questionType,
      correctAnswer: req.body.correctAnswer || req.body.correct_answer,
      correct_answer: req.body.correct_answer || req.body.correctAnswer
    };

    const newQuestion = await Question.create(questionData);

    res.status(201).json({
      success: true,
      data: newQuestion.toJSON()
    });
  } catch (err) {
    console.error("Create Question Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// Lấy câu hỏi theo quizId
exports.getQuestionsByQuiz = async (req, res) => {
  try {
    // Support both camelCase and snake_case
    const quizId = req.query.quizId || req.query.quiz_id;

    if (!quizId) {
      return res.status(400).json({ success: false, error: 'Quiz ID is required' });
    }

    const questions = await Question.findByQuizId(quizId);

    res.status(200).json({
      success: true,
      data: questions.map(q => q.toJSON())
    });
  } catch (err) {
    console.error("Get Questions By Quiz Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};