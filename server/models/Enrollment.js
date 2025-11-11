const { getFirestore } = require('firebase-admin/firestore');

/**
 * Enrollment Model
 * Tracks user enrollments in courses
 */
class Enrollment {
    constructor(data) {
        this.id = data.id || null;

        // Support both camelCase and snake_case for backwards compatibility
        this.userId = data.userId || data.user_id;
        this.user_id = data.user_id || data.userId; // Keep for backwards compat

        this.courseId = data.courseId || data.course_id;
        this.course_id = data.course_id || data.courseId; // Keep for backwards compat

        this.enrolledAt = data.enrolledAt || data.enrolled_at || new Date().toISOString();
        this.enrolled_at = data.enrolled_at || data.enrolledAt || new Date().toISOString();

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

            // Try camelCase first (new schema)
            let snapshot = await db.collection('enrollments')
                .where('userId', '==', userId)
                .get();

            // If empty, try snake_case (old schema)
            if (snapshot.empty) {
                snapshot = await db.collection('enrollments')
                    .where('user_id', '==', userId)
                    .get();
            }

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

            // Try camelCase first (new schema)
            let snapshot = await db.collection('enrollments')
                .where('courseId', '==', courseId)
                .get();

            // If empty, try snake_case (old schema)
            if (snapshot.empty) {
                snapshot = await db.collection('enrollments')
                    .where('course_id', '==', courseId)
                    .get();
            }

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

            // Try camelCase first (new schema)
            let snapshot = await db.collection('enrollments')
                .where('userId', '==', userId)
                .where('courseId', '==', courseId)
                .get();

            // If empty, try snake_case (old schema)
            if (snapshot.empty) {
                snapshot = await db.collection('enrollments')
                    .where('user_id', '==', userId)
                    .where('course_id', '==', courseId)
                    .get();
            }

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
     * Update enrollment status (update in CRUD)
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

    /**
     * Count enrollments by multiple courses (fixes N+1 query problem)
     * @param {Array<string>} courseIds - Array of course IDs
     * @returns {Promise<Object>} - Object with courseId as key and count as value
     */
    static async countByCourses(courseIds) {
        try {
            if (!courseIds || courseIds.length === 0) return {};

            const db = this.getDB();
            const uniqueIds = [...new Set(courseIds)]; // Remove duplicates

            // Firestore 'in' query limit is 10
            const chunkSize = 10;
            const chunks = [];
            for (let i = 0; i < uniqueIds.length; i += chunkSize) {
                chunks.push(uniqueIds.slice(i, i + chunkSize));
            }

            // Fetch all chunks in parallel (try both camelCase and snake_case)
            const promisesCamelCase = chunks.map(chunk =>
                db.collection('enrollments')
                    .where('courseId', 'in', chunk)
                    .get()
            );

            const promisesSnakeCase = chunks.map(chunk =>
                db.collection('enrollments')
                    .where('course_id', 'in', chunk)
                    .get()
            );

            const snapshots = await Promise.all([...promisesCamelCase, ...promisesSnakeCase]);

            // Count enrollments per course (support both field names)
            const counts = {};
            snapshots.forEach(snapshot => {
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const courseId = data.courseId || data.course_id;
                    if (courseId) {
                        counts[courseId] = (counts[courseId] || 0) + 1;
                    }
                });
            });

            return counts;
        } catch (error) {
            throw new Error(`Error counting enrollments by courses: ${error.message}`);
        }
    }

    /**
     * Check if user is enrolled in course
     * @param {string} userId - User ID
     * @param {string} courseId - Course ID
     * @returns {Promise<boolean>} - true if enrolled
     */
    static async isEnrolled(userId, courseId) {
        try {
            const enrollment = await this.findOne(userId, courseId);
            return enrollment !== null;
        } catch (error) {
            throw new Error(`Error checking enrollment: ${error.message}`);
        }
    }
}

module.exports = Enrollment;
