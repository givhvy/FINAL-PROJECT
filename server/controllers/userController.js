// server/controllers/userController.js

const { getFirestore } = require('firebase-admin/firestore');

// Create a new user (Hàm này đã đúng, không cần sửa)
exports.createUser = async (req, res) => {
    try {
        const db = getFirestore();
        // SỬA LẠI: Dùng db.collection(...).add(...)
        const newUserRef = await db.collection('users').add(req.body);
        res.status(201).json({ id: newUserRef.id, ...req.body });
    } catch (err) {
        console.error("Create User Error:", err);
        res.status(400).json({ error: err.message });
    }
};

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const db = getFirestore();
        // SỬA LẠI: Dùng db.collection(...)
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get(); // SỬA LẠI: Dùng .get()

        const users = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            delete data.password; // Không trả về mật khẩu
            users.push({ id: doc.id, ...data });
        });

        res.status(200).json(users);
    } catch (err) {
        console.error("Get Users Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const db = getFirestore();
        // SỬA LẠI: Dùng db.collection(...).doc(...)
        const docRef = db.collection('users').doc(req.params.id);
        const docSnap = await docRef.get(); // SỬA LẠI: Dùng .get()

        if (docSnap.exists) {
            const data = docSnap.data();
            delete data.password;
            res.status(200).json({ id: docSnap.id, ...data });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error("Get User By ID Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('users').doc(req.params.id);
        
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // SỬA LẠI: Dùng .update()
        await docRef.update(req.body);
        res.status(200).json({ id: req.params.id, ...req.body });
    } catch (err) {
        console.error("Update User Error:", err);
        res.status(400).json({ error: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('users').doc(req.params.id);
        
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        // SỬA LẠI: Dùng .delete()
        await docRef.delete();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Delete User Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// NEW: Hàm lấy chi tiết tiến trình học tập của người dùng
exports.getUserProgressDetails = async (req, res) => {
    try {
        const db = getFirestore();
        const userId = req.params.id;

        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid user ID provided.' });
        }

        // 1. Get user's enrolled courses from orders collection
        const ordersRef = db.collection('orders');
        const userOrdersQuery = ordersRef.where('user_id', '==', userId).where('status', '==', 'completed');
        const ordersSnapshot = await userOrdersQuery.get();

        if (ordersSnapshot.empty) {
            return res.status(200).json([]);
        }

        const progressData = [];
        const processedCourses = new Set(); // Prevent duplicate courses

        // 2. Process each enrolled course
        for (const orderDoc of ordersSnapshot.docs) {
            try {
                const order = orderDoc.data();
                const courseId = order.course_id;

                // Skip if no course_id or already processed
                if (!courseId || processedCourses.has(courseId)) {
                    continue;
                }

                processedCourses.add(courseId);

                // Get course details
                const courseRef = db.collection('courses').doc(courseId);
                const courseSnap = await courseRef.get();

                if (!courseSnap.exists) {
                    console.warn(`Course ${courseId} not found for user ${userId}`);
                    continue; // Skip if course no longer exists
                }

                const courseData = courseSnap.data();

                // Validate course data
                if (!courseData || !courseData.title) {
                    console.warn(`Invalid course data for course ${courseId}`);
                    continue;
                }

                // Get total lessons for this course
                const lessonsQuery = db.collection('lessons').where('course_id', '==', courseId);
                const lessonsSnapshot = await lessonsQuery.get();
                const totalLessons = lessonsSnapshot.size;

                // Get completed lessons for this user and course
                const progressQuery = db.collection('user_progress')
                    .where('user_id', '==', userId)
                    .where('course_id', '==', courseId)
                    .where('progress_type', '==', 'lesson_completed');
                const progressSnapshot = await progressQuery.get();
                const completedLessons = progressSnapshot.size;

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
                    name: courseData.title,
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