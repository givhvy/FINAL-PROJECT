const { getFirestore } = require('firebase-admin/firestore');

// Create a new quiz
exports.createQuiz = async (req, res) => {
    try {
        const db = getFirestore();
        const { title, description, course_id, questions } = req.body;

        if (!title || !course_id || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Quiz title, course ID, and at least one question are required.' });
        }

        const batch = db.batch();
        const newQuizRef = db.collection('quizzes').doc();
        
        const quizData = {
            title,
            description: description || '',
            course_id,
            createdAt: new Date().toISOString(),
            questionCount: questions.length,
            type: 'quiz'
        };
        batch.set(newQuizRef, quizData);

        questions.forEach(q => {
            const newQuestionRef = db.collection('questions').doc();
            const questionData = {
                quiz_id: newQuizRef.id,
                question_text: q.question_text,
                options: q.options,
                correct_answer_index: q.correct_answer_index
            };
            batch.set(newQuestionRef, questionData);
        });

        await batch.commit();

        res.status(201).json({
            message: 'Quiz and questions created successfully!',
            quizId: newQuizRef.id,
            ...quizData
        });

    } catch (err) {
        console.error("Create Quiz Error:", err);
        res.status(500).json({ error: 'Failed to create quiz.', details: err.message });
    }
};

// Get all quizzes
exports.getQuizzes = async (req, res) => {
    try {
        const db = getFirestore();
        let query = db.collection('quizzes');

        if (req.query.courseId) {
            query = query.where('course_id', '==', req.query.courseId);
        }

        const snapshot = await query.get();
        
        const quizzes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(quizzes);
    } catch (err) {
        console.error("Get Quizzes Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
    try {
        const db = getFirestore();
        const quizRef = db.collection('quizzes').doc(req.params.id);
        const quizSnap = await quizRef.get();

        // SỬA LẠI: .exists là một thuộc tính, không phải hàm
        if (!quizSnap.exists) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        res.status(200).json({ id: quizSnap.id, ...quizSnap.data() });

    } catch (err) {
        console.error("Get Quiz By ID Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('quizzes').doc(req.params.id);
        const docSnap = await docRef.get();

        // SỬA LẠI: .exists là một thuộc tính, không phải hàm
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        await docRef.update(req.body);
        res.status(200).json({ id: req.params.id, ...req.body });
    } catch (err) {
        console.error("Update Quiz Error:", err);
        res.status(400).json({ error: err.message });
    }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('quizzes').doc(req.params.id);
        const docSnap = await docRef.get();

        // SỬA LẠI: .exists là một thuộc tính, không phải hàm
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        await docRef.delete();
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        console.error("Delete Quiz Error:", err);
        res.status(500).json({ error: err.message });
    }
};
