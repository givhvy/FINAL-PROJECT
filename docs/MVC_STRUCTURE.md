# Cấu trúc MVC - CodeMaster E-Learning Platform

## Tổng quan

Dự án CodeMaster đã được chuyển đổi sang mô hình **MVC (Model-View-Controller)** để tăng tính tổ chức, dễ bảo trì và mở rộng.

## Cấu trúc thư mục

```
Codemaster-3/
├── client/                 # VIEW LAYER
│   ├── *.html             # Các trang HTML (Views)
│   ├── css/               # Stylesheets
│   └── js/                # Client-side JavaScript
│
├── server/                # BACKEND
│   ├── models/            # MODEL LAYER
│   │   ├── User.js        # User model
│   │   ├── Course.js      # Course model
│   │   ├── Lesson.js      # Lesson model
│   │   ├── Quiz.js        # Quiz model
│   │   ├── Question.js    # Question model
│   │   ├── Order.js       # Order model
│   │   ├── Payment.js     # Payment model
│   │   └── index.js       # Models export
│   │
│   ├── controllers/       # CONTROLLER LAYER
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── lessonController.js
│   │   ├── quizController.js
│   │   ├── questionController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── ...
│   │
│   ├── routes/            # ROUTING
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── lessonRoutes.js
│   │   └── ...
│   │
│   ├── middleware/        # Middleware
│   │   └── authMiddleware.js
│   │
│   ├── services/          # Business Logic Services
│   │   └── emailService.js
│   │
│   └── config/            # Configuration
│       └── cloudinary.js
│
└── server.js              # Application entry point
```

## Chi tiết các layer

### 1. MODEL Layer (server/models/)

Models chịu trách nhiệm tương tác với database (Firestore) và chứa business logic liên quan đến dữ liệu.

**Các Models chính:**

#### User Model (`User.js`)
- Quản lý người dùng
- Phương thức:
  - `findByEmail(email)` - Tìm user theo email
  - `findById(id)` - Tìm user theo ID
  - `findAll(filters)` - Lấy danh sách users
  - `create(userData)` - Tạo user mới
  - `update(id, updateData)` - Cập nhật user
  - `delete(id)` - Xóa user
  - `comparePassword(password)` - So sánh password
  - `saveResetCode(code, expiresAt)` - Lưu mã reset password
  - `clearResetCode()` - Xóa mã reset

#### Course Model (`Course.js`)
- Quản lý khóa học
- Phương thức:
  - `findById(id)` - Tìm course theo ID
  - `findAll(filters)` - Lấy danh sách courses
  - `search(searchTerm)` - Tìm kiếm courses
  - `create(courseData)` - Tạo course mới
  - `update(id, updateData)` - Cập nhật course
  - `delete(id)` - Xóa course
  - `incrementEnrollment(id)` - Tăng số học sinh
  - `updateRating(id, newRating)` - Cập nhật rating
  - `togglePublish(id, isPublished)` - Publish/Unpublish
  - `getPopular(limit)` - Lấy courses phổ biến

#### Lesson Model (`Lesson.js`)
- Quản lý bài học
- Phương thức:
  - `findById(id)` - Tìm lesson theo ID
  - `findAll(filters)` - Lấy danh sách lessons
  - `findByCourseId(courseId)` - Lấy lessons theo course
  - `create(lessonData)` - Tạo lesson mới
  - `update(id, updateData)` - Cập nhật lesson
  - `delete(id)` - Xóa lesson
  - `reorder(id, newOrder)` - Thay đổi thứ tự
  - `togglePublish(id, isPublished)` - Publish/Unpublish
  - `addResource(id, resource)` - Thêm tài nguyên
  - `removeResource(id, resourceIndex)` - Xóa tài nguyên

#### Quiz Model (`Quiz.js`)
- Quản lý bài kiểm tra
- Phương thức:
  - `findById(id)` - Tìm quiz theo ID
  - `findAll(filters)` - Lấy danh sách quizzes
  - `findByCourseId(courseId)` - Lấy quizzes theo course
  - `findByLessonId(lessonId)` - Lấy quizzes theo lesson
  - `create(quizData)` - Tạo quiz mới
  - `update(id, updateData)` - Cập nhật quiz
  - `delete(id)` - Xóa quiz
  - `togglePublish(id, isPublished)` - Publish/Unpublish
  - `updateTotalPoints(id, totalPoints)` - Cập nhật tổng điểm

#### Question Model (`Question.js`)
- Quản lý câu hỏi
- Phương thức:
  - `findById(id)` - Tìm question theo ID
  - `findAll(filters)` - Lấy danh sách questions
  - `findByQuizId(quizId)` - Lấy questions theo quiz
  - `create(questionData)` - Tạo question mới
  - `update(id, updateData)` - Cập nhật question
  - `delete(id)` - Xóa question
  - `reorder(id, newOrder)` - Thay đổi thứ tự
  - `checkAnswer(answer)` - Kiểm tra đáp án
  - `toStudentJSON()` - Chuyển đổi cho học sinh (ẩn đáp án)

#### Order Model (`Order.js`)
- Quản lý đơn hàng
- Phương thức:
  - `findById(id)` - Tìm order theo ID
  - `findAll(filters)` - Lấy danh sách orders
  - `findByUserId(userId)` - Lấy orders theo user
  - `findByCourseId(courseId)` - Lấy orders theo course
  - `create(orderData)` - Tạo order mới
  - `update(id, updateData)` - Cập nhật order
  - `delete(id)` - Xóa order
  - `updateStatus(id, status)` - Cập nhật trạng thái
  - `complete(id, paymentId)` - Hoàn thành order
  - `cancel(id)` - Hủy order
  - `refund(id)` - Hoàn tiền
  - `getTotalRevenue(filters)` - Tính tổng doanh thu

#### Payment Model (`Payment.js`)
- Quản lý thanh toán
- Phương thức:
  - `findById(id)` - Tìm payment theo ID
  - `findByOrderId(orderId)` - Tìm payment theo order
  - `findByTransactionId(transactionId)` - Tìm payment theo transaction
  - `findAll(filters)` - Lấy danh sách payments
  - `findByUserId(userId)` - Lấy payments theo user
  - `create(paymentData)` - Tạo payment mới
  - `update(id, updateData)` - Cập nhật payment
  - `delete(id)` - Xóa payment
  - `updateStatus(id, paymentStatus)` - Cập nhật trạng thái
  - `complete(id, transactionId, gatewayResponse)` - Hoàn thành payment
  - `fail(id, gatewayResponse)` - Đánh dấu thất bại
  - `refund(id)` - Hoàn tiền
  - `getTotalAmount(filters)` - Tính tổng số tiền

### 2. CONTROLLER Layer (server/controllers/)

Controllers xử lý request từ client, gọi models để thao tác dữ liệu, và trả về response.

**Nguyên tắc:**
- Controllers không trực tiếp tương tác với database
- Sử dụng models để thực hiện các thao tác dữ liệu
- Xử lý validation và error handling
- Trả về JSON response

**Ví dụ:**
```javascript
// authController.js
const User = require('../models/User');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sử dụng User Model
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token và trả về response
        // ...
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

### 3. VIEW Layer (client/)

Views là các file HTML và client-side JavaScript.

**Cấu trúc:**
- `*.html` - Các trang web
- `css/` - Stylesheets
- `js/` - Client-side scripts

### 4. ROUTES (server/routes/)

Routes định nghĩa các endpoints API và map chúng với controllers.

**Ví dụ:**
```javascript
// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
```

## Luồng xử lý request

```
Client Request
    ↓
Routes (server/routes/)
    ↓
Controllers (server/controllers/)
    ↓
Models (server/models/)
    ↓
Firestore Database
    ↓
Models → Controllers → Routes → Client Response
```

## Ưu điểm của mô hình MVC

1. **Separation of Concerns**: Tách biệt logic thành các phần riêng biệt
2. **Dễ bảo trì**: Mỗi phần có trách nhiệm rõ ràng
3. **Dễ mở rộng**: Thêm features mới dễ dàng
4. **Tái sử dụng code**: Models có thể được sử dụng ở nhiều controllers
5. **Testing**: Dễ dàng viết unit tests cho từng layer
6. **Collaboration**: Nhiều developers có thể làm việc đồng thời

## Cách sử dụng Models

### Import model:
```javascript
// Import một model
const User = require('../models/User');

// Hoặc import nhiều models
const { User, Course, Lesson } = require('../models');
```

### Sử dụng trong controller:
```javascript
// Tạo mới
const newUser = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
});

// Tìm kiếm
const user = await User.findByEmail('john@example.com');
const course = await Course.findById('courseId');

// Cập nhật
await User.update(userId, { name: 'Jane Doe' });

// Xóa
await Course.delete(courseId);
```

## Best Practices

1. **Luôn sử dụng Models** trong controllers thay vì truy cập trực tiếp database
2. **Error Handling**: Luôn wrap async code trong try-catch
3. **Validation**: Validate dữ liệu trước khi truyền vào models
4. **Security**: Không trả về sensitive data như password
5. **Consistency**: Sử dụng naming conventions nhất quán

## Migration từ code cũ

Khi cập nhật code cũ:
1. Thay thế `db.collection('users')...` bằng `User.findAll()`
2. Thay thế `db.collection('courses').add()` bằng `Course.create()`
3. Sử dụng model methods thay vì raw Firestore queries

## Tài liệu tham khảo

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MVC Architecture Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
