const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');

// Update lesson progress
exports.updateLessonProgress = async (req, res) => {
  try {
    const { userId, courseId, lessonId, completed } = req.body;

    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({ error: 'userId, courseId, and lessonId are required' });
    }

    const progress = await Progress.updateLessonProgress(userId, courseId, lessonId, completed);

    // Check if course is completed and auto-generate certificate
    const completion = await Progress.calculateCompletion(userId, courseId);
    let certificateGenerated = false;

    if (completion >= 100) {
      try {
        await Certificate.generate(userId, courseId);
        certificateGenerated = true;
      } catch (err) {
        // Certificate might already exist, that's okay
        console.log('Certificate generation skipped:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      progress,
      completion,
      certificateGenerated
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get lesson progress
exports.getLessonProgress = async (req, res) => {
  try {
    const { userId, courseId, lessonId } = req.params;
    const progress = await Progress.getLessonProgress(userId, courseId, lessonId);

    res.status(200).json(progress || { completed: false });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get course progress summary
exports.getCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const summary = await Progress.getCourseSummary(userId, courseId);

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all user progress
exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.query;

    const progress = await Progress.getByEnrollment(userId, courseId);

    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reset course progress
exports.resetCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    await Progress.resetCourseProgress(userId, courseId);

    res.status(200).json({ // response to front end 
      success: true,
      message: 'Course progress reset successfully'
    });
  } catch (error) { // catch bugs
    console.error('Error resetting progress:', error);
    res.status(500).json({ error: error.message });
  }
};



// Bulk update lessons progress
exports.bulkUpdateProgress = async (req, res) => {
  try {
    const { userId, courseId, lessonIds, completed } = req.body;

    if (!userId || !courseId || !Array.isArray(lessonIds)) {
      return res.status(400).json({ error: 'userId, courseId, and lessonIds array are required' });
    }

    await Progress.bulkUpdateLessons(userId, courseId, lessonIds, completed);

    // Calculate new completion
    const completion = await Progress.calculateCompletion(userId, courseId);

    res.status(200).json({ 
      success: true,
      updated: lessonIds.length,
      completion
    });
  } catch (error) {
    console.error('Error bulk updating progress:', error);
    res.status(500).json({ error: error.message });
  }
};
