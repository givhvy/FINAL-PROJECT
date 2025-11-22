# Website Screenshot Capture Guide
## COMP 1682 Project Documentation

This guide provides step-by-step instructions for capturing high-quality screenshots of the UniLearn platform for inclusion in your project report and proposal.

---

## Setup Instructions

### 1. Start the Application

```powershell
# Navigate to project directory
cd f:\FINALPROJECT\Codemaster-3

# Start the server
npm start

# Server should run at: http://localhost:7000
```

### 2. Prepare Test Data

Before capturing screenshots, ensure you have:
- ✅ At least 3-5 sample courses created
- ✅ User accounts for each role (student, teacher, admin)
- ✅ Enrolled courses with progress
- ✅ Completed quizzes with grades
- ✅ Generated certificates
- ✅ Sample study groups and messages

### 3. Browser Setup

**Recommended Browsers:**
- Google Chrome (Primary - for consistency)
- Firefox (For cross-browser comparison)
- Edge (Windows native browser)

**Recommended Viewport Sizes:**
- Desktop: 1920x1080 (Full HD)
- Tablet: 768x1024 (iPad)
- Mobile: 375x667 (iPhone 8)

**Chrome DevTools Setup:**
1. Press F12 to open DevTools
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select viewport size from dropdown
4. Set to 100% zoom

---

## Screenshot Checklist

### Figure 4.1: Authentication Pages

#### Figure 4.1.1: Login Page
- **URL:** `http://localhost:7000/login`
- **Viewport:** Desktop (1920x1080)
- **Modes:** Light + Dark mode
- **Elements to Show:**
  - Logo and branding
  - Email and password fields
  - "Remember me" checkbox
  - Login button
  - "Forgot password?" link
  - "Sign up" link
  - Google authentication button (if visible)
- **Filename:** `fig_4-1-1_login-page-light.png`, `fig_4-1-1_login-page-dark.png`

#### Figure 4.1.2: Signup Page
- **URL:** `http://localhost:7000/signup`
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Registration form with all fields
  - Role selection (Student/Teacher)
  - Password strength indicator
  - Terms and conditions checkbox
  - Create account button
  - Animated background
- **Filename:** `fig_4-1-2_signup-page.png`

#### Figure 4.1.3: Password Reset Modal
- **URL:** `http://localhost:7000/login` (click "Forgot password")
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Modal overlay
  - Email input field
  - Send reset link button
  - Back to login button
- **Filename:** `fig_4-1-3_password-reset-modal.png`

---

### Figure 4.2: Student Dashboard Pages

#### Figure 4.2.1: Homepage
- **URL:** `http://localhost:7000/`
- **Viewport:** Desktop (1920x1080)
- **Modes:** Light + Dark mode
- **Elements to Show:**
  - Hero section with call-to-action
  - Feature highlights
  - Course categories
  - Statistics section
  - Footer
- **Scroll:** Capture full page (use screenshot extension)
- **Filename:** `fig_4-2-1_homepage-full.png`

#### Figure 4.2.2: Courses Catalog
- **URL:** `http://localhost:7000/courses`
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Search bar
  - Category filters (Web Dev, Programming, Design, etc.)
  - Course grid with at least 6 courses
  - Course cards showing:
    - Thumbnail image
    - Title
    - Teacher name
    - Price
    - Level badge
    - Enroll button
- **Filename:** `fig_4-2-2_courses-catalog.png`

#### Figure 4.2.3: Course Detail Page
- **URL:** `http://localhost:7000/courses` (click on a course)
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Course header with image
  - Course title and description
  - Teacher information
  - Lessons list (expandable)
  - "Enroll Now" or "Start Learning" button
  - Course statistics
- **Filename:** `fig_4-2-3_course-detail.png`

#### Figure 4.2.4: Lesson View
- **URL:** `http://localhost:7000/courses` (open a lesson)
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Video player (if applicable)
  - Lesson title
  - Lesson content with formatted text
  - "Mark as Complete" button
  - Navigation to next/previous lesson
- **Filename:** `fig_4-2-4_lesson-view.png`

#### Figure 4.2.5: My Learning Page
- **URL:** `http://localhost:7000/mylearning`
- **Viewport:** Desktop (1920x1080)
- **Modes:** Light + Dark mode
- **Elements to Show:**
  - Tabs: Courses, Quizzes, Grades, Certificates
  - Enrolled courses with progress bars
  - "Continue Learning" buttons
  - Course thumbnails and titles
- **Capture:** One screenshot per tab
- **Filename:** `fig_4-2-5_mylearning-courses.png`, `fig_4-2-5_mylearning-quizzes.png`, etc.

#### Figure 4.2.6: Quiz Taking Interface
- **URL:** `http://localhost:7000/quiz` (or from My Learning)
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Quiz title and description
  - Timer (if applicable)
  - Question counter (e.g., "Question 1 of 10")
  - Question text
  - Multiple choice options
  - "Next" or "Submit" button
  - Progress indicator
- **Filename:** `fig_4-2-6_quiz-interface.png`

#### Figure 4.2.7: Certificate View
- **URL:** `http://localhost:7000/mylearning` (click view certificate)
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Certificate with:
    - Student name
    - Course title
    - Completion date
    - Certificate number
    - Decorative border
    - Seal/badge
  - Download PDF button
- **Filename:** `fig_4-2-7_certificate-view.png`

---

### Figure 4.3: Community and Social Features

#### Figure 4.3.1: Community Page
- **URL:** `http://localhost:7000/community`
- **Viewport:** Desktop (1920x1080)
- **Modes:** Light + Dark mode
- **Elements to Show:**
  - Study groups list
  - User statistics:
    - Study points
    - Rank badge (Ruby, Gold, Silver, Bronze)
    - Progress circles
  - Group messages/posts
  - "Create Group" button
- **Filename:** `fig_4-3-1_community-page.png`

#### Figure 4.3.2: User Profile
- **URL:** `http://localhost:7000/profile`
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Profile avatar
  - User information form
  - Edit profile button
  - Change password section
  - Subscription status
- **Filename:** `fig_4-3-2_user-profile.png`

#### Figure 4.3.3: Blog Posts
- **URL:** `http://localhost:7000/blog`
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Blog post cards with images
  - Post titles and excerpts
  - Author information
  - Read more buttons
- **Filename:** `fig_4-3-3_blog-posts.png`

---

### Figure 4.4: Teacher Dashboard

#### Figure 4.4.1: Teacher Dashboard Overview
- **URL:** `http://localhost:7000/teacher`
- **Login:** Use teacher account
- **Viewport:** Desktop (1920x1080)
- **Modes:** Light + Dark mode
- **Elements to Show:**
  - Sidebar navigation
  - Dashboard statistics:
    - Total courses
    - Total students
    - Total revenue
    - Completion rate
  - Recent activity
  - "Add New Course" button
- **Filename:** `fig_4-4-1_teacher-dashboard.png`

#### Figure 4.4.2: Lesson Management
- **URL:** `http://localhost:7000/lesson-management`
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Course selector
  - Lessons list for selected course
  - Quill rich text editor
  - Add/Edit lesson form:
    - Title field
    - Video URL field
    - Content editor
    - Order field
  - Save button
- **Filename:** `fig_4-4-2_lesson-management.png`

#### Figure 4.4.3: Quiz Management
- **URL:** `http://localhost:7000/quiz-management`
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Quiz creation form:
    - Quiz title
    - Duration
    - Passing score
    - Questions list
  - Question editor:
    - Question text
    - Options (A, B, C, D)
    - Correct answer selector
    - Points
  - Add question button
- **Filename:** `fig_4-4-3_quiz-management.png`

#### Figure 4.4.4: Student Analytics
- **URL:** `http://localhost:7000/teacher` (navigate to grades section)
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Student grades table:
    - Student name and email
    - Quiz scores
    - Pass/Fail status
    - Submission date
  - Pass rate statistics
  - Average score
- **Filename:** `fig_4-4-4_student-analytics.png`

---

### Figure 4.5: Admin Dashboard

#### Figure 4.5.1: Admin Panel
- **URL:** `http://localhost:7000/admin`
- **Login:** Use admin account
- **Viewport:** Desktop (1920x1080)
- **Modes:** Light + Dark mode
- **Elements to Show:**
  - User management table:
    - User ID
    - Name and email
    - Role badges
    - Actions (Edit, Delete)
  - Role filter buttons
  - Search functionality
  - Add user button
- **Filename:** `fig_4-5-1_admin-panel.png`

#### Figure 4.5.2: Analytics Dashboard
- **URL:** `http://localhost:7000/admin` (analytics section)
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Dashboard cards with statistics:
    - Total users
    - Total courses
    - Total revenue
    - Active subscriptions
  - Charts (if implemented):
    - User growth chart
    - Revenue chart
    - Course enrollment chart
- **Filename:** `fig_4-5-2_analytics-dashboard.png`

#### Figure 4.5.3: Payment Management
- **URL:** `http://localhost:7000/admin` (orders/payments section)
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Orders table:
    - Order ID
    - User
    - Amount
    - Status
    - Date
  - Subscriptions list
  - Payment history
- **Filename:** `fig_4-5-3_payment-management.png`

---

### Figure 4.6: Payment and Subscription

#### Figure 4.6.1: Pricing Plans
- **URL:** `http://localhost:7000/payment`
- **Viewport:** Desktop (1920x1080)
- **Modes:** Light + Dark mode
- **Elements to Show:**
  - Student verification section
  - Pricing cards:
    - Pro Monthly ($19.99)
    - Pro Yearly ($199.99)
    - Features list for each plan
  - "Choose Plan" buttons
  - Student discount badge (50% off)
- **Filename:** `fig_4-6-1_pricing-plans.png`

#### Figure 4.6.2: Cart Page
- **URL:** `http://localhost:7000/cart`
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Cart items with:
    - Course thumbnails
    - Titles and prices
    - Remove buttons
  - Subtotal
  - Discount (if applicable)
  - Total
  - Checkout button
- **Filename:** `fig_4-6-2_cart-page.png`

#### Figure 4.6.3: Success Page
- **URL:** `http://localhost:7000/success`
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Success icon/animation
  - Confirmation message
  - Order summary
  - "Go to My Learning" button
  - Email confirmation notice
- **Filename:** `fig_4-6-3_success-page.png`

#### Figure 4.6.4: Cancel Page
- **URL:** `http://localhost:7000/cancel`
- **Viewport:** Desktop (1920x1080)
- **Elements to Show:**
  - Cancel icon
  - "Payment Cancelled" message
  - Reason text
  - "Try Again" button
  - "Return to Courses" button
- **Filename:** `fig_4-6-4_cancel-page.png`

---

## Mobile Responsiveness Screenshots

### Important Mobile Views

#### Mobile Navigation
- **Viewport:** 375x667
- **Show:** Hamburger menu expanded with navigation links
- **Filename:** `mobile_navigation.png`

#### Mobile Course Cards
- **Viewport:** 375x667
- **Show:** Courses displayed in single column
- **Filename:** `mobile_courses.png`

#### Mobile Quiz Interface
- **Viewport:** 375x667
- **Show:** Responsive quiz layout
- **Filename:** `mobile_quiz.png`

#### Mobile Certificate
- **Viewport:** 375x667
- **Show:** Certificate scaled for mobile view
- **Filename:** `mobile_certificate.png`

---

## Dark Mode Comparison

### Key Pages to Capture in Both Modes

1. ✅ Homepage
2. ✅ Courses catalog
3. ✅ My Learning
4. ✅ Community page
5. ✅ Teacher dashboard
6. ✅ Admin panel
7. ✅ Payment page

**Dark Mode Toggle:**
- Click the moon/sun icon in the header navigation

**Naming Convention:**
- Light mode: `fig_X-X-X_page-name-light.png`
- Dark mode: `fig_X-X-X_page-name-dark.png`

---

## Screenshot Tools Recommendations

### Browser Extensions

**For Chrome:**
1. **Full Page Screen Capture** (Highly recommended)
   - Captures entire page with scrolling
   - https://chrome.google.com/webstore

2. **GoFullPage**
   - Clean captures without watermarks
   - PDF export option

**For Firefox:**
1. **Firefox Screenshots** (Built-in)
   - Press Shift+Ctrl+S
   - Select "Save full page"

### Desktop Tools

**Windows:**
- **Snipping Tool** (Windows 11)
  - Press Win+Shift+S
  - Select area

- **Greenshot** (Free)
  - Annotation features
  - Auto-naming

**Cross-Platform:**
- **ShareX** (Windows)
- **Lightshot**
- **Flameshot** (Linux)

---

## Image Processing

### After Capturing

1. **Resize if needed:**
   - Max width: 1920px
   - Maintain aspect ratio

2. **Optimize file size:**
   - Use PNG for UI screenshots
   - Use JPG for photos (80-90% quality)
   - Consider WebP for web usage

3. **Naming convention:**
   ```
   fig_[chapter]-[section]-[number]_[description].png
   
   Examples:
   fig_4-1-1_login-page-light.png
   fig_4-2-5_mylearning-courses-dark.png
   fig_4-4-2_lesson-management.png
   ```

4. **Organize in folders:**
   ```
   screenshots/
   ├── authentication/
   ├── student-dashboard/
   ├── community/
   ├── teacher-dashboard/
   ├── admin-dashboard/
   ├── payment/
   ├── mobile/
   └── dark-mode/
   ```

---

## PowerShell Script for Batch Naming

```powershell
# Create screenshots directory structure
$dirs = @(
    "screenshots/authentication",
    "screenshots/student-dashboard",
    "screenshots/community",
    "screenshots/teacher-dashboard",
    "screenshots/admin-dashboard",
    "screenshots/payment",
    "screenshots/mobile",
    "screenshots/dark-mode"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir
}

Write-Host "Screenshot directories created successfully!"
```

---

## Quality Checklist

Before submitting screenshots, verify:

- ✅ All text is readable (no blur)
- ✅ No personal/sensitive data visible
- ✅ Consistent zoom level (100%)
- ✅ Browser UI hidden (press F11 for fullscreen)
- ✅ No browser extensions/bookmarks visible
- ✅ Sample data looks professional
- ✅ All images properly named
- ✅ Both light and dark mode captured for key pages
- ✅ Mobile responsiveness demonstrated
- ✅ File sizes optimized (<500KB per image)

---

## Integration into Report

### Figure Caption Format

```markdown
**Figure 4.2.1:** Homepage showing hero section, feature highlights, and course categories. The responsive design adapts seamlessly to different screen sizes.
```

### Table of Figures

Create a table of figures at the beginning of your report:

```markdown
## List of Figures

Figure 4.1.1: Login Page (Light Mode) ........................... Page 12
Figure 4.1.2: Signup Page ..................................... Page 13
Figure 4.2.1: Homepage ........................................ Page 14
Figure 4.2.2: Courses Catalog ................................. Page 15
...
```

### Referencing Figures in Text

```markdown
As shown in Figure 4.2.1, the homepage implements a modern design with a prominent hero section and clear call-to-action buttons. The layout follows responsive design principles (Figure 4.2.1), ensuring optimal viewing experience across devices.
```

---

## Estimated Time

**Total screenshots needed:** ~40-50 screenshots

**Time breakdown:**
- Setup and test data: 30 minutes
- Authentication pages: 10 minutes
- Student dashboard: 30 minutes
- Community features: 15 minutes
- Teacher dashboard: 30 minutes
- Admin dashboard: 20 minutes
- Payment pages: 15 minutes
- Mobile views: 20 minutes
- Dark mode variations: 30 minutes
- Organization and naming: 20 minutes

**Total estimated time:** 3-4 hours

---

## Next Steps After Screenshots

1. ✅ Review all screenshots for quality
2. ✅ Insert into documentation with proper figure numbers
3. ✅ Write descriptive captions for each figure
4. ✅ Add cross-references in text
5. ✅ Create table of figures
6. ✅ Run through QuillBot for language refinement
7. ✅ Submit to teacher for review

---

**Created:** November 20, 2025  
**Project:** UniLearn E-Learning Platform (COMP 1682)  
**Purpose:** Final Project Documentation
