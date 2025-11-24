/**
 * Authentication Utilities
 * Shared authentication functions used across multiple pages
 */

/**
 * Get user initials from name
 * @param {string} name - User's full name
 * @returns {string} User initials (2 characters)
 */
function getUserInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    const initials = parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
    return initials;
}

/**
 * Check if user is authenticated
 * @param {string} redirectUrl - URL to redirect if not authenticated (default: '/login')
 * @returns {Object|null} User object if authenticated, null otherwise
 */
function checkAuth(redirectUrl = '/login') {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = redirectUrl;
        return null;
    }
    
    try {
        return JSON.parse(user);
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
        window.location.href = redirectUrl;
        return null;
    }
}

/**
 * Get stored authentication token
 * @returns {string|null} JWT token or null
 */
function getAuthToken() {
    return localStorage.getItem('token');
}

/**
 * Get stored user data
 * @returns {Object|null} User object or null
 */
function getStoredUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Store authentication data
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
function storeAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Logout user and redirect
 * @param {string} redirectUrl - URL to redirect after logout (default: '/login')
 */
function logout(redirectUrl = '/login') {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = redirectUrl;
}

/**
 * Setup logout button event
 * @param {string} buttonId - ID of logout button
 * @param {string} redirectUrl - URL to redirect after logout
 */
function setupLogoutButton(buttonId, redirectUrl = '/login') {
    const logoutBtn = document.getElementById(buttonId);
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout(redirectUrl);
        });
    }
}

/**
 * Update user avatar display
 * @param {string} elementId - ID of avatar element
 * @param {string} userName - User's name
 * @param {string} avatarUrl - Optional avatar URL
 */
function updateUserAvatar(elementId, userName, avatarUrl = null) {
    const avatarElement = document.getElementById(elementId);
    if (!avatarElement) return;
    
    if (avatarUrl) {
        avatarElement.innerHTML = `<img src="${avatarUrl}" alt="${userName}" class="w-full h-full rounded-full object-cover">`;
    } else {
        const initials = getUserInitials(userName);
        avatarElement.textContent = initials;
    }
}

/**
 * Update user profile display
 * @param {Object} options - Configuration object
 * @param {string} options.nameElementId - ID of name element
 * @param {string} options.emailElementId - ID of email element (optional)
 * @param {string} options.avatarElementId - ID of avatar element (optional)
 * @param {Object} options.user - User object
 */
function updateUserProfile(options) {
    const { nameElementId, emailElementId, avatarElementId, user } = options;
    
    if (nameElementId) {
        const nameElement = document.getElementById(nameElementId);
        if (nameElement) nameElement.textContent = user.name || 'User';
    }
    
    if (emailElementId) {
        const emailElement = document.getElementById(emailElementId);
        if (emailElement) emailElement.textContent = user.email || '';
    }
    
    if (avatarElementId) {
        updateUserAvatar(avatarElementId, user.name, user.avatar);
    }
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check (admin, teacher, student)
 * @returns {boolean} True if user has the role
 */
function hasRole(role) {
    const user = getStoredUser();
    return user && user.role === role;
}

/**
 * Redirect based on user role
 * @param {Object} roleRoutes - Object mapping roles to routes
 */
function redirectByRole(roleRoutes = {}) {
    const user = getStoredUser();
    if (!user || !user.role) {
        window.location.href = '/login';
        return;
    }
    
    const route = roleRoutes[user.role];
    if (route) {
        window.location.href = route;
    }
}
