# Mermaid Diagrams for CodeMaster-3 (UniLearn) Documentation

This file contains all Mermaid diagram code based on the ACTUAL implementation of the CodeMaster-3 project. Generate these diagrams using a Mermaid renderer (https://mermaid.live/) and insert the generated images into the main documentation.

---

## Diagram 1: Actual System Architecture
**Location:** Chapter 5.1 - System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Device]
    end

    subgraph "Presentation Layer - Views"
        EJS[EJS Templates]
        Partials[Partials: header/footer]
        Pages[Pages: index/dashboard/courses]
        CSS[Custom CSS + Dark Mode]
        ClientJS[Client JS: avatar-helper/darkmode/login]
    end

    subgraph "Application Layer - Express Server server.js"
        Routes[Routes]
        Controllers[Controllers]
        Middleware[Middleware]
        Models[Models]
        Services[Services]
    end

    subgraph "Routes Layer server/routes/"
        AuthRoutes[authRoutes.js]
        UserRoutes[userRoutes.js]
        CourseRoutes[courseRoutes.js]
        LessonRoutes[lessonRoutes.js]
        QuizRoutes[quizRoutes.js]
        QuestionRoutes[questionRoutes.js]
        GradeRoutes[gradeRoutes.js]
        PaymentRoutes[paymentRoutes.js]
        OrderRoutes[orderRoutes.js]
        CertificateRoutes[certificateRoutes.js]
        ProgressRoutes[progressRoutes.js]
        CommunityRoutes[communityRoutes.js]
        GroupRoutes[groupRoutes.js]
        BlogRoutes[blogRoutes.js]
        UploadRoutes[uploadRoutes.js]
    end

    subgraph "Controllers Layer server/controllers/"
        AuthController[authController.js]
        UserController[userController.js]
        CourseController[courseController.js]
        LessonController[lessonController.js]
        QuizController[quizController.js]
        QuestionController[questionController.js]
        GradeController[gradeController.js]
        PaymentController[paymentController.js]
        OrderController[orderController.js]
        CertificateController[certificateController.js]
        ProgressController[progressController.js]
        CommunityController[communityController.js]
        GroupController[groupController.js]
        BlogController[blogController.js]
        UploadController[uploadController.js]
    end

    subgraph "Middleware server/middleware/"
        AuthMiddleware[authMiddleware.js<br/>JWT Verification]
        SubscriptionMiddleware[subscriptionMiddleware.js]
    end

    subgraph "Models Layer server/models/"
        UserModel[User.js]
        CourseModel[Course.js]
        LessonModel[Lesson.js]
        QuizModel[Quiz.js]
        QuestionModel[Question.js]
        GradeModel[Grade.js]
        OrderModel[Order.js]
        PaymentModel[Payment.js]
        EnrollmentModel[Enrollment.js]
        CertificateModel[Certificate.js]
        ProgressModel[Progress.js]
        SubscriptionModel[Subscription.js]
        BlogModel[Blog.js]
        GroupModel[Group.js]
    end

    subgraph "External Services"
        GoogleOAuth[Google OAuth 2.0<br/>via Passport.js]
        Stripe[Stripe Payment API]
        Cloudinary[Cloudinary CDN<br/>Image/Video Upload]
        NodeMailer[NodeMailer<br/>Email Service]
    end

    subgraph "Data Layer"
        Firestore[(Firebase Firestore<br/>NoSQL Database)]
    end

    subgraph "Configuration server/config/"
        PassportConfig[passport.js]
        CloudinaryConfig[cloudinary.js]
    end

    Browser --> EJS
    Mobile --> EJS
    EJS --> Pages
    EJS --> Partials
    Pages --> ClientJS
    Pages --> CSS
    ClientJS --> Routes

    Routes --> AuthRoutes
    Routes --> UserRoutes
    Routes --> CourseRoutes
    Routes --> PaymentRoutes

    AuthRoutes --> AuthController
    UserRoutes --> UserController
    CourseRoutes --> CourseController
    PaymentRoutes --> PaymentController

    AuthController --> AuthMiddleware
    UserController --> AuthMiddleware
    CourseController --> SubscriptionMiddleware

    AuthController --> UserModel
    CourseController --> CourseModel
    PaymentController --> PaymentModel

    UserModel --> Firestore
    CourseModel --> Firestore
    PaymentModel --> Firestore

    PassportConfig --> GoogleOAuth
    CloudinaryConfig --> Cloudinary
    PaymentController --> Stripe
    AuthController --> NodeMailer

    style Firestore fill:#fff4e6
    style GoogleOAuth fill:#e8f5e9
    style Stripe fill:#f3e5f5
    style Cloudinary fill:#fce4ec
    style NodeMailer fill:#e1f5fe
```

---

## Diagram 2: Actual Database Schema (Firestore Collections)
**Location:** Chapter 5.2 - Database Design

```mermaid
erDiagram
    USERS ||--o{ ENROLLMENTS : has
    USERS ||--o{ ORDERS : creates
    USERS ||--o{ GRADES : receives
    USERS ||--o{ CERTIFICATES : earns
    USERS ||--o{ BLOG_POSTS : writes
    USERS ||--o{ GROUP_MEMBERS : joins
    USERS ||--o| SUBSCRIPTIONS : has

    COURSES ||--o{ LESSONS : contains
    COURSES ||--o{ QUIZZES : has
    COURSES ||--o{ ENROLLMENTS : enrollment
    COURSES ||--o{ ORDERS : purchased
    COURSES ||--o{ CERTIFICATES : issues

    LESSONS ||--o{ QUIZZES : includes
    LESSONS ||--o{ USER_PROGRESS : tracks

    QUIZZES ||--o{ QUESTIONS : contains
    QUIZZES ||--o{ GRADES : graded

    STUDY_GROUPS ||--o{ GROUP_MEMBERS : has
    STUDY_GROUPS ||--o{ GROUP_MESSAGES : contains

    USERS {
        string id PK
        string name
        string email UK
        string password
        string role
        string avatarUrl
        string phone
        string subscriptionTier
        string googleId
        timestamp createdAt
        timestamp updatedAt
        string resetPasswordCode
        timestamp resetPasswordExpires
    }

    COURSES {
        string id PK
        string title
        string description
        string instructor
        string instructorId FK
        string teacher_id FK
        number price
        string duration
        string level
        string category
        string thumbnail
        string imageUrl
        number rating
        number enrolledStudents
        boolean isPublished
        string status
        string rejectionReason
        string approvedBy
        timestamp approvedAt
        boolean locked
        timestamp createdAt
        timestamp updatedAt
    }

    LESSONS {
        string id PK
        string courseId FK
        string course_id FK
        string title
        string description
        string content
        string videoUrl
        string duration
        number order
        boolean isPublished
        array resources
        timestamp createdAt
        timestamp updatedAt
    }

    QUIZZES {
        string id PK
        string courseId FK
        string course_id FK
        string lessonId FK
        string lesson_id FK
        string title
        string description
        number duration
        number passingScore
        number passing_score
        number totalPoints
        number total_points
        boolean isPublished
        timestamp createdAt
        timestamp updatedAt
    }

    QUESTIONS {
        string id PK
        string quizId FK
        string quiz_id FK
        string questionText
        string question_text
        string questionType
        string question_type
        array options
        mixed correctAnswer
        mixed correct_answer
        number correctAnswerIndex
        number correct_answer_index
        number points
        string explanation
        number order
        timestamp createdAt
        timestamp updatedAt
    }

    GRADES {
        string id PK
        string user_id FK
        string quiz_id FK
        string course_id FK
        number score
        number totalQuestions
        number correctAnswers
        array answers
        number timeSpent
        timestamp createdAt
        timestamp updatedAt
    }

    ENROLLMENTS {
        string id PK
        string userId FK
        string user_id FK
        string courseId FK
        string course_id FK
        timestamp enrolledAt
        timestamp enrolled_at
        string status
        number progress
        boolean completed
        timestamp completedAt
    }

    USER_PROGRESS {
        string id PK
        string user_id FK
        string course_id FK
        string lesson_id FK
        string progress_type
        timestamp completed_at
        timestamp updated_at
    }

    ORDERS {
        string id PK
        string userId FK
        string user_id FK
        string courseId FK
        string course_id FK
        string courseName
        number price
        string status
        string paymentMethod
        string payment_method
        string paymentId FK
        string payment_id FK
        timestamp createdAt
        timestamp updatedAt
    }

    PAYMENTS {
        string id PK
        string orderId FK
        string userId FK
        number amount
        string currency
        string paymentMethod
        string paymentStatus
        string transactionId
        object paymentGatewayResponse
        timestamp createdAt
        timestamp updatedAt
    }

    CERTIFICATES {
        string id PK
        string userId FK
        string user_id FK
        string courseId FK
        string course_id FK
        string courseName
        string userName
        string userEmail
        timestamp completedAt
        timestamp issuedAt
        timestamp issued_at
        string certificateId UK
        boolean verified
        number grade
        timestamp revokedAt
    }

    SUBSCRIPTIONS {
        string id PK
        string name
        string description
        number monthlyPrice
        number monthly_price
        number annualPrice
        number annual_price
        array features
        number maxCourses
        number max_courses
        boolean isPopular
        boolean is_popular
        number order
        boolean active
        timestamp createdAt
        timestamp updatedAt
    }

    BLOG_POSTS {
        string id PK
        string title
        string content
        string excerpt
        string slug UK
        string featured_image
        string featuredImage
        array tags
        string status
        string author_id FK
        string authorId FK
        string author_name
        string authorName
        number view_count
        number viewCount
        number like_count
        number likeCount
        timestamp created_at
        timestamp updated_at
    }

    STUDY_GROUPS {
        string id PK
        string name
        string description
        string subject
        string teacher_id FK
        timestamp created_at
        timestamp updated_at
        number member_count
        string status
    }

    GROUP_MEMBERS {
        string id PK
        string group_id FK
        string user_id FK
        timestamp joined_at
        string role
    }

    GROUP_MESSAGES {
        string id PK
        string group_id FK
        string user_id FK
        string message_text
        timestamp created_at
    }

    NEWSLETTER_SUBSCRIBERS {
        string id PK
        string email UK
        boolean active
        timestamp subscribed_at
        timestamp subscribedAt
        timestamp unsubscribed_at
        timestamp unsubscribedAt
    }
```

---

## Diagram 3: Authentication Flow (Google OAuth + JWT)
**Location:** Chapter 2.4.1 - OAuth 2.0 Protocol & Chapter 5.5 - Security Architecture

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server as Express Server
    participant Passport as Passport.js
    participant Google as Google OAuth
    participant Firestore as Firebase Firestore

    Note over User,Firestore: Google OAuth Flow

    User->>Browser: Click "Sign in with Google"
    Browser->>Server: GET /api/auth/google
    Server->>Passport: Trigger Google Strategy
    Passport->>Google: Redirect with client_id & scopes
    Google->>User: Show Google consent screen
    User->>Google: Grant permissions
    Google->>Server: Redirect to /api/auth/google/callback<br/>with authorization code
    Server->>Passport: Handle callback
    Passport->>Google: Exchange code for access token
    Google->>Passport: Return access token + user profile
    Passport->>Firestore: Check if user exists by googleId

    alt User exists
        Firestore->>Passport: Return existing user
    else New user
        Passport->>Firestore: Create new user with googleId
        Firestore->>Passport: Return new user
    end

    Passport->>Server: User authenticated
    Server->>Server: Generate JWT token<br/>with user id, email, role
    Server->>Browser: Redirect to /auth-success?token=<JWT>
    Browser->>Browser: Store JWT in localStorage
    Browser->>User: Display "Login successful"
    User->>Browser: Navigate to dashboard
    Browser->>Server: GET /dashboard<br/>Header: Authorization: Bearer <JWT>
    Server->>Server: Verify JWT via authMiddleware
    Server->>Browser: Return dashboard data
    Browser->>User: Display dashboard

    Note over Server: JWT expires in 7 days
```

---

## Diagram 4: Email/Password Authentication Flow
**Location:** Chapter 5.5 - Security Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController as authController.js
    participant UserModel as User Model
    participant Firestore
    participant bcrypt
    participant jwt as JWT
    participant Email as NodeMailer

    Note over User,Email: Registration Flow

    User->>Frontend: Fill registration form
    Frontend->>AuthController: POST /api/auth/register<br/>{name, email, password, role}
    AuthController->>UserModel: User.findByEmail(email)
    UserModel->>Firestore: Query users collection

    alt Email exists
        Firestore->>UserModel: User found
        UserModel->>AuthController: Return existing user
        AuthController->>Frontend: 400: Email already registered
    else Email not found
        Firestore->>UserModel: No user found
        AuthController->>bcrypt: Hash password
        bcrypt->>AuthController: Return hashed password
        AuthController->>UserModel: User.create({...})
        UserModel->>Firestore: Create user document
        Firestore->>UserModel: User created
        UserModel->>AuthController: Return new user
        AuthController->>Email: Send welcome email
        Email->>User: Welcome email sent
        AuthController->>jwt: Generate JWT token
        jwt->>AuthController: Return signed token
        AuthController->>Frontend: 201: {token, user}
        Frontend->>Frontend: Store token in localStorage
        Frontend->>User: Show success message
    end

    Note over User,Email: Login Flow

    User->>Frontend: Fill login form
    Frontend->>AuthController: POST /api/auth/login<br/>{email, password}
    AuthController->>UserModel: User.findByEmail(email)
    UserModel->>Firestore: Query users collection

    alt User not found
        Firestore->>AuthController: No user
        AuthController->>Frontend: 401: Invalid credentials
    else User found
        Firestore->>UserModel: User data
        UserModel->>AuthController: Return user
        AuthController->>bcrypt: Compare password with hash

        alt Password incorrect
            bcrypt->>AuthController: Mismatch
            AuthController->>Frontend: 401: Invalid credentials
        else Password correct
            bcrypt->>AuthController: Match
            AuthController->>jwt: Generate JWT token
            jwt->>AuthController: Return signed token
            AuthController->>Frontend: 200: {token, user}
            Frontend->>Frontend: Store token in localStorage
            Frontend->>User: Redirect to dashboard
        end
    end

    Note over User,Email: Password Reset Flow

    User->>Frontend: Request password reset
    Frontend->>AuthController: POST /api/auth/forgot-password<br/>{email}
    AuthController->>UserModel: User.findByEmail(email)
    UserModel->>Firestore: Query users collection

    alt User found
        Firestore->>UserModel: User data
        AuthController->>AuthController: Generate 6-digit code
        AuthController->>UserModel: Update user with code & expiry (10 min)
        UserModel->>Firestore: Save reset code
        AuthController->>Email: Send reset code email
        Email->>User: Email with code
        AuthController->>Frontend: 200: Code sent

        User->>Frontend: Enter code & new password
        Frontend->>AuthController: POST /api/auth/reset-password<br/>{email, code, newPassword}
        AuthController->>UserModel: User.findByEmail(email)
        UserModel->>Firestore: Query users collection
        Firestore->>AuthController: User data

        alt Code valid & not expired
            AuthController->>bcrypt: Hash new password
            bcrypt->>AuthController: Hashed password
            AuthController->>UserModel: Update password, clear reset code
            UserModel->>Firestore: Save new password
            AuthController->>Frontend: 200: Password reset successful
            Frontend->>User: Show success, redirect to login
        else Code invalid/expired
            AuthController->>Frontend: 400: Invalid or expired code
        end
    end
```

---

## Diagram 5: Stripe Payment Integration Flow
**Location:** Chapter 2.5.1 - Stripe Payment Platform & Chapter 6.4 - Third-Party Integration

```mermaid
    sequenceDiagram
        participant Student
        participant Frontend
        participant PaymentController as paymentController.js
        participant Stripe as Stripe API
        participant OrderController as orderController.js
        participant OrderModel as Order Model
        participant PaymentModel as Payment Model
        participant Firestore
        participant UserModel as User Model

        Note over Student,Firestore: Checkout Session Creation

        Student->>Frontend: Click "Enroll Now" or "Subscribe"
        Frontend->>PaymentController: POST /api/payments/create-checkout-session<br/>{courseId or subscriptionId, userId}
        PaymentController->>PaymentController: Determine product type<br/>(course or subscription)
        PaymentController->>Stripe: stripe.checkout.sessions.create({<br/>  line_items: [{price, quantity}],<br/>  mode: 'payment' or 'subscription',<br/>  success_url,<br/>  cancel_url,<br/>  metadata: {courseId, userId}<br/>})
        Stripe->>PaymentController: Return session object {id, url}
        PaymentController->>Frontend: 200: {sessionId, url}
        Frontend->>Student: Redirect to Stripe Checkout
        Student->>Stripe: Enter payment details (card info)
        Stripe->>Stripe: Process payment

        alt Payment successful
            Stripe->>Student: Show success message
            Stripe->>Student: Redirect to success_url?session_id=xxx

            Student->>Frontend: GET /success?session_id=xxx
            Frontend->>PaymentController: POST /api/payments/verify-and-create-order<br/>{sessionId}
            PaymentController->>Stripe: stripe.checkout.sessions.retrieve(sessionId)
            Stripe->>PaymentController: Session data {payment_status, metadata, amount}

            alt Payment status = paid
                PaymentController->>PaymentController: Extract metadata (courseId, userId)
                PaymentController->>OrderModel: Order.create({<br/>  userId,<br/>  courseId,<br/>  price,<br/>  status: 'completed',<br/>  paymentMethod: 'stripe'<br/>})
                OrderModel->>Firestore: Create order document
                Firestore->>OrderModel: Order created

                PaymentController->>PaymentModel: Payment.create({<br/>  orderId,<br/>  userId,<br/>  amount,<br/>  paymentMethod: 'stripe',<br/>  paymentStatus: 'completed',<br/>  transactionId: session.id<br/>})
                PaymentModel->>Firestore: Create payment document
                Firestore->>PaymentModel: Payment created

                alt Is subscription purchase
                    PaymentController->>UserModel: Update user subscriptionTier to 'pro'
                    UserModel->>Firestore: Update user document
                end

                PaymentController->>Frontend: 200: {success, order, payment}
                Frontend->>Student: Show success page "Enrollment successful!"
                Student->>Frontend: Navigate to course
            else Payment status != paid
                PaymentController->>Frontend: 400: Payment not completed
                Frontend->>Student: Show error message
            end
        else Payment failed/cancelled
            Stripe->>Student: Show error/cancel message
            Stripe->>Student: Redirect to cancel_url
            Student->>Frontend: GET /cancel
            Frontend->>Student: Show "Payment cancelled" message
        end

        Note over PaymentController,Firestore: No PCI data stored<br/>All card processing by Stripe
```

---

## Diagram 6: Cloudinary Image Upload Flow
**Location:** Chapter 2.6.2 - Cloudinary CDN & Chapter 6.4 - Third-Party Integration

```mermaid
sequenceDiagram
    participant Teacher
    participant Frontend
    participant UploadController as uploadController.js
    participant Multer
    participant Cloudinary as Cloudinary API
    participant CourseController as courseController.js
    participant CourseModel as Course Model
    participant Firestore

    Note over Teacher,Firestore: Image Upload Flow

    Teacher->>Frontend: Select image file (course thumbnail)
    Frontend->>UploadController: POST /api/upload/image<br/>Form-data: {file}
    UploadController->>Multer: multer.single('file')
    Multer->>Multer: Parse multipart/form-data
    Multer->>UploadController: req.file (buffer)

    alt File exists
        UploadController->>Cloudinary: cloudinary.uploader.upload_stream({<br/>  folder: 'codemaster',<br/>  resource_type: 'auto'<br/>})
        Cloudinary->>Cloudinary: Store image on CDN
        Cloudinary->>Cloudinary: Generate optimized URL
        Cloudinary->>UploadController: Return {secure_url, public_id}
        UploadController->>Frontend: 200: {url: secure_url, publicId}
        Frontend->>Frontend: Store imageUrl in form state
        Frontend->>Teacher: Show image preview

        Teacher->>Frontend: Click "Save Course"
        Frontend->>CourseController: POST /api/courses<br/>{title, description, thumbnail: imageUrl}
        CourseController->>CourseModel: Course.create({...})
        CourseModel->>Firestore: Create course document with thumbnail URL
        Firestore->>CourseModel: Course created
        CourseController->>Frontend: 201: {course}
        Frontend->>Teacher: Show success message
    else No file
        UploadController->>Frontend: 400: No file uploaded
    end

    Note over Teacher,Firestore: Content Delivery

    Teacher->>Frontend: Navigate to course page
    Frontend->>Frontend: Render <img src="{cloudinary_url}" />
    Frontend->>Cloudinary: GET https://res.cloudinary.com/.../image.jpg
    Cloudinary->>Cloudinary: Serve from nearest CDN edge
    Cloudinary->>Frontend: Optimized image (auto-format, compression)
    Frontend->>Teacher: Display image
```

---

## Diagram 7: Course Enrollment & Progress Tracking Flow
**Location:** Chapter 4.3 - Use Cases and User Stories

```mermaid
flowchart TD
    Start([Student browses courses]) --> ViewCourse[Click on course card]
    ViewCourse --> CourseDetail[View course details page]
    CourseDetail --> CheckEnrolled{Already enrolled?}

    CheckEnrolled -->|Yes| GoToLearning[Redirect to My Learning]
    CheckEnrolled -->|No| CheckPrice{Is course free?}

    CheckPrice -->|Yes| EnrollFree[Click "Enroll for Free"]
    CheckPrice -->|No| CheckPurchased{Already purchased?}

    CheckPurchased -->|Yes| EnrollFree
    CheckPurchased -->|No| GoToCheckout[Click "Enroll Now"]

    GoToCheckout --> StripePayment[Stripe Checkout]
    StripePayment --> PaymentSuccess{Payment successful?}

    PaymentSuccess -->|No| CourseDetail
    PaymentSuccess -->|Yes| CreateOrder[Create Order & Payment records]

    CreateOrder --> CreateEnrollment[Create Enrollment record]
    EnrollFree --> CreateEnrollment

    CreateEnrollment --> MyLearning[Go to My Learning page]
    GoToLearning --> MyLearning

    MyLearning --> SelectCourse[Select enrolled course]
    SelectCourse --> LessonList[View lesson list]
    LessonList --> SelectLesson[Click on lesson]

    SelectLesson --> ViewLesson[View lesson content]
    ViewLesson --> WatchVideo{Has video?}

    WatchVideo -->|Yes| PlayVideo[Play video]
    WatchVideo -->|No| ReadContent[Read text content]

    PlayVideo --> CompleteLesson[Mark lesson as complete]
    ReadContent --> CompleteLesson

    CompleteLesson --> UpdateProgress[Update user_progress collection]
    UpdateProgress --> UpdateEnrollment[Update enrollment progress %]
    UpdateEnrollment --> HasQuiz{Lesson has quiz?}

    HasQuiz -->|Yes| TakeQuiz[Take quiz]
    HasQuiz -->|No| MoreLessons{More lessons?}

    TakeQuiz --> SubmitQuiz[Submit quiz answers]
    SubmitQuiz --> GradeQuiz[System grades quiz]
    GradeQuiz --> SaveGrade[Save grade to Firestore]
    SaveGrade --> CheckPassing{Score >= passing?}

    CheckPassing -->|No| ShowResults[Show results - Failed]
    CheckPassing -->|Yes| MarkPassed[Mark quiz as passed]

    MarkPassed --> ShowResults[Show results - Passed]
    ShowResults --> MoreLessons

    MoreLessons -->|Yes| LessonList
    MoreLessons -->|No| CheckComplete{All lessons + quizzes complete?}

    CheckComplete -->|No| LessonList
    CheckComplete -->|Yes| GenerateCert[Generate certificate]

    GenerateCert --> SaveCert[Save to certificates collection]
    SaveCert --> UpdateEnrollmentComplete[Mark enrollment as completed]
    UpdateEnrollmentComplete --> ShowCert[Display certificate]
    ShowCert --> End([Certificate awarded!])

    style Start fill:#e3f2fd
    style EnrollFree fill:#c8e6c9
    style StripePayment fill:#fff9c4
    style CompleteLesson fill:#b2dfdb
    style GenerateCert fill:#ce93d8
    style ShowCert fill:#ce93d8
    style End fill:#a5d6a7
```

---

## Diagram 8: Quiz Creation & Grading System
**Location:** Chapter 6.2 - Backend Implementation

```mermaid
flowchart TD
    Start([Teacher Dashboard]) --> SelectCourse[Select course]
    SelectCourse --> QuizMgmt[Go to Quiz Management]
    QuizMgmt --> CreateQuiz[Click "Create Quiz"]

    CreateQuiz --> QuizForm[Fill quiz details]
    QuizForm --> |Title, description, duration| SetPassing[Set passing score %]
    SetPassing --> SaveQuiz[Save quiz to Firestore]
    SaveQuiz --> AddQuestions[Add questions]

    AddQuestions --> QuestionForm[Create question form]
    QuestionForm --> EnterQuestion[Enter question text]
    EnterQuestion --> SelectType{Question type}

    SelectType --> MultipleChoice[Multiple Choice]
    MultipleChoice --> AddOptions[Add 4 options]
    AddOptions --> SelectCorrect[Select correct answer index]
    SelectCorrect --> SetPoints[Set points for question]
    SetPoints --> AddExplanation[Add explanation optional]
    AddExplanation --> SaveQuestion[Save to questions collection]

    SaveQuestion --> MoreQuestions{Add more questions?}
    MoreQuestions -->|Yes| QuestionForm
    MoreQuestions -->|No| CalcTotal[Calculate totalPoints]
    CalcTotal --> UpdateQuiz[Update quiz totalPoints]
    UpdateQuiz --> PublishQuiz[Publish quiz]
    PublishQuiz --> TeacherEnd([Quiz ready!])

    %% Student Taking Quiz

    StudentStart([Student in lesson]) --> ViewQuiz[See quiz available]
    ViewQuiz --> StartQuiz[Click "Start Quiz"]
    StartQuiz --> LoadQuestions[Load all questions from Firestore]
    LoadQuestions --> DisplayQ[Display question by question]

    DisplayQ --> StudentAnswer[Student selects answer]
    StudentAnswer --> NextQ{More questions?}
    NextQ -->|Yes| DisplayQ
    NextQ -->|No| SubmitAnswers[Submit all answers]

    SubmitAnswers --> GradeController[gradeController.js]
    GradeController --> FetchQuiz[Fetch quiz data]
    FetchQuiz --> FetchQuestions[Fetch all questions]
    FetchQuestions --> InitScore[Initialize score = 0]

    InitScore --> LoopQuestions[Loop through questions]
    LoopQuestions --> CompareAnswer{Student answer = correct answer?}

    CompareAnswer -->|Yes| AddPoints[score += question.points]
    CompareAnswer -->|No| NoPoints[No points added]

    AddPoints --> NextQuestion{More questions?}
    NoPoints --> NextQuestion

    NextQuestion -->|Yes| LoopQuestions
    NextQuestion -->|No| CalcPercentage[percentage = score / totalPoints * 100]

    CalcPercentage --> CheckPass{percentage >= passingScore?}

    CheckPass -->|Yes| StatusPassed[status = 'passed']
    CheckPass -->|No| StatusFailed[status = 'failed']

    StatusPassed --> UpdateProgress[Update lesson progress]
    StatusFailed --> NoProgressUpdate[No progress update]

    UpdateProgress --> SaveGrade[Save grade record to Firestore]
    NoProgressUpdate --> SaveGrade

    SaveGrade --> CheckAllComplete{All course lessons complete?}

    CheckAllComplete -->|Yes| TriggerCert[Trigger certificate generation]
    CheckAllComplete -->|No| ShowResult[Show quiz results]

    TriggerCert --> ShowResult
    ShowResult --> StudentEnd([Student sees score & feedback])

    style CreateQuiz fill:#bbdefb
    style SaveQuiz fill:#c5e1a5
    style PublishQuiz fill:#a5d6a7
    style StartQuiz fill:#fff9c4
    style StatusPassed fill:#c8e6c9
    style StatusFailed fill:#ffcdd2
    style TriggerCert fill:#ce93d8
```

---

## Diagram 9: API Route Structure (Actual Routes)
**Location:** Chapter 5.3 - API Design

```mermaid
graph TB
    subgraph "Authentication API /api/auth"
        A1[POST /register]
        A2[POST /login]
        A3[POST /forgot-password]
        A4[POST /reset-password]
        A5[GET /google]
        A6[GET /google/callback]
    end

    subgraph "User API /api/users"
        U1[GET /]
        U2[GET /:id]
        U3[PUT /:id]
        U4[DELETE /:id]
    end

    subgraph "Course API /api/courses"
        C1[GET /]
        C2[GET /:id]
        C3[POST /]
        C4[PUT /:id]
        C5[DELETE /:id]
        C6[GET /teacher/:teacherId]
    end

    subgraph "Lesson API /api/lessons"
        L1[GET /]
        L2[GET /:id]
        L3[POST /]
        L4[PUT /:id]
        L5[DELETE /:id]
        L6[GET /course/:courseId]
    end

    subgraph "Quiz API /api/quizzes"
        Q1[GET /]
        Q2[GET /:id]
        Q3[POST /]
        Q4[PUT /:id]
        Q5[DELETE /:id]
        Q6[GET /course/:courseId]
        Q7[GET /lesson/:lessonId]
    end

    subgraph "Question API /api/questions"
        QU1[GET /]
        QU2[GET /:id]
        QU3[POST /]
        QU4[PUT /:id]
        QU5[DELETE /:id]
        QU6[GET /quiz/:quizId]
    end

    subgraph "Grade API /api/grades"
        G1[GET /]
        G2[GET /:id]
        G3[POST /]
        G4[GET /user/:userId]
        G5[GET /quiz/:quizId/user/:userId]
    end

    subgraph "Payment API /api/payments"
        P1[POST /create-checkout-session]
        P2[POST /verify-and-create-order]
        P3[GET /]
        P4[GET /:id]
    end

    subgraph "Order API /api/orders"
        O1[GET /]
        O2[GET /:id]
        O3[POST /]
        O4[GET /user/:userId]
    end

    subgraph "Certificate API /api/certificates"
        CE1[GET /]
        CE2[POST /generate]
        CE3[GET /:id]
        CE4[GET /verify/:certificateId]
        CE5[GET /user/:userId]
        CE6[GET /course/:courseId/user/:userId]
    end

    subgraph "Progress API /api/progress"
        PR1[GET /user/:userId]
        PR2[POST /lesson]
        PR3[GET /course/:courseId]
        PR4[GET /course/:courseId/user/:userId]
    end

    subgraph "Community API /api/community"
        CO1[GET /groups]
        CO2[POST /groups]
        CO3[GET /groups/:id]
        CO4[POST /groups/:id/join]
        CO5[GET /groups/:id/messages]
        CO6[POST /groups/:id/messages]
    end

    subgraph "Blog API /api/blog"
        B1[GET /]
        B2[GET /:id]
        B3[POST /]
        B4[PUT /:id]
        B5[DELETE /:id]
    end

    subgraph "Upload API /api/upload"
        UP1[POST /image]
        UP2[POST /video]
    end

    subgraph "Middleware Protection"
        AuthMW[authMiddleware.js<br/>JWT Verification]
        SubMW[subscriptionMiddleware.js<br/>Check Pro/Free tier]
    end

    AuthMW -.->|Protects| U1
    AuthMW -.->|Protects| C3
    AuthMW -.->|Protects| L3
    AuthMW -.->|Protects| Q3
    AuthMW -.->|Protects| G3
    AuthMW -.->|Protects| P1
    AuthMW -.->|Protects| CE2
    AuthMW -.->|Protects| PR2

    SubMW -.->|Checks tier| C2
    SubMW -.->|Checks tier| L2

    style AuthMW fill:#ffcdd2
    style SubMW fill:#f8bbd0
```

---

## Diagram 10: Security Architecture (Actual Implementation)
**Location:** Chapter 5.5 - Security Architecture

```mermaid
graph TB
    subgraph "Layer 1: Network Security"
        HTTPS[HTTPS/TLS]
        CORS[CORS Policy]
        Helmet[Helmet.js Headers]
    end

    subgraph "Layer 2: Authentication"
        JWT[JWT Tokens<br/>Expires: 7 days]
        OAuth[Google OAuth 2.0<br/>via Passport.js]
        Bcrypt[Bcrypt Password Hashing<br/>Salt rounds: 10]
    end

    subgraph "Layer 3: Authorization"
        AuthMiddleware[authMiddleware.js<br/>Verify JWT from header]
        SubscriptionMiddleware[subscriptionMiddleware.js<br/>Check user.subscriptionTier]
        RoleCheck[Role checking in controllers<br/>student/teacher/admin]
    end

    subgraph "Layer 4: Input Validation"
        ExpressValidator[Express-validator<br/>Request body validation]
        EmailValidator[Email format validation]
        FileValidation[File upload validation<br/>multer limits]
    end

    subgraph "Layer 5: Data Security"
        FirestoreRules[Firestore Security Rules<br/>Server-side only access]
        EnvVars[Environment Variables<br/>.env file]
        ServiceAccount[Firebase Service Account<br/>serviceAccountKey.json]
    end

    subgraph "Layer 6: Payment Security"
        StripeSecure[Stripe Checkout<br/>PCI DSS Compliant]
        NoCardStorage[No card data stored<br/>Only transaction IDs]
        WebhookVerify[Webhook signature verification]
    end

    subgraph "Layer 7: Session Management"
        HTTPOnly[HTTP-only cookies for session]
        TokenStorage[JWT in localStorage<br/>Client-side]
        TokenExpiry[Token expiration handling]
    end

    subgraph "Layer 8: Third-Party Security"
        CloudinarySecure[Cloudinary API keys<br/>Environment variables]
        GoogleSecure[Google OAuth credentials<br/>Environment variables]
        EmailSecure[Email SMTP credentials<br/>App-specific password]
    end

    HTTPS --> JWT
    JWT --> AuthMiddleware
    OAuth --> AuthMiddleware
    Bcrypt --> JWT
    AuthMiddleware --> ExpressValidator
    SubscriptionMiddleware --> RoleCheck
    ExpressValidator --> FirestoreRules
    FirestoreRules --> StripeSecure
    StripeSecure --> HTTPOnly
    EnvVars -.->|Secures| CloudinarySecure
    EnvVars -.->|Secures| GoogleSecure
    EnvVars -.->|Secures| EmailSecure

    style JWT fill:#c8e6c9
    style AuthMiddleware fill:#fff9c4
    style Bcrypt fill:#ce93d8
    style StripeSecure fill:#f8bbd0
    style FirestoreRules fill:#ffccbc
```

---

## Diagram 11: Subscription Tier System
**Location:** Chapter 2.5.3 - Subscription Billing Model

```mermaid
flowchart TB
    Start([New User Registration]) --> DefaultFree[Assign subscriptionTier = 'free']
    DefaultFree --> CheckEmail{Email domain?}

    CheckEmail -->|.edu/.ac.uk/.edu.vn| AutoPro[Auto-upgrade to 'pro']
    CheckEmail -->|Other| StayFree[Remain 'free']

    AutoPro --> Dashboard
    StayFree --> Dashboard[User Dashboard]

    Dashboard --> BrowseCourses[Browse courses]
    BrowseCourses --> SelectCourse[Select a course]
    SelectCourse --> CheckLocked{Course.locked == true?}

    CheckLocked -->|No - Free course| AllowEnroll[Allow enrollment]
    CheckLocked -->|Yes - Pro only| CheckUserTier{user.subscriptionTier?}

    CheckUserTier -->|'pro'| AllowEnroll
    CheckUserTier -->|'free'| BlockAccess[Block access]

    BlockAccess --> ShowUpgrade[Show "Upgrade to Pro" button]
    ShowUpgrade --> UserDecides{User clicks upgrade?}

    UserDecides -->|No| Dashboard
    UserDecides -->|Yes| StripeCheckout[Redirect to Stripe]

    StripeCheckout --> PaymentSuccess{Payment successful?}

    PaymentSuccess -->|No| Dashboard
    PaymentSuccess -->|Yes| UpdateUserTier[Update user.subscriptionTier = 'pro']

    UpdateUserTier --> CreateSubscriptionRecord[Create subscription record in Firestore]
    CreateSubscriptionRecord --> AllowEnroll

    AllowEnroll --> CreateEnrollment[Create enrollment]
    CreateEnrollment --> AccessCourse[Access course content]
    AccessCourse --> End([Learning!])

    style DefaultFree fill:#e0e0e0
    style AutoPro fill:#bbdefb
    style AllowEnroll fill:#c8e6c9
    style BlockAccess fill:#ffcdd2
    style UpdateUserTier fill:#ce93d8
    style AccessCourse fill:#a5d6a7
```

---

## Diagram 12: Teacher Course Management Workflow
**Location:** Chapter 4.3 - Use Cases and User Stories

```mermaid
stateDiagram-v2
    [*] --> TeacherDashboard
    TeacherDashboard --> CreateCourse: Click "Create Course"

    CreateCourse --> FillDetails: Enter title, description, etc.
    FillDetails --> UploadThumbnail: Upload via Cloudinary API
    UploadThumbnail --> SaveDraft: Save as draft (status: 'draft')
    SaveDraft --> AddLessons: Add lessons

    AddLessons --> CreateLesson: Fill lesson form
    CreateLesson --> UploadVideo: Upload video (optional)
    UploadVideo --> CreateQuiz: Create quiz for lesson
    CreateQuiz --> AddQuestions: Add questions to quiz
    AddQuestions --> MoreLessons: More lessons?

    MoreLessons --> AddLessons: Yes
    MoreLessons --> ReviewCourse: No

    ReviewCourse --> PublishCourse: Click "Publish"
    PublishCourse --> PendingApproval: status = 'pending'

    PendingApproval --> AdminReview: Admin reviews course
    AdminReview --> Approved: Admin approves
    AdminReview --> Rejected: Admin rejects

    Approved --> Published: status = 'approved'<br/>isPublished = true
    Rejected --> SaveDraft: status = 'rejected'<br/>rejectionReason set

    SaveDraft --> EditCourse: Teacher edits
    EditCourse --> SaveDraft: Save changes
    EditCourse --> ReviewCourse: Re-submit

    Published --> ViewAnalytics: View student progress
    ViewAnalytics --> Published

    Published --> EditPublished: Edit course
    EditPublished --> Published: Update

    Published --> UnpublishCourse: Unpublish
    UnpublishCourse --> SaveDraft

    Published --> DeleteCourse: Delete
    DeleteCourse --> [*]

    note right of PendingApproval
        Courses must be approved
        by admin before students
        can enroll
    end note

    note right of Published
        Students can enroll
        and access content
    end note
```

---

## Diagram 13: Deployment Pipeline (Vercel)
**Location:** Chapter 6.5 - Deployment Process

```mermaid
flowchart LR
    subgraph "Development"
        Code[Write Code<br/>VS Code]
        LocalTest[Local Testing<br/>npm run dev]
        Git[Git Commit]
    end

    subgraph "Version Control"
        GitHub[GitHub Repository<br/>github.com/givhvy/FINAL-PROJECT]
        Push[Git Push]
    end

    subgraph "CI/CD - Vercel"
        Webhook[GitHub Webhook]
        AutoDeploy[Vercel Auto-Deploy]
        BuildProcess[Build Process<br/>npm install<br/>npm run build]
        EnvSetup[Environment Variables<br/>JWT_SECRET, Stripe keys, etc.]
    end

    subgraph "Deployment"
        Preview[Preview Deployment<br/>Unique URL per commit]
        Production[Production Deployment<br/>x.huy.global]
    end

    subgraph "Services"
        Firebase[Firebase Firestore<br/>Database]
        Stripe[Stripe API<br/>Payments]
        Cloudinary[Cloudinary<br/>Media CDN]
        Gmail[Gmail SMTP<br/>Emails]
    end

    subgraph "Monitoring"
        VercelAnalytics[Vercel Analytics]
        Logs[Application Logs]
        Errors[Error Tracking]
    end

    Code --> LocalTest
    LocalTest --> Git
    Git --> GitHub
    GitHub --> Push
    Push --> Webhook
    Webhook --> AutoDeploy
    AutoDeploy --> BuildProcess
    BuildProcess --> EnvSetup
    EnvSetup --> Preview
    Preview -->|Merge to main| Production

    Production --> Firebase
    Production --> Stripe
    Production --> Cloudinary
    Production --> Gmail

    Production --> VercelAnalytics
    Production --> Logs
    Production --> Errors

    style Production fill:#4caf50
    style Preview fill:#ffa726
    style BuildProcess fill:#42a5f5
    style Firebase fill:#ffca28
    style Stripe fill:#9c27b0
    style Cloudinary fill:#f44336
```

---

## Chart 1: Technology Stack Distribution
**Location:** Chapter 6.1 - Development Environment

```mermaid
pie title Technology Stack Distribution
    "Backend (Node.js/Express)" : 40
    "Frontend (EJS Views)" : 25
    "Database (Firestore)" : 15
    "External APIs (Stripe/Cloudinary/OAuth)" : 12
    "Deployment & DevOps" : 8
```

---

## Chart 2: API Endpoints by Category
**Location:** Chapter 5.3 - API Design

```mermaid
pie title API Endpoints by Category (75 total endpoints)
    "Course Management" : 18
    "User & Auth" : 12
    "Quiz & Questions" : 14
    "Payments & Orders" : 8
    "Progress & Certificates" : 11
    "Community & Blog" : 8
    "Upload & Media" : 4
```

---

## Chart 3: Firestore Collections
**Location:** Chapter 5.2 - Database Design

```mermaid
pie title Firestore Collections (17 total)
    "Core (Users/Courses/Lessons)" : 3
    "Assessment (Quizzes/Questions/Grades)" : 3
    "Commerce (Orders/Payments/Subscriptions)" : 3
    "Progress (Enrollments/Progress/Certificates)" : 3
    "Community (Groups/Messages/Blog/Newsletter)" : 5
```

---

## Diagram 14: User Journey Map - Student
**Location:** Chapter 4.3 - Use Cases and User Stories

```mermaid
journey
    title Student Learning Journey on CodeMaster-3
    section Discovery
        Visit homepage: 5: Student
        Browse course catalog: 5: Student
        Search by category/level: 4: Student
        Read course details: 5: Student
        Check if Pro required: 3: Student
    section Registration
        Click Sign in with Google: 5: Student
        Authorize Google OAuth: 5: Student
        Select role Student: 5: Student
        Redirect to dashboard: 5: Student
    section Enrollment
        Find desired course: 4: Student
        Click Enroll Now: 5: Student
        Pay via Stripe if paid: 3: Student
        Enrollment successful: 5: Student
    section Learning
        Go to My Learning: 5: Student
        Select course: 5: Student
        Watch video lesson: 5: Student
        Read lesson content: 4: Student
        Mark lesson complete: 5: Student
    section Assessment
        Start lesson quiz: 4: Student
        Answer questions: 3: Student
        Submit quiz: 4: Student
        View results: 4: Student
        Retry if failed: 2: Student
    section Completion
        Complete all lessons: 5: Student
        Pass all quizzes: 4: Student
        Certificate auto-generated: 5: Student
        Download certificate: 5: Student
        Share achievement: 5: Student
    section Community
        Join study group: 4: Student
        Read blog posts: 4: Student
        Participate in forum: 3: Student
```

---

## Diagram 15: Error Handling & Logging
**Location:** Chapter 6.2 - Backend Implementation

```mermaid
flowchart TD
    Request[Client Request] --> TryCatch[Try-Catch Block in Controller]
    TryCatch --> Success{Execution successful?}

    Success -->|Yes| SuccessResponse[Return success response<br/>res.status(200/201).json]
    SuccessResponse --> LogSuccess[Log success info optional]
    LogSuccess --> ClientSuccess[Client receives data]

    Success -->|No| CatchBlock[Catch block triggered]
    CatchBlock --> ErrorType{Error type?}

    ErrorType -->|Validation Error| ValidationHandler[Return 400 Bad Request<br/>with validation details]
    ErrorType -->|Auth Error| AuthHandler[Return 401 Unauthorized<br/>or 403 Forbidden]
    ErrorType -->|Not Found| NotFoundHandler[Return 404 Not Found]
    ErrorType -->|Firestore Error| FirestoreHandler[Return 500 Internal Server Error]
    ErrorType -->|Stripe Error| StripeHandler[Return 402 Payment Required<br/>or 500]
    ErrorType -->|Unknown Error| GenericHandler[Return 500 Internal Server Error]

    ValidationHandler --> LogError[Console.error logging]
    AuthHandler --> LogError
    NotFoundHandler --> LogError
    FirestoreHandler --> LogError
    StripeHandler --> LogError
    GenericHandler --> LogError

    LogError --> ErrorDetails[Log: timestamp, userId, endpoint, error stack]
    ErrorDetails --> SafeResponse[Return user-friendly error message<br/>No sensitive data exposed]
    SafeResponse --> ClientError[Client receives error]

    ClientError --> UserNotification[Display error to user]
    UserNotification --> UserAction{User action?}

    UserAction -->|Retry| Request
    UserAction -->|Cancel| End([End])
    ClientSuccess --> End

    style SuccessResponse fill:#c8e6c9
    style ValidationHandler fill:#ffcc80
    style AuthHandler fill:#ef9a9a
    style NotFoundHandler fill:#ce93d8
    style FirestoreHandler fill:#ffab91
    style StripeHandler fill:#f48fb1
    style GenericHandler fill:#e57373
```

---

## Diagram 16: File Structure Tree
**Location:** Chapter 6.1 - Development Environment

```mermaid
graph TB
    Root[Codemaster-3/]

    Root --> Server[server/]
    Root --> Views[views/]
    Root --> Public[public/]
    Root --> Config[Config Files]

    Server --> ServerConfig[config/]
    Server --> Controllers[controllers/]
    Server --> Middleware[middleware/]
    Server --> Models[models/]
    Server --> Routes[routes/]
    Server --> Services[services/]
    Server --> Utils[utils/]

    ServerConfig --> Passport[passport.js]
    ServerConfig --> CloudinaryConf[cloudinary.js]

    Controllers --> AuthC[authController.js]
    Controllers --> UserC[userController.js]
    Controllers --> CourseC[courseController.js]
    Controllers --> PaymentC[paymentController.js]
    Controllers --> OtherC[... 11 more controllers]

    Middleware --> AuthM[authMiddleware.js]
    Middleware --> SubM[subscriptionMiddleware.js]

    Models --> UserM[User.js]
    Models --> CourseM[Course.js]
    Models --> QuizM[Quiz.js]
    Models --> OtherM[... 14 more models]

    Routes --> AuthR[authRoutes.js]
    Routes --> UserR[userRoutes.js]
    Routes --> CourseR[courseRoutes.js]
    Routes --> OtherR[... 12 more routes]

    Services --> Email[emailService.js]

    Utils --> EmailVal[emailValidator.js]
    Utils --> FirebaseH[firebaseHelpers.js]
    Utils --> CertGen[generateMissingCertificates.js]

    Views --> Layouts[layouts/]
    Views --> Partials[partials/]
    Views --> Pages[pages/]

    Layouts --> MainLayout[main.ejs]

    Partials --> Head[head.ejs]
    Partials --> Header[header.ejs]
    Partials --> Footer[footer.ejs]
    Partials --> LoginModals[login-modals.ejs]

    Pages --> Index[index.ejs]
    Pages --> Login[login.ejs]
    Pages --> Dashboard[*-dashboard.ejs]
    Pages --> Courses[courses.ejs]
    Pages --> OtherPages[... 10 more pages]

    Public --> CSS[css/]
    Public --> Images[images/]
    Public --> JS[js/]

    CSS --> DarkMode[darkmode-improved.css]

    JS --> AvatarHelper[avatar-helper.js]
    JS --> DarkModeJS[darkmode.js]
    JS --> LoginJS[login.js]

    Config --> ServerJS[server.js]
    Config --> Package[package.json]
    Config --> Env[.env]
    Config --> ServiceAccount[serviceAccountKey.json]

    style Root fill:#e3f2fd
    style Server fill:#fff9c4
    style Views fill:#c8e6c9
    style Public fill:#f8bbd0
    style Config fill:#ce93d8
```

---

## Instructions for Using These Diagrams

### Step 1: Generate Diagram Images
1. Go to https://mermaid.live/
2. Copy each mermaid code block (including ```mermaid and ```)
3. Paste into the editor
4. Click "Download PNG" or "Download SVG"
5. Save with naming convention: `diagram-01-system-architecture.png`, `diagram-02-database-erd.png`, etc.

### Step 2: Create Images Folder
Create folder structure:
```
F:\FINALPROJECT\Codemaster-3\images\
├── diagrams/
├── screenshots/
└── charts/
```

### Step 3: Place Diagram Images
Save generated diagrams to `F:\FINALPROJECT\Codemaster-3\images\diagrams\`

### Diagram Placement in Document:

1. **Diagram 1** (System Architecture) → Chapter 5.1, after line ~957
2. **Diagram 2** (Database ERD) → Chapter 5.2, after line ~1001
3. **Diagram 3** (OAuth Flow) → Chapter 2.4.1, line ~427
4. **Diagram 4** (Email Auth Flow) → Chapter 5.5, line ~1409
5. **Diagram 5** (Stripe Payment Flow) → Chapter 2.5.1, line ~460 & Chapter 6.4, line ~1735
6. **Diagram 6** (Cloudinary Upload) → Chapter 2.6.2, line ~487 & Chapter 6.4, line ~1813
7. **Diagram 7** (Enrollment & Progress) → Chapter 4.3, line ~650
8. **Diagram 8** (Quiz System) → Chapter 6.2, line ~1521
9. **Diagram 9** (API Routes) → Chapter 5.3, line ~1127
10. **Diagram 10** (Security Layers) → Chapter 5.5, line ~1409
11. **Diagram 11** (Subscription Tiers) → Chapter 2.5.3, line ~475
12. **Diagram 12** (Teacher Workflow) → Chapter 4.3, line ~650
13. **Diagram 13** (Deployment Pipeline) → Chapter 6.5, line ~1849
14. **Chart 1** (Tech Stack) → Chapter 6.1, line ~1511
15. **Chart 2** (API Distribution) → Chapter 5.3, line ~1127
16. **Chart 3** (Collections) → Chapter 5.2, line ~1001
17. **Diagram 14** (User Journey) → Chapter 4.3, line ~650
18. **Diagram 15** (Error Handling) → Chapter 6.2, line ~1521
19. **Diagram 16** (File Structure) → Chapter 6.1, line ~1511

---

**Note**: All diagrams are based on the ACTUAL CodeMaster-3 implementation found in F:\FINALPROJECT\Codemaster-3\
