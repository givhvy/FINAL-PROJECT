# Quick Reference Guide - Shared Utilities

## 📚 TABLE OF CONTENTS
1. [Authentication Utils](#authentication-utils)
2. [API Utils](#api-utils)
3. [Upload Utils](#upload-utils)
4. [Modal Utils](#modal-utils)
5. [Cart Utils](#cart-utils)
6. [Common Utils](#common-utils)

---

## 🔐 Authentication Utils
**File**: `/public/js/shared/auth-utils.js`

### Core Functions

#### `getUserInitials(name)`
Get user initials from full name
```javascript
getUserInitials('John Doe') // Returns: 'JD'
getUserInitials('Alice') // Returns: 'A'
```

#### `checkAuth(redirectUrl = '/login')`
Check if user is authenticated, redirect if not
```javascript
const user = checkAuth(); // Returns user object or redirects
if (!user) return;
```

#### `getAuthToken()`
Get stored JWT token
```javascript
const token = getAuthToken(); // Returns: 'eyJhbGc...'
```

#### `getStoredUser()`
Get stored user object
```javascript
const user = getStoredUser(); // Returns: { id, name, email, role, ... }
```

#### `storeAuthData(token, user)`
Store authentication data
```javascript
storeAuthData('token-string', { id: '123', name: 'John' });
```

#### `logout(redirectUrl = '/login')`
Logout user and redirect
```javascript
logout(); // Clears storage and redirects to /login
logout('/'); // Redirects to homepage
```

#### `setupLogoutButton(buttonId, redirectUrl = '/login')`
Setup logout button click handler
```javascript
setupLogoutButton('logout-btn');
```

#### `updateUserAvatar(elementId, userName, avatarUrl = null)`
Update avatar display
```javascript
updateUserAvatar('avatar', 'John Doe'); // Shows initials
updateUserAvatar('avatar', 'John Doe', 'https://...jpg'); // Shows image
```

#### `updateUserProfile(options)`
Update complete user profile display
```javascript
updateUserProfile({
    nameElementId: 'user-name',
    emailElementId: 'user-email',
    avatarElementId: 'user-avatar',
    user: { name: 'John', email: 'john@example.com' }
});
```

#### `hasRole(role)`
Check if user has specific role
```javascript
if (hasRole('admin')) {
    // Admin-only code
}
```

---

## 🌐 API Utils
**File**: `/public/js/shared/api-utils.js`

### Core Functions

#### `fetchWithAuth(url, options = {})`
Fetch with automatic auth token injection
```javascript
const response = await fetchWithAuth('/api/users', {
    method: 'GET'
});
```

#### `apiGet(url)`
GET request with auth
```javascript
const users = await apiGet('/api/users');
```

#### `apiPost(url, data)`
POST request with auth
```javascript
const result = await apiPost('/api/users', {
    name: 'John',
    email: 'john@example.com'
});
```

#### `apiPut(url, data)`
PUT request with auth
```javascript
await apiPut('/api/users/123', { name: 'Jane' });
```

#### `apiDelete(url)`
DELETE request with auth
```javascript
await apiDelete('/api/users/123');
```

### UI Functions

#### `showToast(message, type = 'info', duration = 3000)`
Show toast notification
```javascript
showToast('Success!', 'success');
showToast('Error occurred', 'error');
showToast('Please wait', 'info');
showToast('Warning!', 'warning');
```

#### `showLoading(containerId, message = 'Loading...')`
Show loading state
```javascript
showLoading('content', 'Loading users...');
```

#### `showError(containerId, message)`
Show error state
```javascript
showError('content', 'Failed to load data');
```

#### `showEmptyState(containerId, message, icon = 'fa-inbox')`
Show empty state
```javascript
showEmptyState('content', 'No items found', 'fa-box-open');
```

### Utility Functions

#### `debounce(func, wait = 300)`
Debounce function execution
```javascript
const searchHandler = debounce(async (term) => {
    const results = await apiGet(`/api/search?q=${term}`);
    renderResults(results);
}, 300);

inputElement.addEventListener('input', (e) => searchHandler(e.target.value));
```

---

## 📤 Upload Utils
**File**: `/public/js/shared/upload-utils.js`

### Core Functions

#### `uploadToCloudinary(file, options = {})`
Upload file to Cloudinary
```javascript
const result = await uploadToCloudinary(file, {
    onProgress: (percent) => console.log(`${percent}%`),
    folder: 'avatars'
});
console.log(result.secure_url);
```

#### `validateFile(file, options = {})`
Validate file before upload
```javascript
const validation = validateFile(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png']
});

if (!validation.valid) {
    alert(validation.error);
}
```

#### `handleFileChange(event, options = {})`
Complete file upload handler
```javascript
fileInput.addEventListener('change', (event) => {
    handleFileChange(event, {
        validation: {
            maxSize: 10 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png'],
            folder: 'uploads'
        },
        previewElementId: 'preview-img',
        onSuccess: (result) => {
            console.log('Uploaded:', result.secure_url);
        },
        onError: (error) => {
            console.error('Upload failed:', error);
        }
    });
});
```

#### `showUploadProgress(containerId, progress)`
Show upload progress bar
```javascript
showUploadProgress('upload-container', 75); // 75%
```

#### `formatFileSize(bytes)`
Format file size to human readable
```javascript
formatFileSize(1024) // Returns: '1 KB'
formatFileSize(1048576) // Returns: '1 MB'
```

---

## 🪟 Modal Utils
**File**: `/public/js/shared/modal-utils.js`

### Core Functions

#### `openModal(modalId)`
Open modal by ID
```javascript
openModal('edit-modal');
```

#### `closeModal(modalId)`
Close modal by ID
```javascript
closeModal('edit-modal');
```

#### `setupModal(modalId, options = {})`
Setup modal with all event listeners
```javascript
setupModal('my-modal', {
    closeButtonClass: 'close-btn',
    backdropClose: true,
    escapeClose: true
});
```

#### `showConfirmDialog(options = {})`
Show confirmation dialog
```javascript
showConfirmDialog({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: async () => {
        await apiDelete('/api/items/123');
        showToast('Deleted!', 'success');
    },
    onCancel: () => {
        console.log('Cancelled');
    }
});
```

#### `showAlert(message, title = 'Alert', onClose = null)`
Show alert dialog
```javascript
showAlert('Operation completed successfully', 'Success');
```

#### `createModal(options = {})`
Create modal dynamically
```javascript
const modal = createModal({
    id: 'dynamic-modal',
    title: 'Edit Item',
    content: '<form>...</form>',
    buttons: [
        {
            text: 'Cancel',
            className: 'bg-gray-500 text-white',
            onClick: () => closeModal('dynamic-modal')
        },
        {
            text: 'Save',
            className: 'bg-blue-500 text-white',
            onClick: handleSave
        }
    ]
});
```

---

## 🛒 Cart Utils
**File**: `/public/js/shared/cart-utils.js`

### Core Functions

#### `loadCart()`
Load cart from localStorage
```javascript
const cart = loadCart(); // Returns: [{ id, title, price, image }]
```

#### `saveCart(cart)`
Save cart to localStorage
```javascript
saveCart([{ id: '1', title: 'Course', price: 49.99 }]);
```

#### `addToCart(item)`
Add item to cart
```javascript
addToCart({
    id: 'course-123',
    title: 'Web Development',
    price: 49.99,
    image: 'https://...'
});
```

#### `removeFromCart(itemId)`
Remove item from cart
```javascript
removeFromCart('course-123');
```

#### `clearCart()`
Clear entire cart
```javascript
clearCart();
```

#### `getCartCount()`
Get number of items in cart
```javascript
const count = getCartCount(); // Returns: 3
```

#### `getCartTotal()`
Calculate total price
```javascript
const total = getCartTotal(); // Returns: 149.97
```

#### `isInCart(itemId)`
Check if item is in cart
```javascript
if (isInCart('course-123')) {
    console.log('Already in cart');
}
```

#### `renderCart(containerId, options = {})`
Render cart items
```javascript
renderCart('cart-container', {
    showTotal: true,
    onRemove: (itemId) => {
        console.log('Removed:', itemId);
    }
});
```

#### `setupAddToCartButton(buttonId, item)`
Setup add to cart button
```javascript
setupAddToCartButton('add-btn', {
    id: 'course-123',
    title: 'Web Development',
    price: 49.99
});
```

---

## 🔧 Common Utils
**File**: `/public/js/shared/common-utils.js`

### Date/Time Functions

#### `formatDate(date, options = {})`
Format date to readable string
```javascript
formatDate(new Date(), { format: 'short' }) // 'Nov 24, 2025'
formatDate(new Date(), { format: 'long' }) // 'November 24, 2025'
formatDate(new Date(), { format: 'relative' }) // '2 hours ago'
formatDate(new Date(), { includeTime: true }) // 'Nov 24, 2025, 10:30 AM'
```

#### `getRelativeTime(date)`
Get relative time
```javascript
getRelativeTime(new Date(Date.now() - 3600000)) // '1 hour ago'
```

### Formatting Functions

#### `formatCurrency(amount, currency = 'USD')`
Format currency
```javascript
formatCurrency(49.99) // '$49.99'
formatCurrency(1234.56, 'EUR') // '€1,234.56'
```

#### `truncateText(text, maxLength = 100)`
Truncate text with ellipsis
```javascript
truncateText('Long text...', 50) // 'Long text...'
```

#### `escapeHtml(text)`
Escape HTML to prevent XSS
```javascript
escapeHtml('<script>alert("xss")</script>') // '&lt;script&gt;...'
```

### Validation Functions

#### `isValidEmail(email)`
Validate email format
```javascript
isValidEmail('test@example.com') // true
isValidEmail('invalid-email') // false
```

#### `isValidUrl(url)`
Validate URL format
```javascript
isValidUrl('https://example.com') // true
isValidUrl('not-a-url') // false
```

### Utility Functions

#### `generateId(length = 8)`
Generate random ID
```javascript
generateId() // 'aBc12XyZ'
generateId(16) // 'aBc12XyZ123456Ab'
```

#### `copyToClipboard(text)`
Copy text to clipboard
```javascript
await copyToClipboard('Text to copy');
```

#### `parseQueryString(queryString)`
Parse query string to object
```javascript
parseQueryString('?id=123&name=John') // { id: '123', name: 'John' }
```

#### `buildQueryString(params)`
Build query string from object
```javascript
buildQueryString({ id: 123, name: 'John' }) // 'id=123&name=John'
```

#### `scrollToElement(elementId, options = {})`
Scroll to element smoothly
```javascript
scrollToElement('section-2', { offset: 100 });
```

#### `isMobile()`
Check if device is mobile
```javascript
if (isMobile()) {
    // Mobile-specific code
}
```

#### `throttle(func, limit = 100)`
Throttle function execution
```javascript
const handleScroll = throttle(() => {
    console.log('Scrolling...');
}, 100);

window.addEventListener('scroll', handleScroll);
```

#### `deepClone(obj)`
Deep clone object
```javascript
const clone = deepClone({ a: 1, b: { c: 2 } });
```

#### `groupBy(array, key)`
Group array by key
```javascript
const users = [
    { name: 'John', role: 'admin' },
    { name: 'Jane', role: 'user' },
    { name: 'Bob', role: 'admin' }
];
groupBy(users, 'role');
// { admin: [...], user: [...] }
```

#### `sortBy(array, key, order = 'asc')`
Sort array by key
```javascript
sortBy(users, 'name', 'asc');
sortBy(users, 'age', 'desc');
```

#### `calculatePercentage(value, total, decimals = 0)`
Calculate percentage
```javascript
calculatePercentage(75, 100) // 75
calculatePercentage(1, 3, 2) // 33.33
```

---

## 💡 USAGE EXAMPLES

### Example 1: Complete Page with Auth & API
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    const user = checkAuth();
    if (!user) return;
    
    // Setup UI
    updateUserAvatar('avatar', user.name);
    setupLogoutButton('logout-btn');
    
    // Load data
    try {
        const data = await apiGet('/api/courses');
        renderCourses(data);
    } catch (error) {
        showError('content', error.message);
    }
});
```

### Example 2: Form with File Upload
```javascript
const form = document.getElementById('profile-form');
const fileInput = document.getElementById('avatar-input');

fileInput.addEventListener('change', async (event) => {
    await handleFileChange(event, {
        validation: {
            maxSize: 2 * 1024 * 1024, // 2MB
            allowedTypes: ['image/jpeg', 'image/png']
        },
        previewElementId: 'avatar-preview',
        onSuccess: (result) => {
            form.avatarUrl.value = result.secure_url;
        }
    });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        await apiPut(`/api/users/${user.id}`, data);
        showToast('Profile updated!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
});
```

### Example 3: Modal with Confirmation
```javascript
function deleteItem(itemId) {
    showConfirmDialog({
        title: 'Confirm Delete',
        message: 'This action cannot be undone.',
        confirmText: 'Delete',
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
```

### Example 4: Shopping Cart Integration
```javascript
// Add to cart button
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const courseId = btn.dataset.courseId;
        const courseTitle = btn.dataset.courseTitle;
        const coursePrice = parseFloat(btn.dataset.coursePrice);
        
        addToCart({
            id: courseId,
            title: courseTitle,
            price: coursePrice
        });
        
        updateCartButton(btn.id, courseId);
    });
});

// Update cart count on page load
updateCartCount('cart-badge');
```

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
