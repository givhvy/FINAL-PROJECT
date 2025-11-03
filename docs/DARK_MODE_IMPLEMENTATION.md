# 🌓 Dark Mode Implementation Guide

## 📋 Overview

This guide explains how to implement dark mode across all 19 pages of the UniLearn platform.

---

## ✅ Benefits of EJS vs HTML for This Project

### 1. **Code Reusability** (Tái sử dụng code)

**HTML (Cũ):**
```
LoginPage.html        → Header + Footer (500 lines)
SignUpPage.html       → Header + Footer (500 lines)
CourseandLesson.html  → Header + Footer (500 lines)
... (19 files)

Total: 19 × 500 = 9,500 lines DUPLICATE CODE!
```

**EJS (Mới):**
```
header.ejs           → 500 lines (1 lần duy nhất)
footer.ejs           → 200 lines (1 lần duy nhất)
login.ejs            → <%- include('header') %> (1 line!)
signup.ejs           → <%- include('header') %> (1 line!)
... (19 files)

Total: 700 lines shared + 19 × 50 lines unique = 1,650 lines
Code reduction: 82%!
```

**→ Update header/footer 1 time = ALL 19 pages updated!**

### 2. **Dynamic Data from Backend**

**HTML:**
```html
<!-- Static, cannot change -->
<title>Courses - UniLearn</title>
<p>Welcome, User!</p>
<p>© 2025 UniLearn</p>  <!-- Must manually update every year -->
```

**EJS:**
```ejs
<!-- Dynamic, from database -->
<title><%= title %> - UniLearn</title>
<p>Welcome, <%= user.name %>!</p>  <!-- From req.user -->
<p>© <%= new Date().getFullYear() %> UniLearn</p>  <!-- Auto update -->
```

### 3. **Conditional Logic**

**EJS:**
```ejs
<!-- Show different menu based on user role -->
<% if (!user) { %>
  <a href="/login">Login</a>
<% } else if (user.role === 'admin') { %>
  <a href="/admin">Admin Dashboard</a>
<% } else if (user.role === 'teacher') { %>
  <a href="/teacher">Teacher Dashboard</a>
<% } else { %>
  <a href="/student">My Courses</a>
<% } %>
```

**HTML:**
❌ Cannot do this! Need JavaScript or multiple pages.

### 4. **Loop Through Data**

**EJS:**
```ejs
<!-- Display courses from database -->
<% courses.forEach(course => { %>
  <div class="course-card">
    <h3><%= course.title %></h3>
    <p><%= course.description %></p>
    <span>$<%= course.price %></span>
  </div>
<% }); %>
```

**HTML:**
❌ Must hardcode or use AJAX + JavaScript

### 5. **Backend Integration**

```javascript
// Controller can pass data to view
app.get('/courses', async (req, res) => {
  const courses = await Course.findAll();
  const user = await getUser(req);

  res.render('pages/courses', {
    title: 'Courses',
    courses: courses,      // From database
    user: user,           // Current user
    enrolledCount: user ? user.enrolled.length : 0
  });
});
```

**HTML:**
❌ Cannot receive backend data directly

---

## 🎯 Dark Mode Implementation

### Step 1: Add Tailwind Dark Mode Configuration

Update all pages to support dark mode classes:

```html
<!-- Add to <html> tag -->
<html lang="en" class="transition-colors duration-300">
```

### Step 2: Create Dark Mode Styles

Add to `public/css/darkmode.css`:

```css
/* Dark mode variables */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

.dark {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-color: #374151;
}

/* Apply variables */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Tailwind dark mode utilities */
.dark .dark\:bg-gray-900 { background-color: #111827; }
.dark .dark\:bg-gray-800 { background-color: #1f2937; }
.dark .dark\:text-white { color: #ffffff; }
.dark .dark\:text-gray-300 { color: #d1d5db; }
```

### Step 3: Update Header Partial

Edit `views/partials/header.ejs`:

```ejs
<!-- Add dark mode toggle button -->
<button id="darkModeToggleBtn" class="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-lg transition-all duration-300" title="Toggle Dark Mode">
    <svg class="w-6 h-6 sun-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
    </svg>
    <svg class="w-6 h-6 moon-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
    </svg>
</button>

<!-- Dark mode toggle script -->
<script src="/js/darkmode.js"></script>
```

### Step 4: Dark Mode JavaScript

Already created at `public/js/darkmode.js`:

```javascript
// Dark Mode Toggle System
(function() {
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply theme on page load
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }

    document.addEventListener('DOMContentLoaded', function() {
        const toggle = document.getElementById('darkModeToggleBtn');
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');

        if (toggle) {
            // Set initial icons
            if (currentTheme === 'dark') {
                sunIcon?.classList.add('hidden');
                moonIcon?.classList.remove('hidden');
            }

            // Toggle theme on click
            toggle.addEventListener('click', function() {
                const isDark = document.documentElement.classList.contains('dark');

                if (isDark) {
                    // Switch to light
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                    sunIcon?.classList.remove('hidden');
                    moonIcon?.classList.add('hidden');
                } else {
                    // Switch to dark
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                    sunIcon?.classList.add('hidden');
                    moonIcon?.classList.remove('hidden');
                }
            });
        }
    });
})();
```

### Step 5: Update Each Page

For each of the 19 pages, add dark mode classes:

**Example: `views/pages/courses.ejs`**

```ejs
<!DOCTYPE html>
<html lang="en" class="transition-colors duration-300">
<head>
    <%- include('../partials/head', {title: 'Courses'}) %>
    <link rel="stylesheet" href="/css/darkmode.css">
</head>
<body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">

    <%- include('../partials/header') %>

    <!-- Main content with dark mode classes -->
    <main class="pt-20">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Courses
            </h1>
            <!-- ... -->
        </div>
    </main>

    <%- include('../partials/footer') %>

    <script src="/js/darkmode.js"></script>
</body>
</html>
```

---

## 🎨 Common Dark Mode Classes

### Backgrounds
```
bg-white          dark:bg-gray-800
bg-gray-50        dark:bg-gray-900
bg-gray-100       dark:bg-gray-800
bg-gray-200       dark:bg-gray-700
```

### Text
```
text-gray-900     dark:text-white
text-gray-800     dark:text-gray-100
text-gray-600     dark:text-gray-300
text-gray-500     dark:text-gray-400
```

### Borders
```
border-gray-200   dark:border-gray-700
border-gray-300   dark:border-gray-600
```

### Hover States
```
hover:bg-gray-100     dark:hover:bg-gray-700
hover:text-gray-900   dark:hover:text-white
```

---

## 📝 Implementation Checklist

### Global Setup
- [x] Create `public/js/darkmode.js` ✅
- [x] Create `public/css/darkmode.css` ⏳
- [ ] Update `views/partials/header.ejs` with toggle button
- [ ] Update `views/partials/head.ejs` to include darkmode.css
- [ ] Fix logo to use `/images/e-learning.svg`

### Pages to Update (19 total)
- [ ] `views/pages/index.ejs` - Homepage
- [ ] `views/pages/login.ejs` - Login
- [ ] `views/pages/signup.ejs` - Sign Up
- [ ] `views/pages/courses.ejs` - Courses
- [ ] `views/pages/community.ejs` - Community
- [ ] `views/pages/blog.ejs` - Blog
- [ ] `views/pages/student-dashboard.ejs` - Student Dashboard
- [ ] `views/pages/teacher-dashboard.ejs` - Teacher Dashboard
- [ ] `views/pages/admin-dashboard.ejs` - Admin Dashboard
- [ ] `views/pages/profile.ejs` - Profile
- [ ] `views/pages/account.ejs` - Account
- [ ] `views/pages/order.ejs` - Order
- [ ] `views/pages/payment.ejs` - Payment
- [ ] `views/pages/success.ejs` - Success
- [ ] `views/pages/cancel.ejs` - Cancel
- [ ] `views/pages/quiz.ejs` - Quiz
- [ ] `views/pages/lesson-management.ejs` - Lesson Management
- [ ] `views/pages/quiz-management.ejs` - Quiz Management
- [ ] `views/pages/certificate.ejs` - Certificate

---

## 🚀 Quick Implementation Script

To speed up the process, use this script to add dark mode classes automatically:

```javascript
// scripts/add-darkmode-classes.js
const fs = require('fs');
const path = require('path');

const replacements = {
    'bg-white"': 'bg-white dark:bg-gray-800"',
    'bg-gray-50"': 'bg-gray-50 dark:bg-gray-900"',
    'text-gray-900"': 'text-gray-900 dark:text-white"',
    'text-gray-600"': 'text-gray-600 dark:text-gray-300"',
    'border-gray-200"': 'border-gray-200 dark:border-gray-700"',
};

const pagesDir = path.join(__dirname, '../views/pages');
const files = fs.readdirSync(pagesDir);

files.forEach(file => {
    if (file.endsWith('.ejs')) {
        let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');

        Object.entries(replacements).forEach(([old, newVal]) => {
            content = content.replace(new RegExp(old, 'g'), newVal);
        });

        fs.writeFileSync(path.join(pagesDir, file), content);
        console.log(`✓ Updated ${file}`);
    }
});
```

---

## 🎯 Expected Outcome

After implementation:

**Light Mode:**
- White/light gray backgrounds
- Dark text
- Light borders

**Dark Mode:**
- Dark gray/black backgrounds
- Light text
- Dark borders
- Smooth transitions between modes
- Preference saved in localStorage

---

## 📚 Resources

- [Tailwind Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [MDN Dark Mode Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

---

**Status**: ⏳ In Progress
**Estimated Time**: 2-3 hours for all 19 pages
**Priority**: Medium

