const { getFirestore } = require('firebase-admin/firestore');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const db = getFirestore();
    const courseData = { ...req.body, createdAt: new Date().toISOString() };
    const newCourseRef = await db.collection('courses').add(courseData);
    res.status(201).json({ id: newCourseRef.id, ...courseData });
  } catch (err) {
    console.error("Create Course Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const db = getFirestore();
    const coursesRef = db.collection('courses');
    const snapshot = await coursesRef.get();

    const courses = await Promise.all(snapshot.docs.map(async (courseDoc) => {
      const courseData = courseDoc.data();
      let teacherData = null;
      if (courseData.teacher_id) {
        const teacherRef = db.collection('users').doc(courseData.teacher_id);
        const teacherSnap = await teacherRef.get();
        if (teacherSnap.exists) {
          teacherData = { id: teacherSnap.id, ...teacherSnap.data() };
          delete teacherData.password;
        }
      }
      return { 
        id: courseDoc.id, 
        ...courseData,
        teacher: teacherData,
      };
    }));
    res.status(200).json(courses);
  } catch (err) {
    console.error("Get Courses Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const db = getFirestore();
    const courseRef = db.collection('courses').doc(req.params.id);
    const courseSnap = await courseRef.get();

    if (!courseSnap.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const courseData = courseSnap.data();
    let teacherData = null;
    const lessons = [];

    if (courseData.teacher_id) {
      const teacherRef = db.collection('users').doc(courseData.teacher_id);
      const teacherSnap = await teacherRef.get();
      if (teacherSnap.exists) {
        teacherData = { id: teacherSnap.id, ...teacherSnap.data() };
        delete teacherData.password;
      }
    }

    const lessonsRef = db.collection('lessons');
    const lessonsQuery = lessonsRef.where('course_id', '==', req.params.id);
    const lessonsSnapshot = await lessonsQuery.get();
    lessonsSnapshot.forEach(lessonDoc => {
      lessons.push({ id: lessonDoc.id, ...lessonDoc.data() });
    });

    res.status(200).json({
      id: courseSnap.id,
      ...courseData,
      teacher: teacherData,
      lessons: lessons,
    });
  } catch (err) {
    console.error("Get Course By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('courses').doc(req.params.id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Course not found' });
        }
        await docRef.update(req.body);
        res.status(200).json({ id: req.params.id, ...req.body });
    } catch (err) {
        console.error("Update Course Error:", err);
        res.status(400).json({ error: err.message });
    }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const db = getFirestore();
    const courseId = req.params.id;
    const docRef = db.collection('courses').doc(courseId);
    
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
        return res.status(404).json({ error: 'Course not found' });
    }

    const lessonsRef = db.collection('lessons');
    const lessonsQuery = lessonsRef.where('course_id', '==', courseId);
    const lessonsSnapshot = await lessonsQuery.get();
    
    const batch = db.batch();
    lessonsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    await docRef.delete();
    res.status(200).json({ message: 'Course and all related lessons deleted successfully' });
  } catch (err) {
    console.error("Delete Course Error:", err);
    res.status(500).json({ error: err.message });
  }
};