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
let draggedItem = null; // For drag & drop
let allContentItems = []; // Store all content for reordering

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

    // Video source toggle - only Cloud and Local now
    const videoSourceUpload = document.getElementById('video-source-upload');
    const videoSourceLocal = document.getElementById('video-source-local');

    videoSourceUpload.addEventListener('change', updateVideoInputVisibility);
    videoSourceLocal.addEventListener('change', updateVideoInputVisibility);

    // Browse file buttons
    document.getElementById('select-video-btn').addEventListener('click', () => {
        document.getElementById('lesson-video-file').click();
    });
    document.getElementById('select-local-video-btn').addEventListener('click', () => {
        document.getElementById('lesson-video-local-file').click();
    });

    // File selection change handlers
    document.getElementById('lesson-video-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('selected-file-name').textContent = file.name;
            document.getElementById('selected-file-info').classList.remove('hidden');
        }
    });
    document.getElementById('lesson-video-local-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('selected-local-file-name').textContent = file.name;
            document.getElementById('selected-local-file-info').classList.remove('hidden');
        }
    });

    // Video upload button
    document.getElementById('upload-video-btn').addEventListener('click', handleVideoUpload);
    
    // Local video upload button
    document.getElementById('upload-video-local-btn').addEventListener('click', handleVideoLocalUpload);

    // Form toggle buttons - reset editing mode when switching forms manually
    document.getElementById('show-lesson-form-btn').addEventListener('click', () => {
        currentEditingContentId = null;
        setActiveForm('lesson');
    });
    document.getElementById('show-quiz-form-btn').addEventListener('click', () => {
        currentEditingContentId = null;
        setActiveForm('quiz');
    });

    // Cancel buttons - reset editing mode
    document.getElementById('cancel-lesson-edit-btn').addEventListener('click', () => {
        currentEditingContentId = null;
        setActiveForm('lesson');
    });
    document.getElementById('cancel-quiz-edit-btn').addEventListener('click', () => {
        currentEditingContentId = null;
        setActiveForm('quiz');
    });

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
    const videoFileInput = document.getElementById('video-file-input');
    const videoLocalInput = document.getElementById('video-local-input');
    const videoSourceUpload = document.getElementById('video-source-upload');
    const videoSourceLocal = document.getElementById('video-source-local');

    videoFileInput.classList.add('hidden');
    videoLocalInput.classList.add('hidden');

    if (videoSourceUpload.checked) {
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
    if (!file) {
        notify.warning('Please select a video file first');
        return;
    }

    // No file size limit for cloud uploads

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

    // Only reset forms if not in edit mode (currentEditingContentId will be set before calling setActiveForm for edit)
    if (isLesson) {
        if (!currentEditingContentId) {
            lessonForm.reset();
            quill.setText('');
            document.getElementById('lesson-form-title').textContent = 'Add a New Lesson';
            lessonForm.querySelector('button[type="submit"]').textContent = 'Save Lesson';
            
            // Reset video upload states
            uploadedVideoUrl = null;
            uploadedVideoLocalUrl = null;
            
            // Reset Cloud upload UI
            document.getElementById('upload-success').classList.add('hidden');
            document.getElementById('upload-progress').classList.add('hidden');
            document.getElementById('selected-file-info').classList.add('hidden');
            
            // Reset Local upload UI
            document.getElementById('upload-local-success').classList.add('hidden');
            document.getElementById('upload-local-progress').classList.add('hidden');
            document.getElementById('selected-local-file-info').classList.add('hidden');
            
            // Reset to Cloud upload option by default
            document.getElementById('video-source-upload').checked = true;
            updateVideoInputVisibility();
        }
    } else {
        if (!currentEditingContentId) {
            quizForm.reset();
            document.getElementById('quiz-form-title').textContent = 'Add a New Quiz';
            quizForm.querySelector('button[type="submit"]').textContent = 'Save Quiz';
            document.getElementById('questions-container').innerHTML = '';
        }
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

        // Sort by order first, then by createdAt as fallback
        allContent.sort((a, b) => {
            const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
            const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
            if (orderA !== orderB) return orderA - orderB;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        // Store for reordering
        allContentItems = allContent;

        // Update content count
        const contentCountEl = document.getElementById('content-count');
        if (contentCountEl) {
            contentCountEl.textContent = `${allContent.length} items`;
        }

        if (allContent.length === 0) {
            contentListUl.innerHTML = `
                <li class="text-center py-8">
                    <div class="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <i class="fas fa-folder-open text-gray-400 text-xl"></i>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">No content yet</p>
                    <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Add your first lesson or quiz!</p>
                </li>
            `;
            return;
        }

        contentListUl.innerHTML = allContent.map((item, index) => {
            const isLesson = item.type === 'lesson';
            const bgColor = isLesson ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20';
            const iconBg = isLesson ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30';
            const iconColor = isLesson ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400';
            const icon = isLesson ? 'fa-book-open' : 'fa-puzzle-piece';

            return `
                <li class="content-item ${bgColor} rounded-xl p-3 cursor-grab group transition-all duration-200" 
                    draggable="true" 
                    data-id="${item.id}" 
                    data-type="${item.type}"
                    data-index="${index}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="drag-handle w-6 h-9 flex items-center justify-center cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
                                <i class="fas fa-grip-vertical"></i>
                            </div>
                            <div class="w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0">
                                <i class="fas ${icon} ${iconColor} text-sm"></i>
                            </div>
                            <div class="min-w-0">
                                <p class="font-medium text-gray-800 dark:text-gray-200 text-sm truncate"><span class="content-index">${index + 1}</span>. ${escapeHtml(item.title)}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${isLesson ? 'Lesson' : 'Quiz'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="edit-content-btn p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors" data-id="${item.id}" data-type="${item.type}" title="Edit">
                                <i class="fas fa-edit text-sm"></i>
                            </button>
                            <button class="delete-content-btn p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" data-id="${item.id}" data-type="${item.type}" title="Delete">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                </li>
            `;
        }).join('');

        // Setup drag & drop handlers
        setupDragAndDrop();
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
    const videoSourceUpload = document.getElementById('video-source-upload');
    const videoSourceLocal = document.getElementById('video-source-local');

    if (videoSourceUpload.checked) {
        videoUrl = uploadedVideoUrl || '';
    } else if (videoSourceLocal.checked) {
        videoUrl = uploadedVideoLocalUrl || '';
    }

    const lessonData = {
        title: lessonTitle,
        content: lessonContent,
        videoUrl: videoUrl,
        course_id: courseId,
        order: currentEditingContentId ? undefined : allContentItems.length // Add to end if new
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
    const quizDescription = document.getElementById('quiz-description')?.value.trim() || '';
    const questionItems = document.querySelectorAll('.question-item');

    const questions = Array.from(questionItems).map(item => ({
        questionText: item.querySelector('.question-text').value.trim(),
        question_text: item.querySelector('.question-text').value.trim(),
        options: {
            A: item.querySelector('.option-a').value.trim(),
            B: item.querySelector('.option-b').value.trim(),
            C: item.querySelector('.option-c').value.trim(),
            D: item.querySelector('.option-d').value.trim()
        },
        correctAnswer: item.querySelector('.correct-answer').value,
        correct_answer_index: item.querySelector('.correct-answer').value
    }));

    if (questions.length === 0) {
        notify.warning('Please add at least one question');
        return;
    }

    const quizData = {
        title: quizTitle,
        description: quizDescription,
        questions: questions,
        course_id: courseId,
        order: currentEditingContentId ? undefined : allContentItems.length // Add to end if new
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
    // Use closest() to handle clicks on icon inside button
    const editBtn = e.target.closest('.edit-content-btn');
    const deleteBtn = e.target.closest('.delete-content-btn');
    
    if (!editBtn && !deleteBtn) {
        return;
    }

    const target = editBtn || deleteBtn;
    const id = target.dataset.id;
    const type = target.dataset.type;

    if (editBtn) {
        // Set editing ID BEFORE calling setActiveForm so form doesn't reset
        currentEditingContentId = id;
        console.log('Editing content ID set to:', currentEditingContentId);

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

                // Handle video URL - now only Cloud and Local options
                const videoUrl = lesson.videoUrl || lesson.video_url;
                if (videoUrl) {
                    // Check if it's a local server URL or cloud URL
                    if (videoUrl.includes('/uploads/videos/') || videoUrl.startsWith('/uploads')) {
                        document.getElementById('video-source-local').checked = true;
                        uploadedVideoLocalUrl = videoUrl;
                    } else {
                        document.getElementById('video-source-upload').checked = true;
                        uploadedVideoUrl = videoUrl;
                    }
                    updateVideoInputVisibility();
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
                        // Support both camelCase and snake_case from backend
                        const questionText = q.questionText || q.question_text || q.text || '';
                        item.querySelector('.question-text').value = questionText;
                        
                        // Handle options - could be object {A, B, C, D} or array
                        const options = q.options || {};
                        if (Array.isArray(options)) {
                            item.querySelector('.option-a').value = options[0] || '';
                            item.querySelector('.option-b').value = options[1] || '';
                            item.querySelector('.option-c').value = options[2] || '';
                            item.querySelector('.option-d').value = options[3] || '';
                        } else {
                            item.querySelector('.option-a').value = options.A || '';
                            item.querySelector('.option-b').value = options.B || '';
                            item.querySelector('.option-c').value = options.C || '';
                            item.querySelector('.option-d').value = options.D || '';
                        }
                        
                        // Support multiple field names for correct answer
                        const correctAnswer = q.correctAnswer || q.correct_answer || q.correctAnswerIndex || q.correct_answer_index || '';
                        item.querySelector('.correct-answer').value = correctAnswer;
                    });
                }
            } catch (error) {
                console.error('Error loading quiz:', error);
                notify.error('Error loading quiz: ' + error.message);
            }
        }
    }

    if (deleteBtn) {
        const titleEl = target.closest('li').querySelector('p.font-medium');
        const itemTitle = titleEl ? titleEl.textContent : 'this item';
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

// ==================== DRAG & DROP ====================
function setupDragAndDrop() {
    const contentList = document.getElementById('content-list');
    const items = contentList.querySelectorAll('.content-item[draggable="true"]');
    
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('opacity-50', 'scale-95');
    this.style.cursor = 'grabbing';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.index);
}

function handleDragEnd(e) {
    this.classList.remove('opacity-50', 'scale-95');
    this.style.cursor = 'grab';
    
    // Remove drag-over styling from all items
    document.querySelectorAll('.content-item').forEach(item => {
        item.classList.remove('border-2', 'border-blue-500', 'border-dashed', 'bg-blue-100', 'dark:bg-blue-900/40');
    });
    
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        this.classList.add('border-2', 'border-blue-500', 'border-dashed');
    }
}

function handleDragLeave(e) {
    this.classList.remove('border-2', 'border-blue-500', 'border-dashed');
}

function handleDrop(e) {
    e.preventDefault();
    
    if (this === draggedItem) return;
    
    const contentList = document.getElementById('content-list');
    const items = Array.from(contentList.querySelectorAll('.content-item[draggable="true"]'));
    
    const fromIndex = items.indexOf(draggedItem);
    const toIndex = items.indexOf(this);
    
    if (fromIndex < toIndex) {
        this.parentNode.insertBefore(draggedItem, this.nextSibling);
    } else {
        this.parentNode.insertBefore(draggedItem, this);
    }
    
    // Update visual indexes
    updateContentIndexes();
    
    // Save new order to server
    saveContentOrder();
}

function updateContentIndexes() {
    const items = document.querySelectorAll('.content-item[draggable="true"]');
    items.forEach((item, index) => {
        const indexSpan = item.querySelector('.content-index');
        if (indexSpan) {
            indexSpan.textContent = index + 1;
        }
        item.dataset.index = index;
    });
}

async function saveContentOrder() {
    const items = document.querySelectorAll('.content-item[draggable="true"]');
    const orderData = Array.from(items).map((item, index) => ({
        id: item.dataset.id,
        type: item.dataset.type,
        order: index
    }));
    
    try {
        const response = await fetchWithAuth('/api/lessons/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: orderData })
        });
        
        if (!response.ok) throw new Error('Failed to save order');
        
        notify.success('Content order saved');
    } catch (error) {
        console.error('Error saving order:', error);
        notify.error('Failed to save content order');
    }
}
