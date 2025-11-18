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

        // Create quiz (Create in Controller, the course quizz)
        const quizData = {
            title,
            description: description || '',
            courseId: actualCourseId,
            course_id: actualCourseId, // Backwards compatibility
            questionCount: questions.length,
            type: 'quiz'
        };

        const newQuiz = await Quiz.create(quizData);

        // Create questions (the question inside quizz like lessons)
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

        res.status(200).json(quizzes.map(q => q.toJSON()));
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

        // DEBUG: Log raw question data
        console.log('=== DEBUG: Question data from Firestore ===');
        if (questions.length > 0) {
            console.log('First question raw data:', JSON.stringify(questions[0], null, 2));
        }

        // Return unwrapped data for consistency with courses API
        res.status(200).json({
            ...quiz.toJSON(),
            questions: questions.map(q => q.toJSON())
        });

    } catch (err) {
        console.error("Get Quiz By ID Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
// Update quiz (Update in Controller)
exports.updateQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const { title, description, questions } = req.body;

        console.log('=== UPDATE QUIZ DEBUG ===');
        console.log('Quiz ID:', quizId);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Questions received:', questions);
        console.log('Questions count:', questions ? questions.length : 0);

        // Update quiz metadata
        const updateData = {
            title,
            description,
            questionCount: questions ? questions.length : undefined
        };

        const updatedQuiz = await Quiz.update(quizId, updateData);

        if (!updatedQuiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        // If questions are provided, update them
        if (questions && Array.isArray(questions) && questions.length > 0) {
            console.log('Updating questions...');

            // Delete all existing questions for this quiz
            const existingQuestions = await Question.findByQuizId(quizId);
            console.log(`Deleting ${existingQuestions.length} existing questions`);
            for (const question of existingQuestions) {
                await Question.delete(question.id);
            }

            // Create new questions
            const createdQuestions = [];
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                console.log(`Creating question ${i + 1}:`, q);

                const questionData = {
                    quizId: quizId,
                    quiz_id: quizId,
                    questionText: q.question_text || q.questionText,
                    question_text: q.question_text || q.questionText,
                    options: q.options,
                    correctAnswer: q.correct_answer_index !== undefined ? q.correct_answer_index : q.correctAnswer,
                    correctAnswerIndex: q.correct_answer_index !== undefined ? q.correct_answer_index : q.correctAnswerIndex,
                    correct_answer_index: q.correct_answer_index !== undefined ? q.correct_answer_index : q.correctAnswer,
                    order: i
                };
                const createdQuestion = await Question.create(questionData);
                console.log('Question created with ID:', createdQuestion.id);
                createdQuestions.push(createdQuestion);
            }

            console.log(`Successfully created ${createdQuestions.length} questions`);

            // Return updated quiz with new questions
            res.status(200).json({
                success: true,
                message: 'Quiz updated successfully!',
                data: {
                    ...updatedQuiz.toJSON(),
                    questions: createdQuestions.map(q => q.toJSON())
                }
            });
        } else {
            console.log('No questions provided in request');
            res.status(200).json({
                success: true,
                message: 'Quiz metadata updated (no questions provided)',
                data: updatedQuiz.toJSON()
            });
        }
    } catch (err) {
        console.error("Update Quiz Error:", err);
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, error: err.message });
        } else {
            res.status(400).json({ success: false, error: err.message });
        }
    }
};

// Delete quiz (Delete in Controller)
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
