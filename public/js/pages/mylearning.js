/**
 * My Learning Page JavaScript
 * Handles enrolled courses, quizzes, grades, and certificates
 */

// ==================== GLOBAL VARIABLES ====================
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    if (!token || !user) {
        window.location.href = '/login';
        return;
    }

    setupEventListeners();
    
    // Check for hash in URL (e.g., #certificates from course completion)
    const hash = window.location.hash.substring(1); // Remove '#'
    if (hash === 'certificates') {
        setActiveTab('content-certificates');
    } else {
        setActiveTab('content-dashboard');
    }
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveTab(btn.dataset.target);
        });
    });

    // Logout buttons
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login';
        });
    }

    const mobileLogoutBtn = document.getElementById('mobile-logout-button');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login';
        });
    }

    // Close completion popup
    const closePopup = document.getElementById('close-completion-popup');
    const completionPopup = document.getElementById('completion-popup');
    if (closePopup && completionPopup) {
        closePopup.addEventListener('click', () => {
            completionPopup.classList.add('hidden');
        });
    }

    const viewCertBtn = document.getElementById('view-cert-button');
    if (viewCertBtn && completionPopup) {
        viewCertBtn.addEventListener('click', () => {
            completionPopup.classList.add('hidden');
            setActiveTab('certificates');
        });
    }
}

// ==================== TAB MANAGEMENT ====================
function setActiveTab(targetId) {
    // Hide all content sections
    document.querySelectorAll('[id^="content-"]').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activate the selected button
    const activeBtn = document.querySelector(`.tab-button[data-target="${targetId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Show the selected content
    const activeContent = document.getElementById(targetId);
    if (activeContent) activeContent.classList.remove('hidden');

    // Load appropriate data based on tab
    if (targetId === 'content-dashboard') {
        fetchAndRenderLearningProgress();
        fetchAndRenderEnrolledCourses();
    } else if (targetId === 'content-quizzes') {
        fetchAndRenderAvailableQuizzes();
    } else if (targetId === 'content-grades') {
        fetchAndRenderMyGrades();
    } else if (targetId === 'content-certificates') {
        fetchAndRenderCertificates();
    }
}

// ==================== ENROLLED COURSES ====================
async function fetchAndRenderEnrolledCourses() {
    const enrolledListDiv = document.getElementById('enrolled-courses-list');
    enrolledListDiv.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-blue-500 text-2xl mb-3"></i>
            <p class="text-gray-500 dark:text-gray-400">Loading your courses...</p>
        </div>`;

    try {
        // Fetch user enrollments with course details and progress
        const enrollmentsResponse = await fetchWithAuth(`/api/users/${user.id}/enrollments`);
        if (!enrollmentsResponse.ok) {
            throw new Error('Failed to fetch enrollments');
        }

        const enrollments = await enrollmentsResponse.json();

        if (!Array.isArray(enrollments) || enrollments.length === 0) {
            enrolledListDiv.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-book-open text-blue-500 text-2xl"></i>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">You haven't enrolled in any courses yet</p>
                    <a href="/courses" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                        <i class="fas fa-search"></i> Browse Courses
                    </a>
                </div>`;
            return;
        }

        enrolledListDiv.innerHTML = '';
        enrollments.forEach(enrollment => {
            const percentage = enrollment.percentage || 0;
            const totalLessons = enrollment.totalLessons || 0;
            const completedLessons = Math.round((percentage / 100) * totalLessons);

            const courseItem = document.createElement('div');
            courseItem.className = 'group flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 cursor-pointer';
            courseItem.onclick = () => window.location.href = `/courses#lesson/${enrollment.courseId}`;
            courseItem.innerHTML = `
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-book text-white text-lg"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(enrollment.title)}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${completedLessons}/${totalLessons} Lessons</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                        <p class="text-lg font-bold ${percentage === 100 ? 'text-green-600' : 'text-blue-600'}">${percentage}%</p>
                    </div>
                    <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <i class="fas fa-arrow-right text-blue-600 group-hover:text-white text-sm"></i>
                    </div>
                </div>
            `;
            enrolledListDiv.appendChild(courseItem);
        });
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        enrolledListDiv.innerHTML = `
            <div class="text-center py-8">
                <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-exclamation-triangle text-red-500"></i>
                </div>
                <p class="text-red-500">Error loading your courses</p>
            </div>`;
    }
}

// ==================== LEARNING PROGRESS ====================
async function fetchAndRenderLearningProgress() {
    const progressListDiv = document.getElementById('progress-container');
    if (!progressListDiv) {
        console.error('progress-container not found');
        return;
    }

    progressListDiv.innerHTML = '<p class="text-gray-500">Loading your progress...</p>';

    try {
        const progressResponse = await fetchWithAuth(`/api/users/${user.id}/progress`);
        if (!progressResponse.ok) throw new Error('Failed to fetch progress.');
        
        const progressData = await progressResponse.json();

        if (!Array.isArray(progressData) || progressData.length === 0) {
            progressListDiv.innerHTML = '<p class="text-gray-500">No progress data available yet.</p>';
            return;
        }

        const coursesResponse = await fetchWithAuth('/api/courses');
        if (!coursesResponse.ok) throw new Error('Failed to fetch courses.');
        const allCourses = await coursesResponse.json();

        progressListDiv.innerHTML = '';
        progressData.slice(0, 5).forEach(progress => {
            const course = allCourses.find(c => c.id === progress.courseId);
            if (!course) return;

            const progressItem = document.createElement('div');
            progressItem.className = 'border rounded-lg p-4';
            progressItem.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-semibold text-gray-800">${escapeHtml(course.title)}</h4>
                    <span class="text-sm font-medium text-blue-600">${progress.percentage}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
            `;
            progressListDiv.appendChild(progressItem);
        });
    } catch (error) {
        console.error('Error fetching learning progress:', error);
        progressListDiv.innerHTML = '<p class="text-red-500">Error loading progress data.</p>';
    }
}

// ==================== AVAILABLE QUIZZES ====================
async function fetchAndRenderAvailableQuizzes() {
    const quizListDiv = document.getElementById('available-quizzes-list');
    if (!quizListDiv) return;

    quizListDiv.innerHTML = '<p class="text-gray-500">Loading available quizzes...</p>';

    try {
        const quizzesResponse = await fetchWithAuth('/api/quizzes');
        if (!quizzesResponse.ok) throw new Error('Failed to fetch quizzes.');
        
        const quizzes = await quizzesResponse.json();

        // Fetch grades to check completed quizzes
        const gradesResponse = await fetchWithAuth(`/api/grades?userId=${user.id}`);
        let completedQuizzes = [];
        if (gradesResponse.ok) {
            const grades = await gradesResponse.json();
            completedQuizzes = grades.map(g => g.quizId || g.quiz_id);
        }

        if (!Array.isArray(quizzes) || quizzes.length === 0) {
            quizListDiv.innerHTML = '<p class="text-gray-500">No quizzes available yet.</p>';
            return;
        }

        quizListDiv.innerHTML = '';
        quizzes.forEach(quiz => {
            const isCompleted = completedQuizzes.includes(quiz.id);
            const quizCard = document.createElement('div');
            quizCard.className = 'quiz-card border rounded-lg p-4 hover:shadow-md transition-shadow';
            quizCard.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center mr-4">
                            <i class="fas fa-clipboard-question text-blue-600 text-xl"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">${escapeHtml(quiz.title)}</h4>
                            <p class="text-sm text-gray-500">${quiz.questions ? quiz.questions.length : 0} questions</p>
                            ${isCompleted ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">Completed</span>' : ''}
                        </div>
                    </div>
                    <button onclick="window.location.href='/courses?quizId=${quiz.id}&courseId=${quiz.courseId || quiz.course_id}'" 
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        ${isCompleted ? 'Retake' : 'Start'}
                    </button>
                </div>
            `;
            quizListDiv.appendChild(quizCard);
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        quizListDiv.innerHTML = '<p class="text-red-500">Error loading quizzes.</p>';
    }
}

// ==================== MY GRADES ====================
async function fetchAndRenderMyGrades() {
    const gradesListDiv = document.getElementById('my-grades-list');
    if (!gradesListDiv) return;

    gradesListDiv.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-purple-500 text-2xl mb-3"></i>
            <p class="text-gray-500 dark:text-gray-400">Loading your grades...</p>
        </div>`;

    try {
        const gradesResponse = await fetchWithAuth(`/api/grades?userId=${user.id}`);
        if (!gradesResponse.ok) throw new Error('Failed to fetch grades.');
        
        const grades = await gradesResponse.json();

        if (!Array.isArray(grades) || grades.length === 0) {
            gradesListDiv.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-clipboard-list text-purple-500 text-2xl"></i>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400 mb-2">No quiz results yet</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Complete quizzes to see your grades here</p>
                </div>`;
            return;
        }

        const quizzesResponse = await fetchWithAuth('/api/quizzes');
        const quizzes = quizzesResponse.ok ? await quizzesResponse.json() : [];

        gradesListDiv.innerHTML = '';
        grades.forEach(grade => {
            const quiz = quizzes.find(q => q.id === (grade.quizId || grade.quiz_id));
            const quizTitle = quiz ? quiz.title : 'Unknown Quiz';
            const score = grade.score || 0;
            const passStatus = score >= 70;

            const gradeCard = document.createElement('div');
            gradeCard.className = 'group flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-300';
            gradeCard.innerHTML = `
                <div class="w-12 h-12 rounded-xl ${passStatus ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} flex items-center justify-center flex-shrink-0">
                    <i class="fas ${passStatus ? 'fa-check' : 'fa-times'} text-white text-lg"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-800 dark:text-gray-200 truncate">${escapeHtml(quizTitle)}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${formatDate(grade.createdAt || grade.created_at)}</p>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-bold ${passStatus ? 'text-green-600' : 'text-red-600'}">${score}%</p>
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full ${passStatus ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}">
                        ${passStatus ? 'Passed' : 'Failed'}
                    </span>
                </div>
            `;
            gradesListDiv.appendChild(gradeCard);
        });
    } catch (error) {
        console.error('Error fetching grades:', error);
        gradesListDiv.innerHTML = `
            <div class="text-center py-8">
                <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-exclamation-triangle text-red-500"></i>
                </div>
                <p class="text-red-500">Error loading grades</p>
            </div>`;
    }
}

// ==================== CERTIFICATES ====================
async function fetchAndRenderCertificates() {
    const certificatesListDiv = document.getElementById('certificates-grid');
    if (!certificatesListDiv) {
        console.error('certificates-grid not found');
        return;
    }

    certificatesListDiv.innerHTML = '<p class="text-gray-500">Loading your certificates...</p>';

    try {
        const certificatesResponse = await fetchWithAuth(`/api/certificates?userId=${user.id}`);
        if (!certificatesResponse.ok) throw new Error('Failed to fetch certificates.');
        
        const certificates = await certificatesResponse.json();

        if (!Array.isArray(certificates) || certificates.length === 0) {
            certificatesListDiv.innerHTML = '<p class="text-gray-500">No certificates yet. Complete courses to earn certificates!</p>';
            return;
        }

        certificatesListDiv.innerHTML = '';
        certificates.forEach(cert => {
            const certCard = document.createElement('div');
            certCard.className = 'certificate-card border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50';
            certCard.innerHTML = `
                <div class="flex items-center justify-between">
                    <div>
                        <div class="flex items-center mb-2">
                            <i class="fas fa-award text-yellow-500 text-2xl mr-3"></i>
                            <h4 class="font-bold text-gray-800">${escapeHtml(cert.courseName || 'Course')}</h4>
                        </div>
                        <p class="text-sm text-gray-600">Student: ${escapeHtml(cert.userName || 'Unknown')}</p>
                        <p class="text-sm text-gray-600">Issued: ${formatDate(cert.issuedAt)}</p>
                    </div>
                    <button onclick="viewCertificate('${cert.id}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        View
                    </button>
                </div>
            `;
            certificatesListDiv.appendChild(certCard);
        });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        certificatesListDiv.innerHTML = '<p class="text-red-500">Error loading certificates.</p>';
    }
}

// ==================== CERTIFICATE VIEWING ====================
window.viewCertificate = function(certificateId) {
    window.location.href = `/certificate-view?id=${certificateId}`;
};

// ==================== UTILITY FUNCTIONS ====================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        // Handle Firestore Timestamp objects
        if (dateString._seconds) {
            const date = new Date(dateString._seconds * 1000);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        // Handle regular date strings/timestamps
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
}
