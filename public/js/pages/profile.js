/**
 * Profile Page JavaScript
 * Handles user profile display, editing, subscription management, and order history
 */

// ==================== GLOBAL VARIABLES ====================
let user = null;
let uploadedAvatarUrl = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    user = checkAuth();
    if (!user) return;
    
    // Setup event listeners
    setupEventListeners();
    
    // Render initial data
    renderProfile(user);
    renderSubscription(user);
    await loadOrderHistory();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Edit profile modal
    document.getElementById('edit-profile-button').addEventListener('click', openEditModal);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeEditModal);
    
    // Profile form submission
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
        editForm.addEventListener('submit', handleProfileSubmit);
    }
    
    // Avatar upload
    setupAvatarUpload();
    
    // Delete account button (only for students)
    setupDeleteAccount();

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
}

// ==================== PROFILE RENDERING ====================
function renderProfile(userData) {
    const initials = getUserInitials(userData.name);
    const avatarContainer = document.getElementById('main-avatar');
    
    // Update header avatar
    const headerAvatar = document.getElementById('user-avatar');
    if (headerAvatar) {
        if (userData.avatarUrl) {
            headerAvatar.innerHTML = `<img src="${userData.avatarUrl}" alt="Avatar" class="h-8 w-8 rounded-full object-cover">`;
        } else {
            headerAvatar.textContent = initials;
            headerAvatar.className = 'h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold';
        }
    }
    
    // Update main profile avatar
    if (avatarContainer) {
        if (userData.avatarUrl) {
            avatarContainer.innerHTML = `<img src="${userData.avatarUrl}" alt="Avatar" class="h-32 w-32 rounded-full object-cover">`;
        } else {
            avatarContainer.innerHTML = initials;
            avatarContainer.className = 'h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-5xl font-bold';
        }
    }
    
    // Update profile information
    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    const emailEl = document.getElementById('profile-email');
    
    if (nameEl) nameEl.textContent = userData.name || 'Student';
    if (roleEl) {
        const role = userData.role || 'student';
        roleEl.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    }
    if (emailEl) emailEl.textContent = userData.email || 'N/A';
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    user = userData;
}

// ==================== EDIT MODAL ====================
function openEditModal() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;
    
    // Fill form with current data
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-name').value = user.name || '';
    document.getElementById('edit-email').value = user.email || '';
    
    // Reset uploaded avatar URL
    uploadedAvatarUrl = user.avatarUrl || null;
    
    // Update avatar preview in modal
    const display = document.getElementById('edit-avatar-display');
    if (display) {
        if (user.avatarUrl) {
            display.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" class="h-20 w-20 rounded-full object-cover">`;
        } else {
            display.innerHTML = getUserInitials(user.name);
            display.className = 'h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold flex-shrink-0';
        }
    }
    
    modal.classList.remove('hidden');
}

function closeEditModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ==================== AVATAR UPLOAD ====================
function setupAvatarUpload() {
    const avatarDropZone = document.getElementById('avatar-drop-zone');
    const avatarFileInput = document.getElementById('avatar-file-input');
    
    if (!avatarDropZone || !avatarFileInput) return;
    
    // Click to upload
    avatarDropZone.addEventListener('click', () => {
        avatarFileInput.click();
    });
    
    avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadProfilePicture(file);
        }
    });
    
    // Drag and drop events
    avatarDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        avatarDropZone.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900');
    });
    
    avatarDropZone.addEventListener('dragleave', () => {
        avatarDropZone.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900');
    });
    
    avatarDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        avatarDropZone.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            uploadProfilePicture(file);
        }
    });
}

async function uploadProfilePicture(file) {
    const validation = validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    });
    
    if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
    }
    
    const uploadProgress = document.getElementById('upload-progress');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadStatus = document.getElementById('upload-status');
    
    if (uploadProgress) uploadProgress.classList.remove('hidden');
    if (uploadProgressBar) uploadProgressBar.style.width = '0%';
    if (uploadStatus) uploadStatus.textContent = 'Uploading...';
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetchWithAuth('/api/upload/profile-picture', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        
        // Update progress
        if (uploadProgressBar) uploadProgressBar.style.width = '100%';
        if (uploadStatus) uploadStatus.textContent = 'Upload complete!';
        
        // Store the uploaded URL
        uploadedAvatarUrl = data.url;
        
        // Update preview
        const display = document.getElementById('edit-avatar-display');
        if (display) {
            display.innerHTML = `<img src="${data.url}" alt="Avatar" class="h-20 w-20 rounded-full object-cover">`;
        }
        
        // Update user data
        user.avatarUrl = data.url;
        localStorage.setItem('user', JSON.stringify(user));
        renderProfile(user);
        
        showToast('Profile picture uploaded successfully', 'success');
        
        // Hide progress after delay
        setTimeout(() => {
            if (uploadProgress) uploadProgress.classList.add('hidden');
        }, 2000);
        
    } catch (error) {
        console.error('Upload error:', error);
        if (uploadStatus) uploadStatus.textContent = 'Upload failed. Please try again.';
        if (uploadProgressBar) {
            uploadProgressBar.style.width = '0%';
            uploadProgressBar.classList.add('bg-red-600');
        }
        
        showToast('Upload failed: ' + error.message, 'error');
        
        setTimeout(() => {
            if (uploadProgress) uploadProgress.classList.add('hidden');
            if (uploadProgressBar) uploadProgressBar.classList.remove('bg-red-600');
        }, 3000);
    }
}

// ==================== FORM SUBMISSION ====================
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    const updatedData = {
        name: document.getElementById('edit-name').value.trim(),
        phone: document.getElementById('edit-phone')?.value.trim() || null
    };
    
    try {
        const response = await apiPut(`/api/users/${user.id}`, updatedData);
        
        const newUserProfile = { ...user, ...updatedData };
        renderProfile(newUserProfile);
        closeEditModal();
        showToast('Profile updated successfully! 🎉', 'success');
        
    } catch (error) {
        console.error('Profile Update Error:', error);
        showToast('Error updating profile: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

// ==================== ORDER HISTORY ====================
async function loadOrderHistory() {
    const loadingEl = document.getElementById('order-history-loading');
    const emptyEl = document.getElementById('order-history-empty');
    const listEl = document.getElementById('order-history-list');
    
    try {
        const allOrders = await apiGet(`/api/orders?userId=${user.id}`);
        const userOrders = allOrders.filter(order => order.userId === user.id);
        
        if (loadingEl) loadingEl.classList.add('hidden');
        
        if (userOrders.length === 0) {
            if (emptyEl) emptyEl.classList.remove('hidden');
            return;
        }
        
        // Sort by date (newest first)
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (listEl) {
            listEl.classList.remove('hidden');
            listEl.innerHTML = userOrders.map(order => createOrderCard(order)).join('');
        }
        
    } catch (error) {
        console.error('Error loading order history:', error);
        if (loadingEl) loadingEl.classList.add('hidden');
        if (listEl) {
            listEl.classList.remove('hidden');
            listEl.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
                    <p>Error loading order history</p>
                    <p class="text-sm mt-2">${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    }
}

function createOrderCard(order) {
    const statusColors = {
        'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'refunded': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };
    
    const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800';
    const orderDate = formatDate(order.createdAt, { format: 'long' });
    const courseName = order.course?.title || order.courseName || 'Unknown Course';
    
    return `
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex-1">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <i class="fas fa-shopping-cart text-blue-600 dark:text-blue-400 text-xl"></i>
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-800 dark:text-gray-200 text-lg">${escapeHtml(courseName)}</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Order ID: <span class="font-mono">${order.id.substring(0, 12)}...</span>
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                <i class="fas fa-calendar-alt mr-1"></i>${orderDate}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${formatCurrency(parseFloat(order.price || 0))}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColor}">
                        ${order.status.toUpperCase()}
                    </span>
                    ${order.paymentMethod ? `
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                            <i class="fas fa-credit-card mr-1"></i>${escapeHtml(order.paymentMethod)}
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// ==================== SUBSCRIPTION MANAGEMENT ====================
function renderSubscription(userData) {
    const loadingEl = document.getElementById('subscription-loading');
    const contentEl = document.getElementById('subscription-content');
    
    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');
    
    const isPro = userData.subscriptionTier === 'pro';
    const isStudent = userData.studentEmail || userData.isStudent;
    
    if (isPro) {
        renderProSubscription(userData, isStudent);
    } else {
        renderFreeSubscription();
    }
}

function renderProSubscription(userData, isStudent) {
    const tierIcon = document.getElementById('tier-icon');
    const tierName = document.getElementById('tier-name');
    const tierBadge = document.getElementById('tier-badge');
    const detailsEl = document.getElementById('subscription-details');
    const actionsEl = document.getElementById('subscription-actions');
    
    // Set Pro tier UI
    if (tierIcon) {
        tierIcon.innerHTML = '<i class="fas fa-crown text-3xl text-yellow-500"></i>';
        tierIcon.className = 'w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900';
    }
    if (tierName) tierName.textContent = 'Pro Plan';
    if (tierBadge) {
        tierBadge.innerHTML = `
            <span class="px-4 py-2 text-sm font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-full flex items-center gap-2 shadow-lg">
                <i class="fas fa-crown"></i> PRO
            </span>
        `;
    }
    
    if (isStudent) {
        renderStudentSubscription(userData, detailsEl, actionsEl);
    } else {
        renderPaidSubscription(userData, detailsEl, actionsEl);
    }
}

function renderStudentSubscription(userData, detailsEl, actionsEl) {
    if (detailsEl) {
        detailsEl.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Subscription Type</p>
                    <p class="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                        <i class="fas fa-graduation-cap"></i> Educational Benefits
                    </p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Student Email</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${escapeHtml(userData.studentEmail || 'Verified')}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Verified On</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${userData.studentVerifiedAt ? formatDate(userData.studentVerifiedAt, { format: 'long' }) : 'N/A'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Expiration</p>
                    <p class="font-semibold text-green-600 dark:text-green-400">Never (while enrolled)</p>
                </div>
            </div>
            <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p class="text-sm text-green-700 dark:text-green-300">
                    <i class="fas fa-info-circle mr-2"></i>
                    As a verified student, you have free access to all Pro features! Your subscription remains active as long as you maintain your student status.
                </p>
            </div>
        `;
    }
    
    if (actionsEl) {
        actionsEl.innerHTML = `
            <div class="flex flex-col sm:flex-row gap-3">
                <button id="cancel-subscription-btn" class="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                    <i class="fas fa-times-circle mr-2"></i>Cancel Student Benefits
                </button>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Canceling will revert your account to Free tier and remove educational benefits.
            </p>
        `;
        
        const cancelBtn = document.getElementById('cancel-subscription-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', handleCancelSubscription);
        }
    }
}

function renderPaidSubscription(userData, detailsEl, actionsEl) {
    const subscriptionPlan = userData.subscriptionPlan || 'monthly';
    const subscriptionStartDate = userData.subscriptionStartDate ? new Date(userData.subscriptionStartDate) : new Date();
    let expirationDate;
    let planLabel;
    
    console.log('🔍 Profile Debug:', {
        subscriptionPlan,
        subscriptionStartDate,
        subscriptionEndDate: userData.subscriptionEndDate,
        fullUserData: userData
    });
    
    // Use subscriptionEndDate from backend if available
    if (userData.subscriptionEndDate) {
        expirationDate = new Date(userData.subscriptionEndDate);
        // Calculate duration in months
        const monthsDiff = Math.round((expirationDate - subscriptionStartDate) / (1000 * 60 * 60 * 24 * 30));
        
        console.log('✅ Using subscriptionEndDate:', {
            expirationDate,
            monthsDiff,
            calculation: `${expirationDate} - ${subscriptionStartDate}`
        });
        
        if (monthsDiff >= 12) {
            planLabel = `${monthsDiff} Months (Yearly)`;
        } else if (monthsDiff >= 3) {
            planLabel = `${monthsDiff} Months (Quarterly)`;
        } else {
            planLabel = `${monthsDiff} Month${monthsDiff > 1 ? 's' : ''} (Monthly)`;
        }
    } else {
        console.log('⚠️ No subscriptionEndDate, using fallback calculation');
        // Fallback to plan-based calculation
        switch (subscriptionPlan) {
            case 'quarterly':
                expirationDate = new Date(subscriptionStartDate);
                expirationDate.setMonth(expirationDate.getMonth() + 3);
                planLabel = '3 Months (Quarterly)';
                break;
            case 'yearly':
                expirationDate = new Date(subscriptionStartDate);
                expirationDate.setFullYear(expirationDate.getFullYear() + 1);
                planLabel = '12 Months (Yearly)';
                break;
            default:
                expirationDate = new Date(subscriptionStartDate);
                expirationDate.setMonth(expirationDate.getMonth() + 1);
                planLabel = '1 Month (Monthly)';
        }
    }
    
    const daysRemaining = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
    const isExpired = daysRemaining <= 0;
    
    if (detailsEl) {
        detailsEl.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Subscription Plan</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${planLabel}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Started On</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">${formatDate(subscriptionStartDate, { format: 'long' })}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Expires On</p>
                    <p class="font-semibold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-gray-800 dark:text-gray-200'}">
                        ${formatDate(expirationDate, { format: 'long' })}
                        ${isExpired ? '<span class="text-xs ml-2">(Expired)</span>' : ''}
                    </p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Days Remaining</p>
                    <p class="font-semibold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}">
                        ${isExpired ? 'Expired' : daysRemaining + ' days'}
                    </p>
                </div>
            </div>
            ${isExpiringSoon ? `
                <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <p class="text-sm text-yellow-700 dark:text-yellow-300">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Your subscription is expiring soon! Renew to continue enjoying Pro benefits.
                    </p>
                </div>
            ` : ''}
            ${isExpired ? `
                <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <p class="text-sm text-red-700 dark:text-red-300">
                        <i class="fas fa-times-circle mr-2"></i>
                        Your subscription has expired. Renew now to restore Pro access.
                    </p>
                </div>
            ` : ''}
        `;
    }
    
    if (actionsEl) {
        actionsEl.innerHTML = `
            <div class="flex flex-col sm:flex-row gap-3">
                <a href="/payment" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
                    <i class="fas fa-sync-alt mr-2"></i>Renew Subscription
                </a>
                <button id="cancel-subscription-btn" class="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                    <i class="fas fa-times-circle mr-2"></i>Cancel Subscription
                </button>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Canceling will revert your account to Free tier at the end of your billing period.
            </p>
        `;
        
        const cancelBtn = document.getElementById('cancel-subscription-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', handleCancelSubscription);
        }
    }
}

function renderFreeSubscription() {
    const tierIcon = document.getElementById('tier-icon');
    const tierName = document.getElementById('tier-name');
    const tierBadge = document.getElementById('tier-badge');
    const detailsEl = document.getElementById('subscription-details');
    const actionsEl = document.getElementById('subscription-actions');
    
    if (tierIcon) {
        tierIcon.innerHTML = '<i class="fas fa-user text-3xl text-gray-500"></i>';
        tierIcon.className = 'w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700';
    }
    if (tierName) tierName.textContent = 'Free Plan';
    if (tierBadge) {
        tierBadge.innerHTML = `
            <span class="px-4 py-2 text-sm font-bold bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full">
                FREE
            </span>
        `;
    }
    
    if (detailsEl) {
        detailsEl.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Access Level</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">Limited (3 courses)</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Certificates</p>
                    <p class="font-semibold text-gray-500">Not Available</p>
                </div>
            </div>
            <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                    <i class="fas fa-lightbulb mr-2"></i>
                    Upgrade to Pro for unlimited courses, certificates, and premium content!
                </p>
            </div>
        `;
    }
    
    if (actionsEl) {
        actionsEl.innerHTML = `
            <a href="/payment" class="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                <i class="fas fa-crown mr-2"></i>Upgrade to Pro
            </a>
        `;
    }
}

async function handleCancelSubscription() {
    const isStudent = user.studentEmail || user.isStudent;
    
    const confirmMsg = isStudent
        ? 'Are you sure you want to cancel your student benefits?\n\nThis will:\n- Revert your account to Free tier\n- Remove access to premium courses\n- You can re-verify later with a valid .edu email'
        : 'Are you sure you want to cancel your Pro subscription?\n\nThis will:\n- Revert your account to Free tier immediately\n- Remove access to premium courses and certificates';
    
    const confirmed = await notify.confirm(
        confirmMsg, 
        'Cancel Subscription', 
        {
            icon: 'fa-exclamation-triangle',
            iconColor: 'text-red-500',
            confirmText: 'Yes, Cancel',
            cancelText: 'Keep Subscription',
            confirmClass: 'bg-red-600 hover:bg-red-700'
        }
    );
    
    if (!confirmed) return;
    
    const cancelBtn = document.getElementById('cancel-subscription-btn');
    if (cancelBtn) {
        cancelBtn.disabled = true;
        cancelBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Canceling...';
    }
    
    try {
        const data = await apiPost('/api/users/cancel-subscription', { user_id: user.id });
        
        // Update local user data
        user.subscriptionTier = 'free';
        user.studentEmail = null;
        user.isStudent = false;
        user.studentVerifiedAt = null;
        user.subscriptionPlan = null;
        user.subscriptionStartDate = null;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update UI
        renderSubscription(user);
        
        // Update header badge
        const headerBadge = document.getElementById('user-tier-badge');
        if (headerBadge) {
            headerBadge.innerHTML = `
                <span class="px-3 py-1 text-xs font-bold bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full">
                    FREE
                </span>
            `;
        }
        
        showToast('Subscription cancelled successfully. Your account has been reverted to Free tier.', 'success');
        
    } catch (error) {
        console.error('Cancel subscription error:', error);
        showToast('Error canceling subscription: ' + error.message, 'error');
        if (cancelBtn) {
            cancelBtn.disabled = false;
            cancelBtn.innerHTML = '<i class="fas fa-times-circle mr-2"></i>Cancel Subscription';
        }
    }
}

// ==================== DELETE ACCOUNT ====================
function setupDeleteAccount() {
    const deleteAccountButton = document.getElementById('delete-account-button');
    
    // Show delete button only for students
    if (user && user.role && user.role.toLowerCase() === 'student') {
        deleteAccountButton.classList.remove('hidden');
    }
    
    deleteAccountButton.addEventListener('click', async function() {
        showConfirmDialog({
            title: '⚠️ Delete Account',
            message: 'This will permanently delete your account and all associated data.\n\nAre you absolutely sure you want to delete your account? This action CANNOT be undone.',
            confirmText: 'Yes, Delete My Account',
            cancelText: 'Cancel',
            onConfirm: async () => {
                const doubleCheck = prompt('To confirm, please type "DELETE" (all capitals):');
                if (doubleCheck !== 'DELETE') {
                    showToast('Account deletion cancelled.', 'info');
                    return;
                }
                
                try {
                    await apiDelete(`/api/users/${user.id}`);
                    showToast('Your account has been successfully deleted.', 'success');
                    localStorage.clear();
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } catch (error) {
                    console.error('Error deleting account:', error);
                    showToast(`Failed to delete account: ${error.message}`, 'error');
                }
            }
        });
    });
}
