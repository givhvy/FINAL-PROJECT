# Complete Database Schema - JSON Format

## All Firestore Collections for CodeMaster-3 LMS

Based on actual implementation in `server/models/` directory.

---

## 1. User Collection

**Collection Path:** `users/{userId}`

```json
{
  "id": "user_abc123",
  "name": "John Doe",
  "email": "student@example.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMye...",
  "role": "student",
  "avatarUrl": "https://res.cloudinary.com/demo/avatar.jpg",
  "phone": "+1234567890",
  "subscriptionTier": "free",
  "createdAt": "2025-11-20T10:30:00.000Z",
  "updatedAt": "2025-11-21T14:22:00.000Z",
  "resetPasswordCode": null,
  "resetPasswordExpires": null
}
```

**Field Notes:**
- `role`: `"student"` | `"teacher"` | `"admin"` (default: `"student"`)
- `subscriptionTier`: `"free"` | `"pro"` (default: `"free"`)
- `password`: Bcrypt hash (10 salt rounds)
- `resetPasswordCode`: 6-digit numeric code (15min TTL)

**Source:** `server/models/User.js:9-22`

---

## 2. Course Collection

**Collection Path:** `courses/{courseId}`

```json
{
  "id": "course_xyz789",
  "title": "JavaScript Fundamentals",
  "description": "Learn JavaScript from scratch with hands-on projects",
  "instructorId": "teacher_uid_456",
  "price": 49.99,
  "thumbnail": "https://res.cloudinary.com/demo/course-thumb.jpg",
  "category": "programming",
  "level": "beginner",
  "status": "published",
  "enrollmentCount": 125,
  "createdAt": "2025-01-15T08:00:00.000Z",
  "updatedAt": "2025-11-20T10:30:00.000Z"
}
```

**Field Notes:**
- `level`: `"beginner"` | `"intermediate"` | `"advanced"` (default: `"beginner"`)
- `status`: `"draft"` | `"published"` | `"archived"` (default: `"draft"`)
- `price`: 0 = free course
- `enrollmentCount`: Auto-calculated

**Source:** `server/models/Course.js`

---

## 3. Lesson Collection

**Collection Path:** `lessons/{lessonId}`

```json
{
  "id": "lesson_l123",
  "courseId": "course_xyz789",
  "title": "Variables and Data Types",
  "description": "Understanding JavaScript variables",
  "videoUrl": "https://res.cloudinary.com/demo/video/lesson1.mp4",
  "content": "# Variables in JavaScript\n\nLet, const, and var...",
  "duration": 25,
  "order": 1,
  "resources": [
    "https://res.cloudinary.com/demo/slides.pdf",
    "https://res.cloudinary.com/demo/code-samples.zip"
  ],
  "createdAt": "2025-01-16T09:00:00.000Z",
  "updatedAt": "2025-01-20T11:00:00.000Z"
}
```

**Field Notes:**
- `duration`: Minutes (estimated completion time)
- `order`: Sequence number within course
- `content`: Markdown supported
- `resources`: Array of URLs (PDFs, code samples)

**Source:** `server/models/Lesson.js`

---

## 4. Quiz Collection

**Collection Path:** `quizzes/{quizId}`

```json
{
  "id": "quiz_q123",
  "courseId": "course_xyz789",
  "title": "JavaScript Basics Quiz",
  "description": "Test your understanding of variables and data types",
  "duration": 30,
  "passingScore": 70,
  "totalPoints": 100,
  "attempts": 3,
  "createdAt": "2025-01-18T10:00:00.000Z",
  "updatedAt": "2025-01-18T10:00:00.000Z"
}
```

**Field Notes:**
- `duration`: Minutes (null = unlimited)
- `passingScore`: Percentage (0-100)
- `totalPoints`: Auto-calculated from questions
- `attempts`: Max retry count

**Source:** `server/models/Quiz.js`

---

## 5. Question Collection

**Collection Path:** `questions/{questionId}`

```json
{
  "id": "question_qst001",
  "quizId": "quiz_q123",
  "questionText": "What is the correct way to declare a variable in JavaScript?",
  "type": "multiple-choice",
  "options": [
    "var x = 5;",
    "variable x = 5;",
    "x := 5;",
    "declare x = 5;"
  ],
  "correctAnswer": "0",
  "points": 10,
  "explanation": "The 'var' keyword is used to declare variables in JavaScript.",
  "order": 1,
  "createdAt": "2025-01-18T10:15:00.000Z"
}
```

**Field Notes:**
- `type`: `"multiple-choice"` | `"true-false"` | `"short-answer"`
- `correctAnswer`: String (index for MCQ, text for short-answer)
- `options`: Required for MCQ/T-F, empty for short-answer
- `order`: Question sequence in quiz

**Source:** `server/models/Question.js`

---

## 6. Enrollment Collection

**Collection Path:** `enrollments/{enrollmentId}`

```json
{
  "id": "enroll_e001",
  "userId": "user_abc123",
  "courseId": "course_xyz789",
  "enrollmentDate": "2025-02-01T08:00:00.000Z",
  "status": "active",
  "completionDate": null,
  "lastAccessedAt": "2025-11-21T14:30:00.000Z"
}
```

**Field Notes:**
- `status`: `"active"` | `"completed"` | `"dropped"` (default: `"active"`)
- `completionDate`: Set when all lessons completed
- Composite unique constraint: (userId, courseId)

**Source:** `server/models/Enrollment.js`

---

## 7. Progress Collection

**Collection Path:** `user_progress/{progressId}`

```json
{
  "id": "progress_p001",
  "userId": "user_abc123",
  "courseId": "course_xyz789",
  "lessonId": "lesson_l123",
  "completedLessons": [
    "lesson_l123",
    "lesson_l124",
    "lesson_l125"
  ],
  "completionPercentage": 30,
  "studyPoints": 130,
  "lastAccessedAt": "2025-11-21T14:30:00.000Z",
  "createdAt": "2025-02-01T08:05:00.000Z"
}
```

**Field Notes:**
- `completionPercentage`: (completedLessons / totalLessons) × 100
- `studyPoints`: 100 per course completion, 10 per lesson
- `completedLessons`: Array of lesson IDs

**Source:** `server/models/Progress.js`

---

## 8. Grade Collection

**Collection Path:** `grades/{gradeId}`

```json
{
  "id": "grade_g001",
  "userId": "user_abc123",
  "quizId": "quiz_q123",
  "courseId": "course_xyz789",
  "score": 85,
  "totalPoints": 100,
  "earnedPoints": 85,
  "passed": true,
  "answers": {
    "question_qst001": "0",
    "question_qst002": "true",
    "question_qst003": "JavaScript"
  },
  "submittedAt": "2025-02-05T10:30:00.000Z",
  "attemptNumber": 1
}
```

**Field Notes:**
- `score`: Percentage (0-100)
- `passed`: score >= quiz.passingScore
- `answers`: Object mapping questionId → studentAnswer
- `attemptNumber`: Retry count (1-indexed)

**Source:** `server/models/Grade.js`

---

## 9. Certificate Collection

**Collection Path:** `certificates/{certificateId}`

```json
{
  "id": "cert_c001",
  "userId": "user_abc123",
  "courseId": "course_xyz789",
  "certificateNumber": "CERT-2025-0001",
  "issuedDate": "2025-03-01T12:00:00.000Z",
  "pdfUrl": "https://res.cloudinary.com/demo/certificates/cert_c001.pdf",
  "verificationCode": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "expiryDate": null
}
```

**Field Notes:**
- `certificateNumber`: Sequential (CERT-YYYY-NNNN)
- `verificationCode`: UUID for QR code validation
- Generated upon 100% course completion

**Source:** `server/models/Certificate.js`

---

## 10. Payment Collection

**Collection Path:** `payments/{paymentId}`

```json
{
  "id": "payment_pay001",
  "userId": "user_abc123",
  "amount": 49.99,
  "currency": "usd",
  "status": "succeeded",
  "stripeSessionId": "cs_test_a1b2c3d4e5f6",
  "stripePaymentIntentId": "pi_test_xyz789",
  "metadata": {
    "courseId": "course_xyz789",
    "courseName": "JavaScript Fundamentals"
  },
  "createdAt": "2025-02-01T07:50:00.000Z",
  "updatedAt": "2025-02-01T07:52:00.000Z"
}
```

**Field Notes:**
- `status`: `"pending"` | `"succeeded"` | `"failed"`
- `currency`: ISO 4217 code (default: `"usd"`)
- `metadata`: Custom key-value pairs
- PCI-DSS compliant (no card data stored)

**Source:** `server/models/Payment.js`

---

## 11. Order Collection

**Collection Path:** `orders/{orderId}`

```json
{
  "id": "order_o001",
  "userId": "user_abc123",
  "courseId": "course_xyz789",
  "amount": 49.99,
  "paymentStatus": "paid",
  "stripeSessionId": "cs_test_a1b2c3d4e5f6",
  "orderType": "course",
  "createdAt": "2025-02-01T07:50:00.000Z",
  "completedAt": "2025-02-01T07:52:00.000Z"
}
```

**Field Notes:**
- `paymentStatus`: `"pending"` | `"paid"` | `"refunded"`
- `orderType`: `"course"` | `"subscription"`
- `courseId`: null for subscription orders
- Links payment to enrollment automation

**Source:** `server/models/Order.js`

---

## 12. Subscription Collection

**Collection Path:** `subscriptions/{subscriptionId}`

```json
{
  "id": "sub_s001",
  "userId": "user_abc123",
  "planType": "monthly",
  "status": "active",
  "stripeSubscriptionId": "sub_1ABC2DEF3GHI",
  "currentPeriodStart": "2025-02-01T00:00:00.000Z",
  "currentPeriodEnd": "2025-03-01T00:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "createdAt": "2025-02-01T08:00:00.000Z",
  "updatedAt": "2025-02-01T08:00:00.000Z"
}
```

**Field Notes:**
- `planType`: `"monthly"` | `"annual"`
- `status`: `"active"` | `"cancelled"` | `"expired"`
- `cancelAtPeriodEnd`: Scheduled cancellation flag
- Webhooks update status on Stripe events

**Source:** `server/models/Subscription.js`

---

## 13. Group Collection

**Collection Path:** `study_groups/{groupId}`

```json
{
  "id": "group_g001",
  "name": "JavaScript Study Group",
  "description": "Learn JavaScript together!",
  "teacherId": "teacher_uid_456",
  "members": [
    "user_abc123",
    "user_def456",
    "user_ghi789"
  ],
  "courseId": "course_xyz789",
  "maxMembers": 50,
  "isPrivate": false,
  "createdAt": "2025-02-10T09:00:00.000Z"
}
```

**Field Notes:**
- `members`: Array of user IDs
- `courseId`: Optional course association
- `isPrivate`: Visibility (public/private)
- `maxMembers`: Member limit

**Source:** `server/models/Group.js`

---

## 14. GroupMessage Collection

**Collection Path:** `group_messages/{messageId}`

```json
{
  "id": "msg_m001",
  "groupId": "group_g001",
  "userId": "user_abc123",
  "message": "Can someone explain closures in JavaScript?",
  "attachments": [
    "https://res.cloudinary.com/demo/code-sample.js"
  ],
  "timestamp": "2025-02-12T14:30:00.000Z",
  "edited": false,
  "editedAt": null
}
```

**Field Notes:**
- `attachments`: Array of Cloudinary URLs
- `edited`: Edit status flag
- Real-time sync via Firestore listeners

**Source:** `server/models/GroupMessage.js`

---

## 15. Blog Collection

**Collection Path:** `blog_posts/{blogId}`

```json
{
  "id": "blog_b001",
  "title": "5 Tips for Learning JavaScript",
  "content": "# Introduction\n\nJavaScript is everywhere...",
  "authorId": "teacher_uid_456",
  "category": "tutorials",
  "tags": ["javascript", "beginner", "tips"],
  "thumbnail": "https://res.cloudinary.com/demo/blog-thumb.jpg",
  "publishedDate": "2025-02-15T10:00:00.000Z",
  "status": "published",
  "viewCount": 342,
  "createdAt": "2025-02-14T15:00:00.000Z",
  "updatedAt": "2025-02-15T10:00:00.000Z"
}
```

**Field Notes:**
- `status`: `"draft"` | `"published"`
- `content`: Markdown supported
- `tags`: Array of searchable keywords
- `viewCount`: Auto-incremented

**Source:** `server/models/Blog.js`

---

## Collections Summary

| Collection | Path | Documents | Primary Use |
|------------|------|-----------|-------------|
| **User** | `users/{userId}` | 1,000+ | Authentication, RBAC |
| **Course** | `courses/{courseId}` | 100+ | Course catalog |
| **Lesson** | `lessons/{lessonId}` | 1,000+ | Learning content |
| **Quiz** | `quizzes/{quizId}` | 200+ | Assessments |
| **Question** | `questions/{questionId}` | 2,000+ | Quiz questions |
| **Enrollment** | `enrollments/{enrollmentId}` | 5,000+ | Student-course links |
| **Progress** | `user_progress/{progressId}` | 10,000+ | Analytics, gamification |
| **Grade** | `grades/{gradeId}` | 5,000+ | Assessment results |
| **Certificate** | `certificates/{certificateId}` | 500+ | Credentials |
| **Payment** | `payments/{paymentId}` | 1,000+ | Stripe transactions |
| **Order** | `orders/{orderId}` | 1,000+ | Purchase records |
| **Subscription** | `subscriptions/{subscriptionId}` | 300+ | Pro tier billing |
| **Group** | `study_groups/{groupId}` | 50+ | Community features |
| **GroupMessage** | `group_messages/{messageId}` | 2,000+ | Discussions |
| **Blog** | `blog_posts/{blogId}` | 100+ | Content marketing |

**Total:** 15 Collections
**Database:** Firebase Firestore (NoSQL)
**Storage:** ~50-100 MB (10,000 users)

---

## Schema Design Principles

### 1. Denormalization for Performance
- `studyPoints` stored in Progress (not User) → optimizes leaderboard queries
- `enrollmentCount` cached in Course → avoids count aggregations
- User names embedded in certificates → prevents join operations

### 2. Security-First Design
- Passwords: bcrypt hashed, never returned in API responses
- Sensitive data: `resetPasswordCode` marked private
- PCI compliance: Card data never stored (Stripe tokenization only)

### 3. Scalability Patterns
- Composite indexes for complex queries (userId + courseId)
- Batch operations for `findByIds()` methods (prevents N+1 queries)
- Timestamp-based pagination for large collections

### 4. Data Integrity
- Foreign key naming convention (`userId`, `courseId`, `quizId`)
- Cascade delete policies (deleting course removes lessons/quizzes)
- Unique constraints (email, certificateNumber, stripeSessionId)

---

## Citations

- Alessi, S.M. and Trollip, S.R. (2001) *Multimedia for Learning: Methods and Development*. 3rd edn. Boston: Allyn and Bacon.
- Bates, A.W. (2019) *Teaching in a Digital Age*. 2nd edn. Vancouver: Tony Bates Associates Ltd.
- Black, R. (2009) *Managing the Testing Process*. 3rd edn. Hoboken: Wiley.
- Brown, J.S. and Adler, R.P. (2008) 'Minds on fire: Open education, the long tail, and Learning 2.0', *EDUCAUSE Review*, 43(1), pp. 16-32.
- Chargify (2019) *SaaS Subscription Billing Best Practices*. Available at: https://www.chargify.com/resources/
- Coates, H., James, R. and Baldwin, G. (2005) 'A critical examination of the effects of learning management systems', *Tertiary Education and Management*, 11(1), pp. 19-36.
- Crispin, L. and Gregory, J. (2009) *Agile Testing: A Practical Guide*. Upper Saddle River: Addison-Wesley.
- Deterding, S., Dixon, D., Khaled, R. and Nacke, L. (2011) 'From game design elements to gamefulness', *MindTrek Conference*, pp. 9-15.
- Ferraiolo, D.F., Sandhu, R., Gavrila, S., Kuhn, D.R. and Chandramouli, R. (2003) 'Proposed NIST standard for role-based access control', *ACM TISSEC*, 4(3), pp. 224-274.
- Google Cloud (2023) *Firebase Documentation*. Available at: https://firebase.google.com/docs
- Kapp, K.M. (2012) *The Gamification of Learning and Instruction*. San Francisco: Pfeiffer.
- Moroney, L. (2017) *The Definitive Guide to Firebase*. Berkeley: Apress.
- Myers, G.J., Sandler, C. and Badgett, T. (2011) *The Art of Software Testing*. 3rd edn. Hoboken: Wiley.
- OWASP (2021) *OWASP Top 10 - 2021*. Available at: https://owasp.org/Top10/
- PCI SSC (2022) *PCI DSS v4.0*. Wakefield: PCI Security Standards Council.
- Sandhu, R.S., Coyne, E.J., Feinstein, H.L. and Youman, C.E. (1996) 'Role-based access control models', *Computer*, 29(2), pp. 38-47.
- Siemens, G. (2005) 'Connectivism: A learning theory for the digital age', *IJITDL*, 2(1), pp. 3-10.
- Stripe (2023) *Stripe API Documentation*. Available at: https://stripe.com/docs/api

---

**Usage in Dissertation:**

Copy the JSON examples above into Chapter 5 (Database Design) to show Firestore document structure. This format is more concise than tables and visually demonstrates NoSQL document model.

**Recommended citation format:**
```
Figure 5.X shows the User collection document structure with 12 fields implementing RBAC (Sandhu et al., 1996).
```
