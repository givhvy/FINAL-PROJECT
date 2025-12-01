/**
 * Modal Utilities
 * Shared modal/dialog functions
 */

/**
 * Open modal by ID
 * @param {string} modalId - ID of modal element
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn(`Modal with ID "${modalId}" not found`);
        return;
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    
    // Add fade-in animation
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
    });
}

/**
 * Close modal by ID
 * @param {string} modalId - ID of modal element
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn(`Modal with ID "${modalId}" not found`);
        return;
    }
    
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }, 200);
}

/**
 * Toggle modal visibility
 * @param {string} modalId - ID of modal element
 */
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (modal.classList.contains('hidden')) {
        openModal(modalId);
    } else {
        closeModal(modalId);
    }
}

/**
 * Setup modal close on backdrop click
 * @param {string} modalId - ID of modal element
 */
function setupModalBackdropClose(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modalId);
        }
    });
}

/**
 * Setup modal close on escape key
 * @param {string} modalId - ID of modal element
 */
function setupModalEscapeClose(modalId) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById(modalId);
            if (modal && !modal.classList.contains('hidden')) {
                closeModal(modalId);
            }
        }
    });
}

/**
 * Setup all modal event listeners
 * @param {string} modalId - ID of modal element
 * @param {Object} options - Configuration options
 * @param {string} options.closeButtonClass - Class of close buttons
 * @param {boolean} options.backdropClose - Enable backdrop click to close (default: true)
 * @param {boolean} options.escapeClose - Enable escape key to close (default: true)
 */
function setupModal(modalId, options = {}) {
    const {
        closeButtonClass = 'modal-close',
        backdropClose = true,
        escapeClose = true,
    } = options;
    
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Setup close buttons
    const closeButtons = modal.querySelectorAll(`.${closeButtonClass}`);
    closeButtons.forEach(button => {
        button.addEventListener('click', () => closeModal(modalId));
    });
    
    // Setup backdrop close
    if (backdropClose) {
        setupModalBackdropClose(modalId);
    }
    
    // Setup escape key close
    if (escapeClose) {
        setupModalEscapeClose(modalId);
    }
}

/**
 * Show confirmation dialog
 * @param {Object} options - Configuration options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Dialog message
 * @param {string} options.confirmText - Confirm button text (default: 'Confirm')
 * @param {string} options.cancelText - Cancel button text (default: 'Cancel')
 * @param {Function} options.onConfirm - Confirm callback
 * @param {Function} options.onCancel - Cancel callback
 */
function showConfirmDialog(options = {}) {
    const {
        title = 'Confirm',
        message = 'Are you sure?',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        onConfirm,
        onCancel,
    } = options;
    
    // Remove existing confirm dialog if any
    const existingDialog = document.getElementById('confirm-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    // Create dialog element
    const dialog = document.createElement('div'); // tạo div trống // bộ nhớ RAM
    dialog.id = 'confirm-dialog';
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialog.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">${title}</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">${message}</p>
            <div class="flex justify-end space-x-3">
                <button id="confirm-cancel-btn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    ${cancelText}
                </button>
                <button id="confirm-ok-btn" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    ${confirmText}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog); // sau khi tạo xong dùng appendChild để in ra màn hình 
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    const cancelBtn = dialog.querySelector('#confirm-cancel-btn');
    const okBtn = dialog.querySelector('#confirm-ok-btn');
    
    const closeDialog = () => {
        dialog.remove();
        document.body.style.overflow = 'auto';
    };
    
    cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
        closeDialog();
    });
    
    okBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
        closeDialog();
    });
    
    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            if (onCancel) onCancel();
            closeDialog();
        }
    });
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            if (onCancel) onCancel();
            closeDialog();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

/**
 * Show alert dialog
 * @param {string} message - Alert message
 * @param {string} title - Alert title (default: 'Alert')
 * @param {Function} onClose - Close callback
 */
function showAlert(message, title = 'Alert', onClose = null) {
    showConfirmDialog({
        title,
        message,
        confirmText: 'OK',
        cancelText: '',
        onConfirm: onClose,
        onCancel: onClose,
    });
    
    // Hide cancel button
    setTimeout(() => {
        const cancelBtn = document.querySelector('#confirm-cancel-btn');
        if (cancelBtn) cancelBtn.style.display = 'none';
    }, 0);
}

/**
 * Create modal element dynamically
 * @param {Object} options - Configuration options
 * @param {string} options.id - Modal ID
 * @param {string} options.title - Modal title
 * @param {string} options.content - Modal HTML content
 * @param {Array} options.buttons - Array of button configurations
 * @returns {HTMLElement} Modal element
 */
function createModal(options = {}) {
    const { id, title, content, buttons = [] } = options;
    
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 transition-opacity duration-300';
    modal.style.opacity = '0';
    
    let buttonsHtml = '';
    buttons.forEach((btn, index) => {
        buttonsHtml += `
            <button data-modal-btn="${index}" class="px-4 py-2 ${btn.className || 'bg-blue-500 text-white'} rounded-lg hover:opacity-90 transition-opacity">
                ${btn.text}
            </button>
        `;
    });
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${title}</h3>
                <button class="modal-close text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6">
                ${content}
            </div>
            ${buttonsHtml ? `
                <div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    ${buttonsHtml}
                </div>
            ` : ''}
        </div>
    `;
    
    // Add button event listeners
    buttons.forEach((btn, index) => {
        const btnElement = modal.querySelector(`[data-modal-btn="${index}"]`);
        if (btnElement && btn.onClick) {
            btnElement.addEventListener('click', btn.onClick);
        }
    });
    
    document.body.appendChild(modal);
    setupModal(id);
    
    return modal;
}
