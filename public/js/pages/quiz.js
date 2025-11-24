/**
 * Quiz Page JavaScript
 * Handles quiz listing and grades display
 */

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const user = checkAuth();
    if (!user) return;
    
    // Update user avatar
    updateUserAvatar('user-avatar', user.name);
    
    // Setup logout button
    setupLogoutButton('logout-button');
    
    // Initialize tabs
    initializeTabs();
});

/**
 * Initialize quiz/grades tabs
 */
function initializeTabs() {
    const quizzesTab = document.getElementById('tab-quizzes');
    const gradesTab = document.getElementById('tab-grades');
    
    if (quizzesTab) {
        quizzesTab.addEventListener('click', () => activateTab('quizzes'));
    }
    
    if (gradesTab) {
        gradesTab.addEventListener('click', () => activateTab('grades'));
    }
    
    // Load initial tab
    activateTab('quizzes');
}

/**
 * Activate specific tab
 * @param {string} tab - Tab name ('quizzes' or 'grades')
 */
function activateTab(tab) {
    const quizzesTab = document.getElementById('tab-quizzes');
    const gradesTab = document.getElementById('tab-grades');
    const quizzesContent = document.getElementById('content-quizzes');
    const gradesContent = document.getElementById('content-grades');
    
    if (tab === 'quizzes') {
        quizzesContent.classList.add('active');
        gradesContent.classList.remove('active');
        
        quizzesTab.classList.add('border-blue-600', 'text-blue-600');
        quizzesTab.classList.remove('text-gray-500', 'border-transparent');
        
        gradesTab.classList.add('text-gray-500', 'border-transparent');
        gradesTab.classList.remove('border-blue-600', 'text-blue-600');
        
        renderAvailableQuizzes();
    } else {
        gradesContent.classList.add('active');
        quizzesContent.classList.remove('active');
        
        gradesTab.classList.add('border-blue-600', 'text-blue-600');
        gradesTab.classList.remove('text-gray-500', 'border-transparent');
        
        quizzesTab.classList.add('text-gray-500', 'border-transparent');
        quizzesTab.classList.remove('border-blue-600', 'text-blue-600');
        
        renderMyGrades();
    }
}

/**
 * Render available quizzes
 */
async function renderAvailableQuizzes() {
    const quizzesContent = document.getElementById('content-quizzes');
    if (!quizzesContent) return;
    
    showLoading('content-quizzes', 'Loading available quizzes...');
    
    try {
        const quizzes = await apiGet('/api/quizzes');
        
        if (quizzes.length === 0) {
            showEmptyState('content-quizzes', 'No quizzes available at the moment.');
            return;
        }
        
        quizzesContent.innerHTML = '';
        quizzes.forEach(quiz => {
            const quizCard = createQuizCard(quiz);
            quizzesContent.appendChild(quizCard);
        });
    } catch (error) {
        showError('content-quizzes', `Error loading quizzes: ${error.message}`);
    }
}

/**
 * Create quiz card element
 * @param {Object} quiz - Quiz object
 * @returns {HTMLElement} Quiz card element
 */
function createQuizCard(quiz) {
    const card = document.createElement('div');
    card.className = 'quiz-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500';
    card.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">${escapeHtml(quiz.title)}</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4 h-16">${escapeHtml(quiz.description || 'Test your knowledge with this quiz.')}</p>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">${quiz.questionCount || 'N/A'} Questions</span>
            <a href="/courses" onclick="localStorage.setItem('selectedCourseId', '${quiz.course_id}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Go to Course
            </a>
        </div>
    `;
    return card;
}

/**
 * Render user's grades
 */
async function renderMyGrades() {
    const gradesContent = document.getElementById('content-grades');
    if (!gradesContent) return;
    
    showLoading('content-grades', 'Loading your grades...');
    
    try {
        const user = getStoredUser();
        const allGrades = await apiGet('/api/grades');
        const myGrades = allGrades.filter(grade => grade.user && grade.user.id === user.id);
        
        if (myGrades.length === 0) {
            showEmptyState('content-grades', "You haven't completed any quizzes yet.", 'fa-clipboard-check');
            return;
        }
        
        const tableRows = myGrades.map(grade => createGradeRow(grade)).join('');
        
        gradesContent.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quiz</th>
                            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        showError('content-grades', `Error loading grades: ${error.message}`);
    }
}

/**
 * Create grade table row
 * @param {Object} grade - Grade object
 * @returns {string} HTML string for table row
 */
function createGradeRow(grade) {
    const statusClass = grade.score >= 70 ? 'text-green-600' : 'text-red-600';
    const statusText = grade.score >= 70 ? 'Passed' : 'Failed';
    const quizTitle = grade.quiz ? escapeHtml(grade.quiz.title) : 'Quiz not found';
    const dateFormatted = formatDate(grade.createdAt);
    
    return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 font-medium">${quizTitle}</td>
            <td class="px-6 py-4 font-bold ${statusClass}">${grade.score}%</td>
            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${dateFormatted}</td>
            <td class="px-6 py-4 font-semibold ${statusClass}">${statusText}</td>
        </tr>
    `;
}
