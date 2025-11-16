// ============================================================================
// Certificate.js - Model CHỨNG CHỈ HOÀN THÀNH (certificates collection)
// ============================================================================
// Đây là MODEL CLASS định nghĩa cấu trúc và các thao tác với certificates
//
// 13 STATIC METHODS:
// CORE: generate (auto khi hoàn thành course), validateCompletion
// QUERY: findById, findByUserAndCourse, findByUser, findByCourse
// VERIFICATION: verify (by certificateId), revoke (mark as not verified)
// UTILS: generateCertificateId (format: CERT-TIMESTAMP-RANDOM), countByUser, countByCourse, delete

const { getFirestore } = require('firebase-admin/firestore');
const { getDocOrThrow, ValidationError } = require('../utils/firebaseHelpers');

class Certificate {
    static getDB() {
        return getFirestore();
    }

    /**
     * Generate certificate for course completion
     */
    static async generate(userId, courseId) {
        // Validate completion
        const { enrollment, course, user } = await this.validateCompletion(userId, courseId);

        // Check if certificate already exists
        const existing = await this.findByUserAndCourse(userId, courseId);
        if (existing) return existing;

        const db = this.getDB();
        const certRef = db.collection('certificates').doc();
        const certificateId = this.generateCertificateId(certRef.id);

        const certificate = {
            userId,
            courseId,
            courseName: course.title || 'Unknown Course',
            userName: user.name || 'Student',
            userEmail: user.email || '',
            completedAt: enrollment.completedAt || new Date(),
            issuedAt: new Date(),
            certificateId: certificateId,
            verified: true,
            grade: enrollment.finalGrade || null
        };

        await certRef.set(certificate);

        return {
            id: certRef.id,
            ...certificate
        };
    }

    /**
     * Validate course completion requirements
     */
    static async validateCompletion(userId, courseId) {
        const db = this.getDB();

        // Check enrollment (try camelCase first)
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

        if (enrollmentSnapshot.empty) {
            throw new ValidationError('User not enrolled in this course');
        }

        const enrollment = {
            id: enrollmentSnapshot.docs[0].id,
            ...enrollmentSnapshot.docs[0].data()
        };

        // Check completion status
        if (!enrollment.completed) {
            throw new ValidationError('Course not completed yet');
        }

        // Get course details
        const course = await getDocOrThrow('courses', courseId, 'Course not found');

        // Get user details
        const user = await getDocOrThrow('users', userId, 'User not found');

        return { enrollment, course, user };
    }

    /**
     * Find certificate by ID
     */
    static async findById(certId) {
        const db = this.getDB();
        return await getDocOrThrow('certificates', certId, 'Certificate not found');
    }

    /**
     * Find certificate by user and course
     */
    static async findByUserAndCourse(userId, courseId) {
        const db = this.getDB();

        // Try camelCase first (new schema)
        let snapshot = await db.collection('certificates')
            .where('userId', '==', userId)
            .where('courseId', '==', courseId)
            .limit(1)
            .get();

        // If empty, try snake_case (old schema)
        if (snapshot.empty) {
            snapshot = await db.collection('certificates')
                .where('user_id', '==', userId)
                .where('course_id', '==', courseId)
                .limit(1)
                .get();
        }

        if (snapshot.empty) return null;

        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        };
    }

    /**
     * Find all certificates by user
     */
    static async findByUser(userId) {
        const db = this.getDB();

        // Try camelCase first (new schema)
        let snapshot = await db.collection('certificates')
            .where('userId', '==', userId)
            .get();

        // If empty, try snake_case (old schema)
        if (snapshot.empty) {
            snapshot = await db.collection('certificates')
                .where('user_id', '==', userId)
                .get();
        }

        // Sort in memory to avoid index requirement
        const certificates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        certificates.sort((a, b) => {
            const dateA = a.issuedAt?.toDate?.() || a.issuedAt || a.issued_at?.toDate?.() || a.issued_at || new Date(0);
            const dateB = b.issuedAt?.toDate?.() || b.issuedAt || b.issued_at?.toDate?.() || b.issued_at || new Date(0);
            return dateB - dateA; // descending
        });

        return certificates;
    }

    /**
     * Find all certificates for a course
     */
    static async findByCourse(courseId) {
        const db = this.getDB();

        // Try camelCase first (new schema)
        let snapshot = await db.collection('certificates')
            .where('courseId', '==', courseId)
            .get();

        // If empty, try snake_case (old schema)
        if (snapshot.empty) {
            snapshot = await db.collection('certificates')
                .where('course_id', '==', courseId)
                .get();
        }

        // Sort in memory to avoid index requirement
        const certificates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        certificates.sort((a, b) => {
            const dateA = a.issuedAt?.toDate?.() || a.issuedAt || a.issued_at?.toDate?.() || a.issued_at || new Date(0);
            const dateB = b.issuedAt?.toDate?.() || b.issuedAt || b.issued_at?.toDate?.() || b.issued_at || new Date(0);
            return dateB - dateA; // descending
        });

        return certificates;
    }

    /**
     * Verify certificate by certificate ID
     */
    static async verify(certificateId) {
        const db = this.getDB();
        const snapshot = await db.collection('certificates')
            .where('certificateId', '==', certificateId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            throw new ValidationError('Invalid certificate ID');
        }

        const cert = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        };

        if (!cert.verified) {
            throw new ValidationError('Certificate not verified');
        }

        return cert;
    }

    /**
     * Revoke certificate
     */
    static async revoke(certId) {
        const db = this.getDB();
        await db.collection('certificates').doc(certId).update({
            verified: false,
            revokedAt: new Date(),
            updatedAt: new Date()
        });

        return await this.findById(certId);
    }

    /**
     * Delete certificate
     */
    static async delete(certId) {
        const db = this.getDB();
        await db.collection('certificates').doc(certId).delete();
    }

    /**
     * Generate unique certificate ID
     * Format: CERT-TIMESTAMP-RANDOM
     */
    static generateCertificateId(docId) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `CERT-${timestamp}-${random}`;
    }

    /**
     * Get certificate count for a user
     */
    static async countByUser(userId) {
        const db = this.getDB();

        // Try camelCase first (new schema)
        let snapshot = await db.collection('certificates')
            .where('userId', '==', userId)
            .get();

        // If empty, try snake_case (old schema)
        if (snapshot.empty) {
            snapshot = await db.collection('certificates')
                .where('user_id', '==', userId)
                .get();
        }

        return snapshot.size;
    }

    /**
     * Get certificate count for a course
     */
    static async countByCourse(courseId) {
        const db = this.getDB();

        // Try camelCase first (new schema)
        let snapshot = await db.collection('certificates')
            .where('courseId', '==', courseId)
            .get();

        // If empty, try snake_case (old schema)
        if (snapshot.empty) {
            snapshot = await db.collection('certificates')
                .where('course_id', '==', courseId)
                .get();
        }

        return snapshot.size;
    }
}

module.exports = Certificate;

// ============================================================================
// TÓM TẬT: Model quản lý certificates với auto-generation và verification
// KEY: db.collection('certificates'), generate() validates enrollment completion first,
// generateCertificateId() uses Date.now().toString(36) + random, verify() checks certificateId
// ============================================================================
