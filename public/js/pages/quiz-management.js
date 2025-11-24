/**
 * Quiz Management Page JavaScript
 * Handles quiz creation and question management for teachers
 */

// ==================== GLOBAL VARIABLES ====================
const token = localStorage.getItem('token');
let quizId = null;
let lessonId = null;

// ==================== AUTH GUARD ====================
if (!token) {
    window.location.href = '/login';
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Get lessonId from URL
    const urlParams = new URLSearchParams(window.location.search);
    lessonId = urlParams.get('lessonId');
    
    if (!lessonId) {
        alert('No lesson selected.');
        window.location.href = '/teacher';
        return;
    }

    setupEventListeners();
    await findOrCreateQuizForLesson();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Add question form
    document.getElementById('add-question-form').addEventListener('submit', handleAddQuestion);

    // Delete question buttons (delegated)
    document.getElementById('questions-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-question-btn')) {
            const questionId = e.target.dataset.questionId;
            handleDeleteQuestion(questionId);
        }
    });
}

// ==================== QUIZ MANAGEMENT ====================
async function findOrCreateQuizForLesson() {
    try {
        // Get lesson information
        const lessonRes = await fetchWithAuth(`/api/lessons/${lessonId}`);
        if (!lessonRes.ok) throw new Error('Failed to fetch lesson');
        
        const lesson = await lessonRes.json();
        document.getElementById('lesson-title').textContent = lesson.title;

        // For simplicity, use lessonId as quizId
        // In a real app, you would fetch or create quiz via API
        quizId = lessonId;
        
        await fetchAndRenderQuestions();
    } catch (error) {
        console.error('Error finding/creating quiz:', error);
        alert('Failed to load quiz information');
    }
}

// ==================== QUESTIONS MANAGEMENT ====================
async function fetchAndRenderQuestions() {
    if (!quizId) return;
    
    const questionsListUl = document.getElementById('questions-list');
    questionsListUl.innerHTML = '<li class="text-gray-500">Loading questions...</li>';

    try {
        const response = await fetchWithAuth(`/api/questions?quizId=${quizId}`);
        if (!response.ok) throw new Error('Could not fetch questions');
        
        const questions = await response.json();
        
        if (questions.length > 0) {
            questionsListUl.innerHTML = '';
            questions.forEach((q, index) => {
                const questionItem = document.createElement('li');
                questionItem.className = 'p-4 border border-gray-200 dark:border-gray-600 rounded-md flex justify-between items-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition';
                questionItem.innerHTML = `
                    <div class="flex-1">
                        <p class="font-medium text-gray-800 dark:text-gray-200 mb-2">
                            ${index + 1}. ${escapeHtml(q.text)}
                        </p>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <span class="text-gray-600 dark:text-gray-400">A: ${escapeHtml(q.options?.A || '')}</span>
                            <span class="text-gray-600 dark:text-gray-400">B: ${escapeHtml(q.options?.B || '')}</span>
                            <span class="text-gray-600 dark:text-gray-400">C: ${escapeHtml(q.options?.C || '')}</span>
                            <span class="text-gray-600 dark:text-gray-400">D: ${escapeHtml(q.options?.D || '')}</span>
                        </div>
                        <p class="text-sm text-green-600 dark:text-green-400 mt-2">
                            Correct Answer: ${q.correctAnswer || q.correct_answer}
                        </p>
                    </div>
                    <button data-question-id="${q.id}" class="delete-question-btn ml-4 px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition">
                        Delete
                    </button>
                `;
                questionsListUl.appendChild(questionItem);
            });
        } else {
            questionsListUl.innerHTML = '<li class="text-gray-500 p-4">No questions have been added to this quiz yet.</li>';
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionsListUl.innerHTML = '<li class="text-red-500 p-4">Failed to load questions.</li>';
    }
}

async function handleAddQuestion(e) {
    e.preventDefault();
    
    if (!quizId) {
        alert('Could not determine the quiz. Please try again.');
        return;
    }

    const questionData = {
        text: document.getElementById('question-text').value,
        options: {
            A: document.getElementById('option-a').value,
            B: document.getElementById('option-b').value,
            C: document.getElementById('option-c').value,
            D: document.getElementById('option-d').value,
        },
        correctAnswer: document.getElementById('correct-answer').value,
        quiz_id: quizId
    };

    try {
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(questionData)
        });

        if (!response.ok) throw new Error('Failed to create question.');
        
        alert('Question added successfully!');
        e.target.reset();
        await fetchAndRenderQuestions();
    } catch (error) {
        console.error('Error adding question:', error);
        alert('Error: ' + error.message);
    }
}

async function handleDeleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }

    try {
        const response = await fetch(`/api/questions/${questionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to delete question.');
        
        alert('Question deleted successfully!');
        await fetchAndRenderQuestions();
    } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error: ' + error.message);
    }
}
