// server/controllers/userController.js

const { getFirestore } = require('firebase-admin/firestore');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Order = require('../models/Order');
const Lesson = require('../models/Lesson');

// Create a new user
exports.createUser = async (req, res) => {
    try {
        // Sử dụng User Model
        const newUser = await User.create(req.body);
        res.status(201).json(newUser.toJSON());
    } catch (err) {
        console.error("Create User Error:", err);
        if (err.message === 'Email already in use') {
            return res.status(400).json({ error: err.message });
        }
        res.status(400).json({ error: err.message });
    }
};

// Get all users
exports.getUsers = async (req, res) => {
    try {
        // Sử dụng User Model
        const filters = {};
        if (req.query.role) {
            filters.role = req.query.role;
        }
        if (req.query.limit) {
            filters.limit = parseInt(req.query.limit);
        }

        const users = await User.findAll(filters);
        const usersJSON = users.map(user => user.toJSON());

        res.status(200).json(usersJSON);
    } catch (err) {
        console.error("Get Users Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        // Sử dụng User Model
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user.toJSON());
    } catch (err) {
        console.error("Get User By ID Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        // Sử dụng User Model
        const updatedUser = await User.update(req.params.id, req.body);

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(updatedUser.toJSON());
    } catch (err) {
        console.error("Update User Error:", err);
        if (err.message === 'User not found') {
            return res.status(404).json({ error: err.message });
        }
        res.status(400).json({ error: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        // Kiểm tra user có tồn tại không
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Sử dụng User Model để xóa
        await User.delete(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Delete User Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// NEW: Hàm lấy chi tiết tiến trình học tập của người dùng
exports.getUserProgressDetails = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid user ID provided.' });
        }

        // 1. Get user's completed orders using Order model
        const completedOrders = await Order.findByUserIdAndStatus(userId, 'completed');

        if (completedOrders.length === 0) {
            return res.status(200).json([]);
        }

        const progressData = [];
        const processedCourses = new Set(); // Prevent duplicate courses

        // 2. Process each enrolled course
        for (const order of completedOrders) {
            try {
                const courseId = order.courseId;

                // Skip if no courseId, undefined, or already processed
                if (!courseId || courseId === 'undefined' || processedCourses.has(courseId)) {
                    continue;
                }

                processedCourses.add(courseId);

                // Get course details using Course model
                const course = await Course.findById(courseId);

                if (!course) {
                    console.warn(`Course ${courseId} not found for user ${userId}`);
                    continue; // Skip if course no longer exists
                }

                // Validate course data
                if (!course.title) {
                    console.warn(`Invalid course data for course ${courseId}`);
                    continue;
                }

                // Get total lessons for this course using Lesson model
                const lessons = await Lesson.findByCourseId(courseId);
                const totalLessons = lessons.length;

                // Get completed lessons using Progress model
                const completedLessonsData = await Progress.getCompletedLessons(userId, courseId);
                const completedLessons = completedLessonsData.length;

                // Calculate progress percentage (handle edge cases)
                let percentage = 0;
                let isCompleted = false;

                if (totalLessons > 0) {
                    percentage = Math.round((completedLessons / totalLessons) * 100);
                    isCompleted = completedLessons >= totalLessons;
                } else {
                    // Course has no lessons - consider it complete
                    percentage = 100;
                    isCompleted = true;
                }

                // Ensure percentage is within bounds
                percentage = Math.max(0, Math.min(100, percentage));

                progressData.push({
                    name: course.title,
                    courseId: courseId,
                    percentage: percentage,
                    isCompleted: isCompleted,
                    completedLessons: completedLessons,
                    totalLessons: totalLessons
                });

            } catch (courseError) {
                console.error(`Error processing course for user ${userId}:`, courseError);
                // Continue processing other courses even if one fails
                continue;
            }
        }

        // Sort by completion percentage (incomplete courses first, then by progress)
        progressData.sort((a, b) => {
            if (a.isCompleted && !b.isCompleted) return 1;
            if (!a.isCompleted && b.isCompleted) return -1;
            return b.percentage - a.percentage;
        });

        res.status(200).json(progressData);

    } catch (err) {
        console.error("Get User Progress Error:", err);
        res.status(500).json({ error: 'Failed to retrieve user progress. Please try again later.' });
    }
};

// NEW: Update user role (Admin/Teacher phân quyền)
exports.updateUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        // Check if requesting user has admin privileges
        // This assumes the JWT middleware has set req.user
        if (req.user && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Only admins can update user roles.' });
        }

        // Validate input
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid user ID provided.' });
        }

        if (!role || !['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be: student, teacher, or admin.' });
        }

        // Check if user exists using User model
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Update only the role field using User model
        const updatedUser = await User.update(userId, { role: role });

        // Return success response
        res.status(200).json({
            message: `User role updated successfully to ${role}.`,
            userId: userId,
            newRole: role,
            user: updatedUser.toJSON()
        });

    } catch (err) {
        console.error("Update User Role Error:", err);
        res.status(500).json({ error: 'Failed to update user role. Please try again later.' });
    }
};

// Verify student status với educational email
exports.verifyStudent = async (req, res) => {
    try {
        const { user_id, email } = req.body;

        if (!user_id || !email) {
            return res.status(400).json({ error: 'User ID and email are required' });
        }

        // Verify student using User model
        const updatedUser = await User.verifyAsStudent(user_id, email);

        res.status(200).json({
            success: true,
            message: 'Student status verified successfully',
            user: updatedUser.toJSON()
        });

    } catch (err) {
        console.error("Verify Student Error:", err);

        // Handle specific error cases
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('does not match') || err.message.includes('educational')) {
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: 'Failed to verify student status. Please try again later.' });
    }
};