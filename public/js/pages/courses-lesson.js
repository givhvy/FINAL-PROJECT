/**
 * Courses Page - Lesson and Quiz Management (Part 2)
 * Handles lesson rendering, quiz interface, progress tracking
 */

// ==================== LESSON PAGE RENDERING ====================
async function renderLessonPage(course) {
    const lessonPage = document.getElementById('lesson-page');
    const lessons = (course.lessons || []).map(item => ({ ...item, contentType: 'lesson' }));
    const quizzes = (course.quizzes || []).map(item => ({ ...item, contentType: 'quiz' }));

    const allContent = [...lessons, ...quizzes];
    allContent.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Fetch completed lessons
    completedLessonIds = new Set();
    try {
        const progressRes = await fetchWithAuth(`/api/progress/user/${user.id}`);
        if (progressRes.ok) {
            const allProgress = await progressRes.json();
            const courseProgress = allProgress.filter(p =>
                (p.courseId === course.id || p.course_id === course.id) &&
                (p.progressType === 'lesson_completed' || p.progress_type === 'lesson_completed')
            );
            completedLessonIds = new Set(courseProgress.map(p => p.lessonId || p.lesson_id));
        }
    } catch (error) {
        console.warn('Could not fetch completed lessons:', error);
    }

    const contentListHTML = allContent.length > 0
        ? allContent.map((item, index) => {
            const isQuiz = item.contentType === 'quiz';
            const isCompleted = !isQuiz && completedLessonIds.has(item.id);

            const userTier = user.subscriptionTier || 'free';
            const userRole = (user.role || '').toLowerCase();
            const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';

            const courseIsLocked = course.locked !== false;
            const hasAccess = isTeacherOrAdmin || !courseIsLocked || userTier === 'pro';

            const icon = isQuiz
                ? `<i class="fas fa-puzzle-piece text-blue-500 w-5 text-center mr-3"></i>`
                : `<i class="fas fa-book-open text-blue-500 w-5 text-center mr-3"></i>`;
            const checkmark = isCompleted
                ? `<i class="fas fa-check-circle text-green-500 ml-auto lesson-checkmark"></i>`
                : '';

            const completedClass = isCompleted ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700';

            return `
                <li class="lesson-card p-3 rounded-md cursor-pointer flex items-center transition-all duration-200 ${completedClass} ${!hasAccess ? 'opacity-60' : ''}"
                    data-id="${item.id}"
                    data-type="${item.contentType}"
                    data-has-access="${hasAccess}">
                    ${icon}
                    <span class="text-sm font-medium pointer-events-none flex-1">${index + 1}. ${escapeHtml(item.title)}</span>
                    ${checkmark}
                </li>
            `;
        }).join('')
        : '<li><p class="text-sm text-gray-500 p-3">No content available for this course yet.</p></li>';

    const totalLessons = lessons.length;
    const completedLessons = completedLessonIds.size;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    lessonPage.innerHTML = `
        <div class="mb-6">
            <button id="back-to-courses-btn" class="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Courses
            </button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="lg:col-span-1">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden sticky top-24">
                    <div class="p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <h2 class="text-xl font-bold mb-2">${escapeHtml(course.title)}</h2>
                        <p class="text-sm font-medium mb-3">By ${escapeHtml(course.teacher?.name || course.instructor || 'Unknown Instructor')}</p>
                        <div class="mt-3">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-xs font-medium">Progress</span>
                                <span class="text-xs font-bold progress-text">${progressPercentage}%</span>
                            </div>
                            <div class="w-full bg-white dark:bg-gray-800/30 rounded-full h-2">
                                <div class="progress-bar-fill bg-white dark:bg-gray-800 h-2 rounded-full transition-all duration-500" style="width: ${progressPercentage}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="p-5">
                        <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-3">Course Content</h3>
                        <ul id="content-list-sidebar" class="space-y-1">${contentListHTML}</ul>
                    </div>
                </div>
            </div>
            <div id="content-main" class="lg:col-span-3">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden min-h-[40rem]">
                    <div id="content-area" class="p-8">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Welcome to ${escapeHtml(course.title)}!</h2>
                        <p class="text-gray-700 dark:text-gray-300">${escapeHtml(course.description || 'No description available for this course.')}</p>
                        <div class="mt-6 border-t pt-6">
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Select a lesson or quiz from the left to begin.</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('back-to-courses-btn').addEventListener('click', () => history.back());

    lessonPage.querySelectorAll('#content-list-sidebar .lesson-card').forEach(card => {
        card.addEventListener('click', async () => {
            const id = card.dataset.id;
            const type = card.dataset.type;
            const hasAccess = card.dataset.hasAccess === 'true';

            if (!hasAccess) {
                notify.warning('This course requires a Pro subscription. Upgrade to access this locked course!');
                window.location.href = '/payment';
                return;
            }

            lessonPage.querySelectorAll('#content-list-sidebar .lesson-card').forEach(c => c.classList.remove('active-lesson'));
            card.classList.add('active-lesson');

            if (type === 'lesson') {
                await renderLessonContent(id, course.id);
            } else if (type === 'quiz') {
                await renderQuizInterface(id);
            }
        });
    });

    // Load first content item
    if (allContent.length > 0) {
        const firstContent = allContent[0];
        const firstCard = lessonPage.querySelector(`[data-id="${firstContent.id}"][data-type="${firstContent.contentType}"]`);
        if (firstCard) {
            firstCard.classList.add('active-lesson');
            if (firstContent.contentType === 'lesson') {
                renderLessonContent(firstContent.id, course.id);
            } else {
                renderQuizInterface(firstContent.id);
            }
        }
    }
}

// ==================== LESSON CONTENT RENDERING ====================
async function renderLessonContent(lessonId, courseId) {
    const contentArea = document.getElementById('content-main');
    contentArea.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex justify-center items-center min-h-[40rem]"><div class="loader"></div></div>`;

    try {
        const res = await fetchWithAuth(`/api/lessons/${lessonId}`);
        if (!res.ok) throw new Error('Could not fetch lesson content.');
        
        const lesson = await res.json();
        let isCompleted = completedLessonIds.has(lessonId);

        let videoHTML = '';
        let videoUrl = lesson.videoUrl || lesson.video_url || lesson.content_data || '';

        if (videoUrl && videoUrl.includes('/uploads/')) {
            const uploadsIndex = videoUrl.indexOf('/uploads/');
            videoUrl = videoUrl.substring(uploadsIndex);
        }

        if (videoUrl && videoUrl.trim() !== '') {
            const data = videoUrl;
            let embedUrl = '';

            if (data.includes('youtube.com') || data.includes('youtu.be')) {
                embedUrl = data.includes('watch?v=')
                    ? data.replace('watch?v=', 'embed/')
                    : data.replace('youtu.be/', 'youtube.com/embed/');
            } else if (data.includes('drive.google.com/embed')) {
                embedUrl = data;
            } else if (data.includes('drive.google.com/file/d/')) {
                const match = data.match(/file\/d\/([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    embedUrl = `https://drive.google.com/embed?id=${match[1]}`;
                }
            } else if (data.includes('vimeo.com')) {
                const vimeoMatch = data.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/);
                if (vimeoMatch && vimeoMatch[1]) {
                    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                }
            } else if (data.includes('dropbox.com')) {
                embedUrl = data.replace('dl=0', 'raw=1');
                if (!embedUrl.startsWith('http://') && !embedUrl.startsWith('https://')) {
                    embedUrl = 'https://' + embedUrl;
                }
            } else if (data.startsWith('/uploads/') || data.includes('cloudinary.com')) {
                videoHTML = `
                    <div class="aspect-video bg-black rounded-lg mb-6 shadow-xl">
                        <video class="w-full h-full rounded-lg" controls>
                            <source src="${escapeHtml(data)}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>`;
            }

            if (embedUrl && !videoHTML) {
                videoHTML = `
                    <div class="aspect-video bg-black rounded-lg mb-6 shadow-xl">
                        <iframe class="w-full h-full rounded-lg" src="${escapeHtml(embedUrl)}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
                    </div>`;
            }
        }

        const buttonClass = isCompleted
            ? 'bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed flex-shrink-0 flex items-center'
            : 'bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex-shrink-0 flex items-center';
        const buttonText = isCompleted
            ? '<i class="fas fa-check-circle mr-2"></i> Completed!'
            : '<i class="fas fa-check mr-2"></i> Mark as Complete';

        const contentHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                ${videoHTML}
                <div class="p-8">
                    <div class="flex justify-between items-start gap-4 mb-6">
                        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-200">${escapeHtml(lesson.title || 'Untitled Lesson')}</h2>
                        <button id="mark-complete-btn" data-lesson-id="${lesson.id}" data-course-id="${courseId}"
                                class="${buttonClass}" ${isCompleted ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                    </div>
                    <div class="prose max-w-none lesson-html-content">
                        ${lesson.description ? `<p class="text-gray-600 dark:text-gray-400 mb-4">${escapeHtml(lesson.description)}</p>` : ''}
                        ${lesson.content || ''}
                    </div>
                </div>
            </div>`;

        contentArea.innerHTML = contentHTML;

        const markCompleteBtn = document.getElementById('mark-complete-btn');
        if (markCompleteBtn && !isCompleted) {
            markCompleteBtn.addEventListener('click', handleMarkAsComplete);
        }
    } catch (error) {
        contentArea.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"><p class="text-red-500">Error loading lesson content: ${error.message}</p></div>`;
    }
}

// ==================== PROGRESS TRACKING ====================
async function handleMarkAsComplete(event) {
    const button = event.currentTarget;
    const { lessonId, courseId } = button.dataset;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';

    try {
        await autoEnrollUser(courseId);

        const response = await fetchWithAuth('/api/progress/lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                lessonId: lessonId,
                courseId: courseId,
                completed: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to save progress.');
        }

        const result = await response.json();

        button.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Completed!';
        button.className = 'bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed flex-shrink-0 flex items-center';
        button.disabled = true;
        button.style.pointerEvents = 'none';

        completedLessonIds.add(lessonId);

        const sidebarCard = document.querySelector(`#content-list-sidebar [data-id="${lessonId}"][data-type="lesson"]`);
        if (sidebarCard) {
            sidebarCard.classList.add('bg-gray-200', 'dark:bg-gray-700');
            sidebarCard.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-700');

            if (!sidebarCard.querySelector('.lesson-checkmark')) {
                const checkmark = document.createElement('i');
                checkmark.className = 'fas fa-check-circle text-green-500 ml-auto lesson-checkmark';
                sidebarCard.appendChild(checkmark);
            }
        }

        const progressText = document.querySelector('.progress-text');
        const progressBarFill = document.querySelector('.progress-bar-fill');

        if (progressText && progressBarFill && result.completion !== undefined) {
            progressText.textContent = `${result.completion}%`;
            progressBarFill.style.width = `${result.completion}%`;
        }

        if (result.certificateGenerated) {
            showCertificateCompletionPopup(result.certificateData);
        } else {
            showToast('Progress saved successfully!', 'success');
        }
    } catch (error) {
        console.error('Error marking lesson as complete:', error);
        showToast(`Error: ${error.message}`, 'error');
        button.innerHTML = '<i class="fas fa-check mr-2"></i> Mark as Complete';
        button.className = 'bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex-shrink-0 flex items-center';
        button.disabled = false;
    }
}

// ==================== QUIZ INTERFACE ====================
async function renderQuizInterface(quizId) {
    const contentArea = document.getElementById('content-main');
    contentArea.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex justify-center items-center min-h-[40rem]"><div class="loader"></div></div>`;

    try {
        const quizRes = await fetchWithAuth(`/api/quizzes/${quizId}`);
        if (!quizRes.ok) throw new Error('Could not fetch quiz details.');
        
        const quiz = await quizRes.json();
        const questions = quiz.questions || [];
        const quizTitle = quiz.title || 'Untitled Quiz';
        const quizDescription = quiz.description || '';

        if (questions.length === 0) {
            contentArea.innerHTML = `<div class="p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg"><h2 class="text-2xl font-bold">${escapeHtml(quizTitle)}</h2><p class="mt-4 text-gray-600 dark:text-gray-400">This quiz has no questions yet.</p></div>`;
            return;
        }

        let questionsHTML = questions.map((q, index) => {
            const optionsHTML = (q.options || []).map((option, i) => `
                <label class="block p-3 border rounded-md hover:bg-gray-50 dark:bg-gray-700 cursor-pointer transition-colors">
                    <input type="radio" name="question-${index}" value="${i}" class="mr-3" required>
                    <span>${escapeHtml(option)}</span>
                </label>
            `).join('');
            
            return `
                <div class="question-block mb-6 pb-6 border-b last:border-b-0">
                    <p class="font-semibold mb-3 text-gray-800 dark:text-gray-200">${index + 1}. ${escapeHtml(q.question_text)}</p>
                    <div class="space-y-2">${optionsHTML}</div>
                </div>
            `;
        }).join('');

        contentArea.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">${escapeHtml(quizTitle)}</h2>
                    <p class="text-gray-600 dark:text-gray-400">${escapeHtml(quizDescription)}</p>
                    <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div class="flex items-center justify-between text-sm text-blue-800">
                            <span><i class="fas fa-question-circle mr-2"></i>${questions.length} Questions</span>
                            <span><i class="fas fa-clock mr-2"></i>No time limit</span>
                        </div>
                    </div>
                </div>
                <form id="quiz-form">${questionsHTML}
                    <button type="submit" class="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <i class="fas fa-paper-plane mr-2"></i>Submit Quiz
                    </button>
                </form>
            </div>
        `;

        document.getElementById('quiz-form').addEventListener('submit', (e) => handleQuizSubmission(e, quizId, questions, quiz.courseId || quiz.course_id));
    } catch (error) {
        contentArea.innerHTML = `<div class="p-8 text-red-500 bg-white dark:bg-gray-800 rounded-xl shadow-lg">Error loading quiz: ${error.message}</div>`;
    }
}

async function handleQuizSubmission(event, quizId, questions, courseId) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Grading...`;

    const userAnswers = [];
    let score = 0;
    let unanswered = false;

    questions.forEach((q, index) => {
        const selectedOption = form.querySelector(`input[name="question-${index}"]:checked`);
        if (selectedOption) {
            const answerIndex = parseInt(selectedOption.value, 10);
            userAnswers[index] = answerIndex;
            if (answerIndex === q.correct_answer_index) {
                score++;
            }
        } else {
            userAnswers[index] = -1;
            unanswered = true;
        }
    });

    if (unanswered) {
        showToast('Please answer all questions before submitting.', 'error');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Submit Quiz';
        return;
    }

    const percentage = Math.round((score / questions.length) * 100);

    try {
        await fetchWithAuth('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                quizId: quizId,
                courseId: courseId,
                score: percentage,
                totalQuestions: questions.length,
                correctAnswers: score
            })
        });
    } catch (error) {
        console.error("Failed to save grade:", error);
    }

    displayQuizResults(score, questions, userAnswers, percentage);
}

function displayQuizResults(score, questions, userAnswers, percentage) {
    const contentArea = document.getElementById('content-main');

    let feedbackHTML = questions.map((q, index) => {
        const correctAnswerIndex = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex :
            (q.correctAnswer !== undefined ? q.correctAnswer :
                (q.correct_answer !== undefined ? q.correct_answer : q.correct_answer_index));

        const optionsHTML = (q.options || []).map((option, i) => {
            let classes = 'block p-3 border rounded-md transition-colors';
            if (i === correctAnswerIndex) {
                classes += ' bg-green-100 border-green-300 text-green-800 font-semibold';
            }
            if (i === userAnswers[index] && i !== correctAnswerIndex) {
                classes += ' bg-red-100 border-red-300 text-red-800';
            }
            return `<div class="${classes}">${escapeHtml(option)}</div>`;
        }).join('');

        const isCorrect = userAnswers[index] === correctAnswerIndex;
        let correctAnswerText = 'N/A';
        if (q.options && correctAnswerIndex !== undefined && q.options[correctAnswerIndex]) {
            correctAnswerText = q.options[correctAnswerIndex];
        }

        return `
            <div class="question-block mb-6 pb-6 border-b last:border-b-0">
                <div class="flex items-start gap-3 mb-3">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}">
                        <i class="fas fa-${isCorrect ? 'check' : 'times'} text-white text-sm"></i>
                    </div>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${index + 1}. ${escapeHtml(q.question_text)}</p>
                </div>
                <div class="space-y-2 ml-9">${optionsHTML}</div>
                <div class="ml-9 mt-3">
                    <p class="text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'} font-medium">
                        ${isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${escapeHtml(correctAnswerText)}`}
                    </p>
                </div>
            </div>
        `;
    }).join('');

    const passStatus = percentage >= 70;
    contentArea.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div class="text-center mb-8">
                <div class="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${passStatus ? 'bg-green-100' : 'bg-red-100'}">
                    <i class="fas fa-${passStatus ? 'trophy' : 'times'} text-3xl ${passStatus ? 'text-green-600' : 'text-red-600'}"></i>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Quiz Results</h2>
                <p class="text-6xl font-bold mt-4 mb-2 ${passStatus ? 'text-green-600' : 'text-red-600'}">${percentage}%</p>
                <p class="text-gray-600 dark:text-gray-400">You answered ${score} out of ${questions.length} questions correctly.</p>
                <div class="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${passStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    <i class="fas fa-${passStatus ? 'check-circle' : 'exclamation-triangle'} mr-2"></i>
                    ${passStatus ? 'Passed' : 'Failed'} (${passStatus ? '70%+ required' : 'Need 70%+ to pass'})
                </div>
            </div>
            <div class="border-t pt-6">
                <h3 class="text-xl font-semibold mb-4">Review Your Answers</h3>
                ${feedbackHTML}
            </div>
        </div>
    `;
}

// ==================== CERTIFICATE POPUP ====================
function showCertificateCompletionPopup(certificateData) {
    const popup = document.getElementById('certificate-completion-popup');
    const courseTitle = document.getElementById('cert-course-title');

    courseTitle.textContent = certificateData.course_title;
    popup.classList.remove('hidden');

    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// ==================== UTILITY FUNCTIONS ====================
function getUserInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    let initials = parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0).toUpperCase();
    }
    return initials;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
