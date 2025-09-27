const { getFirestore } = require('firebase-admin/firestore');

// Mark lesson as complete
exports.markLessonComplete = async (req, res) => {
  try {
    const db = getFirestore();
    const { lesson_id, course_id, user_id } = req.body;

    const progressData = {
      user_id,
      lesson_id,
      course_id,
      completed_at: new Date().toISOString(),
      progress_type: 'lesson_completed'
    };

    const newProgressRef = await db.collection('user_progress').add(progressData);
    res.status(201).json({ id: newProgressRef.id, ...progressData });
  } catch (err) {
    console.error("Progress Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get user progress for a course
exports.getUserProgress = async (req, res) => {
  try {
    const db = getFirestore();
    const { userId, courseId } = req.params;

    const progressRef = db.collection('user_progress');
    const q = progressRef.where('user_id', '==', userId).where('course_id', '==', courseId);
    const snapshot = await q.get();

    const progress = [];
    snapshot.forEach(doc => {
      progress.push({ id: doc.id, ...doc.data() });
    });

    res.json(progress);
  } catch (err) {
    console.error("Get Progress Error:", err);
    res.status(500).json({ error: err.message });
  }
};