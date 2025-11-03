# 📋 MVC Refactoring Plan - UniLearn E-Learning Platform

## 🎯 Mục tiêu
Refactor project từ HTML tĩnh sang cấu trúc MVC với EJS templates để:
- ✅ Giảm code duplication (header, footer, navigation lặp lại nhiều lần)
- ✅ Dễ maintain và update
- ✅ Tăng tính scalability
- ✅ Tuân thủ đúng MVC pattern

## 📊 Current Structure vs Desired Structure

### ❌ BEFORE (Hiện tại)
```
Codemaster-3/
├── client/                    # Static HTML files
│   ├── index.html            # Header + Footer duplicated
│   ├── LoginPage.html        # Header + Footer duplicated
│   ├── CourseandLesson.html  # Header + Footer duplicated
│   ├── Community.html        # Header + Footer duplicated
│   ├── Blog.html             # Header + Footer duplicated
│   └── ... (18 files total with duplicate code)
├── server/
│   ├── models/
│   ├── controllers/
│   └── routes/
└── server.js
```

**Vấn đề:**
- Header navigation lặp lại trong ~18 files
- Footer lặp lại trong ~18 files
- Mỗi khi update navigation phải sửa 18 files
- CSS styles lặp lại nhiều lần
- Không có code reusability

### ✅ AFTER (Mục tiêu)
```
Codemaster-3/
├── views/                     # VIEW LAYER (MVC)
│   ├── layouts/
│   │   └── main.ejs          # Base layout template
│   ├── partials/
│   │   ├── head.ejs          # <head> tags (meta, styles, etc.)
│   │   ├── header.ejs        # Navigation bar (used once, reused everywhere)
│   │   ├── footer.ejs        # Footer (used once, reused everywhere)
│   │   └── scripts.ejs       # Common JavaScript
│   └── pages/
│       ├── index.ejs         # Homepage content only
│       ├── login.ejs         # Login form only
│       ├── courses.ejs       # Courses content only
│       ├── community.ejs     # Community content only
│       └── ... (clean, focused content)
├── public/                    # Static assets
│   ├── css/
│   │   └── styles.css        # Global styles
│   ├── js/
│   │   ├── common.js         # Shared JavaScript utilities
│   │   ├── login.js          # Login-specific logic
│   │   └── courses.js        # Courses-specific logic
│   └── images/
├── server/                    # BACKEND (MVC)
│   ├── models/               # MODEL layer ✅
│   ├── controllers/          # CONTROLLER layer ✅
│   ├── routes/               # Routes ✅
│   ├── middleware/
│   └── services/
└── server.js
```

**Lợi ích:**
- Header/Footer chỉ cần maintain ở 1 chỗ
- Update navigation → tự động apply cho toàn bộ pages
- Code nhỏ gọn, dễ đọc
- Separation of concerns rõ ràng

## 🔧 Implementation Plan

### Phase 1: Setup (✅ COMPLETED)
- [x] Install EJS template engine
- [x] Create views/ directory structure
- [x] Configure EJS in server.js
- [x] Create partials (head, header, footer)
- [x] Create base layout template

### Phase 2: Migration Strategy

#### Option A: Gradual Migration (Recommended)
Migrate từng page một, giữ backward compatibility:

1. **Week 1: Core Pages**
   - [ ] Convert LoginPage.html → views/pages/login.ejs
   - [ ] Convert SignUpPage.html → views/pages/signup.ejs
   - [ ] Test thoroughly

2. **Week 2: Public Pages**
   - [ ] Convert index.html → views/pages/index.ejs
   - [ ] Convert CourseandLesson.html → views/pages/courses.ejs
   - [ ] Convert Community.html → views/pages/community.ejs
   - [ ] Convert Blog.html → views/pages/blog.ejs

3. **Week 3: Dashboard Pages**
   - [ ] Convert StudentDashboard.html → views/pages/student-dashboard.ejs
   - [ ] Convert TeacherDashboard.html → views/pages/teacher-dashboard.ejs
   - [ ] Convert AdminDashboard.html → views/pages/admin-dashboard.ejs

4. **Week 4: Remaining Pages**
   - [ ] Convert all remaining pages
   - [ ] Remove old client/ folder
   - [ ] Update all routes

#### Option B: Big Bang Migration
Convert tất cả một lúc (rủi ro cao hơn):

1. Create automated conversion script
2. Convert all HTML → EJS
3. Update all routes
4. Test extensively
5. Deploy

## 📝 Step-by-Step Conversion Guide

### Converting a Single Page

**Example: LoginPage.html → login.ejs**

#### Step 1: Extract Content
```html
<!-- LoginPage.html -->
<!DOCTYPE html>
<html>
<head>
    <!-- Common head stuff -->
</head>
<body>
    <!-- Login form -->
    <div class="login-container">
        <!-- Login content -->
    </div>
    <script>
        // Login logic
    </script>
</body>
</html>
```

#### Step 2: Create EJS Template
```ejs
<!-- views/pages/login.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
    <%- include('../partials/head', {title: 'Login'}) %>
    <style>
        /* Page-specific styles */
    </style>
</head>
<body>
    <!-- Login form content only -->
    <div class="login-container">
        <!-- Login content -->
    </div>

    <%- include('../partials/login-modals') %>
    <script src="/js/login.js"></script>
</body>
</html>
```

#### Step 3: Extract JavaScript
Move inline `<script>` to `/public/js/login.js`

#### Step 4: Update Route
```javascript
// server.js - BEFORE
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/client/LoginPage.html');
});

// server.js - AFTER
app.get('/login', (req, res) => {
  res.render('pages/login', {
    title: 'Login',
    showHeader: false,  // Login page has custom layout
    showFooter: false
  });
});
```

## 🤖 Automated Conversion Script

Tạo script để tự động convert HTML → EJS:

```javascript
// scripts/convert-to-ejs.js
const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'index.html',
    'LoginPage.html',
    'SignUpPage.html',
    // ... add all files
];

const routeMapping = {
    'index.html': { route: '/', view: 'index', title: 'Home' },
    'LoginPage.html': { route: '/login', view: 'login', title: 'Login' },
    'CourseandLesson.html': { route: '/courses', view: 'courses', title: 'Courses' },
    // ... add mappings
};

function convertHtmlToEjs(htmlFile) {
    const content = fs.readFileSync(`client/${htmlFile}`, 'utf8');

    // Extract body content
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/);
    const bodyContent = bodyMatch ? bodyMatch[1] : '';

    // Extract styles
    const styleMatch = content.match(/<style[^>]*>([\s\S]*)<\/style>/);
    const customStyles = styleMatch ? styleMatch[1] : '';

    // Extract scripts
    const scriptMatch = content.match(/<script>([\s\S]*)<\/script>/);
    const scripts = scriptMatch ? scriptMatch[1] : '';

    // Create EJS template
    const ejsTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <%- include('../partials/head', {title: '${routeMapping[htmlFile].title}'}) %>
    <style>${customStyles}</style>
</head>
<body>
    <%- include('../partials/header') %>

    ${bodyContent}

    <%- include('../partials/footer') %>
    <script>${scripts}</script>
</body>
</html>`;

    // Write EJS file
    fs.writeFileSync(`views/pages/${routeMapping[htmlFile].view}.ejs`, ejsTemplate);
    console.log(`✓ Converted ${htmlFile} → ${routeMapping[htmlFile].view}.ejs`);
}

// Convert all files
htmlFiles.forEach(convertHtmlToEjs);
```

## 🚀 Quick Start Guide

### Test với 1 page trước (Login):

1. **Restart server để load EJS config:**
```bash
# Kill current server
taskkill //F //PID [pid]

# Start with EJS support
cd f:\FINALPROJECT\Codemaster-3
set PORT=7000
node server.js
```

2. **Update login route trong server.js:**
```javascript
app.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});
```

3. **Test:**
- Truy cập: http://localhost:7000/login
- Check xem login page có render đúng không
- Check console có lỗi không

4. **Nếu OK:**
- Proceed với pages khác
- Nếu có issue: Debug và fix

## 📋 Checklist

### Pre-Migration
- [x] Backup toàn bộ project
- [x] Create git branch: `feature/mvc-refactoring`
- [x] Install EJS: `npm install ejs`
- [x] Setup views/ directory structure

### During Migration
- [ ] Convert pages one by one
- [ ] Extract common JavaScript to /public/js
- [ ] Move images to /public/images
- [ ] Update all routes
- [ ] Test each page after conversion

### Post-Migration
- [ ] Remove old client/ folder
- [ ] Update .gitignore
- [ ] Update documentation
- [ ] Deploy to production

## ⚠️ Important Notes

1. **Backward Compatibility**: Trong quá trình migration, giữ cả HTML và EJS để không break production
2. **Testing**: Test kỹ từng page sau khi convert
3. **Git**: Commit sau mỗi page conversion để dễ rollback
4. **Database**: Model layer đã có sẵn, chỉ cần focus vào View layer

## 🎓 Best Practices

### 1. Naming Conventions
- EJS files: `kebab-case` (login.ejs, student-dashboard.ejs)
- Partials: descriptive names (header.ejs, nav.ejs)
- Layouts: purpose-based (main.ejs, auth.ejs)

### 2. Data Passing
```javascript
// Good: Pass specific data
res.render('pages/courses', {
    title: 'Courses',
    user: req.user,
    courses: await Course.findAll()
});

// Bad: Pass entire req object
res.render('pages/courses', { req });
```

### 3. Partials Organization
```
partials/
├── common/
│   ├── head.ejs
│   ├── header.ejs
│   └── footer.ejs
├── forms/
│   ├── login-form.ejs
│   └── signup-form.ejs
└── modals/
    ├── login-modals.ejs
    └── confirm-modal.ejs
```

## 📚 Resources

- [EJS Documentation](https://ejs.co/)
- [Express.js View Engines](https://expressjs.com/en/guide/using-template-engines.html)
- [MVC Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)

## 🆘 Troubleshooting

### Issue: "Cannot find module 'ejs'"
```bash
npm install ejs --save
```

### Issue: "Failed to lookup view"
Check:
- app.set('views', './views') is correct
- File paths are relative to views/ directory
- File extension is .ejs not .html

### Issue: "Partial not found"
Check:
- include() path is correct: `../partials/header` not `/partials/header`
- File exists in partials/ directory

## ✅ Success Criteria

Migration hoàn thành khi:
- [ ] Tất cả pages render qua EJS
- [ ] Không còn duplicate code
- [ ] Header/Footer chỉ maintain ở 1 file
- [ ] All tests pass
- [ ] Performance không giảm
- [ ] SEO không bị ảnh hưởng

---

**Created**: <%= new Date().toISOString().split('T')[0] %>
**Status**: In Progress
**Priority**: High
**Estimated Time**: 2-4 weeks (gradual migration)
