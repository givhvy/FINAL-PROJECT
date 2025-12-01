const { getFirestore } = require('firebase-admin/firestore');

// Quiz class , firestore collection 'quizzes'
class Quiz {
    constructor(data) {
        this.id = data.id || null;

        // Backwards compatibility: support both camelCase and snake_case
        this.courseId = data.courseId || data.course_id;
        this.course_id = data.course_id || data.courseId; // Keep for backwards compat

        this.lessonId = data.lessonId || data.lesson_id || null;
        this.lesson_id = data.lesson_id || data.lessonId || null;

        this.title = data.title;
        this.description = data.description || '';
        this.duration = data.duration || 0; // Duration in minutes

        this.passingScore = data.passingScore || data.passing_score || 70;
        this.passing_score = data.passing_score || data.passingScore || 70;

        this.totalPoints = data.totalPoints || data.total_points || 0;
        this.total_points = data.total_points || data.totalPoints || 0;

        this.isPublished = data.isPublished !== undefined ? data.isPublished : false;

        this.order = data.order || 0;

        this.createdAt = data.createdAt || data.created_at || new Date().toISOString();
        this.created_at = data.created_at || data.createdAt || new Date().toISOString();

        this.updatedAt = data.updatedAt || data.updated_at || new Date().toISOString();
        this.updated_at = data.updated_at || data.updatedAt || new Date().toISOString();
    }

    //
    // Lấy instance của Firestore
    //
    static getDB() {
        return getFirestore();
    }

    //
    // Tìm quiz theo ID
    //
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('quizzes').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new Quiz({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding quiz by ID: ${error.message}`);
        }
    }

    //
    // Lấy tất cả quiz
    //
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('quizzes');

            // Áp dụng bộ lọc theo courseId - Firebase uses snake_case course_id
            if (filters.courseId) {
                query = query.where('course_id', '==', filters.courseId);
            }

            // Áp dụng bộ lọc theo lessonId - Firebase uses snake_case lesson_id
            if (filters.lessonId) {
                query = query.where('lesson_id', '==', filters.lessonId);
            }

            // Áp dụng bộ lọc theo isPublished
            if (filters.isPublished !== undefined) {
                query = query.where('isPublished', '==', filters.isPublished);
            }

            const snapshot = await query.get();
            let quizzes = snapshot.docs.map(doc => new Quiz({ id: doc.id, ...doc.data() }));

            // Sort by order in memory to avoid composite index requirement
            quizzes.sort((a, b) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                return orderA - orderB; // Ascending order
            });

            // Limit after sorting
            if (filters.limit) {
                quizzes = quizzes.slice(0, filters.limit);
            }

            return quizzes;
        } catch (error) {
            throw new Error(`Error finding all quizzes: ${error.message}`);
        }
    }

    //
    // Lấy tất cả quiz của một khóa học
    //
    static async findByCourseId(courseId) {
        try {
            return await this.findAll({ courseId });
        } catch (error) {
            throw new Error(`Error finding quizzes by course ID: ${error.message}`);
        }
    }

    //
    // Lấy quiz của một bài học
    //
    static async findByLessonId(lessonId) {
        try {
            return await this.findAll({ lessonId });
        } catch (error) {
            throw new Error(`Error finding quizzes by lesson ID: ${error.message}`);
        }
    }

    //
    // Tạo quiz mới (Create in CRUD)
    //
    static async create(quizData) {
        try {
            const db = this.getDB();

            const newQuiz = new Quiz({
                ...quizData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const docRef = await db.collection('quizzes').add({
                courseId: newQuiz.courseId,
                course_id: newQuiz.courseId,  // Add snake_case for Firestore queries
                lessonId: newQuiz.lessonId,
                lesson_id: newQuiz.lessonId,  // Add snake_case for Firestore queries
                title: newQuiz.title,
                description: newQuiz.description,
                duration: newQuiz.duration,
                passingScore: newQuiz.passingScore,
                totalPoints: newQuiz.totalPoints,
                isPublished: newQuiz.isPublished,
                order: newQuiz.order,
                createdAt: newQuiz.createdAt,
                updatedAt: newQuiz.updatedAt
            });

            newQuiz.id = docRef.id;
            return newQuiz;
        } catch (error) {
            throw new Error(`Error creating quiz: ${error.message}`);
        }
    }

    //
    // Cập nhật quiz (Update in CRUD)
    //
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const quizRef = db.collection('quizzes').doc(id);
            const doc = await quizRef.get();

            if (!doc.exists) {
                throw new Error('Quiz not found');
            }

            updateData.updatedAt = new Date().toISOString();
            await quizRef.update(updateData);

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating quiz: ${error.message}`);
        }
    }

    //
    // Xóa quiz (Delete in CRUD)
    //
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('quizzes').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting quiz: ${error.message}`);
        }
    }

// Publish/Unpublish quiz
    static async togglePublish(id, isPublished) {
        try {
            const db = this.getDB();
            const quizRef = db.collection('quizzes').doc(id);
            const doc = await quizRef.get();

            if (!doc.exists) {
                throw new Error('Quiz not found');
            }

            await quizRef.update({
                isPublished: isPublished,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error toggling publish status: ${error.message}`);
        }
    }

    //
    // Cập nhật tổng điểm của quiz
    //
    static async updateTotalPoints(id, totalPoints) {
        try {
            const db = this.getDB();
            const quizRef = db.collection('quizzes').doc(id);
            const doc = await quizRef.get();

            if (!doc.exists) {
                throw new Error('Quiz not found');
            }

            await quizRef.update({
                totalPoints: totalPoints,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating total points: ${error.message}`);
        }
    }

    //
    // Thay đổi thứ tự quiz
    //
    static async reorder(id, newOrder) {
        try {
            const db = this.getDB();
            const quizRef = db.collection('quizzes').doc(id);
            const doc = await quizRef.get();

            if (!doc.exists) {
                throw new Error('Quiz not found');
            }

            await quizRef.update({
                order: newOrder,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error reordering quiz: ${error.message}`);
        }
    }

    //
    // Chuyển đổi thành object đơn giản
    //
    toJSON() {
        return { ...this };
    }
}

module.exports = Quiz;
