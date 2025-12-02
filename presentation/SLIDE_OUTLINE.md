# 🎓 UniLearn - Presentation Outline (10 phút)

## Slide 1: Giới thiệu (30 giây)
### UniLearn - Nền tảng học trực tuyến
- **Tên dự án**: UniLearn
- **Công nghệ**: Node.js + Express + Firebase Firestore + EJS
- **Mục tiêu**: Xây dựng hệ thống LMS (Learning Management System) hoàn chỉnh

---

## Slide 2: Vấn đề & Giải pháp (1 phút)

### Vấn đề:
- Học sinh cần nền tảng học trực tuyến linh hoạt
- Giáo viên cần công cụ quản lý khóa học dễ dàng
- Admin cần quản lý toàn bộ hệ thống

### Giải pháp UniLearn:
- ✅ Hệ thống đa vai trò (Student, Teacher, Admin)
- ✅ Quản lý khóa học, bài học, quiz
- ✅ Theo dõi tiến độ học tập
- ✅ Cấp chứng chỉ hoàn thành

---

## Slide 3: Kiến trúc hệ thống (1.5 phút)

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (EJS + TailwindCSS)           │
├─────────────────────────────────────────────────────────────┤
│                      BACKEND (Node.js + Express)            │
├─────────────────────────────────────────────────────────────┤
│  Routes → Controllers → Models → Firebase Firestore (NoSQL) │
├─────────────────────────────────────────────────────────────┤
│           External Services: Cloudinary, Stripe             │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack:
| Layer | Technology |
|-------|------------|
| Frontend | EJS, TailwindCSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore (NoSQL) |
| Auth | JWT + Google OAuth 2.0 |
| Storage | Cloudinary (images), Local (videos) |
| Payment | Stripe |

---

## Slide 4: Cấu trúc thư mục (1 phút)

```
UniLearn/
├── server.js              # Entry point
├── public/                # Static files (JS, CSS, images)
│   └── js/pages/          # Frontend logic
├── views/                 # EJS templates
│   ├── pages/             # Main pages
│   └── partials/          # Header, footer
├── server/
│   ├── controllers/       # Business logic (16 controllers)
│   ├── models/            # Data models (15 models)
│   ├── routes/            # API endpoints (15 route files)
│   ├── middleware/        # Auth, subscription checks
│   └── services/          # Email service
└── uploads/               # Local file storage
```

---

## Slide 5: Các chức năng chính (2 phút)

### 👨‍🎓 Student Features:
- Đăng ký/Đăng nhập (Email + Google OAuth)
- Xem và ghi danh khóa học
- Học bài, xem video
- Làm quiz và xem điểm
- Theo dõi tiến độ
- Nhận chứng chỉ khi hoàn thành

### 👨‍🏫 Teacher Features:
- Tạo và quản lý khóa học
- Upload bài học (video, text)
- Tạo quiz với nhiều loại câu hỏi
- Xem thống kê học viên

### 👨‍💼 Admin Features:
- Quản lý tất cả users
- Quản lý courses, blogs
- Xem orders và subscriptions
- Thay đổi role người dùng

---

## Slide 6: Database Design (1.5 phút)

### Collections trong Firestore:

| Collection | Mô tả | Quan hệ |
|------------|-------|---------|
| `users` | Thông tin người dùng | - |
| `courses` | Khóa học | teacher_id → users |
| `lessons` | Bài học | course_id → courses |
| `quizzes` | Bài kiểm tra | course_id → courses |
| `questions` | Câu hỏi | quiz_id → quizzes |
| `enrollments` | Ghi danh | user_id, course_id |
| `progress` | Tiến độ học | user_id, lesson_id |
| `grades` | Điểm quiz | user_id, quiz_id |
| `certificates` | Chứng chỉ | user_id, course_id |
| `orders` | Đơn hàng | user_id |
| `payments` | Thanh toán | order_id |
| `blogs` | Bài viết | author_id → users |

---

## Slide 7: Demo (2 phút)

### Demo Flow:
1. **Trang chủ** → Giới thiệu giao diện
2. **Đăng nhập** → Google OAuth
3. **Courses** → Xem danh sách khóa học
4. **Course Detail** → Ghi danh và học
5. **Quiz** → Làm bài và xem kết quả
6. **Admin Dashboard** → Quản lý users, courses, blogs
7. **Teacher Dashboard** → Tạo khóa học mới

---

## Slide 8: Tổng kết (30 giây)

### ✅ Đã hoàn thành:
- Hệ thống LMS hoàn chỉnh với 3 roles
- 15+ API endpoints
- Authentication đa phương thức
- Quản lý khóa học, quiz, chứng chỉ
- Responsive UI với Dark mode

### 🚀 Hướng phát triển:
- Real-time chat/discussion
- Mobile app
- AI-powered recommendations
- Video conferencing

---

# Q&A - Sẵn sàng trả lời câu hỏi!
