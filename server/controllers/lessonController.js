const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// Create a new lesson (checkpoint, Create in Controller)
exports.createLesson = async (req, res, next) => {
  try {
    const lessonData = { ...req.body };
    const newLesson = await Lesson.create(lessonData);
    res.status(201).json({ id: newLesson.id, ...newLesson.toJSON() });
  } catch (err) {
    console.error("Create Lesson Error:", err);
    next(err);
  }
};

// Get all lessons
// OPTIMIZED: Batch fetch courses to avoid N+1 query
exports.getLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.findAll();

    if (lessons.length === 0) {
      return res.status(200).json([]);
    }

    // Batch fetch courses using Course.findByIds() (would need to implement)
    const courseIds = [...new Set(lessons.map(l => l.courseId).filter(Boolean))];

    // Fetch all unique courses in one batch
    const courses = await Promise.all(
      courseIds.map(id => Course.findById(id))
    );
    const courseMap = Object.fromEntries(
      courses.filter(c => c !== null).map(c => [c.id, c.toJSON()])
    );

    // Enrich lessons with course data
    const enrichedLessons = lessons.map(lesson => ({
      ...lesson.toJSON(),
      course: courseMap[lesson.courseId] || null,
    }));

    res.status(200).json(enrichedLessons);
  } catch (err) {
    console.error("Get Lessons Error:", err);
    next(err);
  }
};

// Get lesson by ID
exports.getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // DEBUG: Log lesson data to see what fields exist //debug in console
    console.log('=== LESSON DATA DEBUG ===');
    console.log('Lesson ID:', req.params.id);
    console.log('Lesson object:', JSON.stringify(lesson, null, 2));
    console.log('videoUrl:', lesson.videoUrl);
    console.log('content:', lesson.content);
    console.log('description:', lesson.description);
    console.log('========================');

    let courseData = null;
    if (lesson.courseId) {
      const course = await Course.findById(lesson.courseId);
      if (course) {
        courseData = course.toJSON();
      }
    }

    res.status(200).json({
      ...lesson.toJSON(),
      course: courseData,
    });
  } catch (err) {
    console.error("Get Lesson By ID Error:", err);
    next(err);
  }
};

// Update lesson
exports.updateLesson = async (req, res, next) => {
  try {
    const updatedLesson = await Lesson.update(req.params.id, req.body);

    if (!updatedLesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.status(200).json(updatedLesson.toJSON());
  } catch (err) {
    console.error("Update Lesson Error:", err);
    next(err);
  }
};

// Delete lesson
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await Lesson.delete(req.params.id);
    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    console.error("Delete Lesson Error:", err);
    next(err);
  }
};
