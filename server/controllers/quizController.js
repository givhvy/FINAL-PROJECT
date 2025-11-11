const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Create a new quiz
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, course_id, courseId, questions } = req.body;

        // Support both snake_case and camelCase
        const actualCourseId = courseId || course_id;

        if (!title || !actualCourseId || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Quiz title, course ID, and at least one question are required.' });
        }

        // Create quiz
        const quizData = {
            title,
            description: description || '',
            courseId: actualCourseId,
            course_id: actualCourseId, // Backwards compatibility
            questionCount: questions.length,
            type: 'quiz'
        };

        const newQuiz = await Quiz.create(quizData);

        // Create questions
        const createdQuestions = [];
        for (const q of questions) {
            const questionData = {
                quizId: newQuiz.id,
                quiz_id: newQuiz.id, // Backwards compatibility
                questionText: q.question_text || q.questionText,
                question_text: q.question_text || q.questionText, // Backwards compatibility
                options: q.options,
                correctAnswer: q.correct_answer_index !== undefined ? q.correct_answer_index : q.correctAnswer,
                correct_answer_index: q.correct_answer_index !== undefined ? q.correct_answer_index : q.correctAnswer // Backwards compatibility
            };
            const createdQuestion = await Question.create(questionData);
            createdQuestions.push(createdQuestion);
        }

        res.status(201).json({
            success: true,
            message: 'Quiz and questions created successfully!',
            data: {
                id: newQuiz.id,
                ...newQuiz.toJSON(),
                questions: createdQuestions.map(q => q.toJSON())
            }
        });

    } catch (err) {
        console.error("Create Quiz Error:", err);
        res.status(500).json({ success: false, error: 'Failed to create quiz.', details: err.message });
    }
};

// Get all quizzes
exports.getQuizzes = async (req, res) => {
    try {
        const filters = {};

        // Support both camelCase and snake_case
        if (req.query.courseId || req.query.course_id) {
            filters.courseId = req.query.courseId || req.query.course_id;
        }

        if (req.query.lessonId || req.query.lesson_id) {
            filters.lessonId = req.query.lessonId || req.query.lesson_id;
        }

        if (req.query.isPublished !== undefined) {
            filters.isPublished = req.query.isPublished === 'true';
        }

        if (req.query.limit) {
            filters.limit = parseInt(req.query.limit);
        }

        const quizzes = await Quiz.findAll(filters);

        res.status(200).json({
            success: true,
            data: quizzes.map(q => q.toJSON())
        });
    } catch (err) {
        console.error("Get Quizzes Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
    try {
        const quizId = req.params.id;

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        // Get all questions for this quiz
        const questions = await Question.findByQuizId(quizId);

        res.status(200).json({
            success: true,
            data: {
                ...quiz.toJSON(),
                questions: questions.map(q => q.toJSON())
            }
        });

    } catch (err) {
        console.error("Get Quiz By ID Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
// Update quiz
exports.updateQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;

        const updatedQuiz = await Quiz.update(quizId, req.body);

        if (!updatedQuiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        res.status(200).json({
            success: true,
            data: updatedQuiz.toJSON()
        });
    } catch (err) {
        console.error("Update Quiz Error:", err);
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, error: err.message });
        } else {
            res.status(400).json({ success: false, error: err.message });
        }
    }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;

        // Check if quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        // Delete all questions associated with this quiz
        const questions = await Question.findByQuizId(quizId);
        for (const question of questions) {
            await Question.delete(question.id);
        }

        // Delete the quiz
        await Quiz.delete(quizId);

        res.status(200).json({
            success: true,
            message: 'Quiz and all associated questions deleted successfully'
        });
    } catch (err) {
        console.error("Delete Quiz Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
