// Import các hàm cần thiết từ Firestore
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} = require('firebase-admin/firestore');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const db = getFirestore();
    const quizData = { ...req.body, createdAt: new Date().toISOString() };
    const newQuizRef = await addDoc(collection(db, 'quizzes'), quizData);
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
    const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));

    const quizzes = await Promise.all(quizzesSnapshot.docs.map(async (quizDoc) => {
      const quizData = quizDoc.data();
      let lessonData = null;

      // Lấy thông tin lesson (populate lesson)
      if (quizData.lesson_id) {
        const lessonSnap = await getDoc(doc(db, 'lessons', quizData.lesson_id));
        if (lessonSnap.exists()) {
          lessonData = { id: lessonSnap.id, ...lessonSnap.data() };
        }
      }
      
      return { 
        id: quizDoc.id, 
        ...quizData,
        lesson: lessonData, // Thêm thông tin lesson vào kết quả
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
    const quizRef = doc(db, 'quizzes', req.params.id);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quizData = quizSnap.data();
    let lessonData = null;

    // Lấy thông tin lesson (populate lesson)
    if (quizData.lesson_id) {
      const lessonSnap = await getDoc(doc(db, 'lessons', quizData.lesson_id));
      if (lessonSnap.exists()) {
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
    const docRef = doc(db, 'quizzes', req.params.id);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    await updateDoc(docRef, req.body);
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
    const docRef = doc(db, 'quizzes', req.params.id);
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    await deleteDoc(docRef);
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error("Delete Quiz Error:", err);
    res.status(500).json({ error: err.message });
  }
};