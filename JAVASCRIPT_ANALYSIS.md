# PHÂN TÍCH CHI TIẾT JAVASCRIPT INLINE TRONG CÁC FILE .EJS

## 📋 TỔNG QUAN
- **Tổng số file phân tích**: 19 files
- **Tổng số dòng JavaScript ước tính**: ~8,000+ lines
- **Pattern phổ biến**: Auth check, API calls, DOM manipulation, Event handlers

---

## 🔍 CHI TIẾT TỪNG FILE

### 1. **admin-dashboard.ejs** (2583 lines total)
**JavaScript blocks tìm thấy**: 
- Main DOMContentLoaded handler (dòng ~500+)
- Multiple API fetch functions
- Chart rendering logic

**Functions chính**:
```javascript
// AUTH & USER INFO
- token = localStorage.getItem('token')
- user = JSON.parse(localStorage.getItem('user'))
- getUserInitials(name)

// RENDERING FUNCTIONS
- renderSubscriptionManagementPage()
- refreshOrders()
- filterOrders()
- renderDashboard()
- renderUsers()
- renderCourses()
- renderCertificates()

// API CALLS
- fetch('/api/users')
- fetch('/api/courses')
- fetch('/api/subscriptions')
- fetch('/api/orders')
- fetch('/api/certificates')
- fetch('/api/grades')

// EVENT HANDLERS
- Sidebar navigation clicks
- Tab switching
- Modal open/close
- Form submissions
- Logout button

// GLOBAL VARIABLES
- token, user
- allCourses, allStudents
- currentEditingCourseId
```

**Patterns lặp lại**:
- ✅ Auth check: `if (!token || !user)`
- ✅ Fetch with Authorization header
- ✅ Error handling với try/catch
- ✅ LocalStorage operations
- ✅ getUserInitials() function
- ✅ Logout handler

---

### 2. **teacher-dashboard.ejs** (1874 lines total)
**Functions chính**:
```javascript
// AUTH & GLOBALS
- token, user check
- getUserInitials(name)
- uploadedImageUrl, uploadedAvatarUrl

// RENDERING
- fetchAndRenderCourseDetails()
- fetchAndRenderStudents()
- fetchAndRenderGroups()
- fetchAndRenderQuizGrades()
- fetchAndRenderCertificates()

// PROFILE EDIT
- openEditModal()
- closeEditModal()
- uploadProfilePicture(file)

// COURSE MANAGEMENT
- Add/Edit/Delete courses
- Upload course images (Cloudinary)
- Form submissions

// CERTIFICATE
- View certificates
- Download PDF (html2canvas)

// EVENT HANDLERS
- Sidebar navigation
- Profile edit
- Course modal
- File uploads
- Logout
```

**Patterns lặp lại**:
- ✅ Auth guard
- ✅ getUserInitials()
- ✅ Profile picture upload with progress bar
- ✅ Cloudinary image upload
- ✅ Fetch API với token
- ✅ Modal management
- ✅ Logout handler

---

### 3. **courses.ejs** (1705 lines total)
**Functions chính**:
```javascript
// GLOBAL STATE
- allCoursesData = []
- currentFilter = 'All'
- token, user

// AUTH & UI SETUP
- getUserInitials(name)
- Set header avatar with profile picture

// CAROUSEL LOGIC
- Featured banner carousel
- Auto-rotate banners
- Pagination dots

// COURSE RENDERING
- fetchAndRenderAllCourses()
- fetchAndRenderPopularCourses()
- fetchAndRenderTrendingCourses()
- filterCoursesByCategory()
- searchCourses()

// LESSON PAGE
- renderLessonPage(courseId)
- markLessonComplete()
- navigateLessons()
- renderQuiz()
- submitQuiz()

// CERTIFICATE POPUP
- Show completion popup
- View certificate modal

// EVENT HANDLERS
- Category filter buttons
- Search input
- Course card clicks
- Lesson navigation
- Quiz submission
- Mobile menu toggle
- Logout
```

**Patterns lặp lại**:
- ✅ Auth check
- ✅ getUserInitials()
- ✅ Avatar rendering (img or initials)
- ✅ Fetch courses với filter
- ✅ LocalStorage cart operations
- ✅ Modal handling
- ✅ Role-based UI (admin/teacher/student)
- ✅ Logout handler

---

### 4. **quiz.ejs** (khá ngắn, ~100 lines)
**Functions chính**:
```javascript
// AUTH
- token, user check
- getUserInitials()

// TAB SWITCHING
- activateTab(tab)
- renderAvailableQuizzes()
- renderMyGrades()

// EVENT HANDLERS
- Tab clicks
- Logout button
```

**Patterns lặp lại**:
- ✅ Auth guard
- ✅ getUserInitials()
- ✅ Tab switching logic
- ✅ Fetch API
- ✅ Logout

---

### 5. **mylearning.ejs** (928 lines total)
**Functions chính**:
```javascript
// AUTH & GLOBALS
- token, user
- getUserInitials()

// TAB MANAGEMENT (Desktop + Mobile Swiper)
- setActiveTab(targetId)
- Mobile swiper integration

// RENDERING
- fetchAndRenderEnrolledCourses()
- fetchAndRenderAvailableQuizzes()
- fetchAndRenderMyGrades()
- fetchAndRenderCertificates()
- fetchAndRenderLearningProgress()

// CERTIFICATE MODAL
- openCertificateModal()
- closeCertificateModal()
- downloadCertificatePDF()
- printCertificate()

// EVENT HANDLERS
- Tab buttons
- Swiper pagination
- Certificate actions
- Logout
```

**Patterns lặp lại**:
- ✅ Auth check
- ✅ getUserInitials()
- ✅ Tab switching (desktop + mobile)
- ✅ Fetch enrolled courses/progress
- ✅ Certificate modal logic
- ✅ Logout handler

---

### 6. **profile.ejs** (841 lines total)
**Functions chính**:
```javascript
// AUTH & GLOBALS
- user, token
- uploadedAvatarUrl

// PROFILE RENDERING
- renderProfile(userData)
- getUserInitials()

// EDIT MODAL
- openEditModal()
- closeEditModal()

// AVATAR UPLOAD
- uploadProfilePicture(file)
- Drag and drop support
- Progress bar handling

// SUBSCRIPTION SECTION
- loadSubscriptionInfo()
- renderSubscriptionDetails()
- Cancel/Upgrade actions

// ORDER HISTORY
- loadOrderHistory()
- renderOrders()

// FORM SUBMIT
- Update profile (PUT /api/users/:id)

// EVENT HANDLERS
- Edit profile button
- File upload (click/drag-drop)
- Form submission
- Logout
```

**Patterns lặp lại**:
- ✅ Auth check
- ✅ getUserInitials()
- ✅ Profile picture upload with Cloudinary
- ✅ Progress bar animation
- ✅ Modal management
- ✅ Fetch user data
- ✅ LocalStorage updates
- ✅ Logout handler

---

### 7. **payment.ejs** (522 lines total)
**Functions chính**:
```javascript
// AUTH
- token, user check
- getUserInitials()

// STUDENT VERIFICATION
- handleStudentVerification(email)
- isEducationalEmail(email)
- Update user tier to PRO

// SUBSCRIPTION PLANS
- fetchSubscriptionPlan()
- renderPlans()
- Billing toggle (monthly/yearly)
- calculateSavings()

// CHECKOUT
- handlePlanSelection()
- Create Stripe checkout session
- Redirect to Stripe

// EVENT HANDLERS
- Student verification form
- Billing toggle buttons
- Select plan buttons
- Logout
```

**Patterns lặp lại**:
- ✅ Auth check
- ✅ getUserInitials()
- ✅ Fetch subscription plans
- ✅ Stripe checkout integration
- ✅ LocalStorage cart operations
- ✅ Email validation
- ✅ Logout handler

---

### 8. **certificate.ejs** (Generator page, simple)
**Functions chính**:
```javascript
// FORM HANDLING
- Generate certificate button
- Update certificate preview

// DOWNLOAD
- Download button (placeholder alert)
- Would use html2canvas in production

// EVENT HANDLERS
- Generate button
- Back button
- Download button
```

**Patterns**: 
- Không có auth check (public page)
- Simple DOM manipulation
- Form → Preview logic

---

### 9. **lesson-management.ejs** (843 lines total)
**Functions chính**:
```javascript
// AUTH
- token, user check (teacher/admin only)
- Logout handler

// COURSE DETAILS
- fetchAndRenderCourseDetails()
- Display course info

// VIDEO UPLOAD
- Cloudinary upload
- Local server upload
- Progress tracking
- uploadedVideoUrl

// QUILL EDITOR
- Rich text editor integration
- Save lesson content

// FORM MANAGEMENT
- setActiveForm('lesson' | 'quiz')
- Add/Edit/Delete lessons
- Add/Edit/Delete quizzes

// QUIZ QUESTIONS
- addQuestionField()
- Remove question
- Dynamic form generation

// EVENT HANDLERS
- Form toggle buttons
- Video source radio buttons
- File upload buttons
- Form submissions
- Content edit/delete buttons
```

**Patterns lặp lại**:
- ✅ Auth check (role-based)
- ✅ Fetch course data
- ✅ File upload with progress
- ✅ Cloudinary upload
- ✅ Modal/form management
- ✅ Dynamic DOM generation
- ✅ Logout handler

---

### 10. **quiz-management.ejs** (ngắn, placeholder)
**Functions chính**:
```javascript
// AUTH
- token check
- Logout

// QUIZ & QUESTIONS
- findOrCreateQuizForLesson()
- fetchAndRenderQuestions()
- Add question form submit

// API CALLS
- GET /api/lessons/:id
- GET /api/questions?quizId=
- POST /api/questions
- DELETE /api/questions/:id
```

**Patterns lặp lại**:
- ✅ Auth check
- ✅ Fetch data from API
- ✅ Form submission
- ✅ Delete confirmation

---

### 11. **signup.ejs**
**Functions chính**:
```javascript
// NO AUTH (public page)

// PASSWORD STRENGTH
- Password strength meter
- Real-time validation

// FORM HANDLING
- Form submit → POST /api/auth/register
- Success → redirect to /login

// UI FEATURES
- Toggle password visibility
- Loading states
- Error/Success messages

// EVENT HANDLERS
- Form submit
- Password input (strength check)
- Toggle password button
```

**Patterns lặp lại**:
- ✅ Fetch API (no auth)
- ✅ Password strength validation
- ✅ Error/success handling
- ✅ Redirect after success

---

### 12. **login.ejs** 
**Status**: Có thể đã có `/js/login.js` external file
- Nếu có inline: Similar to signup
- Auth redirect
- Form submission
- Error handling

---

### 13. **index.ejs** (Landing page - 647 lines)
**Functions chính**:
```javascript
// NO AUTH REQUIRED (public)

// ANIMATED BACKGROUND
- Particle system (Canvas)
- Floating particles
- Connection lines

// NAVIGATION
- Mobile menu toggle
- Smooth scroll

// MARQUEE ANIMATION
- University logos scroll

// EVENT HANDLERS
- Mobile menu button
- CTA buttons → redirect
```

**Patterns**:
- No auth
- Canvas animation
- Pure UI/UX interactions
- No API calls

---

### 14. **blog.ejs** (575 lines total)
**Functions chính**:
```javascript
// OPTIONAL AUTH (can work without)
- token, user check (but not required)

// BLOG DATA
- articles = []
- loadBlogPosts() from API
- Fallback to staticArticles

// RENDERING
- renderArticles()
- showArticle(id)
- showBlogList()

// FILTERING
- filterByCategory(category)
- Search functionality

// PAGINATION
- Load more button

// EVENT HANDLERS
- Category buttons
- Search input
- Article clicks
- Load more
- Related articles
```

**Patterns lặp lại**:
- ✅ Fetch from API (optional auth)
- ✅ Filter/search logic
- ✅ Pagination
- ✅ Dynamic content rendering

---

### 15. **community.ejs** (894 lines total)
**Functions chính**:
```javascript
// AUTH
- token, user (required)
- getUserInitials()

// PROGRESS TRACKING
- renderUserProgress()
- Calculate completed courses
- Weekly goals
- Study points
- Rank badges

// POMODORO TIMER
- Start/Pause/Reset timer
- Session tracking
- Circle progress animation

// LEADERBOARD
- fetchAndRenderLeaderboard()
- Rank users by points

// STUDY GROUPS
- renderMyStudyGroups()
- showAvailableGroups()
- joinStudyGroup(groupId)
- openGroupForum(groupId)
- loadForumMessages(groupId)
- sendForumMessage()

// EVENT HANDLERS
- Timer buttons
- Join group button
- Forum send message
- Adjust goal button
- Logout
```

**Patterns lặp lại**:
- ✅ Auth check
- ✅ getUserInitials()
- ✅ Fetch user progress
- ✅ Real-time updates (messages)
- ✅ Modal management
- ✅ LocalStorage for timer/goals
- ✅ Logout handler

---

### 16. **cart.ejs** (simple)
**Functions chính**:
```javascript
// AUTH (required for checkout)
- token, user check

// CART MANAGEMENT
- loadCart() from localStorage
- saveCart()
- renderCart()
- removeFromCart(index)
- updateSummary()

// CHECKOUT
- Create Stripe checkout session
- Redirect to Stripe

// EVENT HANDLERS
- Remove buttons
- Checkout button
- Logout
```

**Patterns lặp lại**:
- ✅ Auth check
- ✅ LocalStorage cart ops
- ✅ Stripe integration
- ✅ Error handling
- ✅ Logout handler

---

### 17. **cancel.ejs** (minimal)
- No JavaScript logic
- Just UI + back link

---

### 18. **success.ejs** (payment success)
**Functions chính**:
```javascript
// GET SESSION ID from URL
- urlParams.get('session_id')

// VERIFY PAYMENT
- POST /api/payments/verify-and-create-order
- Clear cart from localStorage
- Update user tier in localStorage

// REDIRECT
- Auto redirect to /courses
```

**Patterns**:
- ✅ URL params extraction
- ✅ API verification
- ✅ LocalStorage cleanup
- ✅ Success handling

---

### 19. **auth-success.ejs** (OAuth callback)
**Functions chính**:
```javascript
// OAUTH CALLBACK
- Extract token & user from URL
- Save to localStorage
- Redirect to /courses

// ERROR HANDLING
- Redirect to /login on error
```

**Patterns**:
- ✅ URL params parsing
- ✅ LocalStorage save
- ✅ Redirect logic

---

## 📊 PHÂN LOẠI FUNCTIONS

### 🔐 **UTILITY FUNCTIONS - CẦN EXTRACT VÀO SHARED FILE**

#### **auth-utils.js** (Sử dụng ở hầu hết các file)
```javascript
// 1. getUserInitials(name) - Xuất hiện ở:
//    - admin-dashboard.ejs
//    - teacher-dashboard.ejs
//    - courses.ejs
//    - quiz.ejs
//    - mylearning.ejs
//    - profile.ejs
//    - payment.ejs
//    - community.ejs

function getUserInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    let initials = parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0).toUpperCase();
    }
    return initials;
}

// 2. checkAuth() - Pattern lặp lại
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = '/login';
        return null;
    }
    
    return { token, user };
}

// 3. checkRoleAuth(allowedRoles)
function checkRoleAuth(allowedRoles = []) {
    const auth = checkAuth();
    if (!auth) return null;
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(auth.user.role)) {
        alert('Unauthorized access');
        window.location.href = '/';
        return null;
    }
    
    return auth;
}

// 4. logout()
function logout() {
    localStorage.clear();
    window.location.href = '/login';
}

// 5. updateUserAvatar(elementId, user)
function updateUserAvatar(elementId, user) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (user.avatarUrl) {
        element.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" class="h-8 w-8 rounded-full object-cover">`;
    } else {
        element.textContent = getUserInitials(user.name);
        element.className = 'h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold';
    }
}
```

#### **api-utils.js** (API fetch helpers)
```javascript
// 1. fetchWithAuth(url, options = {})
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    return fetch(url, { ...options, headers: defaultOptions.headers });
}

// 2. handleApiError(error, fallbackMessage)
function handleApiError(error, fallbackMessage = 'An error occurred') {
    console.error('API Error:', error);
    return error.message || fallbackMessage;
}

// 3. showToast(message, type = 'info')
function showToast(message, type = 'info') {
    // Reusable toast notification
    alert(`${type.toUpperCase()}: ${message}`);
}
```

#### **upload-utils.js** (File upload helpers)
```javascript
// 1. uploadToCloudinary(file, type = 'image')
async function uploadToCloudinary(file, type = 'image') {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = type === 'video' ? '/api/upload/video' : '/api/upload/profile-picture';
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    const data = await response.json();
    return data.url;
}

// 2. showUploadProgress(progressBarId, percent)
function showUploadProgress(progressBarId, percent) {
    const bar = document.getElementById(progressBarId);
    if (bar) bar.style.width = `${percent}%`;
}
```

#### **modal-utils.js** (Modal management)
```javascript
// 1. openModal(modalId)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

// 2. closeModal(modalId)
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// 3. setupModalEvents(modalId, closeButtonId)
function setupModalEvents(modalId, closeButtonId) {
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(closeButtonId);
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modalId));
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modalId);
        });
    }
}
```

#### **cart-utils.js** (Shopping cart helpers)
```javascript
// 1. loadCart()
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
}

// 2. saveCart(cart)
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// 3. addToCart(item)
function addToCart(item) {
    const cart = loadCart();
    cart.push(item);
    saveCart(cart);
    updateCartBadge();
}

// 4. removeFromCart(index)
function removeFromCart(index) {
    const cart = loadCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartBadge();
}

// 5. clearCart()
function clearCart() {
    localStorage.removeItem('cart');
    updateCartBadge();
}

// 6. updateCartBadge()
function updateCartBadge() {
    const cart = loadCart();
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = cart.length;
        badge.classList.toggle('hidden', cart.length === 0);
    }
}
```

---

### 🎯 **PAGE-SPECIFIC FUNCTIONS**

#### **Admin Dashboard Specific**
- `renderSubscriptionManagementPage()`
- `refreshOrders()`
- `filterOrders()`
- `renderUsers()`
- Chart rendering (ChartJS integration)

#### **Teacher Dashboard Specific**
- `fetchAndRenderStudents()`
- `fetchAndRenderGroups()`
- `fetchAndRenderQuizGrades()`
- `createStudyGroup()`

#### **Courses Page Specific**
- `fetchAndRenderAllCourses()`
- `fetchAndRenderPopularCourses()`
- `fetchAndRenderTrendingCourses()`
- `filterCoursesByCategory()`
- `renderLessonPage(courseId)`
- `markLessonComplete()`
- `renderQuiz()`
- `submitQuiz()`
- Banner carousel logic

#### **My Learning Specific**
- `fetchAndRenderEnrolledCourses()`
- `fetchAndRenderLearningProgress()`
- `fetchAndRenderCertificates()`
- Swiper mobile tabs integration

#### **Profile Specific**
- `renderProfile(userData)`
- `loadSubscriptionInfo()`
- `loadOrderHistory()`
- Drag-and-drop avatar upload

#### **Community Specific**
- `renderUserProgress()`
- `fetchAndRenderLeaderboard()`
- `renderMyStudyGroups()`
- `showAvailableGroups()`
- `joinStudyGroup(groupId)`
- `openGroupForum(groupId)`
- `loadForumMessages(groupId)`
- `sendForumMessage()`
- Pomodoro timer logic

#### **Lesson Management Specific**
- `fetchAndRenderCourseDetails()`
- `setActiveForm(formId)`
- `addQuestionField(question)`
- Quill editor integration
- Video upload (Cloudinary + Local)

#### **Blog Specific**
- `loadBlogPosts()`
- `renderArticles()`
- `showArticle(id)`
- `filterByCategory(category)`

---

### 🌍 **GLOBAL VARIABLES ĐƯỢC SỬ DỤNG**

```javascript
// Auth & User (Hầu hết các file)
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Course data (courses.ejs, mylearning.ejs, etc.)
let allCoursesData = [];
let currentFilter = 'All';

// Cart (cart.ejs, payment.ejs)
let cart = [];

// Editing states (admin, teacher dashboards)
let currentEditingCourseId = null;
let currentEditingContentId = null;

// Upload states (profile, lesson-management, teacher-dashboard)
let uploadedImageUrl = null;
let uploadedAvatarUrl = null;
let uploadedVideoUrl = null;

// Pagination (blog, courses)
let currentPage = 1;
let articlesPerPage = 6;

// Timer (community.ejs)
let pomodoroInterval = null;
let timerMinutes = 25;
let timerSeconds = 0;

// Forum (community.ejs)
let currentGroupId = null;
```

---

### 🔁 **PATTERNS LẶP LẠI NHIỀU NHẤT**

#### **1. Auth Check Pattern** (16/19 files)
```javascript
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = '/login';
    return;
}
```

#### **2. Fetch with Token Pattern** (Hầu hết files)
```javascript
const response = await fetch('/api/endpoint', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

if (!response.ok) throw new Error('Failed to fetch');
const data = await response.json();
```

#### **3. Error Handling Pattern**
```javascript
try {
    // API call
} catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
}
```

#### **4. Modal Toggle Pattern**
```javascript
function openModal() {
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}
```

#### **5. Logout Pattern** (Hầu hết files)
```javascript
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/login';
});
```

#### **6. File Upload with Progress Pattern**
```javascript
const formData = new FormData();
formData.append('file', file);

// Show progress
uploadProgress.classList.remove('hidden');

const response = await fetch('/api/upload/...', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
});

const data = await response.json();
uploadedUrl = data.url;

// Hide progress
uploadProgress.classList.add('hidden');
```

#### **7. getUserInitials Pattern**
```javascript
function getUserInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    let initials = parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0).toUpperCase();
    }
    return initials;
}
```

#### **8. Avatar Rendering Pattern**
```javascript
if (user.avatarUrl) {
    avatarElement.innerHTML = `<img src="${user.avatarUrl}" class="...">`;
} else {
    avatarElement.textContent = getUserInitials(user.name);
    avatarElement.className = '...';
}
```

#### **9. Form Submission Pattern**
```javascript
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        const formData = { /* ... */ };
        const response = await fetch('/api/endpoint', {
            method: 'POST',
            headers: { /* ... */ },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed');
        
        alert('Success!');
        closeModal();
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save';
    }
});
```

#### **10. Tab Switching Pattern**
```javascript
function setActiveTab(targetId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`content-${targetId}`).classList.remove('hidden');
    document.getElementById(`tab-${targetId}`).classList.add('active');
}
```

---

## 📦 ĐỀ XUẤT CẤU TRÚC SHARED FILES

```
public/js/
├── shared/
│   ├── auth-utils.js          # Auth, getUserInitials, logout
│   ├── api-utils.js           # fetchWithAuth, error handling
│   ├── upload-utils.js        # Cloudinary upload, progress
│   ├── modal-utils.js         # Modal open/close/setup
│   ├── cart-utils.js          # Cart CRUD, badge update
│   ├── avatar-helper.js       # ĐÃ TỒN TẠI - merge logic
│   ├── darkmode.js            # ĐÃ TỒN TẠI
│   └── login.js               # ĐÃ TỒN TẠI
│
├── pages/
│   ├── admin-dashboard.js     # Admin-specific logic
│   ├── teacher-dashboard.js   # Teacher-specific logic
│   ├── courses.js             # Courses page logic
│   ├── mylearning.js          # My learning page logic
│   ├── profile.js             # Profile page logic
│   ├── community.js           # Community page logic
│   ├── lesson-management.js   # Lesson management logic
│   └── blog.js                # Blog page logic
│
└── vendor/
    ├── quill.js               # Rich text editor (nếu cần local)
    └── swiper.js              # Slider library (nếu cần local)
```

---

## 🎯 HÀNH ĐỘNG TIẾP THEO

### **Phase 1: Extract Shared Utilities**
1. ✅ Tạo `auth-utils.js` với:
   - `checkAuth()`
   - `checkRoleAuth()`
   - `getUserInitials()`
   - `logout()`
   - `updateUserAvatar()`

2. ✅ Tạo `api-utils.js` với:
   - `fetchWithAuth()`
   - `handleApiError()`
   - `showToast()`

3. ✅ Tạo `upload-utils.js` với:
   - `uploadToCloudinary()`
   - `showUploadProgress()`

4. ✅ Tạo `modal-utils.js` với:
   - `openModal()`
   - `closeModal()`
   - `setupModalEvents()`

5. ✅ Tạo `cart-utils.js` với:
   - `loadCart()`
   - `saveCart()`
   - `addToCart()`
   - `removeFromCart()`
   - `clearCart()`
   - `updateCartBadge()`

### **Phase 2: Refactor Page Scripts**
1. Extract admin-dashboard inline JS → `admin-dashboard.js`
2. Extract teacher-dashboard inline JS → `teacher-dashboard.js`
3. Extract courses inline JS → `courses.js`
4. Extract mylearning inline JS → `mylearning.js`
5. Extract profile inline JS → `profile.js`
6. Extract community inline JS → `community.js`
7. Extract lesson-management inline JS → `lesson-management.js`
8. Extract blog inline JS → `blog.js`

### **Phase 3: Update EJS Files**
1. Include shared scripts trong `<head>` hoặc trước `</body>`
2. Replace inline code với external script tags
3. Test từng page sau khi refactor

### **Phase 4: Testing & Optimization**
1. Test auth flows
2. Test upload features
3. Test cart operations
4. Test API calls
5. Browser console error checking
6. Performance optimization

---

## 📈 KẾT QUẢ DỰ KIẾN

**Trước refactor:**
- ~8,000+ lines inline JavaScript
- Duplicate code ở nhiều files
- Khó maintain và debug
- Khó test

**Sau refactor:**
- ~2,000 lines shared utilities
- ~6,000 lines page-specific logic (organized)
- Code reuse tối đa
- Dễ maintain và scale
- Có thể unit test utilities
- Better performance (browser caching)

---

## 🎉 TỔNG KẾT

Đây là phân tích toàn diện về JavaScript trong dự án UniLearn. Các patterns lặp lại nhiều nhất là:

1. **Auth check** (16/19 files) ⭐⭐⭐⭐⭐
2. **getUserInitials()** (8/19 files) ⭐⭐⭐⭐
3. **Fetch với token** (15/19 files) ⭐⭐⭐⭐⭐
4. **Modal management** (10/19 files) ⭐⭐⭐⭐
5. **File upload** (5/19 files) ⭐⭐⭐
6. **Cart operations** (3/19 files) ⭐⭐
7. **Logout handler** (16/19 files) ⭐⭐⭐⭐⭐

Ưu tiên extract các utilities theo thứ tự: auth-utils → api-utils → upload-utils → modal-utils → cart-utils.
