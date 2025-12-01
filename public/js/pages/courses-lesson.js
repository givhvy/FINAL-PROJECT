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
    // Sort by order first, then by createdAt as fallback
    allContent.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // Fetch completed lessons
    completedLessonIds = new Set();
    try {
        const progressRes = await fetchWithAuth(`/api/progress/completed/${user.id}/${course.id}`);
        if (progressRes.ok) {
            const completedLessons = await progressRes.json();
            // Extract lesson IDs from user_progress records
            completedLessonIds = new Set(completedLessons.map(p => p.lesson_id));
        }
    } catch (error) {
        console.warn('Could not fetch completed lessons:', error);
    }

    const totalLessons = lessons.length;
    const completedLessonsCount = completedLessonIds.size;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

    const contentListHTML = allContent.length > 0
        ? allContent.map((item, index) => {
            const isQuiz = item.contentType === 'quiz';
            const isCompleted = !isQuiz && completedLessonIds.has(item.id);

            const userTier = user.subscriptionTier || 'free';
            const userRole = (user.role || '').toLowerCase();
            const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';

            const courseIsLocked = course.locked !== false;
            const hasAccess = isTeacherOrAdmin || !courseIsLocked || userTier === 'pro';

            const iconBg = isQuiz 
                ? 'bg-purple-100 dark:bg-purple-900/30' 
                : (isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30');
            const iconColor = isQuiz 
                ? 'text-purple-600 dark:text-purple-400' 
                : (isCompleted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400');
            const iconClass = isQuiz ? 'fa-puzzle-piece' : (isCompleted ? 'fa-check-circle' : 'fa-play-circle');

            const completedClass = isCompleted 
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10';

            const lockIcon = !hasAccess ? '<i class="fas fa-lock text-gray-400 dark:text-gray-500 ml-2"></i>' : '';

            return `
                <li class="lesson-card group p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-300 border ${completedClass} ${!hasAccess ? 'opacity-70' : ''}"
                    data-id="${item.id}"
                    data-type="${item.contentType}"
                    data-has-access="${hasAccess}">
                    <div class="w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                        <i class="fas ${iconClass} ${iconColor} text-sm"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">${index + 1}. ${escapeHtml(item.title)}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${isQuiz ? 'Quiz' : 'Lesson'}</p>
                    </div>
                    ${lockIcon}
                </li>
            `;
        }).join('')
        : '<li class="p-4 text-center"><p class="text-sm text-gray-500 dark:text-gray-400">No content available yet</p></li>';

    lessonPage.innerHTML = `
        <div class="mb-3">
            <button id="back-to-courses-btn" class="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-sm">
                <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span class="font-medium text-sm">Back to Courses</span>
            </button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <!-- Sidebar -->
            <div class="lg:col-span-4 xl:col-span-3">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden sticky top-24 border border-gray-200 dark:border-gray-700">
                    <!-- Course Header Card -->
                    <div class="relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
                        <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                        <div class="relative p-5">
                            <div class="flex items-start gap-3 mb-4">
                                <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-graduation-cap text-white text-lg"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h2 class="text-lg font-bold text-white leading-tight line-clamp-2">${escapeHtml(course.title)}</h2>
                                    <p class="text-blue-100 text-sm mt-1 truncate">
                                        <i class="fas fa-user-tie mr-1.5 text-xs"></i>
                                        ${escapeHtml(course.teacher?.name || course.instructor || 'Unknown Instructor')}
                                    </p>
                                </div>
                            </div>
                            <!-- Progress Section -->
                            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-white/90 font-medium">Your Progress</span>
                                    <span class="text-sm font-bold text-white progress-text">${progressPercentage}%</span>
                                </div>
                                <div class="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                                    <div class="progress-bar-fill bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full transition-all duration-700 ease-out" style="width: ${progressPercentage}%"></div>
                                </div>
                                <p class="text-xs text-white/70 mt-2">${completedLessonsCount} of ${totalLessons} lessons completed</p>
                            </div>
                        </div>
                    </div>
                    <!-- Content List -->
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <i class="fas fa-list-ul text-blue-600 dark:text-blue-400"></i>
                                Course Content
                            </h3>
                            <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">${allContent.length} items</span>
                        </div>
                        <ul id="content-list-sidebar" class="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">${contentListHTML}</ul>
                    </div>
                </div>
            </div>
            <!-- Main Content Area -->
            <div id="content-main" class="lg:col-span-8 xl:col-span-9">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden min-h-[40rem] border border-gray-200 dark:border-gray-700">
                    <div id="content-area" class="p-8">
                        <!-- Welcome State -->
                        <div class="text-center py-12">
                            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-6">
                                <i class="fas fa-play-circle text-4xl text-blue-600 dark:text-blue-400"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Welcome to ${escapeHtml(course.title)}!</h2>
                            <p class="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">${escapeHtml(course.description || 'Start your learning journey by selecting a lesson from the sidebar.')}</p>
                            <div class="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span class="flex items-center gap-1.5">
                                    <i class="fas fa-book-open text-blue-500"></i>
                                    ${totalLessons} Lessons
                                </span>
                                <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                <span class="flex items-center gap-1.5">
                                    <i class="fas fa-puzzle-piece text-purple-500"></i>
                                    ${quizzes.length} Quizzes
                                </span>
                            </div>
                            <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl inline-block">
                                <p class="text-sm text-blue-700 dark:text-blue-300">
                                    <i class="fas fa-lightbulb mr-2"></i>
                                    Select a lesson or quiz from the left to begin learning
                                </p>
                            </div>
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

            lessonPage.querySelectorAll('#content-list-sidebar .lesson-card').forEach(c => {
                c.classList.remove('active-lesson', 'border-blue-500', 'dark:border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
            });
            card.classList.add('active-lesson', 'border-blue-500', 'dark:border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');

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
            firstCard.classList.add('active-lesson', 'border-blue-500', 'dark:border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
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
    contentArea.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex justify-center items-center min-h-[40rem] border border-gray-200 dark:border-gray-700">
            <div class="text-center">
                <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <i class="fas fa-spinner fa-spin text-blue-600 dark:text-blue-400 text-xl"></i>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-sm">Loading lesson content...</p>
            </div>
        </div>`;

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
                    <div class="aspect-video bg-gray-900 rounded-t-2xl overflow-hidden">
                        <video class="w-full h-full" controls controlsList="nodownload">
                            <source src="${escapeHtml(data)}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>`;
            }

            if (embedUrl && !videoHTML) {
                videoHTML = `
                    <div class="aspect-video bg-gray-900 rounded-t-2xl overflow-hidden">
                        <iframe class="w-full h-full" src="${escapeHtml(embedUrl)}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
                    </div>`;
            }
        }

        const buttonClass = isCompleted
            ? 'inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl cursor-not-allowed font-medium text-sm'
            : 'inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105';
        const buttonText = isCompleted
            ? '<i class="fas fa-check-circle"></i><span>Completed</span>'
            : '<i class="fas fa-check"></i><span>Mark as Complete</span>';

        const contentHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                ${videoHTML || ''}
                <div class="p-6">
                    <!-- Lesson Header -->
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg">
                                    <i class="fas fa-book-open mr-1"></i>Lesson
                                </span>
                                ${isCompleted ? '<span class="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-lg"><i class="fas fa-check-circle mr-1"></i>Completed</span>' : ''}
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">${escapeHtml(lesson.title || 'Untitled Lesson')}</h2>
                        </div>
                        <button id="mark-complete-btn" data-lesson-id="${lesson.id}" data-course-id="${courseId}"
                                class="${buttonClass}" ${isCompleted ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                    </div>
                    <!-- Lesson Content -->
                    <div class="prose prose-lg dark:prose-invert max-w-none lesson-html-content">
                        ${lesson.description ? `<p class="text-gray-600 dark:text-gray-400 leading-relaxed">${escapeHtml(lesson.description)}</p>` : ''}
                        ${lesson.content ? `<div class="lesson-body text-gray-700 dark:text-gray-300 mt-4">${lesson.content}</div>` : ''}
                    </div>
                </div>
            </div>`;

        contentArea.innerHTML = contentHTML;

        const markCompleteBtn = document.getElementById('mark-complete-btn');
        if (markCompleteBtn && !isCompleted) {
            markCompleteBtn.addEventListener('click', handleMarkAsComplete);
        }
    } catch (error) {
        contentArea.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <div class="text-center py-8">
                    <div class="w-16 h-16 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Error Loading Lesson</h3>
                    <p class="text-gray-600 dark:text-gray-400">${error.message}</p>
                </div>
            </div>`;
    }
}

// ==================== PROGRESS TRACKING ====================
async function handleMarkAsComplete(event) {
    const button = event.currentTarget;
    const { lessonId, courseId } = button.dataset;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';

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

        button.innerHTML = '<i class="fas fa-check-circle"></i><span>Completed</span>';
        button.className = 'inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl cursor-not-allowed font-medium text-sm';
        button.disabled = true;
        button.style.pointerEvents = 'none';

        completedLessonIds.add(lessonId);

        // Update sidebar card with Octavia styling
        const sidebarCard = document.querySelector(`#content-list-sidebar [data-id="${lessonId}"][data-type="lesson"]`);
        if (sidebarCard) {
            // Update card styling
            sidebarCard.classList.remove('bg-white', 'dark:bg-gray-800', 'border-gray-200', 'dark:border-gray-700', 'hover:border-blue-300', 'dark:hover:border-blue-600', 'hover:bg-blue-50/50', 'dark:hover:bg-blue-900/10');
            sidebarCard.classList.add('bg-green-50', 'dark:bg-green-900/10', 'border-green-200', 'dark:border-green-800');

            // Update icon to checkmark
            const iconContainer = sidebarCard.querySelector('.w-9.h-9');
            if (iconContainer) {
                iconContainer.className = 'w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105';
                const icon = iconContainer.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-check-circle text-green-600 dark:text-green-400 text-sm';
                }
            }
        }

        const progressText = document.querySelector('.progress-text');
        const progressBarFill = document.querySelector('.progress-bar-fill');

        if (progressText && progressBarFill && result.completion !== undefined) {
            progressText.textContent = `${result.completion}%`;
            progressBarFill.style.width = `${result.completion}%`;
        }

        if (result.certificateGenerated && result.certificateData) {
            showCertificateCompletionPopup(result.certificateData);
        } else {
            showToast('Progress saved successfully!', 'success');
        }
    } catch (error) {
        console.error('Error marking lesson as complete:', error);
        showToast(`Error: ${error.message}`, 'error');
        button.innerHTML = '<i class="fas fa-check"></i><span>Mark as Complete</span>';
        button.className = 'inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105';
        button.disabled = false;
    }
}

// ==================== QUIZ INTERFACE ====================
async function renderQuizInterface(quizId) {
    const contentArea = document.getElementById('content-main');
    contentArea.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex justify-center items-center min-h-[40rem] border border-gray-200 dark:border-gray-700">
            <div class="text-center">
                <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <i class="fas fa-spinner fa-spin text-purple-600 dark:text-purple-400 text-xl"></i>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-sm">Loading quiz...</p>
            </div>
        </div>`;

    try {
        const quizRes = await fetchWithAuth(`/api/quizzes/${quizId}`);
        if (!quizRes.ok) throw new Error('Could not fetch quiz details.');
        
        const quiz = await quizRes.json();
        const questions = quiz.questions || [];
        const quizTitle = quiz.title || 'Untitled Quiz';
        const quizDescription = quiz.description || '';

        if (questions.length === 0) {
            contentArea.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div class="text-center py-8">
                        <div class="w-16 h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-puzzle-piece text-purple-600 dark:text-purple-400 text-2xl"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">${escapeHtml(quizTitle)}</h2>
                        <p class="text-gray-600 dark:text-gray-400">This quiz has no questions yet.</p>
                    </div>
                </div>`;
            return;
        }

        let questionsHTML = questions.map((q, index) => {
            // Handle options - could be object {A, B, C, D} or array
            let optionsArray = [];
            const opts = q.options || {};
            if (Array.isArray(opts)) {
                optionsArray = opts;
            } else {
                // Convert object to array
                optionsArray = [opts.A || '', opts.B || '', opts.C || '', opts.D || ''].filter(o => o);
            }
            
            const optionsHTML = optionsArray.map((option, i) => `
                <label class="quiz-option group flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 cursor-pointer transition-all duration-200">
                    <input type="radio" name="question-${index}" value="${i}" class="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500" required>
                    <span class="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">${escapeHtml(option)}</span>
                </label>
            `).join('');
            
            // Support both camelCase and snake_case for question text
            const questionText = q.questionText || q.question_text || q.text || '';
            
            return `
                <div class="question-block mb-6 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p class="font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-start gap-3">
                        <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-300 text-sm font-bold">${index + 1}</span>
                        <span class="pt-1">${escapeHtml(questionText)}</span>
                    </p>
                    <div class="space-y-3 ml-11">${optionsHTML}</div>
                </div>
            `;
        }).join('');

        contentArea.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div class="flex items-start gap-4">
                        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-puzzle-piece text-white text-xl"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-lg">
                                    <i class="fas fa-clipboard-check mr-1"></i>Quiz
                                </span>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">${escapeHtml(quizTitle)}</h2>
                            ${quizDescription ? `<p class="text-gray-600 dark:text-gray-400 mt-1">${escapeHtml(quizDescription)}</p>` : ''}
                        </div>
                    </div>
                    <div class="mt-4 flex items-center gap-4 text-sm">
                        <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
                            <i class="fas fa-question-circle"></i>
                            <span>${questions.length} Questions</span>
                        </div>
                        <div class="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                            <i class="fas fa-infinity"></i>
                            <span>No time limit</span>
                        </div>
                    </div>
                </div>
                <form id="quiz-form" class="p-6">
                    ${questionsHTML}
                    <button type="submit" class="w-full mt-6 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] flex items-center justify-center gap-2">
                        <i class="fas fa-paper-plane"></i>
                        <span>Submit Quiz</span>
                    </button>
                </form>
            </div>
        `;

        document.getElementById('quiz-form').addEventListener('submit', (e) => handleQuizSubmission(e, quizId, questions, quiz.courseId || quiz.course_id));
    } catch (error) {
        contentArea.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <div class="text-center py-8">
                    <div class="w-16 h-16 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Error Loading Quiz</h3>
                    <p class="text-gray-600 dark:text-gray-400">${error.message}</p>
                </div>
            </div>`;
    }
}

async function handleQuizSubmission(event, quizId, questions, courseId) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Grading...`;

    // Helper to convert letter answer to index
    const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
    
    const userAnswers = [];
    let score = 0;
    let unanswered = false;

    questions.forEach((q, index) => {
        const selectedOption = form.querySelector(`input[name="question-${index}"]:checked`);
        if (selectedOption) {
            const answerIndex = parseInt(selectedOption.value, 10);
            userAnswers[index] = answerIndex;
            
            // Get correct answer - handle multiple field names and formats
            let correctIndex = q.correctAnswerIndex ?? q.correctAnswer ?? q.correct_answer ?? q.correct_answer_index;
            // Convert letter to index if needed
            if (typeof correctIndex === 'string' && letterToIndex[correctIndex] !== undefined) {
                correctIndex = letterToIndex[correctIndex];
            } else if (typeof correctIndex === 'string') {
                correctIndex = parseInt(correctIndex, 10);
            }
            
            if (answerIndex === correctIndex) {
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
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i><span>Submit Quiz</span>';
        return;
    }

    const percentage = Math.round((score / questions.length) * 100);

    try {
        await fetchWithAuth('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id, // lấy từ localStorage (khi đã login bằng teacher)
                quizId: quizId, // lấy từ URL hiện tại để hiện đúng id
                courseId: courseId, // lấy từ Url hiện tại để hiện đúng id như cách google auth nhả ra token
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
        // Get correct answer - handle multiple field names
        let correctAnswerIndex = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex :
            (q.correctAnswer !== undefined ? q.correctAnswer :
                (q.correct_answer !== undefined ? q.correct_answer : q.correct_answer_index));
        
        // If correctAnswer is a letter (A, B, C, D), convert to index
        if (typeof correctAnswerIndex === 'string') {
            const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
            correctAnswerIndex = letterToIndex[correctAnswerIndex.toUpperCase()] ?? correctAnswerIndex;
        }

        // Handle options - could be object {A, B, C, D} or array
        let optionsArray = [];
        const opts = q.options || {};
        if (Array.isArray(opts)) {
            optionsArray = opts;
        } else {
            // Convert object to array
            optionsArray = [opts.A || '', opts.B || '', opts.C || '', opts.D || ''].filter(o => o);
        }

        const optionsHTML = optionsArray.map((option, i) => {
            let baseClasses = 'flex items-center gap-3 p-4 rounded-xl border-2 transition-all';
            let stateClasses = '';
            let icon = '';
            
            if (i === correctAnswerIndex) {
                stateClasses = 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700';
                icon = '<i class="fas fa-check-circle text-green-500 flex-shrink-0"></i>';
            } else if (i === userAnswers[index] && i !== correctAnswerIndex) {
                stateClasses = 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
                icon = '<i class="fas fa-times-circle text-red-500 flex-shrink-0"></i>';
            } else {
                stateClasses = 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600';
                icon = '<span class="w-5"></span>';
            }
            
            return `<div class="${baseClasses} ${stateClasses}">${icon}<span class="text-gray-700 dark:text-gray-300">${escapeHtml(option)}</span></div>`;
        }).join('');

        const isCorrect = userAnswers[index] === correctAnswerIndex;
        let correctAnswerText = 'N/A';
        if (optionsArray.length > 0 && correctAnswerIndex !== undefined && optionsArray[correctAnswerIndex]) {
            correctAnswerText = optionsArray[correctAnswerIndex];
        }
        
        // Support both camelCase and snake_case for question text
        const questionText = q.questionText || q.question_text || q.text || '';

        return `
            <div class="question-block mb-6 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div class="flex items-start gap-3 mb-4">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}">
                        <i class="fas fa-${isCorrect ? 'check' : 'times'} ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} text-sm"></i>
                    </div>
                    <p class="font-semibold text-gray-800 dark:text-gray-200 pt-1">${index + 1}. ${escapeHtml(questionText)}</p>
                </div>
                <div class="space-y-2 ml-11">${optionsHTML}</div>
                ${!isCorrect ? `
                <div class="ml-11 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p class="text-sm text-blue-700 dark:text-blue-300">
                        <i class="fas fa-lightbulb mr-2"></i>Correct answer: <strong>${escapeHtml(correctAnswerText)}</strong>
                    </p>
                </div>` : ''}
            </div>
        `;
    }).join('');

    const passStatus = percentage >= 70;
    const gradientColors = passStatus 
        ? 'from-green-500 to-emerald-600' 
        : 'from-red-500 to-rose-600';
    
    contentArea.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <!-- Results Header -->
            <div class="relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br ${gradientColors}"></div>
                <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                <div class="relative p-8 text-center text-white">
                    <div class="mx-auto w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                        <i class="fas fa-${passStatus ? 'trophy' : 'redo-alt'} text-4xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold mb-2">Quiz ${passStatus ? 'Completed!' : 'Results'}</h2>
                    <p class="text-6xl font-bold my-4">${percentage}%</p>
                    <p class="text-white/90">You answered <strong>${score}</strong> out of <strong>${questions.length}</strong> questions correctly</p>
                    <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm">
                        <i class="fas fa-${passStatus ? 'check-circle' : 'exclamation-triangle'}"></i>
                        <span>${passStatus ? 'Passed' : 'Need 70% to pass'}</span>
                    </div>
                </div>
            </div>
            <!-- Review Section -->
            <div class="p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <i class="fas fa-clipboard-list text-purple-600 dark:text-purple-400"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Review Your Answers</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">See which questions you got right and wrong</p>
                    </div>
                </div>
                ${feedbackHTML}
            </div>
        </div>
    `;
}

// ==================== CERTIFICATE POPUP ====================
function showCertificateCompletionPopup(certificateData) {
    const popup = document.getElementById('certificate-completion-popup');
    const courseTitle = document.getElementById('cert-course-title');
    const viewCertBtn = document.getElementById('view-my-certificate-btn');

    courseTitle.textContent = certificateData.courseName || certificateData.course_title || 'Course';
    
    // Update View Certificate button to redirect to certificate viewer
    viewCertBtn.onclick = () => {
        window.location.href = `/certificate-view?id=${certificateData.id}`;
    };
    
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
