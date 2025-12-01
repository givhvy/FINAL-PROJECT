# 📋 Technical Summary - Quick Reference Card

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      UNILEARN STACK                          │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND          │  BACKEND           │  DATABASE          │
│  ─────────         │  ───────           │  ────────          │
│  • EJS Templates   │  • Node.js v18+    │  • Firebase        │
│  • Tailwind CSS    │  • Express.js      │    Firestore       │
│  • Vanilla JS      │  • JWT Auth        │  • 16 Collections  │
│  • Font Awesome    │  • Passport.js     │  • NoSQL Document  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| Lines of Code | 20,000+ |
| API Endpoints | 97 |
| Database Collections | 16 |
| Models | 16 |
| Controllers | 16 |
| Routes | 16 |
| Views (EJS) | 20+ |

## 🗂️ Database Collections

```
users          → User accounts, auth, profile
courses        → Course info, teacher, pricing
lessons        → Video content, materials
quizzes        → Quiz settings, scores
questions      → MCQ questions, answers
enrollments    → User-course relationships
progress       → Lesson completion tracking
grades         → Quiz results
certificates   → Generated certificates
payments       → Stripe transactions
orders         → Purchase records
subscriptions  → Pro tier status
groups         → Study groups
groupMessages  → Forum posts
blogs          → Blog articles
```

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
```
POST /register       → Create account
POST /login          → Email/password login
GET  /google         → Google OAuth start
GET  /google/callback→ OAuth callback
POST /forgot-password→ Send reset email
POST /reset-password → Reset with code
```

### Courses (`/api/courses`)
```
GET  /              → List all courses
GET  /:id           → Course details
POST /              → Create course (teacher)
PUT  /:id           → Update course
DELETE /:id         → Delete course
POST /:id/enroll    → Enroll student
GET  /:id/lessons   → Get lessons
```

### Quizzes (`/api/quizzes`)
```
GET  /:id           → Quiz details
POST /              → Create quiz
POST /:id/submit    → Submit answers
GET  /:id/results   → Get results
```

### Payments (`/api/payment`)
```
POST /create-checkout→ Stripe session
POST /webhook        → Stripe webhook
GET  /orders         → Order history
```

## 🔐 Security Implementation

### Authentication Flow
```
1. User submits credentials
2. Server validates against Firestore
3. bcrypt.compare() checks password
4. JWT token generated (24h expiry)
5. Token stored in localStorage
6. All requests include: Authorization: Bearer <token>
```

### RBAC Middleware
```javascript
const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// Usage:
router.get('/admin', authMiddleware, requireRole(['admin']), adminController);
```

### Security Headers (Helmet.js)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

## 💳 Payment Flow

```
1. User clicks "Upgrade to Pro"
2. Frontend: POST /api/payment/create-checkout
3. Server creates Stripe Checkout Session
4. Server returns Stripe URL
5. User redirected to Stripe
6. User enters card (never touches our server)
7. Payment success → Stripe webhook
8. Webhook: Update user.subscriptionTier = 'pro'
```

## 📁 Project Structure

```
Codemaster-3/
├── server.js              # Entry point
├── package.json           # Dependencies
├── vercel.json           # Deployment config
├── public/
│   ├── css/              # Stylesheets
│   ├── js/
│   │   ├── pages/        # Page-specific JS
│   │   ├── shared/       # Utility modules
│   │   └── utils/        # Helper functions
│   └── images/           # Static assets
├── server/
│   ├── config/           # Passport, Cloudinary
│   ├── controllers/      # Business logic (16)
│   ├── middleware/       # Auth, RBAC
│   ├── models/           # Firestore models (16)
│   ├── routes/           # API routes (16)
│   ├── services/         # Email service
│   └── utils/            # Helpers
└── views/
    ├── layouts/          # Main template
    ├── pages/            # EJS pages (20+)
    └── partials/         # Reusable components
```

## 🌐 Cloud Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Vercel** | Hosting, CI/CD | 100GB bandwidth |
| **Firebase Firestore** | Database | 50K reads/day |
| **Cloudinary** | Media CDN | 25GB storage |
| **Stripe** | Payments | No monthly fee |
| **Gmail SMTP** | Emails | 500/day |

## 🧪 Testing Summary

| Test Type | Tool | Result |
|-----------|------|--------|
| Functional | Manual | 100% pass |
| API | Postman | 97 endpoints |
| Security | OWASP ZAP | 0 high-risk |
| Load | Artillery | 70ms avg (100 users) |
| Browser | Manual | Chrome, FF, Safari, Edge |

## 📈 Performance

```
Response Times (100 concurrent users):
├── Average: 70ms
├── p95: 150ms
├── p99: 250ms
└── Failed: 0 requests

Page Load (Desktop):
├── First Contentful Paint: 1.2s
├── Time to Interactive: 2.1s
└── Lighthouse Score: 85+
```

## 🔗 URLs

| Environment | URL |
|-------------|-----|
| Production | https://unilearn.huy.global/ |
| Backup | https://x.huy.global/ |
| GitHub | https://github.com/givhvy/FINAL-PROJECT |

## 🎯 Key Technologies

```
Runtime:     Node.js 18+
Framework:   Express.js 4.x
Database:    Firebase Firestore
Auth:        JWT + Passport.js + Google OAuth 2.0
Payments:    Stripe Checkout
Email:       Nodemailer + Gmail SMTP
Media:       Cloudinary CDN
PDF:         Puppeteer
Styling:     Tailwind CSS
Deployment:  Vercel Serverless
VCS:         Git + GitHub
```
