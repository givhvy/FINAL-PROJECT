const { getFirestore } = require('firebase-admin/firestore');

// Create a new course (Giữ nguyên)
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

// Get all courses (Giữ nguyên)
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

            // MỚI: Lấy cả lessons cho TeacherDashboard
            const lessons = [];
            const lessonsQuery = db.collection('lessons').where('course_id', '==', courseDoc.id);
            const lessonsSnapshot = await lessonsQuery.get();
            lessonsSnapshot.forEach(lessonDoc => {
                lessons.push({ id: lessonDoc.id, ...lessonDoc.data() });
            });

            return { 
                id: courseDoc.id, 
                ...courseData,
                teacher: teacherData,
                lessons: lessons, // Thêm lessons vào đây
            };
        }));
        res.status(200).json(courses);
    } catch (err) {
        console.error("Get Courses Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// SỬA LẠI: Get course by ID để lấy cả lessons và quizzes
exports.getCourseById = async (req, res) => {
    try {
        const db = getFirestore();
        const courseId = req.params.id;
        const courseRef = db.collection('courses').doc(courseId);
        const courseSnap = await courseRef.get();

        if (!courseSnap.exists) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const courseData = courseSnap.data();
        let teacherData = null;

        // Lấy thông tin giảng viên
        if (courseData.teacher_id) {
            const teacherRef = db.collection('users').doc(courseData.teacher_id);
            const teacherSnap = await teacherRef.get();
            if (teacherSnap.exists) {
                teacherData = { id: teacherSnap.id, ...teacherSnap.data() };
                delete teacherData.password;
            }
        }

        // Lấy tất cả lessons của khóa học
        const lessons = [];
        const lessonsQuery = db.collection('lessons').where('course_id', '==', courseId);
        const lessonsSnapshot = await lessonsQuery.get();
        lessonsSnapshot.forEach(lessonDoc => {
            lessons.push({ id: lessonDoc.id, ...lessonDoc.data() });
        });

        // MỚI: Lấy tất cả quizzes của khóa học
        const quizzes = [];
        const quizzesQuery = db.collection('quizzes').where('course_id', '==', courseId);
        const quizzesSnapshot = await quizzesQuery.get();
        quizzesSnapshot.forEach(quizDoc => {
            quizzes.push({ id: quizDoc.id, ...quizDoc.data() });
        });

        res.status(200).json({
            id: courseSnap.id,
            ...courseData,
            teacher: teacherData,
            lessons: lessons,
            quizzes: quizzes, // Thêm quizzes vào response
        });
    } catch (err) {
        console.error("Get Course By ID Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Update course (Giữ nguyên)
exports.updateCourse = async (req, res) => {
    // ... code không đổi
};

// Delete course (Sửa lại để xóa cả quizzes)
exports.deleteCourse = async (req, res) => {
    try {
        const db = getFirestore();
        const courseId = req.params.id;
        const docRef = db.collection('courses').doc(courseId);
        
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const batch = db.batch();

        // Xóa các lessons liên quan
        const lessonsQuery = db.collection('lessons').where('course_id', '==', courseId);
        const lessonsSnapshot = await lessonsQuery.get();
        lessonsSnapshot.forEach(doc => batch.delete(doc.ref));

        // MỚI: Xóa các quizzes liên quan
        const quizzesQuery = db.collection('quizzes').where('course_id', '==', courseId);
        const quizzesSnapshot = await quizzesQuery.get();
        quizzesSnapshot.forEach(doc => batch.delete(doc.ref));

        // Xóa chính khóa học
        batch.delete(docRef);

        await batch.commit();

        res.status(200).json({ message: 'Course and all related content deleted successfully' });
    } catch (err) {
        console.error("Delete Course Error:", err);
        res.status(500).json({ error: err.message });
    }
};