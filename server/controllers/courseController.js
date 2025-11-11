const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            // Ensure price is number
            price: req.body.price !== undefined ? parseFloat(req.body.price) : 0,
            // Support both camelCase and snake_case
            instructorId: req.body.instructorId || req.body.teacher_id,
            teacher_id: req.body.teacher_id || req.body.instructorId
        };

        const newCourse = await Course.create(courseData);

        res.status(201).json({
            success: true,
            data: newCourse.toJSON()
        });
    } catch (err) {
        console.error("Create Course Error:", err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get all courses (Bao gồm lessons và thông tin giảng viên)
// FR2.4: Supports filtering by category, price, and instructor
// OPTIMIZED: Uses Course.getAllWithDetails() to fix N+1 query problem
exports.getCourses = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, instructorId, instructor } = req.query;

        // Build filters for Course.getAllWithDetails()
        const filters = {};
        if (category) {
            filters.category = category;
        }
        if (instructorId) {
            filters.instructorId = instructorId;
        }

        // Get all courses with teacher and enrollment data (3 queries total instead of N+1)
        let courses = await Course.getAllWithDetails(filters);

        // Client-side filtering for price range (Firestore doesn't support range queries well)
        if (minPrice !== undefined) {
            const min = parseFloat(minPrice);
            courses = courses.filter(course => (course.price || 0) >= min);
        }

        if (maxPrice !== undefined) {
            const max = parseFloat(maxPrice);
            courses = courses.filter(course => (course.price || 0) <= max);
        }

        // Filter by instructor name
        if (instructor) {
            const instructorLower = instructor.toLowerCase();
            courses = courses.filter(course =>
                course.teacher &&
                course.teacher.name &&
                course.teacher.name.toLowerCase().includes(instructorLower)
            );
        }

        // Fetch lessons for each course (batch by courseIds)
        if (courses.length > 0) {
            const courseIds = courses.map(c => c.id);
            const allLessons = await Lesson.findByCourseIds(courseIds);

            // Group lessons by courseId
            const lessonsByCourse = {};
            allLessons.forEach(lesson => {
                if (!lessonsByCourse[lesson.courseId]) {
                    lessonsByCourse[lesson.courseId] = [];
                }
                lessonsByCourse[lesson.courseId].push(lesson);
            });

            // Attach lessons to courses
            courses = courses.map(course => ({
                ...course,
                lessons: lessonsByCourse[course.id] || []
            }));
        }

        res.status(200).json(courses);
    } catch (err) {
        console.error("Get Courses Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get course by ID (Bao gồm lessons và quizzes)
exports.getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        const courseData = course.toJSON();
        let teacherData = null;

        // 1. Lấy thông tin giảng viên
        if (courseData.instructorId || courseData.teacher_id) {
            const teacherId = courseData.instructorId || courseData.teacher_id;
            const teacher = await User.findById(teacherId);
            if (teacher) {
                teacherData = teacher.toJSON();
            }
        }

        // 2. Lấy tất cả lessons của khóa học
        const lessons = await Lesson.findByCourseId(courseId);

        // 3. Lấy tất cả quizzes của khóa học
        const Quiz = require('../models/Quiz');
        const quizzes = await Quiz.findByCourseId(courseId);

        res.status(200).json({
            success: true,
            data: {
                ...courseData,
                teacher: teacherData,
                lessons: lessons.map(l => l.toJSON()),
                quizzes: quizzes.map(q => q.toJSON()),
            }
        });
    } catch (err) {
        console.error("Get Course By ID Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update course
exports.updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Prepare update data, ensure price is number if provided
        const updateData = { ...req.body };
        if (updateData.price !== undefined) {
            updateData.price = parseFloat(updateData.price);
        }

        const updatedCourse = await Course.update(courseId, updateData);

        res.status(200).json({
            success: true,
            data: updatedCourse.toJSON()
        });
    } catch (err) {
        console.error("Update Course Error:", err);
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, error: err.message });
        } else {
            res.status(400).json({ success: false, error: 'Failed to update course: ' + err.message });
        }
    }
};

// Delete course (Xóa khóa học và tất cả lessons/quizzes liên quan)
exports.deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // 1. Delete all lessons related to this course
        const lessons = await Lesson.findByCourseId(courseId);
        for (const lesson of lessons) {
            await Lesson.delete(lesson.id);
        }

        // 2. Delete all quizzes related to this course
        const Quiz = require('../models/Quiz');
        const Question = require('../models/Question');
        const quizzes = await Quiz.findByCourseId(courseId);
        for (const quiz of quizzes) {
            // Delete questions in each quiz
            const questions = await Question.findByQuizId(quiz.id);
            for (const question of questions) {
                await Question.delete(question.id);
            }
            await Quiz.delete(quiz.id);
        }

        // 3. Delete the course itself
        await Course.delete(courseId);

        res.status(200).json({
            success: true,
            message: 'Course and all related content deleted successfully'
        });
    } catch (err) {
        console.error("Delete Course Error:", err);
        res.status(500).json({ success: false, error: err.message });
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
        const courseId = req.params.id;

        const lessons = await Lesson.findByCourseId(courseId);

        res.status(200).json({
            success: true,
            data: lessons.map(l => l.toJSON())
        });
    } catch (err) {
        console.error("Get Course Lessons Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get quizzes for a course
exports.getCourseQuizzes = async (req, res) => {
    try {
        const courseId = req.params.id;

        const Quiz = require('../models/Quiz');
        const quizzes = await Quiz.findByCourseId(courseId);

        res.status(200).json({
            success: true,
            data: quizzes.map(q => q.toJSON())
        });
    } catch (err) {
        console.error("Get Course Quizzes Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};