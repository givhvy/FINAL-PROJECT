const { getFirestore } = require('firebase-admin/firestore');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const db = getFirestore();
    const quizData = { ...req.body, createdAt: new Date().toISOString() };
    const newQuizRef = await db.collection('quizzes').add(quizData);
    res.status(201).json({ id: newQuizRef.id, ...quizData });
  } catch (err) {
    console.error("Create Quiz Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const db = getFirestore();
    const quizzesRef = db.collection('quizzes');
    const snapshot = await quizzesRef.get();

    const quizzes = await Promise.all(snapshot.docs.map(async (quizDoc) => {
      const quizData = quizDoc.data();
      let lessonData = null;

      if (quizData.lesson_id) {
        const lessonRef = db.collection('lessons').doc(quizData.lesson_id);
        const lessonSnap = await lessonRef.get();
        if (lessonSnap.exists) {
          lessonData = { id: lessonSnap.id, ...lessonSnap.data() };
        }
      }
      
      return { 
        id: quizDoc.id, 
        ...quizData,
        lesson: lessonData,
      };
    }));

    res.status(200).json(quizzes);
  } catch (err) {
    console.error("Get Quizzes Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const db = getFirestore();
    const quizRef = db.collection('quizzes').doc(req.params.id);
    const quizSnap = await quizRef.get();

    if (!quizSnap.exists) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quizData = quizSnap.data();
    let lessonData = null;

    if (quizData.lesson_id) {
      const lessonRef = db.collection('lessons').doc(quizData.lesson_id);
      const lessonSnap = await lessonRef.get();
      if (lessonSnap.exists) {
        lessonData = { id: lessonSnap.id, ...lessonSnap.data() };
      }
    }

    res.status(200).json({
      id: quizSnap.id,
      ...quizData,
      lesson: lessonData,
    });

  } catch (err) {
    console.error("Get Quiz By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('quizzes').doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    await docRef.update(req.body);
    res.status(200).json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error("Update Quiz Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('quizzes').doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    await docRef.delete();
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error("Delete Quiz Error:", err);
    res.status(500).json({ error: err.message });
  }
};