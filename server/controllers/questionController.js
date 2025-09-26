const { getFirestore } = require('firebase-admin/firestore');

// Tạo câu hỏi mới
exports.createQuestion = async (req, res) => {
  try {
    const db = getFirestore();
    const newQuestionRef = await db.collection('questions').add(req.body);
    res.status(201).json({ id: newQuestionRef.id, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy câu hỏi theo quizId
exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const db = getFirestore();
    const { quizId } = req.query; // Lấy từ query string ?quizId=...
    if (!quizId) return res.status(400).json({ error: 'Quiz ID is required' });

    const questionsRef = db.collection('questions');
    const q = questionsRef.where('quiz_id', '==', quizId);
    const snapshot = await q.get();

    const questions = [];
    snapshot.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};