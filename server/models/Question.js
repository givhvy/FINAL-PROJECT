const { getFirestore } = require('firebase-admin/firestore');

/**
 * Question Model
 * Xử lý tất cả các thao tác liên quan đến câu hỏi trong Firestore
 */
class Question {
    constructor(data) {
        this.id = data.id || null;

        // Support both camelCase and snake_case for backwards compatibility
        this.quizId = data.quizId || data.quiz_id;
        this.quiz_id = data.quiz_id || data.quizId; // Keep for backwards compat

        this.questionText = data.questionText || data.question_text;
        this.question_text = data.question_text || data.questionText;

        this.questionType = data.questionType || data.question_type || 'multiple-choice';
        this.question_type = data.question_type || data.questionType || 'multiple-choice';

        this.options = data.options || []; // Array of options for multiple-choice

        this.correctAnswer = data.correctAnswer || data.correct_answer;
        this.correct_answer = data.correct_answer || data.correctAnswer;

        this.points = data.points || 1;
        this.explanation = data.explanation || ''; // Giải thích đáp án
        this.order = data.order || 0;

        this.createdAt = data.createdAt || data.created_at || new Date().toISOString();
        this.created_at = data.created_at || data.createdAt || new Date().toISOString();

        this.updatedAt = data.updatedAt || data.updated_at || new Date().toISOString();
        this.updated_at = data.updated_at || data.updatedAt || new Date().toISOString();
    }

    /**
     * Lấy instance của Firestore
     */
    static getDB() {
        return getFirestore();
    }

    /**
     * Tìm câu hỏi theo ID
     * @param {string} id - Question ID
     * @returns {Promise<Question|null>} - Question object hoặc null
     */
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('questions').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new Question({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding question by ID: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả câu hỏi
     * @param {Object} filters - Bộ lọc (quizId, questionType, etc.)
     * @returns {Promise<Array<Question>>} - Mảng Question objects
     */
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();

            // Try camelCase first (new schema)
            let query = db.collection('questions');

            // Áp dụng bộ lọc theo quizId
            if (filters.quizId) {
                query = query.where('quizId', '==', filters.quizId);
            }

            // Áp dụng bộ lọc theo questionType
            if (filters.questionType) {
                query = query.where('questionType', '==', filters.questionType);
            }

            // Don't use orderBy with where clause to avoid index requirement
            // We'll sort in memory instead

            // Limit
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            let snapshot = await query.get();

            // If empty and we had filters, try snake_case (old schema)
            if (snapshot.empty && (filters.quizId || filters.questionType)) {
                query = db.collection('questions');

                if (filters.quizId) {
                    query = query.where('quiz_id', '==', filters.quizId);
                }

                if (filters.questionType) {
                    query = query.where('question_type', '==', filters.questionType);
                }

                if (filters.limit) {
                    query = query.limit(filters.limit);
                }

                snapshot = await query.get();
            }

            // Map and sort in memory
            const questions = snapshot.docs.map(doc => new Question({ id: doc.id, ...doc.data() }));
            questions.sort((a, b) => (a.order || 0) - (b.order || 0));

            return questions;
        } catch (error) {
            throw new Error(`Error finding all questions: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả câu hỏi của một quiz
     * @param {string} quizId - Quiz ID
     * @returns {Promise<Array<Question>>} - Mảng Question objects
     */
    static async findByQuizId(quizId) {
        try {
            return await this.findAll({ quizId });
        } catch (error) {
            throw new Error(`Error finding questions by quiz ID: ${error.message}`);
        }
    }

    /**
     * Tạo câu hỏi mới (Create in CRUD)
     * @param {Object} questionData - Dữ liệu câu hỏi
     * @returns {Promise<Question>} - Question object đã tạo
     */
    static async create(questionData) {
        try {
            const db = this.getDB();

            const newQuestion = new Question({
                ...questionData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const docRef = await db.collection('questions').add({
                quizId: newQuestion.quizId,
                questionText: newQuestion.questionText,
                questionType: newQuestion.questionType,
                options: newQuestion.options,
                correctAnswer: newQuestion.correctAnswer,
                points: newQuestion.points,
                explanation: newQuestion.explanation,
                order: newQuestion.order,
                createdAt: newQuestion.createdAt,
                updatedAt: newQuestion.updatedAt
            });

            newQuestion.id = docRef.id;
            return newQuestion;
        } catch (error) {
            throw new Error(`Error creating question: ${error.message}`);
        }
    }

    /**
     * Cập nhật câu hỏi (Update in CRUD)
     * @param {string} id - Question ID
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Promise<Question>} - Question object đã cập nhật
     */
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const questionRef = db.collection('questions').doc(id);
            const doc = await questionRef.get();

            if (!doc.exists) {
                throw new Error('Question not found');
            }

            updateData.updatedAt = new Date().toISOString();
            await questionRef.update(updateData);

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating question: ${error.message}`);
        }
    }

    /**
     * Xóa câu hỏi (Delete in CRUD)
     * @param {string} id - Question ID
     * @returns {Promise<boolean>} - true nếu xóa thành công
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('questions').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting question: ${error.message}`);
        }
    }

    /**
     * Thay đổi thứ tự câu hỏi (reorder)
     * @param {string} id - Question ID
     * @param {number} newOrder - Thứ tự mới
     * @returns {Promise<Question>} - Question object đã cập nhật
     */
    static async reorder(id, newOrder) {
        try {
            const db = this.getDB();
            const questionRef = db.collection('questions').doc(id);
            const doc = await questionRef.get();

            if (!doc.exists) {
                throw new Error('Question not found');
            }

            await questionRef.update({
                order: newOrder,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error reordering question: ${error.message}`);
        }
    }

    /**
     * Kiểm tra câu trả lời
     * @param {string|Array} answer - Câu trả lời của học sinh
     * @returns {boolean} - true nếu đúng
     */
    checkAnswer(answer) {
        if (Array.isArray(this.correctAnswer)) {
            // Đối với câu hỏi nhiều đáp án
            return JSON.stringify(answer.sort()) === JSON.stringify(this.correctAnswer.sort());
        } else {
            // Đối với câu hỏi một đáp án
            return answer === this.correctAnswer ||
                   answer.toString().toLowerCase() === this.correctAnswer.toString().toLowerCase();
        }
    }

    /**
     * Lấy câu hỏi không có đáp án (để gửi cho học sinh)
     * @returns {Object} - Question object không có correctAnswer
     */
    toStudentJSON() {
        const obj = { ...this };
        delete obj.correctAnswer;
        delete obj.explanation;
        return obj;
    }

    /**
     * Chuyển đổi thành object đơn giản
     * @returns {Object} - Question object
     */
    toJSON() {
        return { ...this };
    }
}

module.exports = Question;
