# 🎤 UniLearn - Presentation Script (10 Minutes)

## ⏱️ Time Breakdown
| Section | Duration | Cumulative |
|---------|----------|------------|
| Introduction | 1 min | 1:00 |
| Problem & Solution | 1.5 min | 2:30 |
| Live Demo | 4 min | 6:30 |
| Technical Architecture | 2 min | 8:30 |
| Conclusion | 1.5 min | 10:00 |

---

## 📍 SLIDE 1: Title (30 seconds)

**Say:**
> "Good morning/afternoon everyone. My name is Phạm Trần Gia Huy, Student ID GCS220124. Today I will present my final year project: UniLearn - A Comprehensive E-Learning Management System."

**Show:** Title slide with logo, URL: https://unilearn.huy.global/

---

## 📍 SLIDE 2: Problem Statement (1 minute)

**Say:**
> "The COVID-19 pandemic accelerated online education, but existing platforms have significant problems:
> 
> 1. **Fragmentation** - Students use 4-5 different tools: one for content, one for quizzes, another for certificates
> 2. **Complex pricing** - Enterprise LMS like Canvas costs $60-180 per user per year
> 3. **Poor UX** - Traditional systems like Moodle have steep learning curves
> 
> UniLearn solves this by providing an ALL-IN-ONE platform that's affordable, modern, and easy to use."

---

## 📍 SLIDE 3: Key Features Overview (30 seconds)

**Say:**
> "UniLearn provides 8 core modules:
> - User authentication with Google OAuth
> - Course management with video lessons
> - Interactive quizzes with auto-grading
> - Automatic certificate generation
> - Stripe payment integration
> - Community features with leaderboards
> - Admin dashboard
> - Pro subscription system"

---

## 📍 LIVE DEMO (4 minutes)

### Demo Flow - Follow this exact sequence:

#### 1️⃣ Landing Page (30 sec)
- Open https://unilearn.huy.global/
- Show the 3D Spline animation background
- Point out responsive design, dark mode toggle
- Click "Get Started"

#### 2️⃣ Authentication (30 sec)
- Show Login page
- Click "Sign in with Google" → Show OAuth flow
- OR login with test account: `demo@example.com`
- Mention: "JWT token stored securely, bcrypt password hashing"

#### 3️⃣ Course Catalog (45 sec)
- Browse courses page
- Use search/filter functionality
- Click on a course to show details
- Show video lesson playing
- Click "Mark as Complete" button

#### 4️⃣ Quiz System (45 sec)
- Navigate to a quiz
- Answer 2-3 questions quickly
- Submit and show auto-grading results
- "System calculates score instantly using automated grading algorithm"

#### 5️⃣ Certificate Generation (30 sec)
- Go to "My Learning" → Certificates tab
- Show a generated certificate
- Click download PDF
- "Uses Puppeteer to generate professional PDF certificates"

#### 6️⃣ Payment Flow (30 sec)
- Click "Upgrade to Pro"
- Show Stripe Checkout page (don't complete payment)
- "Stripe handles PCI compliance - we never store card data"

#### 7️⃣ Admin Dashboard (30 sec)
- Login as admin
- Show analytics: total users, courses, revenue
- Show user management table
- "Role-based access control restricts this to admins only"

---

## 📍 SLIDE 4: Technical Architecture (1.5 minutes)

**Say:**
> "UniLearn follows the MVC architecture pattern:
> 
> **Frontend:**
> - EJS templating for server-side rendering
> - Tailwind CSS for responsive design
> - Vanilla JavaScript for interactivity
> 
> **Backend:**
> - Node.js with Express.js framework
> - RESTful API with 97 endpoints
> - JWT for authentication
> 
> **Database:**
> - Firebase Firestore - NoSQL document database
> - 16 collections: Users, Courses, Quizzes, Certificates...
> 
> **Cloud Services:**
> - Vercel for serverless deployment with CI/CD
> - Cloudinary CDN for images and videos
> - Stripe for payment processing
> - Nodemailer for transactional emails"

---

## 📍 SLIDE 5: Security Implementation (30 seconds)

**Say:**
> "Security was a priority. We implemented:
> - OWASP Top 10 compliance
> - Bcrypt password hashing with 12 salt rounds
> - HTTPS everywhere via Vercel
> - Role-based access control (Student, Teacher, Admin)
> - PCI DSS compliance through Stripe tokenization"

---

## 📍 SLIDE 6: Testing Results (30 seconds)

**Say:**
> "Testing confirmed system reliability:
> - 100% functional requirement pass rate
> - Response time under 500ms with 100 concurrent users
> - Zero high-risk vulnerabilities in OWASP ZAP scan
> - Cross-browser compatibility: Chrome, Firefox, Safari, Edge"

---

## 📍 SLIDE 7: Conclusion (1 minute)

**Say:**
> "In conclusion, UniLearn successfully delivers:
> 
> ✅ A complete, integrated LMS platform
> ✅ Modern tech stack following industry standards
> ✅ Secure payment and authentication
> ✅ Scalable cloud-native architecture
> 
> **Future improvements** could include:
> - Native mobile apps
> - AI-powered course recommendations
> - Real-time video conferencing
> 
> The live system is available at **unilearn.huy.global**
> 
> Thank you for your attention. I'm ready for questions."

---

## 🔗 Quick Links for Demo
- **Main URL:** https://unilearn.huy.global/
- **Backup URL:** https://x.huy.global/
- **GitHub:** https://github.com/givhvy/FINAL-PROJECT

## 🔑 Demo Accounts (if needed)
| Role | Email | Password |
|------|-------|----------|
| Student | student@test.com | Test123! |
| Teacher | teacher@test.com | Test123! |
| Admin | admin@test.com | Test123! |

---

## ⚠️ Backup Plan
If website is slow:
1. Mention: "Vercel free tier may have cold starts"
2. Show GitHub repo instead
3. Have screenshots ready in `/presentation/screenshots/`
