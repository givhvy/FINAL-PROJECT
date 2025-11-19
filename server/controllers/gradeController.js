const Grade = require('../models/Grade');
const Quiz = require('../models/Quiz');

// Create a new grade (checkpoint, Create in Controller)
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

    console.log('\n=== GET GRADES ===');
    console.log('Query params:', { userId, quizId });

    let grades;
    if (userId) {
      console.log(`Fetching grades for user: ${userId}`);
      grades = await Grade.findByStudent(userId);
      console.log(`Found ${grades.length} grades for user ${userId}`);
    } else if (quizId) {
      console.log(`Fetching grades for quiz: ${quizId}`);
      grades = await Grade.findByQuiz(quizId);
      console.log(`Found ${grades.length} grades for quiz ${quizId}`);
    } else {
      // Fetch all grades for admin/teacher dashboard
      console.log('Fetching all grades');
      const db = Grade.getDB();
      const snapshot = await db.collection('grades').get();

      grades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${grades.length} total grades`);

      // Sort by createdAt descending
      grades.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return dateB - dateA;
      });
    }

    // Populate quiz information for each grade
    console.log('Populating quiz information for grades...');
    const gradesWithQuiz = await Promise.all(grades.map(async (grade) => {
      try {
        const quiz = await Quiz.findById(grade.quiz_id);
        console.log(`Grade ${grade.id}: quiz_id=${grade.quiz_id}, quiz found=${!!quiz}`);
        return {
          ...grade,
          quiz: quiz ? quiz.toJSON() : null
        };
      } catch (err) {
        console.error(`Error fetching quiz ${grade.quiz_id}:`, err);
        return {
          ...grade,
          quiz: null
        };
      }
    }));

    // Sort by createdAt descending (most recent first)
    gradesWithQuiz.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return dateB - dateA;
    });

    console.log(`Returning ${gradesWithQuiz.length} grades with quiz info`);
    console.log('=== GET GRADES END ===\n');

    res.status(200).json(gradesWithQuiz);
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

// Update grade (checkpoint, Update in Controller)
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

// Delete grade (checkpoint, Delete in Controller)
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
