const { getFirestore } = require('firebase-admin/firestore');
const { getDocOrThrow, ValidationError } = require('../utils/firebaseHelpers');

class Grade {
    static getDB() {
        return getFirestore();
    }

    /**
     * Create a new grade (create in crud) (checkpoint)
     */
    static async create(gradeData) {
        this.validate(gradeData);

        const db = this.getDB();
        const gradeRef = db.collection('grades').doc();
        const grade = {
            userId: gradeData.userId,
            quizId: gradeData.quizId,
            courseId: gradeData.courseId,
            score: gradeData.score,
            totalQuestions: gradeData.totalQuestions || 0,
            correctAnswers: gradeData.correctAnswers || 0,
            answers: gradeData.answers || [],
            timeSpent: gradeData.timeSpent || 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await gradeRef.set(grade);

        return {
            id: gradeRef.id,
            ...grade
        };
    }

    /**
     * Find grade by ID
     */
    static async findById(gradeId) {
        return await getDocOrThrow('grades', gradeId, 'Grade not found');
    }

    /**
     * Find grades by quiz
     */
    static async findByQuiz(quizId) {
        const db = this.getDB();

        // Firebase uses snake_case quiz_id
        const snapshot = await db.collection('grades')
            .where('quiz_id', '==', quizId)
            .get();

        // Sort by score in memory to avoid index requirement
        const grades = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        grades.sort((a, b) => (b.score || 0) - (a.score || 0)); // descending

        return grades;
    }

    /**
     * Find grades by student
     */
    static async findByStudent(userId) {
        const db = this.getDB();

        // Firebase uses snake_case user_id
        const snapshot = await db.collection('grades')
            .where('user_id', '==', userId)
            .get();

        // Sort by createdAt in memory to avoid index requirement
        const grades = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        grades.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
            const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
            return dateB - dateA; // descending
        });

        return grades;
    }

    /**
     * Find grade by user and quiz
     */
    static async findByUserAndQuiz(userId, quizId) {
        const db = this.getDB();

        // Firebase uses snake_case user_id and quiz_id
        const snapshot = await db.collection('grades')
            .where('user_id', '==', userId)
            .where('quiz_id', '==', quizId)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        };
    }

    /**
     * Calculate average score for a quiz
     */
    static calculateAverage(grades) {
        if (grades.length === 0) return 0;
        const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
        return Math.round((sum / grades.length) * 100) / 100;
    }

    /**
     * Calculate student's average across all courses
     */
    static async getStudentAverage(userId) {
        const grades = await this.findByStudent(userId);
        return this.calculateAverage(grades);
    }

    /**
     * Get quiz statistics (total attempts, average score, highest score, lowest score)
     */
    static async getQuizStats(quizId) {
        const grades = await this.findByQuiz(quizId);

        if (grades.length === 0) {
            return {
                totalAttempts: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0
            };
        }

        const scores = grades.map(g => g.score);

        return {
            totalAttempts: grades.length,
            averageScore: this.calculateAverage(grades),
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores)
        };
    }

    /**
     * Update grade (update in crud)
     */
    static async update(gradeId, updateData) {
        const db = this.getDB();
        await db.collection('grades').doc(gradeId).update({
            ...updateData,
            updatedAt: new Date()
        });

        return await this.findById(gradeId);
    }

    /**
     * Delete grade (delete in crud)
     */
    static async delete(gradeId) {
        const db = this.getDB();
        await db.collection('grades').doc(gradeId).delete();
    }

    /**
     * Validate grade data (check if correct, if not then error)
     */
    static validate(data) {
        if (!data.userId) {
            throw new ValidationError('User ID is required');
        }

        if (!data.quizId) {
            throw new ValidationError('Quiz ID is required');
        }

        if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) {
            throw new ValidationError('Score must be a number between 0 and 100');
        }

        if (data.totalQuestions && typeof data.totalQuestions !== 'number') {
            throw new ValidationError('Total questions must be a number');
        }

        if (data.correctAnswers && typeof data.correctAnswers !== 'number') {
            throw new ValidationError('Correct answers must be a number');
        }
    }
}

module.exports = Grade;
