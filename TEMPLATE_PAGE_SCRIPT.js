/**
 * [PAGE NAME] Page JavaScript Template
 * Description: [What this page does]
 * 
 * Dependencies:
 * - common-utils.js
 * - auth-utils.js
 * - api-utils.js
 * - [other utilities if needed]
 */

// ==================== GLOBAL VARIABLES ====================
// Declare any page-level variables here
let currentData = null;
let isLoading = false;

// ==================== INITIALIZATION ====================
/**
 * Initialize page when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check authentication (if required)
    const user = checkAuth();
    if (!user) return;
    
    // 2. Setup UI components
    setupEventListeners();
    
    // 3. Update user profile display
    updateUserProfile({
        nameElementId: 'user-name',
        emailElementId: 'user-email',
        avatarElementId: 'user-avatar',
        user: user
    });
    
    // 4. Load initial data
    await loadInitialData();
});

// ==================== EVENT LISTENERS ====================
/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Logout button
    setupLogoutButton('logout-button');
    
    // Other buttons
    const submitBtn = document.getElementById('submit-button');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
    
    // Forms
    const form = document.getElementById('main-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Modal triggers
    const openModalBtn = document.getElementById('open-modal-btn');
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => openModal('main-modal'));
    }
    
    // Setup modals
    setupModal('main-modal', {
        closeButtonClass: 'modal-close',
        backdropClose: true,
        escapeClose: true
    });
}

// ==================== DATA LOADING ====================
/**
 * Load initial page data
 */
async function loadInitialData() {
    showLoading('content-container', 'Loading data...');
    
    try {
        const data = await apiGet('/api/your-endpoint');
        currentData = data;
        renderData(data);
    } catch (error) {
        showError('content-container', `Error loading data: ${error.message}`);
        showToast(error.message, 'error');
    }
}

/**
 * Refresh data
 */
async function refreshData() {
    if (isLoading) return;
    
    isLoading = true;
    await loadInitialData();
    isLoading = false;
}

// ==================== DATA RENDERING ====================
/**
 * Render main data to the page
 * @param {Array|Object} data - Data to render
 */
function renderData(data) {
    const container = document.getElementById('content-container');
    if (!container) return;
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
        showEmptyState('content-container', 'No data available');
        return;
    }
    
    container.innerHTML = '';
    
    if (Array.isArray(data)) {
        data.forEach(item => {
            const element = createDataCard(item);
            container.appendChild(element);
        });
    } else {
        container.innerHTML = createDetailView(data);
    }
}

/**
 * Create a data card element
 * @param {Object} item - Item data
 * @returns {HTMLElement} Card element
 */
function createDataCard(item) {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow';
    card.innerHTML = `
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            ${escapeHtml(item.title)}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
            ${escapeHtml(item.description || '')}
        </p>
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">${formatDate(item.createdAt)}</span>
            <button 
                onclick="handleItemAction('${item.id}')" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Action
            </button>
        </div>
    `;
    return card;
}

/**
 * Create detail view HTML
 * @param {Object} data - Data object
 * @returns {string} HTML string
 */
function createDetailView(data) {
    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ${escapeHtml(data.title)}
            </h2>
            <div class="prose dark:prose-invert max-w-none">
                ${data.content}
            </div>
        </div>
    `;
}

// ==================== FORM HANDLING ====================
/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Validate data
    const validation = validateFormData(data);
    if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
    }
    
    try {
        const result = await apiPost('/api/your-endpoint', data);
        showToast('Saved successfully', 'success');
        await refreshData();
        closeModal('main-modal');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/**
 * Handle button click
 * @param {Event} event - Click event
 */
async function handleSubmit(event) {
    event.preventDefault();
    
    // Your submit logic here
    showToast('Processing...', 'info');
    
    try {
        // API call
        const result = await apiPost('/api/submit', {});
        showToast('Success!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ==================== VALIDATION ====================
/**
 * Validate form data
 * @param {Object} data - Form data
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateFormData(data) {
    if (!data.title || data.title.trim() === '') {
        return { valid: false, error: 'Title is required' };
    }
    
    if (data.email && !isValidEmail(data.email)) {
        return { valid: false, error: 'Invalid email format' };
    }
    
    return { valid: true };
}

// ==================== ACTIONS ====================
/**
 * Handle item action
 * @param {string} itemId - Item ID
 */
async function handleItemAction(itemId) {
    showConfirmDialog({
        title: 'Confirm Action',
        message: 'Are you sure you want to perform this action?',
        confirmText: 'Yes',
        cancelText: 'No',
        onConfirm: async () => {
            try {
                await apiPost(`/api/items/${itemId}/action`, {});
                showToast('Action completed', 'success');
                await refreshData();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    });
}

/**
 * Handle delete action
 * @param {string} itemId - Item ID
 */
async function handleDelete(itemId) {
    showConfirmDialog({
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: async () => {
            try {
                await apiDelete(`/api/items/${itemId}`);
                showToast('Deleted successfully', 'success');
                await refreshData();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    });
}

// ==================== FILE UPLOAD (if needed) ====================
/**
 * Handle file upload
 * @param {Event} event - Change event from file input
 */
async function handleFileUpload(event) {
    await handleFileChange(event, {
        validation: {
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
            folder: 'uploads'
        },
        previewElementId: 'file-preview',
        onSuccess: (result) => {
            console.log('File uploaded:', result.secure_url);
            // Update form or state with file URL
        },
        onError: (error) => {
            console.error('Upload error:', error);
        }
    });
}

// ==================== SEARCH/FILTER (if needed) ====================
/**
 * Handle search input
 */
const handleSearch = debounce(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
        await refreshData();
        return;
    }
    
    try {
        const results = await apiGet(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        renderData(results);
    } catch (error) {
        showError('content-container', error.message);
    }
}, 300);

/**
 * Handle filter change
 * @param {string} filterValue - Filter value
 */
async function handleFilter(filterValue) {
    showLoading('content-container');
    
    try {
        const filtered = await apiGet(`/api/items?filter=${filterValue}`);
        renderData(filtered);
    } catch (error) {
        showError('content-container', error.message);
    }
}

// ==================== UTILITY FUNCTIONS ====================
/**
 * Helper function specific to this page
 * @param {any} param - Parameter
 * @returns {any} Result
 */
function pageSpecificHelper(param) {
    // Implementation
    return param;
}

// ==================== EXPORT (if needed for other scripts) ====================
// window.PageName = {
//     refresh: refreshData,
//     handleAction: handleItemAction
// };
