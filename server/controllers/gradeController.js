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

// Create a new grade
exports.createGrade = async (req, res) => {
  try {
    const db = getFirestore();
    const gradeData = { ...req.body, createdAt: new Date().toISOString() };
    const newGradeRef = await addDoc(collection(db, 'grades'), gradeData);
    res.status(201).json({ id: newGradeRef.id, ...gradeData });
  } catch (err) {
    console.error("Create Grade Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all grades (với logic "populate" thủ công)
exports.getGrades = async (req, res) => {
  try {
    const db = getFirestore();
    const gradesSnapshot = await getDocs(collection(db, 'grades'));

    const grades = await Promise.all(gradesSnapshot.docs.map(async (gradeDoc) => {
      const gradeData = gradeDoc.data();
      let userData = null;
      let quizData = null;

      // Lấy thông tin user (populate user)
      if (gradeData.user_id) {
        const userSnap = await getDoc(doc(db, 'users', gradeData.user_id));
        if (userSnap.exists()) {
          userData = { id: userSnap.id, ...userSnap.data() };
          delete userData.password;
        }
      }

      // Lấy thông tin quiz (populate quiz)
      if (gradeData.quiz_id) {
        const quizSnap = await getDoc(doc(db, 'quizzes', gradeData.quiz_id));
        if (quizSnap.exists()) {
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

// Get grade by ID (với logic "populate" thủ công)
exports.getGradeById = async (req, res) => {
  try {
    const db = getFirestore();
    const gradeRef = doc(db, 'grades', req.params.id);
    const gradeSnap = await getDoc(gradeRef);

    if (!gradeSnap.exists()) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    const gradeData = gradeSnap.data();
    let userData = null;
    let quizData = null;

    // Lấy thông tin user (populate user)
    if (gradeData.user_id) {
        const userSnap = await getDoc(doc(db, 'users', gradeData.user_id));
        if (userSnap.exists()) {
          userData = { id: userSnap.id, ...userSnap.data() };
          delete userData.password;
        }
    }

    // Lấy thông tin quiz (populate quiz)
    if (gradeData.quiz_id) {
        const quizSnap = await getDoc(doc(db, 'quizzes', gradeData.quiz_id));
        if (quizSnap.exists()) {
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
    const docRef = doc(db, 'grades', req.params.id);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    await updateDoc(docRef, req.body);
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
    const docRef = doc(db, 'grades', req.params.id);
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    await deleteDoc(docRef);
    res.status(200).json({ message: 'Grade deleted successfully' });
  } catch (err) {
    console.error("Delete Grade Error:", err);
    res.status(500).json({ error: err.message });
  }
};