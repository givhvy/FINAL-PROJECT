const Grade = require('../models/Grade');

// Create a new grade
exports.createGrade = async (req, res) => {
  try {
    const grade = await Grade.create(req.body);
    res.status(201).json({ success: true, grade });
  } catch (err) {
    console.error("Create Grade Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all grades (for admin/teacher)
exports.getGrades = async (req, res) => {
  try {
    const { userId, quizId } = req.query;

    let grades;
    if (userId) {
      grades = await Grade.findByStudent(userId);
    } else if (quizId) {
      grades = await Grade.findByQuiz(quizId);
    } else {
      // Fetch all grades for admin/teacher dashboard
      const db = Grade.getDB();
      const snapshot = await db.collection('grades').get();

      grades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by createdAt descending
      grades.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return dateB - dateA;
      });
    }

    res.status(200).json(grades);
  } catch (err) {
    console.error("Get Grades Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get grade by ID
exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    res.status(200).json(grade);
  } catch (err) {
    console.error("Get Grade By ID Error:", err);
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Get student's average
exports.getStudentAverage = async (req, res) => {
  try {
    const { userId } = req.params;
    const average = await Grade.getStudentAverage(userId);
    res.status(200).json({ userId, average });
  } catch (err) {
    console.error("Get Student Average Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get quiz statistics
exports.getQuizStats = async (req, res) => {
  try {
    const { quizId } = req.params;
    const stats = await Grade.getQuizStats(quizId);
    res.status(200).json({ quizId, ...stats });
  } catch (err) {
    console.error("Get Quiz Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update grade
exports.updateGrade = async (req, res) => {
  try {
    const updatedGrade = await Grade.update(req.params.id, req.body);
    res.status(200).json({ success: true, grade: updatedGrade });
  } catch (err) {
    console.error("Update Grade Error:", err);
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};

// Delete grade
exports.deleteGrade = async (req, res) => {
  try {
    await Grade.delete(req.params.id);
    res.status(200).json({ message: 'Grade deleted successfully' });
  } catch (err) {
    console.error("Delete Grade Error:", err);
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};
