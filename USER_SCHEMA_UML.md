# User Schema - UML Class Diagram

## Complete UML Class Diagram with Relationships

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        -String password
        +String role
        +String avatarUrl
        +String phone
        +String subscriptionTier
        +DateTime createdAt
        +DateTime updatedAt
        -String resetPasswordCode
        -DateTime resetPasswordExpires

        +findByEmail(email) User$
        +findById(id) User$
        +findAll(filters) User[]$
        +findByIds(userIds) User[]$
        +create(userData) User$
        +update(id, updateData) User$
        +delete(id) Boolean$
        +comparePassword(password) Boolean
        +saveResetCode(code, expiresAt) void
        +clearResetCode() void
        +isPro() Boolean
        +upgradeToProTier(id) User$
        +downgradeToFreeTier(id) User$
        +toJSON() Object
        +sanitize(userData) Object$
        +getPublicProfile(userId) Object$
        +isAdmin(userId) Boolean$
        +isTeacher(userId) Boolean$
        +isEducationalEmail(email) Boolean$
        +verifyAsStudent(userId, email) User$
    }

    class Course {
        +String id
        +String instructorId FK
        +String title
        +String description
        +Number price
        +String thumbnail
        +String category
        +String level
        +DateTime createdAt
    }

    class Enrollment {
        +String id
        +String userId FK
        +String courseId FK
        +DateTime enrollmentDate
        +String status
    }

    class Progress {
        +String id
        +String userId FK
        +String courseId FK
        +String lessonId FK
        +String[] completedLessons
        +Number completionPercentage
        +Number studyPoints
        +DateTime lastAccessedAt
        +DateTime createdAt
    }

    class Certificate {
        +String id
        +String userId FK
        +String courseId FK
        +String certificateNumber
        +DateTime issuedDate
        +String pdfUrl
    }

    class Grade {
        +String id
        +String userId FK
        +String quizId FK
        +Number score
        +Number totalPoints
        +Boolean passed
        +DateTime submittedAt
    }

    class Group {
        +String id
        +String name
        +String teacherId FK
        +String[] members
        +String description
        +DateTime createdAt
    }

    class Order {
        +String id
        +String userId FK
        +String courseId FK
        +Number amount
        +String paymentStatus
        +String stripeSessionId
        +DateTime createdAt
    }

    User "1" -- "0..*" Course : instructs >
    User "1" -- "0..*" Enrollment : enrolls in >
    User "1" -- "0..*" Progress : tracks >
    User "1" -- "0..*" Certificate : earns >
    User "1" -- "0..*" Grade : receives >
    User "1" -- "0..*" Group : creates/joins >
    User "1" -- "0..*" Order : places >

    Course "1" -- "0..*" Enrollment : has >
    Course "1" -- "0..*" Progress : tracked in >
    Course "1" -- "0..*" Certificate : awards >

    note for User "Roles: student | teacher | admin\nTiers: free | pro\nPassword: bcrypt 10 rounds\nEmail: unique constraint"
    note for Progress "studyPoints stored here\n100 points per course\n10 points per lesson"
```

---

## Simplified Diagram (User Entity Only)

```mermaid
classDiagram
    class User {
        <<Entity>>
        +String id PK
        +String name
        +String email UNIQUE
        -String password HASHED
        +String role ENUM
        +String avatarUrl URL
        +String phone NULLABLE
        +String subscriptionTier ENUM
        +DateTime createdAt
        +DateTime updatedAt
        -String resetPasswordCode NULLABLE
        -DateTime resetPasswordExpires NULLABLE
    }

    class UserMethods {
        <<Interface>>
        +findByEmail(email) User
        +findById(id) User
        +create(userData) User
        +update(id, data) User
        +delete(id) Boolean
        +comparePassword(pwd) Boolean
        +isPro() Boolean
        +toJSON() Object
    }

    User ..|> UserMethods : implements

    note for User "Security:\n- Password hashed with bcrypt (10 rounds)\n- resetPasswordCode expires in 15 minutes\n- avatarUrl validated by Cloudinary\n\nBusiness Rules:\n- .edu emails → auto Pro tier\n- Default role: student\n- Free tier: 3 course limit\n- Pro tier: unlimited courses"
```

---

## Entity-Relationship Diagram (Focus on User)

```mermaid
erDiagram
    USER ||--o{ ENROLLMENT : "enrolls in"
    USER ||--o{ PROGRESS : "tracks"
    USER ||--o{ CERTIFICATE : "earns"
    USER ||--o{ GRADE : "receives"
    USER ||--o{ ORDER : "places"
    USER ||--o{ COURSE : "instructs (teacher)"
    USER ||--o{ GROUP : "creates/joins"
    USER ||--o{ GROUP_MESSAGE : "posts"

    USER {
        string id PK "Firestore auto-generated"
        string name "2-100 chars"
        string email UK "Unique, email format"
        string password "Bcrypt hash"
        enum role "student|teacher|admin"
        string avatarUrl "Cloudinary CDN URL"
        string phone "E.164 format, optional"
        enum subscriptionTier "free|pro"
        datetime createdAt "ISO 8601"
        datetime updatedAt "ISO 8601"
        string resetPasswordCode "6 digits, nullable"
        datetime resetPasswordExpires "15min TTL"
    }

    ENROLLMENT {
        string id PK
        string userId FK
        string courseId FK
        datetime enrollmentDate
        enum status "active|completed|dropped"
    }

    PROGRESS {
        string id PK
        string userId FK
        string courseId FK
        array completedLessons
        number completionPercentage
        number studyPoints "Gamification points"
        datetime lastAccessedAt
    }

    CERTIFICATE {
        string id PK
        string userId FK
        string courseId FK
        string certificateNumber
        datetime issuedDate
        string pdfUrl
    }

    GRADE {
        string id PK
        string userId FK
        string quizId FK
        number score
        number totalPoints
        boolean passed
        datetime submittedAt
    }

    COURSE {
        string id PK
        string instructorId FK
        string title
        string description
        number price
        string category
    }

    ORDER {
        string id PK
        string userId FK
        string courseId FK
        number amount
        string paymentStatus
        string stripeSessionId
    }

    GROUP {
        string id PK
        string name
        string teacherId FK
        array members
        string description
    }

    GROUP_MESSAGE {
        string id PK
        string groupId FK
        string userId FK
        string message
        datetime timestamp
    }
```

---

## State Diagram (User Role Transitions)

```mermaid
stateDiagram-v2
    [*] --> Student : Default Registration

    Student --> Teacher : Admin Manual Promotion
    Student --> Admin : Super Admin Promotion

    Teacher --> Admin : Super Admin Promotion
    Teacher --> Student : Demotion

    Admin --> Teacher : Demotion
    Admin --> Student : Demotion

    note right of Student
        Default role
        Can enroll in courses
        Limited by subscription tier
    end note

    note right of Teacher
        Can create courses
        Can manage lessons/quizzes
        Access to teacher dashboard
    end note

    note right of Admin
        Full system access
        User management
        Course moderation
        Payment oversight
    end note
```

---

## Subscription Tier State Diagram

```mermaid
stateDiagram-v2
    [*] --> Free : Registration

    Free --> Pro : Stripe Payment
    Free --> Pro : .edu Email Verification

    Pro --> Free : Subscription Expired
    Pro --> Free : Payment Failed

    note right of Free
        3 course enrollment limit
        Basic features
        No certificate downloads
    end note

    note right of Pro
        Unlimited enrollments
        Premium features
        Certificate generation
        $9.99/month
    end note
```

---

## Package Diagram (User Model Structure)

```mermaid
graph TB
    subgraph "User Model Layer"
        A[User.js - Class Definition]
        B[CRUD Operations]
        C[Authentication Methods]
        D[Subscription Management]
        E[Security Utilities]
    end

    subgraph "Dependencies"
        F[firebase-admin/firestore]
        G[bcryptjs]
        H[authMiddleware.js]
    end

    subgraph "Related Models"
        I[Course.js]
        J[Enrollment.js]
        K[Progress.js]
        L[Certificate.js]
    end

    A --> B
    A --> C
    A --> D
    A --> E

    B --> F
    C --> G
    C --> H

    A -.-> I
    A -.-> J
    A -.-> K
    A -.-> L

    style A fill:#3b82f6,color:#fff
    style B fill:#10b981,color:#fff
    style C fill:#f59e0b,color:#fff
    style D fill:#8b5cf6,color:#fff
    style E fill:#ef4444,color:#fff
```

---

## Sequence Diagram: User Registration Flow

```mermaid
sequenceDiagram
    actor U as User
    participant C as Client
    participant S as Server
    participant UC as UserController
    participant UM as User Model
    participant FS as Firestore
    participant BC as Bcrypt

    U->>+C: Fill registration form
    C->>+S: POST /api/auth/register
    S->>+UC: register(req, res)
    UC->>UC: Validate input

    UC->>+UM: findByEmail(email)
    UM->>+FS: Query users collection
    FS-->>-UM: Empty result
    UM-->>-UC: null (email available)

    UC->>+UM: create(userData)
    UM->>+BC: hash(password, 10)
    BC-->>-UM: hashedPassword

    UM->>UM: Check if .edu email
    alt is .edu email
        UM->>UM: Set tier = 'pro'
    else regular email
        UM->>UM: Set tier = 'free'
    end

    UM->>+FS: Add document to users
    FS-->>-UM: Document ID
    UM-->>-UC: User object

    UC->>UC: Generate JWT token
    UC-->>-S: {user, token}
    S-->>-C: 201 Created
    C-->>-U: Redirect to dashboard
```

---

## Deployment Diagram: User Data Flow

```mermaid
graph LR
    subgraph "Client Layer"
        A[Browser]
        B[Mobile App]
    end

    subgraph "API Layer - Vercel"
        C[Express Server]
        D[User Controller]
        E[Auth Middleware]
    end

    subgraph "Business Logic"
        F[User Model]
        G[Bcrypt Service]
        H[JWT Service]
    end

    subgraph "Data Layer - Firebase"
        I[(Firestore: users)]
        J[Firebase Auth]
    end

    subgraph "External Services"
        K[Cloudinary - Avatars]
        L[Stripe - Subscriptions]
    end

    A --> C
    B --> C
    C --> E
    E --> D
    D --> F
    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
    D --> L

    style I fill:#f59e0b,stroke:#333,stroke-width:3px
    style F fill:#3b82f6,color:#fff
```

---

## Data Dictionary

### User Collection Fields

| Field | Type | Constraints | Default | Description | Source |
|-------|------|-------------|---------|-------------|--------|
| `id` | String | Auto-generated, PK | - | Firestore document ID | User.js:10 |
| `name` | String | Required, 2-100 chars | - | User's full name | User.js:11 |
| `email` | String | Required, Unique, Email format | - | Authentication identifier | User.js:12 |
| `password` | String | Required, Bcrypt hash | - | Hashed password (10 rounds) | User.js:13 |
| `role` | Enum | `student` \| `teacher` \| `admin` | `student` | RBAC role (Sandhu et al., 1996) | User.js:14 |
| `avatarUrl` | String | Optional, URL format | `null` | Cloudinary CDN profile picture | User.js:15 |
| `phone` | String | Optional, E.164 format | `null` | Contact number | User.js:16 |
| `subscriptionTier` | Enum | `free` \| `pro` | `free` | Subscription level | User.js:17 |
| `createdAt` | DateTime | ISO 8601 string | Auto | Account creation timestamp | User.js:18 |
| `updatedAt` | DateTime | ISO 8601 string | Auto | Last modification timestamp | User.js:19 |
| `resetPasswordCode` | String | Optional, 6-digit | `null` | Password reset code (15min TTL) | User.js:20 |
| `resetPasswordExpires` | DateTime | Optional | `null` | Reset code expiration time | User.js:21 |

---

## Citations for Diagram

**References:**
- Sandhu, R.S., Coyne, E.J., Feinstein, H.L. and Youman, C.E. (1996) 'Role-based access control models', *Computer*, 29(2), pp. 38-47.
- Ferraiolo, D.F., Sandhu, R., Gavrila, S., Kuhn, D.R. and Chandramouli, R. (2003) 'Proposed NIST standard for role-based access control', *ACM Transactions on Information and System Security*, 4(3), pp. 224-274.
- Google Cloud (2023) *Firebase Documentation*. Mountain View: Google LLC. Available at: https://firebase.google.com/docs
- OWASP (2021) *OWASP Top 10 - 2021: The Ten Most Critical Web Application Security Risks*. Available at: https://owasp.org/Top10/

---

## Usage in Dissertation

### Chapter 5 - System Design

**Section 5.3.2: User Collection Schema**

```markdown
The User collection implements Role-Based Access Control (RBAC) following the model proposed by Sandhu et al. (1996) and standardized by NIST (Ferraiolo et al., 2003). Figure 5.2 presents the complete class diagram showing attributes, methods, and relationships with dependent entities.

**[INSERT: UML Class Diagram - Complete version above]**

*Figure 5.2:* UML class diagram of User model showing RBAC roles (student, teacher, admin), subscription tiers (free, pro), and relationships with enrollment, progress, and certificate entities. Private fields marked with (-) indicate security-sensitive data.

**Security Implementation:**
As illustrated in Figure 5.2, passwords are stored as bcrypt hashes with 10 salt rounds, following OWASP (2021) recommendations for password storage. The `resetPasswordCode` field implements temporary verification codes with 15-minute expiration (Time-To-Live), preventing brute-force attacks on password reset flows.

**Business Logic:**
The User model implements automatic tier assignment: users registering with educational email domains (.edu, .ac.uk, .edu.vn) receive `pro` tier access automatically (User.js:119), while standard emails default to `free` tier with a 3-course enrollment limit.

**Relationships:**
The ERD (Figure 5.3) demonstrates one-to-many relationships between User and dependent collections:
- User → Enrollment (students enroll in multiple courses)
- User → Progress (tracks completion across multiple courses)
- User → Certificate (awards earned upon course completion)
- User → Course (teachers instruct multiple courses)

This denormalized schema optimizes for Firestore's document-based query model (Moniruzzaman & Hossain, 2013), avoiding expensive join operations common in relational databases.
```

---

## All Diagrams Ready for Copy-Paste

✅ **Complete UML Class Diagram** - Shows all methods and relationships
✅ **Simplified Entity Diagram** - Focus on User schema only
✅ **ERD Diagram** - Database relationships
✅ **State Diagrams** - Role transitions and subscription tiers
✅ **Sequence Diagram** - Registration flow
✅ **Package Diagram** - Code structure
✅ **Deployment Diagram** - Data flow architecture
✅ **Data Dictionary Table** - Field specifications with line references

All diagrams use Mermaid syntax and can be rendered directly in Markdown!
