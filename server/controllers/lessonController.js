const { getFirestore } = require('firebase-admin/firestore');

// Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    const db = getFirestore();
    const lessonData = { ...req.body, createdAt: new Date().toISOString() };
    const newLessonRef = await db.collection('lessons').add(lessonData);
    res.status(201).json({ id: newLessonRef.id, ...lessonData });
  } catch (err) {
    console.error("Create Lesson Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all lessons
exports.getLessons = async (req, res) => {
  try {
    const db = getFirestore();
    const lessonsRef = db.collection('lessons');
    const snapshot = await lessonsRef.get();

    const lessons = await Promise.all(snapshot.docs.map(async (lessonDoc) => {
      const lessonData = lessonDoc.data();
      let courseData = null;

      if (lessonData.course_id) {
        const courseRef = db.collection('courses').doc(lessonData.course_id);
        const courseSnap = await courseRef.get();
        if (courseSnap.exists) { // Chú ý: Dòng này đúng
          courseData = { id: courseSnap.id, ...courseSnap.data() };
        }
      }
      
      return { 
        id: lessonDoc.id, 
        ...lessonData,
        course: courseData,
      };
    }));

    res.status(200).json(lessons);
  } catch (err) {
    console.error("Get Lessons Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get lesson by ID
exports.getLessonById = async (req, res) => {
  try {
    const db = getFirestore();
    const lessonRef = db.collection('lessons').doc(req.params.id);
    const lessonSnap = await lessonRef.get();

    // *** DÒNG NÀY ĐÃ ĐƯỢC SỬA LẠI ***
    if (!lessonSnap.exists) { // Bỏ cặp dấu ngoặc () đi
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lessonData = lessonSnap.data();
    let courseData = null;

    if (lessonData.course_id) {
      const courseRef = db.collection('courses').doc(lessonData.course_id);
      const courseSnap = await courseRef.get();
      if (courseSnap.exists) { // Dòng này đúng
        courseData = { id: courseSnap.id, ...courseSnap.data() };
      }
    }

    res.status(200).json({
      id: lessonSnap.id,
      ...lessonData,
      course: courseData,
    });

  } catch (err) {
    console.error("Get Lesson By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('lessons').doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) { // Sửa lại ở đây
      return res.status(404).json({ error: 'Lesson not found' });
    }
    await docRef.update(req.body);
    res.status(200).json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error("Update Lesson Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection('lessons').doc(req.params.id);
    
    const docSnap = await docRef.get();
    if (!docSnap.exists) { // Sửa lại ở đây
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await docRef.delete();
    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    console.error("Delete Lesson Error:", err);
    res.status(500).json({ error: err.message });
  }
};