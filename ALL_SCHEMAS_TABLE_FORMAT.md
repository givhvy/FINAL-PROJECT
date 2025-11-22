# Complete Database Schema - Table Format

## All Firestore Collections for CodeMaster-3 LMS

Based on actual implementation in `server/models/` directory.

---

## Table 5.1: User Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `name` | String | Required, 2-100 chars | - | User's full name |
| `email` | String | Required, Unique, Email format | - | Authentication identifier |
| `password` | String | Required, Bcrypt hash | - | Hashed with 10 salt rounds (bcryptjs) |
| `role` | Enum | `student` \| `teacher` \| `admin` | `student` | RBAC role (Sandhu et al., 1996) |
| `avatarUrl` | String | Optional, URL format | `null` | Cloudinary CDN profile picture |
| `phone` | String | Optional, E.164 format | `null` | Contact number |
| `subscriptionTier` | Enum | `free` \| `pro` | `free` | Subscription level determining feature access |
| `createdAt` | DateTime | ISO 8601 string | Auto | Account creation timestamp |
| `updatedAt` | DateTime | ISO 8601 string | Auto | Last modification timestamp |
| `resetPasswordCode` | String | Optional, 6-digit numeric | `null` | Password reset verification code |
| `resetPasswordExpires` | DateTime | Optional | `null` | Reset code expiration (15min TTL) |

**Table 5.1:** User collection schema following Firestore document model with RBAC implementation (Ferraiolo et al., 2003). Passwords stored as bcrypt hashes following OWASP (2021) security guidelines.

**Source:** `server/models/User.js:9-22`

---

## Table 5.2: Course Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `title` | String | Required, 5-200 chars | - | Course name |
| `description` | String | Required, 50-5000 chars | - | Course overview and learning outcomes |
| `instructorId` | String | Required, Foreign Key → `users.id` | - | Teacher who created the course |
| `price` | Number | Optional, Min: 0, Max: 9999.99 | `0` | Course price in USD (0 = free) |
| `thumbnail` | String | Optional, URL format | `null` | Cloudinary CDN course cover image |
| `category` | String | Optional | `'general'` | Course category (programming, design, etc.) |
| `level` | Enum | `beginner` \| `intermediate` \| `advanced` | `beginner` | Difficulty level |
| `status` | Enum | `draft` \| `published` \| `archived` | `draft` | Visibility status |
| `enrollmentCount` | Number | Auto-calculated | `0` | Number of enrolled students |
| `createdAt` | DateTime | ISO 8601 string | Auto | Course creation timestamp |
| `updatedAt` | DateTime | ISO 8601 string | Auto | Last modification timestamp |

**Table 5.2:** Course collection schema. Teachers create courses with draft status; only published courses appear in student catalog (Bates, 2019).

**Source:** `server/models/Course.js`

---

## Table 5.3: Lesson Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `courseId` | String | Required, Foreign Key → `courses.id` | - | Parent course reference |
| `title` | String | Required, 3-200 chars | - | Lesson name |
| `description` | String | Optional | `''` | Lesson overview |
| `videoUrl` | String | Optional, URL format | `null` | Cloudinary video CDN URL |
| `content` | String | Optional, Markdown supported | `''` | Text-based lesson content |
| `duration` | Number | Optional, In minutes | `null` | Estimated completion time |
| `order` | Number | Required, Min: 1 | `1` | Lesson sequence number within course |
| `resources` | Array | Optional | `[]` | Downloadable files (PDFs, code samples) |
| `createdAt` | DateTime | ISO 8601 string | Auto | Lesson creation timestamp |
| `updatedAt` | DateTime | ISO 8601 string | Auto | Last modification timestamp |

**Table 5.3:** Lesson collection schema supporting multimedia learning content (video, text, resources). Order field enables sequential curriculum design (Alessi & Trollip, 2001).

**Source:** `server/models/Lesson.js`

---

## Table 5.4: Quiz Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `courseId` | String | Required, Foreign Key → `courses.id` | - | Associated course |
| `title` | String | Required, 3-200 chars | - | Quiz name |
| `description` | String | Optional | `''` | Quiz instructions |
| `duration` | Number | Optional, In minutes | `null` | Time limit (null = unlimited) |
| `passingScore` | Number | Required, 0-100 percentage | `70` | Minimum score to pass |
| `totalPoints` | Number | Auto-calculated | `0` | Sum of all question points |
| `attempts` | Number | Optional, Max attempts | `3` | Number of retries allowed |
| `createdAt` | DateTime | ISO 8601 string | Auto | Quiz creation timestamp |
| `updatedAt` | DateTime | ISO 8601 string | Auto | Last modification timestamp |

**Table 5.4:** Quiz collection schema. Duration enforces timed assessments; passingScore determines student progression (Black, 2009).

**Source:** `server/models/Quiz.js`

---

## Table 5.5: Question Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `quizId` | String | Required, Foreign Key → `quizzes.id` | - | Parent quiz reference |
| `questionText` | String | Required, 10-1000 chars | - | Question prompt |
| `type` | Enum | `multiple-choice` \| `true-false` \| `short-answer` | `multiple-choice` | Question format |
| `options` | Array | Required for MCQ/T-F | `[]` | Answer choices (array of strings) |
| `correctAnswer` | Mixed | Required | - | String (index) for MCQ, String for text |
| `points` | Number | Required, Min: 1 | `1` | Points awarded for correct answer |
| `explanation` | String | Optional | `null` | Feedback shown after submission |
| `order` | Number | Required, Min: 1 | `1` | Question sequence in quiz |
| `createdAt` | DateTime | ISO 8601 string | Auto | Question creation timestamp |

**Table 5.5:** Question collection schema supporting multiple question types. Correct answers stored for automated grading (Myers et al., 2011).

**Source:** `server/models/Question.js`

---

## Table 5.6: Enrollment Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `userId` | String | Required, Foreign Key → `users.id` | - | Enrolled student |
| `courseId` | String | Required, Foreign Key → `courses.id` | - | Enrolled course |
| `enrollmentDate` | DateTime | ISO 8601 string | Auto | Enrollment timestamp |
| `status` | Enum | `active` \| `completed` \| `dropped` | `active` | Enrollment state |
| `completionDate` | DateTime | Optional | `null` | Course completion timestamp |
| `lastAccessedAt` | DateTime | ISO 8601 string | Auto | Most recent lesson view |

**Table 5.6:** Enrollment collection tracks student-course relationships. Composite unique constraint on (userId, courseId) prevents duplicate enrollments (Coates et al., 2005).

**Source:** `server/models/Enrollment.js`

---

## Table 5.7: Progress Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `userId` | String | Required, Foreign Key → `users.id` | - | Student tracking |
| `courseId` | String | Required, Foreign Key → `courses.id` | - | Course tracking |
| `lessonId` | String | Optional, Foreign Key → `lessons.id` | `null` | Current lesson |
| `completedLessons` | Array | String array of lesson IDs | `[]` | Lessons marked complete |
| `completionPercentage` | Number | Auto-calculated, 0-100 | `0` | (completedLessons / totalLessons) * 100 |
| `studyPoints` | Number | Auto-calculated | `0` | Gamification points (100/course, 10/lesson) |
| `lastAccessedAt` | DateTime | ISO 8601 string | Auto | Most recent activity |
| `createdAt` | DateTime | ISO 8601 string | Auto | Progress record creation |

**Table 5.7:** Progress collection enables learning analytics and gamification. StudyPoints drive leaderboard rankings (Kapp, 2012; Deterding et al., 2011).

**Source:** `server/models/Progress.js`

---

## Table 5.8: Grade Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `userId` | String | Required, Foreign Key → `users.id` | - | Student who took quiz |
| `quizId` | String | Required, Foreign Key → `quizzes.id` | - | Quiz attempted |
| `courseId` | String | Required, Foreign Key → `courses.id` | - | Associated course |
| `score` | Number | Required, 0-100 | - | Percentage score achieved |
| `totalPoints` | Number | Required | - | Maximum possible points |
| `earnedPoints` | Number | Required | - | Points student earned |
| `passed` | Boolean | Auto-calculated | - | score >= quiz.passingScore |
| `answers` | Object | Optional | `{}` | Student's submitted answers (for review) |
| `submittedAt` | DateTime | ISO 8601 string | Auto | Quiz submission timestamp |
| `attemptNumber` | Number | Required, Min: 1 | `1` | Retry attempt count |

**Table 5.8:** Grade collection stores assessment results. Answers object enables result review and analytics (Crispin & Gregory, 2009).

**Source:** `server/models/Grade.js`

---

## Table 5.9: Certificate Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `userId` | String | Required, Foreign Key → `users.id` | - | Certificate recipient |
| `courseId` | String | Required, Foreign Key → `courses.id` | - | Completed course |
| `certificateNumber` | String | Required, Unique | Auto | Sequential number (CERT-2025-0001) |
| `issuedDate` | DateTime | ISO 8601 string | Auto | Certificate generation timestamp |
| `pdfUrl` | String | Optional, URL format | `null` | Cloudinary stored PDF |
| `verificationCode` | String | Auto-generated, UUID | - | QR code verification hash |
| `expiryDate` | DateTime | Optional | `null` | Certificate expiration (if applicable) |

**Table 5.9:** Certificate collection implements credential verification system. Auto-generated upon 100% course completion (Brown & Adler, 2008).

**Source:** `server/models/Certificate.js`

---

## Table 5.10: Payment Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `userId` | String | Required, Foreign Key → `users.id` | - | Customer making payment |
| `amount` | Number | Required, Min: 0.50 | - | Payment amount in USD |
| `currency` | String | Required | `'usd'` | ISO 4217 currency code |
| `status` | Enum | `pending` \| `succeeded` \| `failed` | `pending` | Payment state |
| `stripeSessionId` | String | Required, Unique | - | Stripe Checkout Session ID |
| `stripePaymentIntentId` | String | Optional | `null` | Stripe PaymentIntent ID |
| `metadata` | Object | Optional | `{}` | Custom key-value pairs |
| `createdAt` | DateTime | ISO 8601 string | Auto | Payment initiation timestamp |
| `updatedAt` | DateTime | ISO 8601 string | Auto | Last status update timestamp |

**Table 5.10:** Payment collection tracks Stripe transactions. PCI-DSS compliant (PCI SSC, 2022); card data never stored locally (Stripe, 2023).

**Source:** `server/models/Payment.js`

---

## Table 5.11: Order Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `userId` | String | Required, Foreign Key → `users.id` | - | Purchaser |
| `courseId` | String | Optional, Foreign Key → `courses.id` | `null` | Course purchased (null for subscriptions) |
| `amount` | Number | Required, Min: 0 | - | Total order amount in USD |
| `paymentStatus` | Enum | `pending` \| `paid` \| `refunded` | `pending` | Payment state |
| `stripeSessionId` | String | Required | - | Stripe Checkout Session reference |
| `orderType` | Enum | `course` \| `subscription` | `course` | Purchase type |
| `createdAt` | DateTime | ISO 8601 string | Auto | Order creation timestamp |
| `completedAt` | DateTime | Optional | `null` | Payment success timestamp |

**Table 5.11:** Order collection records transactions. Links payment to course/subscription for enrollment automation (Chargify, 2019).

**Source:** `server/models/Order.js`

---

## Table 5.12: Subscription Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `userId` | String | Required, Foreign Key → `users.id` | - | Subscriber |
| `planType` | Enum | `monthly` \| `annual` | `monthly` | Billing cycle |
| `status` | Enum | `active` \| `cancelled` \| `expired` | `active` | Subscription state |
| `stripeSubscriptionId` | String | Required, Unique | - | Stripe Subscription object ID |
| `currentPeriodStart` | DateTime | ISO 8601 string | Auto | Billing period start |
| `currentPeriodEnd` | DateTime | ISO 8601 string | Auto | Billing period end |
| `cancelAtPeriodEnd` | Boolean | Optional | `false` | Scheduled cancellation flag |
| `createdAt` | DateTime | ISO 8601 string | Auto | Subscription creation timestamp |
| `updatedAt` | DateTime | ISO 8601 string | Auto | Last modification timestamp |

**Table 5.12:** Subscription collection manages Pro tier billing. Webhooks update status on Stripe events (Stripe, 2023).

**Source:** `server/models/Subscription.js`

---

## Table 5.13: Group Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `name` | String | Required, 3-100 chars | - | Study group name |
| `description` | String | Optional | `''` | Group purpose |
| `teacherId` | String | Required, Foreign Key → `users.id` | - | Group creator/moderator |
| `members` | Array | String array of user IDs | `[]` | Group participants |
| `courseId` | String | Optional, Foreign Key → `courses.id` | `null` | Associated course (if any) |
| `maxMembers` | Number | Optional, Min: 2 | `50` | Member limit |
| `isPrivate` | Boolean | Optional | `false` | Visibility (public/private) |
| `createdAt` | DateTime | ISO 8601 string | Auto | Group creation timestamp |

**Table 5.13:** Group collection enables collaborative learning communities (Siemens, 2005). Teachers facilitate discussions.

**Source:** `server/models/Group.js`

---

## Table 5.14: GroupMessage Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `groupId` | String | Required, Foreign Key → `groups.id` | - | Target group |
| `userId` | String | Required, Foreign Key → `users.id` | - | Message author |
| `message` | String | Required, 1-5000 chars | - | Message content |
| `attachments` | Array | Optional, URL array | `[]` | File attachments (Cloudinary URLs) |
| `timestamp` | DateTime | ISO 8601 string | Auto | Message creation time |
| `edited` | Boolean | Optional | `false` | Edit status flag |
| `editedAt` | DateTime | Optional | `null` | Last edit timestamp |

**Table 5.14:** GroupMessage collection stores study group discussions. Real-time sync via Firestore listeners (Google Cloud, 2023).

**Source:** `server/models/GroupMessage.js`

---

## Table 5.15: Blog Collection Schema

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | String | Auto-generated, Primary Key | - | Firestore document ID |
| `title` | String | Required, 5-200 chars | - | Blog post title |
| `content` | String | Required, Markdown supported | - | Post body content |
| `authorId` | String | Required, Foreign Key → `users.id` | - | Post author (teacher/admin) |
| `category` | String | Optional | `'general'` | Post category |
| `tags` | Array | String array | `[]` | Searchable keywords |
| `thumbnail` | String | Optional, URL format | `null` | Featured image (Cloudinary) |
| `publishedDate` | DateTime | ISO 8601 string | Auto | Publication timestamp |
| `status` | Enum | `draft` \| `published` | `draft` | Visibility status |
| `viewCount` | Number | Auto-incremented | `0` | Page views counter |
| `createdAt` | DateTime | ISO 8601 string | Auto | Post creation timestamp |
| `updatedAt` | DateTime | ISO 8601 string | Auto | Last modification timestamp |

**Table 5.15:** Blog collection provides content marketing and announcements. Markdown support enables rich formatting (Deugo, 2005).

**Source:** `server/models/Blog.js`

---

## Collections Summary Table

| Collection | Document Count (Typical) | Primary Use Case | References |
|------------|---------------------------|------------------|------------|
| `users` | 1,000+ | Authentication, RBAC | Sandhu et al. (1996) |
| `courses` | 100+ | Course catalog | Bates (2019) |
| `lessons` | 1,000+ | Learning content | Alessi & Trollip (2001) |
| `quizzes` | 200+ | Assessments | Black (2009) |
| `questions` | 2,000+ | Quiz questions | Myers et al. (2011) |
| `enrollments` | 5,000+ | Student-course links | Coates et al. (2005) |
| `user_progress` | 10,000+ | Analytics, gamification | Kapp (2012) |
| `grades` | 5,000+ | Assessment results | Crispin & Gregory (2009) |
| `certificates` | 500+ | Credentials | Brown & Adler (2008) |
| `payments` | 1,000+ | Stripe transactions | Stripe (2023) |
| `orders` | 1,000+ | Purchase records | Chargify (2019) |
| `subscriptions` | 300+ | Pro tier billing | Stripe (2023) |
| `study_groups` | 50+ | Community features | Siemens (2005) |
| `group_messages` | 2,000+ | Discussions | Google Cloud (2023) |
| `blog_posts` | 100+ | Content marketing | - |

**Total Collections:** 15
**Database Type:** Firebase Firestore (NoSQL Document Database)
**Average Document Size:** 2-5 KB
**Estimated Total Storage:** 50-100 MB (for 10,000 users)

---

## Schema Design Principles

### 1. Denormalization for Performance
Following Firebase best practices (Moroney, 2017), schemas favor denormalization:
- `studyPoints` stored in Progress, not User (optimizes leaderboard queries)
- `enrollmentCount` cached in Course (avoids count aggregations)
- User names embedded in certificates (prevents join operations)

### 2. Security-First Design
Security considerations per OWASP (2021):
- Passwords: bcrypt hashed, never returned in API responses
- Sensitive data: `resetPasswordCode` marked private in User model
- PCI compliance: Card data never stored; Stripe tokenization only

### 3. Scalability Patterns
Firestore optimization strategies (Google Cloud, 2023):
- Composite indexes for complex queries (userId + courseId)
- Batch operations for `findByIds()` methods (prevents N+1 queries)
- Timestamp-based pagination for large collections

### 4. Data Integrity
Referential integrity maintained via:
- Foreign key naming convention (`userId`, `courseId`)
- Cascade delete policies (deleting course removes lessons/quizzes)
- Unique constraints (email, certificateNumber, stripeSessionId)

---

## Citations

- Alessi, S.M. and Trollip, S.R. (2001) *Multimedia for Learning: Methods and Development*. 3rd edn. Boston: Allyn and Bacon.
- Bates, A.W. (2019) *Teaching in a Digital Age: Guidelines for Designing Teaching and Learning*. 2nd edn. Vancouver: Tony Bates Associates Ltd.
- Black, R. (2009) *Managing the Testing Process*. 3rd edn. Hoboken: Wiley.
- Brown, J.S. and Adler, R.P. (2008) 'Minds on fire: Open education, the long tail, and Learning 2.0', *EDUCAUSE Review*, 43(1), pp. 16-32.
- Chargify (2019) *SaaS Subscription Billing Best Practices*. Available at: https://www.chargify.com/resources/
- Coates, H., James, R. and Baldwin, G. (2005) 'A critical examination of the effects of learning management systems on university teaching and learning', *Tertiary Education and Management*, 11(1), pp. 19-36.
- Crispin, L. and Gregory, J. (2009) *Agile Testing: A Practical Guide for Testers and Agile Teams*. Upper Saddle River: Addison-Wesley.
- Deterding, S., Dixon, D., Khaled, R. and Nacke, L. (2011) 'From game design elements to gamefulness: Defining "gamification"', *Proceedings of the 15th International Academic MindTrek Conference*, pp. 9-15.
- Deugo, D. (2005) 'Examining MVC and PAC architectural patterns', in *Proceedings of the International Conference on Software Engineering Research and Practice*, pp. 154-160.
- Ferraiolo, D.F., Sandhu, R., Gavrila, S., Kuhn, D.R. and Chandramouli, R. (2003) 'Proposed NIST standard for role-based access control', *ACM Transactions on Information and System Security*, 4(3), pp. 224-274.
- Google Cloud (2023) *Firebase Documentation*. Available at: https://firebase.google.com/docs
- Kapp, K.M. (2012) *The Gamification of Learning and Instruction*. San Francisco: Pfeiffer.
- Moroney, L. (2017) *The Definitive Guide to Firebase: Build Android Apps on Google's Mobile Platform*. Berkeley: Apress.
- Myers, G.J., Sandler, C. and Badgett, T. (2011) *The Art of Software Testing*. 3rd edn. Hoboken: Wiley.
- OWASP (2021) *OWASP Top 10 - 2021: The Ten Most Critical Web Application Security Risks*. Available at: https://owasp.org/Top10/
- PCI SSC (2022) *Payment Card Industry Data Security Standard (PCI DSS) v4.0*. Wakefield: PCI Security Standards Council.
- Sandhu, R.S., Coyne, E.J., Feinstein, H.L. and Youman, C.E. (1996) 'Role-based access control models', *Computer*, 29(2), pp. 38-47.
- Siemens, G. (2005) 'Connectivism: A learning theory for the digital age', *International Journal of Instructional Technology and Distance Learning*, 2(1), pp. 3-10.
- Stripe (2023) *Stripe API Documentation*. Available at: https://stripe.com/docs/api
