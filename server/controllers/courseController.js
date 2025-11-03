const { getFirestore } = require('firebase-admin/firestore');

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const db = getFirestore();
        const courseData = { ...req.body, createdAt: new Date().toISOString() };
        // Đảm bảo giá trị price là number
        if (courseData.price !== undefined) {
            courseData.price = parseFloat(courseData.price);
        }
        const newCourseRef = await db.collection('courses').add(courseData);
        res.status(201).json({ id: newCourseRef.id, ...courseData });
    } catch (err) {
        console.error("Create Course Error:", err);
        res.status(400).json({ error: err.message });
    }
};

// Get all courses (Bao gồm lessons và thông tin giảng viên)
exports.getCourses = async (req, res) => {
    try {
        const db = getFirestore();
        const coursesRef = db.collection('courses');
        const snapshot = await coursesRef.get();

        const courses = await Promise.all(snapshot.docs.map(async (courseDoc) => {
            const courseData = courseDoc.data();
            let teacherData = null;
            
            // 1. Lấy thông tin giảng viên (populate teacher)
            if (courseData.teacher_id) {
                const teacherRef = db.collection('users').doc(courseData.teacher_id);
                const teacherSnap = await teacherRef.get();
                if (teacherSnap.exists) {
                    teacherData = { id: teacherSnap.id, ...teacherSnap.data() };
                    delete teacherData.password;
                }
            }

            // 2. Lấy tất cả lessons của khóa học
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
                lessons: lessons,
            };
        }));
        res.status(200).json(courses);
    } catch (err) {
        console.error("Get Courses Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get course by ID (Bao gồm lessons và quizzes)
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

        // 1. Lấy thông tin giảng viên
        if (courseData.teacher_id) {
            const teacherRef = db.collection('users').doc(courseData.teacher_id);
            const teacherSnap = await teacherRef.get();
            if (teacherSnap.exists) {
                teacherData = { id: teacherSnap.id, ...teacherSnap.data() };
                delete teacherData.password;
            }
        }

        // 2. Lấy tất cả lessons của khóa học
        const lessons = [];
        const lessonsQuery = db.collection('lessons').where('course_id', '==', courseId);
        const lessonsSnapshot = await lessonsQuery.get();
        lessonsSnapshot.forEach(lessonDoc => {
            lessons.push({ id: lessonDoc.id, ...lessonDoc.data() });
        });

        // 3. Lấy tất cả quizzes của khóa học
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
            quizzes: quizzes,
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
        
        // Tạo payload mới, đảm bảo price là number nếu được gửi lên
        const updateData = req.body;
        if (updateData.price !== undefined) {
            updateData.price = parseFloat(updateData.price);
        }

        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        // Cập nhật tài liệu
        await docRef.update(updateData);
        
        // Trả về dữ liệu cập nhật
        res.status(200).json({ id: req.params.id, ...updateData });
    } catch (err) {
        console.error("Update Course Error:", err);
        res.status(400).json({ error: 'Failed to update course: ' + err.message });
    }
};

// Delete course (Xóa khóa học và tất cả lessons/quizzes liên quan)
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

        // 1. Xóa các lessons liên quan
        const lessonsQuery = db.collection('lessons').where('course_id', '==', courseId);
        const lessonsSnapshot = await lessonsQuery.get();
        lessonsSnapshot.forEach(doc => batch.delete(doc.ref));

        // 2. Xóa các quizzes liên quan
        const quizzesQuery = db.collection('quizzes').where('course_id', '==', courseId);
        const quizzesSnapshot = await quizzesQuery.get();
        quizzesSnapshot.forEach(doc => batch.delete(doc.ref));

        // 3. Xóa chính khóa học
        batch.delete(docRef);

        await batch.commit();

        res.status(200).json({ message: 'Course and all related content deleted successfully' });
    } catch (err) {
        console.error("Delete Course Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Approve course (Admin only)
exports.approveCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { approvedBy } = req.body;

        if (!approvedBy) {
            return res.status(400).json({ error: 'Approved by user ID is required' });
        }

        const approvedCourse = await Course.approveCourse(courseId, approvedBy);
        res.status(200).json({
            message: 'Course approved successfully',
            course: approvedCourse.toJSON()
        });
    } catch (err) {
        console.error("Approve Course Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Reject course (Admin only)
exports.rejectCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const rejectedCourse = await Course.rejectCourse(courseId, reason);
        res.status(200).json({
            message: 'Course rejected',
            course: rejectedCourse.toJSON()
        });
    } catch (err) {
        console.error("Reject Course Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Submit course for approval (Teacher)
exports.submitForApproval = async (req, res) => {
    try {
        const courseId = req.params.id;
        const submittedCourse = await Course.submitForApproval(courseId);
        res.status(200).json({
            message: 'Course submitted for approval',
            course: submittedCourse.toJSON()
        });
    } catch (err) {
        console.error("Submit Course Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get lessons for a course
exports.getCourseLessons = async (req, res) => {
    try {
        const db = getFirestore();
        const courseId = req.params.id;

        const lessonsSnapshot = await db.collection('lessons')
            .where('course_id', '==', courseId)
            .orderBy('order', 'asc')
            .get();

        const lessons = lessonsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(lessons);
    } catch (err) {
        console.error("Get Course Lessons Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get quizzes for a course
exports.getCourseQuizzes = async (req, res) => {
    try {
        const db = getFirestore();
        const courseId = req.params.id;

        const quizzesSnapshot = await db.collection('quizzes')
            .where('course_id', '==', courseId)
            .get();

        const quizzes = quizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(quizzes);
    } catch (err) {
        console.error("Get Course Quizzes Error:", err);
        res.status(500).json({ error: err.message });
    }
};