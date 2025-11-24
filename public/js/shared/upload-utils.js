/**
 * Upload Utilities
 * Shared file upload functions (Cloudinary integration)
 */

/**
 * Upload file to Cloudinary
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @param {Function} options.onProgress - Progress callback function
 * @param {string} options.folder - Cloudinary folder name
 * @returns {Promise<Object>} Upload result with secure_url
 */
async function uploadToCloudinary(file, options = {}) {
    const { onProgress, folder = 'uploads' } = options;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Progress tracking
        if (onProgress && xhr.upload) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    onProgress(percentComplete);
                }
            });
        }
        
        // Success handler
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (error) {
                    reject(new Error('Failed to parse response'));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });
        
        // Error handler
        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });
        
        // Get token for authentication
        const token = localStorage.getItem('token');
        
        xhr.open('POST', '/api/upload');
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
    });
}

/**
 * Show upload progress UI
 * @param {string} containerId - ID of container to show progress
 * @param {number} progress - Progress percentage (0-100)
 */
function showUploadProgress(containerId, progress) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let progressBar = container.querySelector('.upload-progress-bar');
    if (!progressBar) {
        container.innerHTML = `
            <div class="upload-progress bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Uploading...</p>
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div class="upload-progress-bar bg-blue-500 h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <p class="upload-progress-text text-sm text-gray-600 dark:text-gray-400 mt-2">0%</p>
            </div>
        `;
        progressBar = container.querySelector('.upload-progress-bar');
    }
    
    progressBar.style.width = `${progress}%`;
    const progressText = container.querySelector('.upload-progress-text');
    if (progressText) {
        progressText.textContent = `${progress}%`;
    }
}

/**
 * Hide upload progress UI
 * @param {string} containerId - ID of container
 */
function hideUploadProgress(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const uploadProgress = container.querySelector('.upload-progress');
    if (uploadProgress) {
        uploadProgress.remove();
    }
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Max file size in bytes (default: 10MB)
 * @param {Array<string>} options.allowedTypes - Allowed MIME types
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
function validateFile(file, options = {}) {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = [],
    } = options;
    
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }
    
    if (maxSize && file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return { valid: false, error: `File type ${file.type} is not allowed` };
    }
    
    return { valid: true };
}

/**
 * Format file size to human readable
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Handle file input change event
 * @param {Event} event - Change event from file input
 * @param {Object} options - Options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {string} options.previewElementId - ID of preview element
 * @param {Object} options.validation - Validation options
 */
async function handleFileChange(event, options = {}) {
    const { onSuccess, onError, previewElementId, validation = {} } = options;
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file
    const validationResult = validateFile(file, validation);
    if (!validationResult.valid) {
        if (onError) onError(validationResult.error);
        showToast(validationResult.error, 'error');
        return;
    }
    
    // Show preview for images
    if (previewElementId && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(previewElementId);
            if (preview) {
                preview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
    
    try {
        // Upload file
        const result = await uploadToCloudinary(file, {
            onProgress: (progress) => {
                if (previewElementId) {
                    showUploadProgress(previewElementId + '-progress', progress);
                }
            },
            folder: validation.folder || 'uploads',
        });
        
        if (previewElementId) {
            hideUploadProgress(previewElementId + '-progress');
        }
        
        if (onSuccess) onSuccess(result);
        showToast('File uploaded successfully', 'success');
        
        return result;
    } catch (error) {
        if (previewElementId) {
            hideUploadProgress(previewElementId + '-progress');
        }
        
        const errorMessage = error.message || 'Upload failed';
        if (onError) onError(errorMessage);
        showToast(errorMessage, 'error');
        throw error;
    }
}

/**
 * Create file input element
 * @param {Object} options - Configuration options
 * @param {string} options.accept - Accepted file types
 * @param {boolean} options.multiple - Allow multiple files
 * @param {Function} options.onChange - Change event handler
 * @returns {HTMLInputElement} File input element
 */
function createFileInput(options = {}) {
    const { accept = '*', multiple = false, onChange } = options;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.className = 'hidden';
    
    if (onChange) {
        input.addEventListener('change', onChange);
    }
    
    return input;
}
