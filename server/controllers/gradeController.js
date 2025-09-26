const { getFirestore } = require('firebase-admin/firestore');

// Create a new grade
exports.createGrade = async (req, res) => {
  try {
    const db = getFirestore();
    const gradeData = { ...req.body, createdAt: new Date().toISOString() };
    const newGradeRef = await db.collection('grades').add(gradeData);
    res.status(201).json({ id: newGradeRef.id, ...gradeData });
  } catch (err) {
    console.error("Create Grade Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all grades
exports.getGrades = async (req, res) => {
  try {
    const db = getFirestore();
    const gradesRef = db.collection('grades');
    const snapshot = await gradesRef.get();

    const grades = await Promise.all(snapshot.docs.map(async (gradeDoc) => {
      const gradeData = gradeDoc.data();
      let userData = null;
      let quizData = null;

      if (gradeData.user_id) {
        const userRef = db.collection('users').doc(gradeData.user_id);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          userData = { id: userSnap.id, ...userSnap.data() };
          delete userData.password;
        }
      }

      if (gradeData.quiz_id) {
        const quizRef = db.collection('quizzes').doc(gradeData.quiz_id);
        const quizSnap = await quizRef.get();
        if (quizSnap.exists) {
          quizData = { id: quizSnap.id, ...quizSnap.data() };
        }
      }
      
      return { 
        id: gradeDoc.id, 
        ...gradeData,
        user: userData,
        quiz: quizData,
      };
    }));

    res.status(200).json(grades);
  } catch (err) {
    console.error("Get Grades Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get grade by ID
exports.getGradeById = async (req, res) => {
  try {
    const db = getFirestore();
    const gradeRef = db.collection('grades').doc(req.params.id);
    const gradeSnap = await gradeRef.get();

    if (!gradeSnap.exists) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    const gradeData = gradeSnap.data();
    let userData = null;
    let quizData = null;

    if (gradeData.user_id) {
        const userRef = db.collection('users').doc(gradeData.user_id);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          userData = { id: userSnap.id, ...userSnap.data() };
          delete userData.password;
        }
    }

    if (gradeData.quiz_id) {
        const quizRef = db.collection('quizzes').doc(gradeData.quiz_id);
        const quizSnap = await quizRef.get();
        if (quizSnap.exists) {
          quizData = { id: quizSnap.id, ...quizSnap.data() };
        }
    }

    res.status(200).json({
      id: gradeSnap.id,
      ...gradeData,
      user: userData,
      quiz: quizData,
    });

  } catch (err) {
    console.error("Get Grade By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update grade
exports.updateGrade = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('grades').doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    await docRef.update(req.body);
    res.status(200).json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error("Update Grade Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete grade
exports.deleteGrade = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('grades').doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    await docRef.delete();
    res.status(200).json({ message: 'Grade deleted successfully' });
  } catch (err) {
    console.error("Delete Grade Error:", err);
    res.status(500).json({ error: err.message });
  }
};