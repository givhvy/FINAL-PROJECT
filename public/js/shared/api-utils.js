/**
 * API Utilities
 * Shared API functions for making HTTP requests
 */

/**
 * Fetch with authentication token
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }
    
    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * Handle API errors
 * @param {Error|Response} error - Error object or response
 * @param {string} defaultMessage - Default error message
 * @returns {string} Error message
 */
function handleApiError(error, defaultMessage = 'An error occurred') {
    if (error.response) {
        return error.response.message || defaultMessage;
    }
    if (error.message) {
        return error.message;
    }
    return defaultMessage;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast if any
    const existingToast = document.getElementById('app-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle',
    };
    
    const toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = `fixed top-4 right-4 ${colors[type] || colors.info} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3 animate-slide-in-right`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-slide-out-right');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Notify object for easier toast notifications
 * Usage: notify.success('Message'), notify.error('Message'), etc.
 */
const notify = {
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
    warning: (message, duration) => showToast(message, 'warning', duration)
};

/**
 * Show loading state
 * @param {string} containerId - ID of container to show loading
 * @param {string} message - Loading message (optional)
 */
function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
            <div class="loader border-4 border-gray-200 border-t-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p class="mt-4 text-gray-600 dark:text-gray-400">${message}</p>
        </div>
    `;
}

/**
 * Show error message
 * @param {string} containerId - ID of container to show error
 * @param {string} message - Error message
 */
function showError(containerId, message = 'An error occurred') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
            <i class="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
            <p class="text-gray-700 dark:text-gray-300">${message}</p>
        </div>
    `;
}

/**
 * Show empty state
 * @param {string} containerId - ID of container to show empty state
 * @param {string} message - Empty state message
 * @param {string} icon - FontAwesome icon class (optional)
 */
function showEmptyState(containerId, message = 'No data available', icon = 'fa-inbox') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
            <i class="fas ${icon} text-gray-400 text-5xl mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">${message}</p>
        </div>
    `;
}

/**
 * Make GET request with auth
 * @param {string} url - API endpoint URL
 * @returns {Promise<any>} Response data
 */
async function apiGet(url) {
    const response = await fetchWithAuth(url, { method: 'GET' });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
}

/**
 * Make POST request with auth
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request body data
 * @returns {Promise<any>} Response data
 */
async function apiPost(url, data) {
    const response = await fetchWithAuth(url, {
        method: 'POST',
        body: data,
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
}

/**
 * Make PUT request with auth
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request body data
 * @returns {Promise<any>} Response data
 */
async function apiPut(url, data) {
    const response = await fetchWithAuth(url, {
        method: 'PUT',
        body: data,
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
}

/**
 * Make DELETE request with auth
 * @param {string} url - API endpoint URL
 * @returns {Promise<any>} Response data
 */
async function apiDelete(url) {
    const response = await fetchWithAuth(url, { method: 'DELETE' });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
}

/**
 * Debounce function for search/input handlers
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
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
