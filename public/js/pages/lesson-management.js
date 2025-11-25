/**
 * Lesson Management Page JavaScript
 * Handles lesson and quiz creation/editing for teachers
 */

// ==================== GLOBAL VARIABLES ====================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

let quill; // Quill editor instance
let courseId = null;
let currentEditingContentId = null;
let uploadedVideoUrl = null;
let uploadedVideoLocalUrl = null; // For local server uploads

// ==================== AUTH GUARD ====================
if (!token || !user || (user.role !== 'teacher' && user.role !== 'admin')) {
    window.location.href = '/login';
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill editor
    quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: [['bold', 'italic', 'underline'], ['link', 'code-block']]
        }
    });

    // Get courseId from URL
    const urlParams = new URLSearchParams(window.location.search);
    courseId = urlParams.get('courseId');

    if (!courseId) {
        console.error('No courseId found in URL');
        document.getElementById('course-title').textContent = 'ERROR';
        document.getElementById('course-description').textContent = 'Course ID missing from URL. Please return to Dashboard.';
        alert('No course selected.');
        return;
    }

    setupEventListeners();
    await fetchAndRenderCourseDetails();
    setActiveForm('lesson');
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login';
        });
    }

    // Video source toggle
    const videoSourceUrl = document.getElementById('video-source-url');
    const videoSourceUpload = document.getElementById('video-source-upload');
    const videoSourceLocal = document.getElementById('video-source-local');

    videoSourceUrl.addEventListener('change', updateVideoInputVisibility);
    videoSourceUpload.addEventListener('change', updateVideoInputVisibility);
    videoSourceLocal.addEventListener('change', updateVideoInputVisibility);

    // Video upload button
    document.getElementById('upload-video-btn').addEventListener('click', handleVideoUpload);
    
    // Local video upload button
    document.getElementById('upload-video-local-btn').addEventListener('click', handleVideoLocalUpload);

    // Form toggle buttons
    document.getElementById('show-lesson-form-btn').addEventListener('click', () => setActiveForm('lesson'));
    document.getElementById('show-quiz-form-btn').addEventListener('click', () => setActiveForm('quiz'));

    // Forms
    document.getElementById('lesson-form').addEventListener('submit', handleLessonSubmit);
    document.getElementById('quiz-form').addEventListener('submit', handleQuizSubmit);

    // Question management
    document.getElementById('add-question-btn').addEventListener('click', addQuestionField);

    // Content list (delegated events)
    document.getElementById('content-list').addEventListener('click', handleContentActions);
}

// ==================== VIDEO SOURCE MANAGEMENT ====================
function updateVideoInputVisibility() {
    const videoUrlInput = document.getElementById('video-url-input');
    const videoFileInput = document.getElementById('video-file-input');
    const videoLocalInput = document.getElementById('video-local-input');
    const videoSourceUrl = document.getElementById('video-source-url');
    const videoSourceUpload = document.getElementById('video-source-upload');
    const videoSourceLocal = document.getElementById('video-source-local');

    videoUrlInput.classList.add('hidden');
    videoFileInput.classList.add('hidden');
    videoLocalInput.classList.add('hidden');

    if (videoSourceUrl.checked) {
        videoUrlInput.classList.remove('hidden');
    } else if (videoSourceUpload.checked) {
        videoFileInput.classList.remove('hidden');
    } else if (videoSourceLocal.checked) {
        videoLocalInput.classList.remove('hidden');
    }
}

// ==================== VIDEO UPLOAD ====================
async function handleVideoUpload() {
    const videoFileInputEl = document.getElementById('lesson-video-file');
    const uploadProgress = document.getElementById('upload-progress');
    const uploadSuccess = document.getElementById('upload-success');

    const file = videoFileInputEl.files[0];
    if (!videoFile) {
        notify.warning('Please select a video file first');
        return;
    }

    if (videoFile.size > 100 * 1024 * 1024) {
        notify.error('File size must be less than 100MB');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        uploadProgress.classList.remove('hidden');
        uploadSuccess.classList.add('hidden');

        const response = await fetch('/api/upload/video', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) throw new Error('Video upload failed');

        const data = await response.json();
        uploadedVideoUrl = data.url;

        uploadProgress.classList.add('hidden');
        uploadSuccess.classList.remove('hidden');
        uploadSuccess.textContent = `Upload successful! URL: ${uploadedVideoUrl}`;
    } catch (error) {
        console.error('Upload error:', error);
        uploadProgress.classList.add('hidden');
        alert('Upload failed: ' + error.message);
    }
}

// ==================== LOCAL VIDEO UPLOAD ====================
async function handleVideoLocalUpload() {
    const videoFileInputEl = document.getElementById('lesson-video-local-file');
    const uploadProgress = document.getElementById('upload-local-progress');
    const uploadSuccess = document.getElementById('upload-local-success');

    const file = videoFileInputEl.files[0];
    if (!file) {
        alert('Please select a video file first');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        uploadProgress.classList.remove('hidden');
        uploadSuccess.classList.add('hidden');

        const response = await fetch('/api/upload/video-local', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) throw new Error('Local video upload failed');

        const data = await response.json();
        uploadedVideoLocalUrl = data.path || data.url;

        uploadProgress.classList.add('hidden');
        uploadSuccess.classList.remove('hidden');
        uploadSuccess.textContent = `Upload successful! Path: ${uploadedVideoLocalUrl}`;
    } catch (error) {
        console.error('Local upload error:', error);
        uploadProgress.classList.add('hidden');
        alert('Upload failed: ' + error.message);
    }
}

// ==================== FORM MANAGEMENT ====================
function setActiveForm(formId) {
    const isLesson = formId === 'lesson';
    const lessonForm = document.getElementById('lesson-form');
    const quizForm = document.getElementById('quiz-form');
    const lessonBtn = document.getElementById('show-lesson-form-btn');
    const quizBtn = document.getElementById('show-quiz-form-btn');

    lessonForm.classList.toggle('hidden', !isLesson);
    quizForm.classList.toggle('hidden', isLesson);

    lessonBtn.classList.toggle('active', isLesson);
    quizBtn.classList.toggle('active', !isLesson);

    if (isLesson) {
        lessonForm.reset();
        quill.setText('');
        document.getElementById('lesson-form-title').textContent = 'Add a New Lesson';
        lessonForm.querySelector('button[type="submit"]').textContent = 'Save Lesson';
        currentEditingContentId = null;
        uploadedVideoUrl = null;
        document.getElementById('upload-success').classList.add('hidden');
    } else {
        quizForm.reset();
        document.getElementById('quiz-form-title').textContent = 'Add a New Quiz';
        quizForm.querySelector('button[type="submit"]').textContent = 'Save Quiz';
        document.getElementById('questions-container').innerHTML = '';
        currentEditingContentId = null;
    }
}

// ==================== COURSE DETAILS ====================
async function fetchAndRenderCourseDetails() {
    try {
        const response = await fetchWithAuth(`/api/courses/${courseId}`);
        if (!response.ok) throw new Error('Failed to fetch course');

        const responseData = await response.json();
        const course = responseData.data || responseData;

        document.getElementById('course-title').textContent = course.title || 'No Title';
        document.getElementById('course-description').textContent = course.description || 'No Description';

        const contentListUl = document.getElementById('content-list');
        const lessons = course.lessons || [];
        const quizzes = course.quizzes || [];

        const allContent = [
            ...lessons.map(l => ({ ...l, type: 'lesson' })),
            ...quizzes.map(q => ({ ...q, type: 'quiz' }))
        ];

        allContent.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (allContent.length === 0) {
            contentListUl.innerHTML = '<li class="text-gray-500 p-3">No lessons or quizzes yet. Add your first content!</li>';
            return;
        }

        contentListUl.innerHTML = allContent.map((item, index) => {
            const icon = item.type === 'lesson' ?
                '<i class="fas fa-book-open text-blue-500"></i>' :
                '<i class="fas fa-puzzle-piece text-green-500"></i>';

            return `
                <li class="flex justify-between items-center p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div class="flex items-center space-x-3">
                        ${icon}
                        <span class="font-medium dark:text-gray-200">${index + 1}. ${escapeHtml(item.title)}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button class="edit-content-btn text-blue-600 hover:text-blue-800 text-sm" data-id="${item.id}" data-type="${item.type}">
                            Edit
                        </button>
                        <button class="delete-content-btn text-red-600 hover:text-red-800 text-sm" data-id="${item.id}" data-type="${item.type}">
                            Delete
                        </button>
                    </div>
                </li>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading course details:', error);
        notify.error('Failed to load course details');
    }
}

// ==================== LESSON SUBMISSION ====================
async function handleLessonSubmit(e) {
    e.preventDefault();

    const lessonTitle = document.getElementById('lesson-title').value.trim();
    const lessonContent = quill.root.innerHTML;

    let videoUrl = '';
    const videoSourceUrl = document.getElementById('video-source-url');
    const videoSourceUpload = document.getElementById('video-source-upload');
    const videoSourceLocal = document.getElementById('video-source-local');

    if (videoSourceUrl.checked) {
        videoUrl = document.getElementById('lesson-video-url').value.trim();
    } else if (videoSourceUpload.checked) {
        videoUrl = uploadedVideoUrl || '';
    } else if (videoSourceLocal.checked) {
        videoUrl = uploadedVideoLocalUrl || '';
    }

    const lessonData = {
        title: lessonTitle,
        content: lessonContent,
        videoUrl: videoUrl,
        course_id: courseId
    };

    try {
        let response;
        if (currentEditingContentId) {
            response = await fetch(`/api/lessons/${currentEditingContentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(lessonData)
            });
        } else {
            response = await fetch('/api/lessons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(lessonData)
            });
        }

        if (!response.ok) throw new Error('Failed to save lesson');

        alert('Lesson saved successfully!');
        setActiveForm('lesson');
        await fetchAndRenderCourseDetails();
    } catch (error) {
        console.error('Error saving lesson:', error);
        alert('Error: ' + error.message);
    }
}

// ==================== QUIZ MANAGEMENT ====================
function addQuestionField() {
    const container = document.getElementById('questions-container');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item p-4 border border-gray-300 dark:border-gray-600 rounded-md space-y-3';
    questionDiv.innerHTML = `
        <label class="block text-sm font-medium mb-2">Question:</label>
        <textarea class="question-text w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md" rows="2" required></textarea>
        <div class="grid grid-cols-2 gap-2">
            <input type="text" class="option-a w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Option A" required>
            <input type="text" class="option-b w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Option B" required>
            <input type="text" class="option-c w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Option C" required>
            <input type="text" class="option-d w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="Option D" required>
        </div>
        <select class="correct-answer w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md" required>
            <option value="">Select Correct Answer</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
        </select>
        <button type="button" class="remove-question-btn text-red-600 hover:text-red-800 text-sm">Remove</button>
    `;

    questionDiv.querySelector('.remove-question-btn').addEventListener('click', () => {
        questionDiv.remove();
    });

    container.appendChild(questionDiv);
}

async function handleQuizSubmit(e) {
    e.preventDefault();

    const quizTitle = document.getElementById('quiz-title').value.trim();
    const questionItems = document.querySelectorAll('.question-item');

    const questions = Array.from(questionItems).map(item => ({
        text: item.querySelector('.question-text').value.trim(),
        options: {
            A: item.querySelector('.option-a').value.trim(),
            B: item.querySelector('.option-b').value.trim(),
            C: item.querySelector('.option-c').value.trim(),
            D: item.querySelector('.option-d').value.trim()
        },
        correctAnswer: item.querySelector('.correct-answer').value
    }));

    if (questions.length === 0) {
        notify.warning('Please add at least one question');
        return;
    }

    const quizData = {
        title: quizTitle,
        questions: questions,
        course_id: courseId
    };

    try {
        let response;
        if (currentEditingContentId) {
            response = await fetch(`/api/quizzes/${currentEditingContentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(quizData)
            });
        } else {
            response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(quizData)
            });
        }

        if (!response.ok) throw new Error('Failed to save quiz');

        alert('Quiz saved successfully!');
        setActiveForm('quiz');
        await fetchAndRenderCourseDetails();
    } catch (error) {
        console.error('Error saving quiz:', error);
        alert('Error: ' + error.message);
    }
}

// ==================== CONTENT ACTIONS ====================
async function handleContentActions(e) {
    const target = e.target;
    if (!target.classList.contains('edit-content-btn') && !target.classList.contains('delete-content-btn')) {
        return;
    }

    const id = target.dataset.id;
    const type = target.dataset.type;

    if (target.classList.contains('edit-content-btn')) {
        currentEditingContentId = id;

        if (type === 'lesson') {
            try {
                const response = await fetchWithAuth(`/api/lessons/${id}`);
                if (!response.ok) throw new Error('Failed to fetch lesson');

                const lesson = await response.json();
                setActiveForm('lesson');
                document.getElementById('lesson-form-title').textContent = 'Edit Lesson';
                document.getElementById('lesson-form').querySelector('button[type="submit"]').textContent = 'Update Lesson';
                document.getElementById('lesson-title').value = lesson.title;
                quill.root.innerHTML = lesson.content || '';

                if (lesson.videoUrl || lesson.video_url) {
                    document.getElementById('video-source-url').checked = true;
                    updateVideoInputVisibility();
                    document.getElementById('lesson-video-url').value = lesson.videoUrl || lesson.video_url;
                }
            } catch (error) {
                console.error('Error loading lesson:', error);
                notify.error('Error loading lesson: ' + error.message);
            }
        } else if (type === 'quiz') {
            try {
                const response = await fetchWithAuth(`/api/quizzes/${id}`);
                if (!response.ok) throw new Error('Failed to fetch quiz');

                const quiz = await response.json();
                setActiveForm('quiz');
                document.getElementById('quiz-form-title').textContent = 'Edit Quiz';
                document.getElementById('quiz-form').querySelector('button[type="submit"]').textContent = 'Update Quiz';
                document.getElementById('quiz-title').value = quiz.title;

                const questionsContainer = document.getElementById('questions-container');
                questionsContainer.innerHTML = '';

                if (quiz.questions && quiz.questions.length > 0) {
                    quiz.questions.forEach(() => addQuestionField());
                    const questionItems = document.querySelectorAll('.question-item');
                    quiz.questions.forEach((q, idx) => {
                        const item = questionItems[idx];
                        item.querySelector('.question-text').value = q.text;
                        item.querySelector('.option-a').value = q.options.A;
                        item.querySelector('.option-b').value = q.options.B;
                        item.querySelector('.option-c').value = q.options.C;
                        item.querySelector('.option-d').value = q.options.D;
                        item.querySelector('.correct-answer').value = q.correctAnswer || q.correct_answer;
                    });
                }
            } catch (error) {
                console.error('Error loading quiz:', error);
                notify.error('Error loading quiz: ' + error.message);
            }
        }
    }

    if (target.classList.contains('delete-content-btn')) {
        const itemTitle = target.closest('li').querySelector('span.font-medium').textContent;
        if (!confirm(`Are you sure you want to delete "${itemTitle}" (${type})?`)) {
            return;
        }

        try {
            const apiUrl = type === 'lesson' ? `/api/lessons/${id}` : `/api/quizzes/${id}`;
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`Failed to delete ${type}`);

            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
            await fetchAndRenderCourseDetails();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error: ' + error.message);
        }
    }
}
