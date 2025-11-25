/**
 * Beautiful toast notification system
 * Replaces native alert() with modern UI
 */

const notify = (() => {
    // Notification queue
    let notificationQueue = [];
    const MAX_VISIBLE = 5;

    // Create notification container if it doesn't exist
    function ensureContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md';
            document.body.appendChild(container);
        }
        return container;
    }

    // Show notification with type, icon, and color
    function show(message, type = 'info', duration = 3000) {
        const config = {
            success: {
                icon: 'fa-check-circle',
                bgColor: 'bg-green-500',
                borderColor: 'border-green-600',
                iconColor: 'text-green-100'
            },
            error: {
                icon: 'fa-times-circle',
                bgColor: 'bg-red-500',
                borderColor: 'border-red-600',
                iconColor: 'text-red-100'
            },
            warning: {
                icon: 'fa-exclamation-triangle',
                bgColor: 'bg-yellow-500',
                borderColor: 'border-yellow-600',
                iconColor: 'text-yellow-100'
            },
            info: {
                icon: 'fa-info-circle',
                bgColor: 'bg-blue-500',
                borderColor: 'border-blue-600',
                iconColor: 'text-blue-100'
            }
        };

        const { icon, bgColor, borderColor, iconColor } = config[type] || config.info;
        const container = ensureContainer();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `${bgColor} ${borderColor} text-white px-5 py-4 rounded-lg shadow-lg border-l-4 flex items-start gap-4 transform transition-all duration-300 ease-out translate-x-0 opacity-100`;
        notification.style.animation = 'slideInRight 0.3s ease-out';
        
        notification.innerHTML = `
            <div class="flex-shrink-0 mt-0.5">
                <i class="fas ${icon} text-xl ${iconColor}"></i>
            </div>
            <div class="flex-1 mr-2">
                <p class="text-sm font-medium leading-relaxed">${escapeHtml(message)}</p>
            </div>
            <button class="flex-shrink-0 ml-auto hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors duration-200" onclick="this.parentElement.remove()">
                <i class="fas fa-times text-sm"></i>
            </button>
        `;

        // Add to container
        container.appendChild(notification);
        notificationQueue.push(notification);

        // Remove oldest if exceeding max visible
        if (notificationQueue.length > MAX_VISIBLE) {
            const oldest = notificationQueue.shift();
            oldest.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => oldest.remove(), 300);
        }

        // Auto-dismiss
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    notification.remove();
                    notificationQueue = notificationQueue.filter(n => n !== notification);
                }, 300);
            }
        }, duration);
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Confirm dialog
    function confirm(message, title = 'Confirm', options = {}) {
        return new Promise((resolve) => {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4';
            overlay.style.animation = 'fadeIn 0.2s ease-out';
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all';
            modal.style.animation = 'scaleIn 0.3s ease-out';
            
            const icon = options.icon || 'fa-exclamation-triangle';
            const iconColor = options.iconColor || 'text-yellow-500';
            const confirmText = options.confirmText || 'OK';
            const cancelText = options.cancelText || 'Cancel';
            const confirmClass = options.confirmClass || 'bg-blue-600 hover:bg-blue-700';
            
            modal.innerHTML = `
                <div class="p-6">
                    <div class="flex items-start gap-4">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <i class="fas ${icon} text-2xl ${iconColor}"></i>
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">${escapeHtml(title)}</h3>
                            <p class="text-gray-600 dark:text-gray-300 whitespace-pre-line">${escapeHtml(message)}</p>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button id="confirm-cancel" class="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            ${cancelText}
                        </button>
                        <button id="confirm-ok" class="flex-1 px-4 py-2.5 ${confirmClass} text-white rounded-lg font-medium transition-colors">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Handle buttons
            const okBtn = modal.querySelector('#confirm-ok');
            const cancelBtn = modal.querySelector('#confirm-cancel');
            
            function close(result) {
                overlay.style.animation = 'fadeOut 0.2s ease-out';
                modal.style.animation = 'scaleOut 0.2s ease-out';
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 200);
            }
            
            okBtn.addEventListener('click', () => close(true));
            cancelBtn.addEventListener('click', () => close(false));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(false);
            });
            
            // Focus OK button
            okBtn.focus();
        });
    }

    // Public API
    return {
        success: (message, duration = 3000) => show(message, 'success', duration),
        error: (message, duration = 5000) => show(message, 'error', duration),
        warning: (message, duration = 4000) => show(message, 'warning', duration),
        info: (message, duration = 3000) => show(message, 'info', duration),
        confirm: (message, title, options) => confirm(message, title, options)
    };
})();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    @keyframes scaleIn {
        from {
            transform: scale(0.9);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    @keyframes scaleOut {
        from {
            transform: scale(1);
            opacity: 1;
        }
        to {
            transform: scale(0.9);
            opacity: 0;
        }
    }

    #notification-container {
        pointer-events: none;
    }

    #notification-container > div {
        pointer-events: auto;
    }
`;
document.head.appendChild(style);

// Make globally available
if (typeof window !== 'undefined') {
    window.notify = notify;
}
