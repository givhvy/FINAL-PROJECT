const { getFirestore } = require('firebase-admin/firestore');
const { getDocOrThrow, ValidationError } = require('../utils/firebaseHelpers');

class Progress {
    static getDB() {
        return getFirestore();
    }

    /**
     * Update lesson progress (update)
     */
    static async updateLessonProgress(userId, courseId, lessonId, completed = true) {
        const db = this.getDB();
        if (!userId || !courseId || !lessonId) {
            throw new ValidationError('userId, courseId, and lessonId are required');
        }

        // Save to user_progress collection (snake_case to match existing data)
        const progressId = `${userId}_${courseId}_${lessonId}`;
        const progressRef = db.collection('user_progress').doc(progressId);

        const progressData = {
            user_id: userId,
            course_id: courseId,
            lesson_id: lessonId,
            progress_type: 'lesson_completed',
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        };

        await progressRef.set(progressData, { merge: true });

        // Update enrollment progress percentage
        await this.updateEnrollmentProgress(userId, courseId);

        return {
            id: progressId,
            ...progressData
        };
    }

    /**
     * Get progress for a specific lesson
     */
    static async getLessonProgress(userId, courseId, lessonId) {
        const db = this.getDB();
        const progressId = `${userId}_${courseId}_${lessonId}`;
        const doc = await db.collection('user_progress').doc(progressId).get();

        if (!doc.exists) return null;

        return {
            id: doc.id,
            ...doc.data()
        };
    }

    /**
     * Get all progress for a user's enrollment in a course
     * If courseId is not provided, returns all progress for the user
     */
    static async getByEnrollment(userId, courseId = null) {
        const db = this.getDB();

        // Query user_progress collection (where lesson completion is stored)
        let query = db.collection('user_progress')
            .where('user_id', '==', userId);

        // Add courseId filter if provided
        if (courseId) {
            query = query.where('course_id', '==', courseId);
        }

        const snapshot = await query.get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Get completed lessons for a user in a course
     */
    static async getCompletedLessons(userId, courseId) {
        const db = this.getDB();

        // Firebase uses user_progress collection with snake_case fields
        const snapshot = await db.collection('user_progress')
            .where('user_id', '==', userId)
            .where('course_id', '==', courseId)
            .where('progress_type', '==', 'lesson_completed')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Calculate completion percentage
     */
    static async calculateCompletion(userId, courseId) {
        const db = this.getDB();

        // Get total lessons in course
        const lessonsSnapshot = await db.collection('lessons')
            .where('courseId', '==', courseId)
            .get();

        const totalLessons = lessonsSnapshot.size;

        if (totalLessons === 0) return 0;

        // Get completed lessons (try camelCase first)
        let progressSnapshot = await db.collection('progress')
            .where('userId', '==', userId)
            .where('courseId', '==', courseId)
            .where('completed', '==', true)
            .get();

        // If empty, try snake_case (old schema)
        if (progressSnapshot.empty) {
            progressSnapshot = await db.collection('progress')
                .where('user_id', '==', userId)
                .where('course_id', '==', courseId)
                .where('completed', '==', true)
                .get();
        }

        const completedLessons = progressSnapshot.size;

        return Math.round((completedLessons / totalLessons) * 100);
    }

    /**
     * Update enrollment progress percentage (update)
     */
    static async updateEnrollmentProgress(userId, courseId) {
        const db = this.getDB();
        const completionPercentage = await this.calculateCompletion(userId, courseId);

        // Find enrollment (try camelCase first)
        let enrollmentSnapshot = await db.collection('enrollments')
            .where('userId', '==', userId)
            .where('courseId', '==', courseId)
            .limit(1)
            .get();

        // If empty, try snake_case (old schema)
        if (enrollmentSnapshot.empty) {
            enrollmentSnapshot = await db.collection('enrollments')
                .where('user_id', '==', userId)
                .where('course_id', '==', courseId)
                .limit(1)
                .get();
        }

        if (!enrollmentSnapshot.empty) {
            const isCompleted = completionPercentage === 100;

            await enrollmentSnapshot.docs[0].ref.update({
                progress: completionPercentage,
                completed: isCompleted,
                completedAt: isCompleted ? new Date() : null,
                updatedAt: new Date()
            });
        }

        return completionPercentage;
    }

    /**
     * Check if user has completed a specific lesson
     */
    static async isLessonCompleted(userId, courseId, lessonId) {
        const db = this.getDB();
        const progress = await this.getLessonProgress(userId, courseId, lessonId);
        return progress ? progress.completed : false;
    }

    /**
     * Get course progress summary
     */
    static async getCourseSummary(userId, courseId) {
        const db = this.getDB();
        const completionPercentage = await this.calculateCompletion(userId, courseId);
        const completedLessons = await this.getCompletedLessons(userId, courseId);

        // Get total lessons
        const totalLessonsSnapshot = await db.collection('lessons')
            .where('courseId', '==', courseId)
            .get();

        return {
            courseId,
            userId,
            totalLessons: totalLessonsSnapshot.size,
            completedLessons: completedLessons.length,
            completionPercentage,
            isCompleted: completionPercentage === 100,
            lastActivity: completedLessons.length > 0
                ? completedLessons[0].completedAt
                : null
        };
    }

    /**
     * Reset progress for a course (for retaking)
     */
    static async resetCourseProgress(userId, courseId) {
        const db = this.getDB();
        const progressDocs = await this.getByEnrollment(userId, courseId);

        const batch = db.batch();
        progressDocs.forEach(doc => {
            batch.delete(db.collection('progress').doc(doc.id));
        });

        await batch.commit();

        // Update enrollment
        await this.updateEnrollmentProgress(userId, courseId);
    }

    /**
     * Mark multiple lessons as completed
     */
    static async bulkUpdateLessons(userId, courseId, lessonIds, completed = true) {
        const db = this.getDB();
        const batch = db.batch();

        lessonIds.forEach(lessonId => {
            const progressId = `${userId}_${courseId}_${lessonId}`;
            const progressRef = db.collection('progress').doc(progressId);

            batch.set(progressRef, {
                userId,
                courseId,
                lessonId,
                completed,
                completedAt: completed ? new Date() : null,
                updatedAt: new Date()
            }, { merge: true });
        });

        await batch.commit();

        // Update enrollment progress
        await this.updateEnrollmentProgress(userId, courseId);
    }

    /**
     * Get user's overall progress across all courses
     */
    static async getUserOverallProgress(userId) {
        const db = this.getDB();

        // Get all enrollments (try camelCase first)
        let enrollmentsSnapshot = await db.collection('enrollments')
            .where('userId', '==', userId)
            .get();

        // If empty, try snake_case (old schema)
        if (enrollmentsSnapshot.empty) {
            enrollmentsSnapshot = await db.collection('enrollments')
                .where('user_id', '==', userId)
                .get();
        }

        const enrollments = enrollmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const progressData = await Promise.all(
            enrollments.map(async (enrollment) => {
                const courseId = enrollment.courseId || enrollment.course_id;
                const summary = await this.getCourseSummary(userId, courseId);
                return {
                    ...enrollment,
                    ...summary
                };
            })
        );

        return progressData;
    }

    /**
     * Get daily progress count (lessons completed today)
     * @param {string} userId - User ID
     * @returns {Promise<number>} - Count of lessons completed today
     */
    static async getDailyProgress(userId) {
        const db = this.getDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Firebase uses user_progress collection with snake_case fields
        const snapshot = await db.collection('user_progress')
            .where('user_id', '==', userId)
            .where('progress_type', '==', 'lesson_completed')
            .where('completed_at', '>=', today.toISOString())
            .get();

        return snapshot.size;
    }

    /**
     * Get weekly progress count (lessons completed this week)
     * @param {string} userId - User ID
     * @returns {Promise<number>} - Count of lessons completed this week
     */
    static async getWeeklyProgress(userId) {
        const db = this.getDB();

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Firebase uses user_progress collection with snake_case fields
        const snapshot = await db.collection('user_progress')
            .where('user_id', '==', userId)
            .where('progress_type', '==', 'lesson_completed')
            .where('completed_at', '>=', weekAgo.toISOString())
            .get();

        return snapshot.size;
    }

    /**
     * Calculate study points based on lessons and courses completed
     * @param {number} lessonsCount - Number of lessons completed
     * @param {number} coursesCount - Number of courses completed
     * @returns {number} - Total study points
     */
    static calculateStudyPoints(lessonsCount, coursesCount) {
        // 10 points per lesson, 100 bonus points per completed course
        return (lessonsCount * 10) + (coursesCount * 100);
    }
}

module.exports = Progress;
