const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Helper function to normalize options to array format
function normalizeOptions(options) {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    // Convert object {A, B, C, D} to array
    return [options.A || '', options.B || '', options.C || '', options.D || ''].filter(o => o);
}

// Helper function to normalize correct answer to index (0, 1, 2, 3)
function normalizeCorrectAnswer(answer) {
    if (answer === undefined || answer === null) return 0;
    // If it's already a number, return it
    if (typeof answer === 'number') return answer;
    // If it's a letter (A, B, C, D), convert to index
    if (typeof answer === 'string') {
        const letterMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
        if (letterMap[answer] !== undefined) return letterMap[answer];
        // Try parsing as number
        const parsed = parseInt(answer);
        if (!isNaN(parsed)) return parsed;
    }
    return 0;
}

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
            // Normalize options to array format and correctAnswer to index
            const normalizedOptions = normalizeOptions(q.options);
            const normalizedCorrectAnswer = normalizeCorrectAnswer(q.correct_answer_index ?? q.correctAnswer);
            
            const questionData = {
                quizId: newQuiz.id,
                quiz_id: newQuiz.id, // Backwards compatibility
                questionText: q.question_text || q.questionText,
                question_text: q.question_text || q.questionText, // Backwards compatibility
                options: normalizedOptions,
                correctAnswer: normalizedCorrectAnswer,
                correctAnswerIndex: normalizedCorrectAnswer,
                correct_answer_index: normalizedCorrectAnswer // Backwards compatibility
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

        console.log(`\n=== GET QUIZ BY ID: ${quizId} ===`);

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        // Get all questions for this quiz
        const questions = await Question.findByQuizId(quizId);

        console.log(`Found ${questions.length} questions for quiz ${quizId}`);
        if (questions.length > 0) {
            questions.forEach((q, i) => {
                console.log(`Question ${i + 1}:`, {
                    id: q.id,
                    quiz_id: q.quiz_id,
                    questionText: q.questionText || q.question_text,
                    optionsCount: q.options?.length
                });
            });
        } else {
            console.log('No questions found - this quiz has no questions in Firestore');
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

        console.log(`\n=== UPDATE QUIZ: ${quizId} ===`);
        console.log('Title:', title);
        console.log('Description:', description);
        console.log('Questions received:', questions ? questions.length : 0);

        if (questions && questions.length > 0) {
            console.log('First question preview:', {
                question_text: questions[0].question_text || questions[0].questionText,
                options: questions[0].options,
                correct_answer_index: questions[0].correct_answer_index
            });
        }

        // Update quiz metadata - filter out undefined values
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (questions && questions.length > 0) updateData.questionCount = questions.length;

        const updatedQuiz = await Quiz.update(quizId, updateData);

        if (!updatedQuiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        console.log('Quiz metadata updated successfully');

        // If questions are provided, update them
        if (questions && Array.isArray(questions) && questions.length > 0) {
            console.log(`Processing ${questions.length} questions...`);
            // Delete all existing questions for this quiz
            const existingQuestions = await Question.findByQuizId(quizId);
            for (const question of existingQuestions) {
                await Question.delete(question.id);
            }

            // Create new questions
            const createdQuestions = [];
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                // Normalize options to array format and correctAnswer to index
                const normalizedOptions = normalizeOptions(q.options);
                const normalizedCorrectAnswer = normalizeCorrectAnswer(q.correct_answer_index ?? q.correctAnswer);
                
                const questionData = {
                    quizId: quizId,
                    quiz_id: quizId,
                    questionText: q.question_text || q.questionText,
                    question_text: q.question_text || q.questionText,
                    options: normalizedOptions,
                    correctAnswer: normalizedCorrectAnswer,
                    correctAnswerIndex: normalizedCorrectAnswer,
                    correct_answer_index: normalizedCorrectAnswer,
                    order: i
                };
                const createdQuestion = await Question.create(questionData);
                createdQuestions.push(createdQuestion);
            }

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
