const { getFirestore } = require('firebase-admin/firestore');

/**
 * Enrollment Model
 * Tracks user enrollments in courses
 */
class Enrollment {
    constructor(data) {
        this.id = data.id || null;
        this.userId = data.userId;
        this.courseId = data.courseId;
        this.enrolledAt = data.enrolledAt || new Date().toISOString();
        this.status = data.status || 'active'; // 'active', 'completed', 'dropped'
    }

    /**
     * Get Firestore instance
     */
    static getDB() {
        return getFirestore();
    }

    /**
     * Find all enrollments for a user
     * @param {string} userId - User ID
     * @returns {Promise<Array<Enrollment>>} - Array of enrollments
     */
    static async findByUserId(userId) {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('enrollments')
                .where('userId', '==', userId)
                .get();

            return snapshot.docs.map(doc => new Enrollment({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error finding enrollments by user: ${error.message}`);
        }
    }

    /**
     * Find all enrollments for a course
     * @param {string} courseId - Course ID
     * @returns {Promise<Array<Enrollment>>} - Array of enrollments
     */
    static async findByCourseId(courseId) {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('enrollments')
                .where('courseId', '==', courseId)
                .get();

            return snapshot.docs.map(doc => new Enrollment({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error finding enrollments by course: ${error.message}`);
        }
    }

    /**
     * Find a specific enrollment
     * @param {string} userId - User ID
     * @param {string} courseId - Course ID
     * @returns {Promise<Enrollment|null>} - Enrollment or null
     */
    static async findOne(userId, courseId) {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('enrollments')
                .where('userId', '==', userId)
                .where('courseId', '==', courseId)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return new Enrollment({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding enrollment: ${error.message}`);
        }
    }

    /**
     * Create a new enrollment
     * @param {Object} enrollmentData - Enrollment data
     * @returns {Promise<Enrollment>} - Created enrollment
     */
    static async create(enrollmentData) {
        try {
            const db = this.getDB();

            // Check if enrollment already exists
            const existing = await this.findOne(enrollmentData.userId, enrollmentData.courseId);
            if (existing) {
                return existing;
            }

            const newEnrollment = new Enrollment(enrollmentData);

            const docRef = await db.collection('enrollments').add({
                userId: newEnrollment.userId,
                courseId: newEnrollment.courseId,
                enrolledAt: newEnrollment.enrolledAt,
                status: newEnrollment.status
            });

            newEnrollment.id = docRef.id;
            return newEnrollment;
        } catch (error) {
            throw new Error(`Error creating enrollment: ${error.message}`);
        }
    }

    /**
     * Update enrollment status
     * @param {string} id - Enrollment ID
     * @param {string} status - New status
     * @returns {Promise<Enrollment>} - Updated enrollment
     */
    static async updateStatus(id, status) {
        try {
            const db = this.getDB();
            await db.collection('enrollments').doc(id).update({ status });

            const doc = await db.collection('enrollments').doc(id).get();
            return new Enrollment({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error updating enrollment status: ${error.message}`);
        }
    }

    /**
     * Delete an enrollment
     * @param {string} id - Enrollment ID
     * @returns {Promise<boolean>} - true if deleted
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('enrollments').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting enrollment: ${error.message}`);
        }
    }

    /**
     * Count active enrollments for a user
     * @param {string} userId - User ID
     * @returns {Promise<number>} - Count of active enrollments
     */
    static async countActiveEnrollments(userId) {
        try {
            const enrollments = await this.findByUserId(userId);
            return enrollments.filter(e => e.status === 'active').length;
        } catch (error) {
            throw new Error(`Error counting enrollments: ${error.message}`);
        }
    }
}

module.exports = Enrollment;
