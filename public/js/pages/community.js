/**
 * Community Page JavaScript
 * Handles study groups, forum, leaderboard, progress tracking, and Pomodoro timer
 */

// ==================== GLOBAL VARIABLES ====================
const API_BASE = (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin) + '/api/community';
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

let currentGroupId = null;

// Pomodoro Timer Variables
let timerInterval;
let timeLeft = 25 * 60;
let isRunning = false;
let isWorkSession = true;
let sessionsCompleted = parseInt(localStorage.getItem('pomodoroSessions') || '0');

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const CIRCLE_CIRCUMFERENCE = 351.86;

// ==================== AUTH GUARD ====================
if (!token || !user) {
    window.location.href = '/login';
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeUserHeader();
    setupEventListeners();
    initializePomodoroTimer();
    
    // Fetch data
    renderUserProgress();
    renderLeaderboard();
    renderMyStudyGroups();
});

// ==================== USER HEADER ====================
function initializeUserHeader() {
    const initials = getUserInitials();
    const userAvatarEl = document.getElementById('user-avatar');
    if (userAvatarEl) {
        if (user.avatarUrl) {
            userAvatarEl.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" class="h-8 w-8 rounded-full object-cover">`;
        } else {
            userAvatarEl.textContent = initials;
            userAvatarEl.className = 'h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold';
        }
    }

    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login';
        });
    }

    const userMenuBtn = document.getElementById('user-menu-button');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', () => {
            window.location.href = '/profile';
        });
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Study Groups
    const joinNewGroupBtn = document.getElementById('join-new-group-btn');
    if (joinNewGroupBtn) {
        joinNewGroupBtn.addEventListener('click', showAvailableGroups);
    }

    const closeGroupsModal = document.getElementById('close-groups-modal');
    const availableGroupsModal = document.getElementById('available-groups-modal');
    if (closeGroupsModal && availableGroupsModal) {
        closeGroupsModal.addEventListener('click', () => {
            availableGroupsModal.classList.add('hidden');
        });
    }

    if (availableGroupsModal) {
        availableGroupsModal.addEventListener('click', (e) => {
            if (e.target.id === 'available-groups-modal') {
                availableGroupsModal.classList.add('hidden');
            }
        });
    }

    // Forum
    const closeForumModal = document.getElementById('close-forum-modal');
    const groupForumModal = document.getElementById('group-forum-modal');
    if (closeForumModal && groupForumModal) {
        closeForumModal.addEventListener('click', () => {
            groupForumModal.classList.add('hidden');
        });
    }

    if (groupForumModal) {
        groupForumModal.addEventListener('click', (e) => {
            if (e.target.id === 'group-forum-modal') {
                groupForumModal.classList.add('hidden');
            }
        });
    }

    const sendMessageBtn = document.getElementById('send-message-btn');
    const newMessageInput = document.getElementById('new-message-input');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendForumMessage);
    }
    if (newMessageInput) {
        newMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendForumMessage();
        });
    }

    // Weekly Goal
    const adjustGoalBtn = document.getElementById('adjust-goal-btn');
    if (adjustGoalBtn) {
        adjustGoalBtn.addEventListener('click', showWeeklyGoalDialog);
    }
}

// ==================== UTILITY FUNCTIONS ====================
function getUserInitials() {
    if (user && user.name) {
        const parts = user.name.split(' ');
        let initials = parts[0].charAt(0).toUpperCase();
        if (parts.length > 1) {
            initials += parts.pop().charAt(0).toUpperCase();
        }
        return initials;
    }
    return 'AC';
}

// ==================== PROGRESS & STATS ====================
async function renderUserProgress() {
    try {
        const response = await fetch(`/api/users/${user.id}/enrollments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch progress');
        
        const enrollments = await response.json();
        
        // Calculate courses completed (based on enrollments with 100% progress)
        const completedCourses = enrollments.filter(e => e.percentage === 100).length;
        const totalCourses = enrollments.length || 1;
        const completionPercentage = (completedCourses / totalCourses) * 100;

        const courseCompletedCount = document.getElementById('course-completed-count');
        const courseCompletedBar = document.getElementById('course-completed-bar');
        if (courseCompletedCount) {
            courseCompletedCount.textContent = `${completedCourses}/${totalCourses}`;
        }
        if (courseCompletedBar) {
            courseCompletedBar.style.width = `${completionPercentage}%`;
        }

        // Weekly goal (simplified)
        const weeklyGoal = parseInt(localStorage.getItem('weeklyGoal') || '3');
        const weeklyProgress = Math.min(completedCourses, weeklyGoal);
        const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100;

        const weeklyGoalCount = document.getElementById('weekly-goal-count');
        const weeklyGoalBar = document.getElementById('weekly-goal-bar');
        if (weeklyGoalCount) {
            weeklyGoalCount.textContent = `${weeklyProgress}/${weeklyGoal} courses`;
        }
        if (weeklyGoalBar) {
            weeklyGoalBar.style.width = `${weeklyPercentage}%`;
        }

        // Study points
        const studyPoints = completedCourses * 100;
        const studyPointsEl = document.getElementById('study-points');
        if (studyPointsEl) {
            studyPointsEl.textContent = studyPoints;
        }

        // Rank/Badge
        updateRankBadge(completedCourses);
    } catch (error) {
        console.error('Error fetching progress:', error);
    }
}

function updateRankBadge(completedCourses) {
    let rank = { 
        name: 'Beginner', 
        color: '#9CA3AF', 
        description: 'Complete 5 courses to rank up!'
    };
    
    if (completedCourses >= 20) {
        rank = { 
            name: 'Master', 
            color: '#F59E0B', 
            description: 'You are a master learner!'
        };
    } else if (completedCourses >= 10) {
        rank = { 
            name: 'Expert', 
            color: '#10B981', 
            description: 'Impressive! 10 more to Master!'
        };
    } else if (completedCourses >= 5) {
        rank = { 
            name: 'Intermediate', 
            color: '#3B82F6', 
            description: '5 more courses to Expert!'
        };
    }

    const rankName = document.getElementById('rank-name');
    const rankDescription = document.getElementById('rank-description');
    const rankBadge = document.getElementById('rank-badge');
    const rankContainer = document.getElementById('rank-container');

    if (rankName) {
        rankName.textContent = rank.name;
    }
    if (rankDescription) {
        rankDescription.textContent = rank.description;
    }
    if (rankBadge) {
        // SVG hexagon badge with number in center - similar to old design
        rankBadge.innerHTML = `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                <defs>
                    <linearGradient id="grad-${completedCourses}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${rank.color};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${rank.color};stop-opacity:0.7" />
                    </linearGradient>
                </defs>
                <!-- Hexagon shape -->
                <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="url(#grad-${completedCourses})" stroke="${rank.color}" stroke-width="3"/>
                <!-- Number in center -->
                <text x="50" y="60" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${completedCourses}</text>
            </svg>
        `;
    }
    
    // Update container color based on rank
    if (rankContainer) {
        rankContainer.className = 'p-4 rounded-lg border-2';
        if (completedCourses >= 20) {
            rankContainer.classList.add('bg-gradient-to-br', 'from-yellow-50', 'to-orange-50', 'border-yellow-300');
        } else if (completedCourses >= 10) {
            rankContainer.classList.add('bg-gradient-to-br', 'from-green-50', 'to-emerald-50', 'border-green-300');
        } else if (completedCourses >= 5) {
            rankContainer.classList.add('bg-gradient-to-br', 'from-blue-50', 'to-indigo-50', 'border-blue-300');
        } else {
            rankContainer.classList.add('bg-gradient-to-br', 'from-gray-50', 'to-gray-100', 'border-gray-300');
        }
    }
}

function showWeeklyGoalDialog() {
    const currentGoal = parseInt(localStorage.getItem('weeklyGoal') || '3');
    const newGoal = prompt(`Set your weekly goal (current: ${currentGoal} courses):`, currentGoal);
    
    if (newGoal && !isNaN(newGoal) && newGoal > 0) {
        localStorage.setItem('weeklyGoal', newGoal);
        renderUserProgress();
        notify.success(`Weekly goal updated to ${newGoal} courses!`);
    }
}

// ==================== LEADERBOARD ====================
async function renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    try {
        const response = await fetch(`${API_BASE}/leaderboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        
        const leaderboard = await response.json();

        if (!leaderboard || leaderboard.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No leaderboard data yet.</p>';
            return;
        }

        container.innerHTML = '';
        leaderboard.slice(0, 10).forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700';
            
            // Medal icons for top 3
            let rankDisplay = `<span class="font-bold text-gray-500 text-lg w-8">${index + 1}</span>`;
            if (index === 0) {
                rankDisplay = `<span class="text-2xl w-8">🥇</span>`;
            } else if (index === 1) {
                rankDisplay = `<span class="text-2xl w-8">🥈</span>`;
            } else if (index === 2) {
                rankDisplay = `<span class="text-2xl w-8">🥉</span>`;
            }
            
            // Use 'hours' field from backend (which contains completed courses count)
            const coursesCompleted = entry.hours || 0;
            const userName = entry.name || entry.userName || 'Unknown';
            const userInitials = entry.initials || getInitials(userName);
            const isCurrentUser = entry.userId === user.id || entry.email === user.email;
            
            item.innerHTML = `
                <div class="flex items-center gap-3">
                    ${rankDisplay}
                    <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        ${userInitials}
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800 dark:text-gray-200">${escapeHtml(userName)}${isCurrentUser ? ' <span class="text-xs">(You)</span>' : ''}</p>
                        <p class="text-xs text-gray-500">${coursesCompleted} courses completed</p>
                    </div>
                </div>
                <span class="font-bold ${index < 3 ? 'text-orange-500' : 'text-blue-600'}">${entry.points || 0} pts</span>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        container.innerHTML = '<p class="text-red-500 text-sm">Error loading leaderboard.</p>';
    }
}

function getInitials(name) {
    if (!name) return 'AC';
    const parts = name.split(' ');
    let initials = parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) initials += parts.pop().charAt(0).toUpperCase();
    return initials;
}

// ==================== STUDY GROUPS ====================
async function renderMyStudyGroups() {
    const container = document.getElementById('my-study-groups-container');
    try {
        const response = await fetch(`${API_BASE}/users/${user.id}/groups`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch groups');
        
        const groups = await response.json();

        if (!groups || groups.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">You haven\'t joined any study groups yet. Click "Join New Group" to get started!</p>';
            return;
        }

        container.innerHTML = '';
        groups.forEach(group => {
            const groupCard = document.createElement('div');
            groupCard.className = 'border rounded-lg p-4 hover:shadow-md transition-shadow mb-3';
            
            const statusBadge = group.status ? `<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">${escapeHtml(group.status)}</span>` : '';
            const teacherInfo = group.teacher ? `<div class="text-xs text-gray-500 mb-3">Teacher: ${escapeHtml(group.teacher.name || group.teacher.email)}</div>` : '';
            const subject = group.subject || 'General';
            const memberCount = group.member_count || group.memberCount || 0;
            
            groupCard.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-800 dark:text-gray-200">${escapeHtml(group.name)}</h4>
                    ${statusBadge}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">${escapeHtml(group.description || 'No description')}</div>
                <div class="flex items-center space-x-2 mb-3">
                    <span class="text-sm text-gray-600 dark:text-gray-400">📚 ${escapeHtml(subject)}</span>
                    <span class="text-sm text-gray-600 dark:text-gray-400">👥 ${memberCount} members</span>
                </div>
                ${teacherInfo}
                <div class="flex space-x-2">
                    <button onclick="openGroupForum('${group.id}', '${escapeHtml(group.name)}')"
                            class="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors">
                        💬 Forum
                    </button>
                    <button class="px-3 py-2 border rounded text-sm hover:bg-gray-50 dark:bg-gray-700 transition-colors">
                        📋 Details
                    </button>
                </div>
            `;
            container.appendChild(groupCard);
        });
    } catch (error) {
        console.error('Error fetching study groups:', error);
        container.innerHTML = '<p class="text-red-500 text-sm">Error loading study groups.</p>';
    }
}

async function showAvailableGroups() {
    const modal = document.getElementById('available-groups-modal');
    const container = document.getElementById('available-groups-container');
    
    if (!container) {
        console.error('available-groups-container not found');
        return;
    }
    
    modal.classList.remove('hidden');
    container.innerHTML = '<p class="text-gray-500">Loading groups...</p>';

    try {
        const response = await fetch(`${API_BASE}/groups`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch groups');
        
        const groups = await response.json();

        if (!groups || groups.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No groups available.</p>';
            return;
        }

        container.innerHTML = '';
        groups.forEach(group => {
            const groupCard = document.createElement('div');
            groupCard.className = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3';
            groupCard.innerHTML = `
                <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-1">${escapeHtml(group.name)}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">${escapeHtml(group.description || 'No description')}</p>
                <button onclick="joinGroup('${group.id}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                    Join Group
                </button>
            `;
            container.appendChild(groupCard);
        });
    } catch (error) {
        console.error('Error fetching available groups:', error);
        container.innerHTML = '<p class="text-red-500">Error loading groups.</p>';
    }
}

window.joinGroup = async function(groupId) {
    try {
        const response = await fetch(`${API_BASE}/groups/${groupId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user.id })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to join group');
        }
        
        if (typeof showToast === 'function') {
            showToast('Successfully joined the group!', 'success');
        } else {
            alert('Successfully joined the group!');
        }
        document.getElementById('available-groups-modal').classList.add('hidden');
        renderMyStudyGroups();
    } catch (error) {
        console.error('Error joining group:', error);
        if (typeof showToast === 'function') {
            showToast(error.message || 'Failed to join group. Please try again.', 'error');
        } else {
            alert(error.message || 'Failed to join group. Please try again.');
        }
    }
};

// ==================== GROUP FORUM ====================
async function openGroupForum(groupId, groupName) {
    currentGroupId = groupId;
    const modal = document.getElementById('group-forum-modal');
    const titleEl = document.getElementById('forum-group-title');
    const messagesContainer = document.getElementById('forum-messages-container');

    titleEl.textContent = groupName;
    modal.classList.remove('hidden');
    messagesContainer.innerHTML = '<p class="text-gray-500 text-center">Loading messages...</p>';

    try {
        const response = await fetch(`${API_BASE}/groups/${groupId}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch messages');
        
        const messages = await response.json();

        if (!messages || messages.length === 0) {
            messagesContainer.innerHTML = '<p class="text-gray-500 text-center">No messages yet. Be the first to post!</p>';
            return;
        }

        messagesContainer.innerHTML = '';
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'flex gap-4 animate-fade-in';
            
            // Get user name from user object
            const userName = msg.user?.name || msg.userName || 'Unknown User';
            
            // Generate gradient colors based on user name
            const colors = [
                'from-blue-500 to-indigo-600',
                'from-purple-500 to-pink-600',
                'from-green-500 to-teal-600',
                'from-orange-500 to-red-600',
                'from-cyan-500 to-blue-600'
            ];
            const colorIndex = userName.length % colors.length;
            
            messageDiv.innerHTML = `
                <div class="flex-shrink-0">
                    <div class="h-12 w-12 rounded-2xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold shadow-lg text-lg">
                        ${getInitials(userName)}
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="font-bold text-gray-900 dark:text-white text-sm">${escapeHtml(userName)}</span>
                            <span class="text-xs text-gray-400 dark:text-gray-500">${formatDate(msg.createdAt || msg.created_at)}</span>
                        </div>
                        <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">${escapeHtml(msg.message)}</p>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(messageDiv);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error fetching forum messages:', error);
        messagesContainer.innerHTML = '<p class="text-red-500 text-center">Error loading messages.</p>';
    }
}

// Export function for use from teacher dashboard
window.openGroupForum = openGroupForum;

async function sendForumMessage() {
    const input = document.getElementById('new-message-input');
    const message = input.value.trim();
    
    if (!message || !currentGroupId) return;

    try {
        const response = await fetch(`${API_BASE}/groups/${currentGroupId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user.id,
                message: message
            })
        });

        if (!response.ok) throw new Error('Failed to send message');
        
        input.value = '';
        
        const messagesContainer = document.getElementById('forum-messages-container');
        const groupName = document.getElementById('forum-group-title').textContent;
        openGroupForum(currentGroupId, groupName);
    } catch (error) {
        console.error('Error sending message:', error);
        notify.error('Failed to send message. Please try again.');
    }
}

// ==================== POMODORO TIMER ====================
function initializePomodoroTimer() {
    document.getElementById('sessions-count').textContent = sessionsCompleted;
    document.getElementById('start-timer').addEventListener('click', startTimer);
    document.getElementById('pause-timer').addEventListener('click', pauseTimer);
    document.getElementById('reset-timer').addEventListener('click', resetTimer);
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const totalTime = isWorkSession ? WORK_TIME : BREAK_TIME;
    const progress = ((totalTime - timeLeft) / totalTime) * CIRCLE_CIRCUMFERENCE;
    document.getElementById('timer-progress').style.strokeDashoffset = CIRCLE_CIRCUMFERENCE - progress;
}

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    document.getElementById('start-timer').classList.add('hidden');
    document.getElementById('pause-timer').classList.remove('hidden');

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;

            if (isWorkSession) {
                sessionsCompleted++;
                localStorage.setItem('pomodoroSessions', sessionsCompleted);
                document.getElementById('sessions-count').textContent = sessionsCompleted;
                notify.success('Work session complete! Take a 5-minute break.');
                timeLeft = BREAK_TIME;
            } else {
                notify.info('Break over! Ready for another work session?');
                timeLeft = WORK_TIME;
            }

            isWorkSession = !isWorkSession;
            document.getElementById('start-timer').classList.remove('hidden');
            document.getElementById('pause-timer').classList.add('hidden');
            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    document.getElementById('start-timer').classList.remove('hidden');
    document.getElementById('pause-timer').classList.add('hidden');
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isWorkSession = true;
    timeLeft = WORK_TIME;
    document.getElementById('start-timer').classList.remove('hidden');
    document.getElementById('pause-timer').classList.add('hidden');
    updateTimerDisplay();
}

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
}
