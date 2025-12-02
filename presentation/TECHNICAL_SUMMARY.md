# 📊 Technical Summary - UniLearn

## 1. Project Overview

| Attribute | Value |
|-----------|-------|
| **Project Name** | UniLearn |
| **Type** | Learning Management System (LMS) |
| **Architecture** | MVC (Model-View-Controller) |
| **Rendering** | Server-Side (EJS) |
| **Database** | Firebase Firestore (NoSQL) |

---

## 2. Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| Firebase Admin SDK | Database & Auth |
| JWT | Token-based authentication |
| Passport.js | Google OAuth 2.0 |
| Multer | File upload handling |
| bcrypt | Password hashing |
| Stripe | Payment processing |
| Nodemailer | Email service |

### Frontend
| Technology | Purpose |
|------------|---------|
| EJS | Template engine |
| TailwindCSS | Styling framework |
| JavaScript (Vanilla) | Client-side logic |
| Font Awesome | Icons |

### External Services
| Service | Purpose |
|---------|---------|
| Firebase Firestore | NoSQL database |
| Firebase Auth | Authentication |
| Cloudinary | Image storage |
| Stripe | Payment gateway |
| Gmail SMTP | Email sending |

---

## 3. Project Structure

```
UniLearn/
├── server.js                    # Application entry point
├── package.json                 # Dependencies
├── vercel.json                  # Deployment config
│
├── public/                      # Static assets
│   ├── css/
│   │   └── darkmode-improved.css
│   ├── images/
│   └── js/
│       ├── pages/               # Page-specific JS (16 files)
│       ├── shared/              # Shared utilities
│       └── utils/
│
├── views/                       # EJS templates
│   ├── pages/                   # Main pages (18 pages)
│   └── partials/                # Reusable components
│
├── server/
│   ├── config/
│   │   ├── cloudinary.js        # Cloudinary setup
│   │   └── passport.js          # OAuth config
│   │
│   ├── controllers/             # Business logic (16 controllers)
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── lessonController.js
│   │   ├── quizController.js
│   │   ├── userController.js
│   │   └── ... (11 more)
│   │
│   ├── models/                  # Data models (15 models)
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lesson.js
│   │   ├── Quiz.js
│   │   └── ... (11 more)
│   │
│   ├── routes/                  # API routes (15 route files)
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   └── ... (13 more)
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── subscriptionMiddleware.js
│   │
│   ├── services/
│   │   └── emailService.js      # Email sending
│   │
│   └── utils/
│       ├── emailValidator.js
│       └── firebaseHelpers.js
│
└── uploads/                     # Local file storage
    └── videos/
```

---

## 4. Database Schema (Firestore Collections)

### Core Collections

#### `users`
```javascript
{
  id: string,
  name: string,
  email: string,
  password: string (hashed),
  role: "student" | "teacher" | "admin",
  avatarUrl: string,
  phone: string,
  bio: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `courses`
```javascript
{
  id: string,
  title: string,
  description: string,
  instructor: string,
  teacher_id: string (ref: users),
  imageUrl: string,
  category: string,
  level: "beginner" | "intermediate" | "advanced",
  price: number,
  status: "draft" | "published",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `lessons`
```javascript
{
  id: string,
  course_id: string (ref: courses),
  title: string,
  description: string,
  content: string (HTML),
  videoUrl: string,
  order: number,
  duration: string,
  isPublished: boolean,
  createdAt: timestamp
}
```

#### `quizzes`
```javascript
{
  id: string,
  course_id: string (ref: courses),
  title: string,
  description: string,
  time_limit: number,
  passing_score: number,
  order: number,
  createdAt: timestamp
}
```

#### `questions`
```javascript
{
  id: string,
  quiz_id: string (ref: quizzes),
  question_text: string,
  question_type: "multiple_choice" | "true_false",
  options: array,
  correct_answer: string | number,
  points: number,
  order: number
}
```

### Tracking Collections

#### `enrollments`
```javascript
{
  id: string,
  user_id: string (ref: users),
  course_id: string (ref: courses),
  enrolled_at: timestamp,
  status: "active" | "completed"
}
```

#### `progress`
```javascript
{
  id: string,
  user_id: string (ref: users),
  course_id: string (ref: courses),
  lesson_id: string (ref: lessons),
  completed: boolean,
  completed_at: timestamp
}
```

#### `grades`
```javascript
{
  id: string,
  user_id: string (ref: users),
  quiz_id: string (ref: quizzes),
  course_id: string (ref: courses),
  score: number,
  total_points: number,
  percentage: number,
  passed: boolean,
  submitted_at: timestamp
}
```

#### `certificates`
```javascript
{
  id: string,
  user_id: string (ref: users),
  course_id: string (ref: courses),
  certificate_id: string (unique),
  issued_at: timestamp
}
```

### Commerce Collections

#### `orders`
```javascript
{
  id: string,
  user_id: string (ref: users),
  items: array,
  total_amount: number,
  status: "pending" | "completed" | "cancelled",
  created_at: timestamp
}
```

#### `payments`
```javascript
{
  id: string,
  order_id: string (ref: orders),
  stripe_payment_id: string,
  amount: number,
  status: string,
  created_at: timestamp
}
```

#### `subscriptions`
```javascript
{
  id: string,
  name: string,
  price: number,
  features: array,
  duration: string,
  isActive: boolean
}
```

### Content Collections

#### `blogs`
```javascript
{
  id: string,
  title: string,
  content: string (HTML),
  excerpt: string,
  featured_image: string,
  author_id: string (ref: users),
  author_name: string,
  tags: array,
  status: "draft" | "published",
  view_count: number,
  created_at: timestamp
}
```

---

## 5. API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Request password reset |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| PUT | `/api/users/:id/role` | Change user role |
| DELETE | `/api/users/:id` | Delete user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get course details |
| POST | `/api/courses` | Create course (teacher) |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |
| GET | `/api/courses/:id/lessons` | Get course lessons |

### Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lessons/:id` | Get lesson details |
| POST | `/api/lessons` | Create lesson |
| PUT | `/api/lessons/:id` | Update lesson |
| DELETE | `/api/lessons/:id` | Delete lesson |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/:id` | Get quiz with questions |
| POST | `/api/quizzes` | Create quiz |
| POST | `/api/quizzes/:id/submit` | Submit quiz answers |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/:userId` | Get user progress |
| POST | `/api/progress/lesson` | Mark lesson complete |

---

## 6. Authentication Flow

### JWT Flow
```
1. User submits credentials
2. Server validates & creates JWT
3. Token returned to client
4. Client stores in localStorage
5. Client sends token in Authorization header
6. Server middleware verifies token
7. Request processed if valid
```

### Google OAuth Flow
```
1. User clicks "Sign in with Google"
2. Redirect to Google consent screen
3. User authorizes app
4. Google redirects with auth code
5. Server exchanges code for tokens
6. Server gets user profile from Google
7. Server creates/updates user in DB
8. Server creates JWT and redirects
```

---

## 7. Key Features Implementation

### Progress Tracking
- Each lesson completion creates `progress` record
- Progress percentage = (completed lessons / total lessons) × 100
- When 100% → Auto-generate certificate

### Role-Based Access
- Middleware checks `req.user.role`
- UI adapts based on role
- API endpoints restricted by role

### File Upload
- Images → Cloudinary (cloud)
- Videos → Local `/uploads/videos/`
- Multer handles multipart form data

---

## 8. Security Measures

| Measure | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with salt rounds |
| JWT Tokens | Signed with secret, expiry |
| CORS | Configured allowed origins |
| Input Validation | Server-side validation |
| SQL Injection | N/A (NoSQL) |
| XSS | EJS auto-escapes output |

---

## 9. Statistics

| Metric | Count |
|--------|-------|
| Total Files | ~100+ |
| Controllers | 16 |
| Models | 15 |
| Routes | 15 |
| EJS Pages | 18 |
| JS Files (Frontend) | 16 |
| API Endpoints | 50+ |
| Firestore Collections | 14 |
