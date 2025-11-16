// ============================================================================
// 📚 FILE NÀY LÀM GÌ? - courseController.js
// ============================================================================
// File này là COURSE CONTROLLER - điều khiển tất cả các thao tác liên quan đến KHÓA HỌC (courses)
//
// Giống như một nhân viên quản lý cửa hàng khóa học, file này:
// ✅ Tạo khóa học mới (createCourse) - admin/teacher
// ✅ Lấy danh sách tất cả khóa học (getCourses) - public, có filter, OPTIMIZED!
// ✅ Lấy thông tin 1 khóa học cụ thể (getCourseById) - kèm lessons & quizzes
// ✅ Cập nhật khóa học (updateCourse) - admin/teacher
// ✅ Xóa khóa học (deleteCourse) - CASCADE delete (xóa cả lessons & quizzes)
// ✅ Lấy lessons của khóa học (getCourseLessons)
// ✅ Lấy quizzes của khóa học (getCourseQuizzes)
//
// 🎯 ĐẶC ĐIỂM QUAN TRỌNG:
// - OPTIMIZATION: Tránh N+1 Query Problem bằng batch queries
// - FILTERING: Lọc theo category, price range, instructor
// - CASCADE DELETE: Xóa course → tự động xóa lessons → quizzes → questions
//
// ============================================================================
// 📖 GIẢI THÍCH KHÁI NIỆM - "N+1 Query Problem"
// ============================================================================
//
// 🤔 "N+1 Query Problem" là gì?
// - Vấn đề query database quá nhiều lần, làm chậm performance
// - N+1 = 1 query chính + N queries phụ (N là số lượng items)
//
// 🎯 VÍ DỤ THỰC TẾ (XẤU):
// Tưởng tượng bạn là giáo viên cần lấy danh sách 50 khóa học, mỗi khóa có:
// - Thông tin khóa học
// - Thông tin giảng viên
// - Danh sách lessons
//
// CÁCH LÀM SAI (N+1 queries):
// 1. Query 1: Lấy 50 courses
//    → SELECT * FROM courses (1 query)
// 2. Query 2-51: Lấy teacher của từng course
//    → SELECT * FROM users WHERE id = course1.teacher_id (query 2)
//    → SELECT * FROM users WHERE id = course2.teacher_id (query 3)
//    → ... (50 queries)
// 3. Query 52-101: Lấy lessons của từng course
//    → SELECT * FROM lessons WHERE course_id = course1.id (query 52)
//    → SELECT * FROM lessons WHERE course_id = course2.id (query 53)
//    → ... (50 queries)
// → TỔNG: 1 + 50 + 50 = 101 queries! ❌ RẤT CHẬM!
//
// CÁCH LÀM ĐÚNG (Batch queries):
// 1. Query 1: Lấy 50 courses
//    → SELECT * FROM courses
// 2. Query 2: Lấy TẤT CẢ teachers cùng lúc
//    → SELECT * FROM users WHERE id IN (teacher1, teacher2, ..., teacher50)
// 3. Query 3: Lấy TẤT CẢ lessons cùng lúc
//    → SELECT * FROM lessons WHERE course_id IN (course1, course2, ..., course50)
// 4. Join data trong memory (RAM)
//    → Ghép teachers và lessons vào từng course
// → TỔNG: 3 queries! ✅ RẤT NHANH!
//
// 📊 SO SÁNH PERFORMANCE:
// ┌─────────────────────┬───────────┬───────────┐
// │ Method              │ Queries   │ Time      │
// ├─────────────────────┼───────────┼───────────┤
// │ N+1 (XẤU)          │ 101       │ ~5000ms   │
// │ Batch (TỐT)        │ 3         │ ~150ms    │
// └─────────────────────┴───────────┴───────────┘
//
// File này sử dụng BATCH QUERIES để tối ưu performance!
//
// ============================================================================
// 🎓 GIẢI THÍCH KHÁI NIỆM - "CASCADE Delete"
// ============================================================================
//
// 🤔 "CASCADE Delete" là gì?
// - CASCADE = Thác nước (chảy từ trên xuống dưới)
// - CASCADE Delete = Xóa theo tầng (xóa cha → tự động xóa con)
//
// 🎯 VÍ DỤ THỰC TẾ:
// Khi xóa 1 COURSE, phải xóa tất cả nội dung liên quan:
//
// COURSE (Khóa học: "JavaScript Từ Cơ Bản Đến Nâng Cao")
//    ├─ LESSON 1: "Giới thiệu JavaScript"
//    ├─ LESSON 2: "Biến và Kiểu dữ liệu"
//    ├─ LESSON 3: "Hàm và Arrow Functions"
//    ├─ QUIZ 1: "Kiểm tra Cơ Bản"
//    │    ├─ QUESTION 1: "JavaScript là gì?"
//    │    ├─ QUESTION 2: "Cách khai báo biến?"
//    │    └─ QUESTION 3: "Kiểu dữ liệu nào đúng?"
//    └─ QUIZ 2: "Kiểm tra Nâng Cao"
//         ├─ QUESTION 1: "Arrow function khác gì?"
//         └─ QUESTION 2: "Closure là gì?"
//
// Khi admin nhấn "Xóa khóa học":
// 1. Xóa tất cả QUESTIONS trong mỗi QUIZ
// 2. Xóa tất cả QUIZZES
// 3. Xóa tất cả LESSONS
// 4. Xóa COURSE
//
// Nếu KHÔNG cascade delete → rác trong database:
// - Lessons không thuộc course nào (orphaned)
// - Quizzes không có course
// - Questions không có quiz
//
// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ 1: USER XEM DANH SÁCH KHÓA HỌC
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 1: FRONTEND (file: views/pages/index.ejs)                     │
// │ User mở trang chủ, muốn xem các khóa học                           │
// │                                                                      │
// │ JavaScript code:                                                     │
// │   fetch('/api/courses?category=programming')                        │
// │     .then(res => res.json())                                        │
// │     .then(courses => {                                              │
// │       displayCourses(courses); // Hiển thị danh sách khóa học     │
// │     })                                                              │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 2: ROUTES (file: routes/courseRoutes.js)                      │
// │ Route nhận request và chuyển đến controller                         │
// │                                                                      │
// │ Code:                                                               │
// │   router.get('/courses', getCourses);                               │
// │                           ↑                                         │
// │                    Gọi function trong file NÀY                     │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 3: CONTROLLER (file NÀY - courseController.js)                │
// │ Function getCourses() xử lý:                                        │
// │   1. Lấy filters từ query params (category, minPrice, maxPrice)    │
// │   2. Gọi Course.getAllWithDetails(filters) - BATCH QUERY!          │
// │   3. Gọi Lesson.findByCourseIds(courseIds) - BATCH QUERY!          │
// │   4. Join data trong memory                                        │
// │   5. Apply additional filters (price range, instructor name)       │
// │   6. Trả về danh sách courses                                      │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 4: MODEL (files: models/Course.js, models/Lesson.js)         │
// │ Course.getAllWithDetails():                                         │
// │   - Query Firestore lấy courses với filters                        │
// │   - Batch query lấy teachers (1 query cho tất cả)                 │
// │                                                                      │
// │ Lesson.findByCourseIds([course1, course2, ...]):                   │
// │   - Query Firestore lấy lessons WHERE course_id IN (...)          │
// │   - 1 query cho tất cả courses                                     │
// └─────────────────────────────────────────────────────────────────────┘
//                                  ↓
// ┌─────────────────────────────────────────────────────────────────────┐
// │ BƯỚC 5: DATABASE (Firebase Firestore)                              │
// │ Trả về data:                                                        │
// │ [                                                                   │
// │   {                                                                 │
// │     id: "course1",                                                 │
// │     title: "JavaScript Cơ Bản",                                    │
// │     category: "programming",                                       │
// │     price: 299000,                                                 │
// │     teacher: { name: "Thầy Phong", email: "..." },                │
// │     lessons: [                                                     │
// │       { id: "lesson1", title: "Giới thiệu JS", order: 1 },       │
// │       { id: "lesson2", title: "Biến", order: 2 }                 │
// │     ]                                                              │
// │   },                                                               │
// │   { ... }                                                          │
// │ ]                                                                   │
// └─────────────────────────────────────────────────────────────────────┘
//
// VÍ DỤ 2: ADMIN TẠO KHÓA HỌC MỚI
// Frontend: Admin điền form tạo khóa học → nhấn "Tạo"
//   → POST /api/courses + body: { title, description, price, category, ... }
//    ↓
// Routes: router.post('/courses', authMiddleware, roleMiddleware(['admin', 'teacher']), createCourse)
//    ↓
// Controller (file này):
//   - Validate dữ liệu
//   - parseFloat(price) để chuyển string → number
//   - Gọi Course.create(courseData)
//    ↓
// Model: Course.create() lưu vào Firestore
//    ↓
// Database: Document mới trong collection "courses"
//
// VÍ DỤ 3: ADMIN XÓA KHÓA HỌC (CASCADE DELETE)
// Frontend: Admin nhấn nút "Xóa khóa học"
//   → DELETE /api/courses/:courseId
//    ↓
// Routes: router.delete('/courses/:id', authMiddleware, roleMiddleware(['admin']), deleteCourse)
//    ↓
// Controller (file này - function deleteCourse):
//   1. Tìm course
//   2. Xóa tất cả LESSONS của course
//   3. Xóa tất cả QUESTIONS trong mỗi QUIZ
//   4. Xóa tất cả QUIZZES của course
//   5. Xóa COURSE
//    ↓
// Model: Course.delete(), Lesson.delete(), Quiz.delete(), Question.delete()
//    ↓
// Database: Xóa tất cả documents liên quan
//
// ============================================================================
// 📖 GIẢI THÍCH KHÁI NIỆM CƠ BẢN - "Controller"
// ============================================================================
//
// 🤔 "Controller" là gì?
// - Controller = Người điều khiển
// - Tầng xử lý LOGIC NGHIỆP VỤ (business logic) trong mô hình MVC
//
// 🎯 MÔ HÌNH MVC:
// - M = Model (models/Course.js) → Làm việc với database
// - V = View (views/pages/index.ejs) → Hiển thị giao diện
// - C = Controller (file NÀY) → Xử lý logic, kết nối M và V
//
// 📚 VÍ DỤ TƯƠNG TỰ - NHÀ HÀNG:
// ┌──────────────────────────────────────────────────────────────┐
// │ KHÁCH HÀNG (User/Frontend)                                   │
// │ - Gọi món: "Cho tôi 1 phở bò"                               │
// └──────────────────────────────────────────────────────────────┘
//                         ↓
// ┌──────────────────────────────────────────────────────────────┐
// │ NHÂN VIÊN PHỤC VỤ (Routes)                                   │
// │ - Nhận order từ khách                                        │
// │ - Chuyển order đến controller                                │
// └──────────────────────────────────────────────────────────────┘
//                         ↓
// ┌──────────────────────────────────────────────────────────────┐
// │ QUẢN LÝ BẾP (Controller)                                     │
// │ - Kiểm tra: Còn nguyên liệu không? (Validation)             │
// │ - Kiểm tra: Khách có tiền không? (Authorization)            │
// │ - Ra lệnh cho bếp: "Nấu 1 phở bò" (Call Model)             │
// │ - Kiểm tra món ăn trước khi đưa khách (Format response)     │
// └──────────────────────────────────────────────────────────────┘
//                         ↓
// ┌──────────────────────────────────────────────────────────────┐
// │ BẾP (Model)                                                  │
// │ - Lấy nguyên liệu (Query database)                          │
// │ - Nấu món (Process data)                                    │
// │ - Trả món về (Return data)                                  │
// └──────────────────────────────────────────────────────────────┘
//                         ↓
// ┌──────────────────────────────────────────────────────────────┐
// │ KHO NGUYÊN LIỆU (Database)                                   │
// │ - Lưu trữ: thịt bò, rau, gia vị                            │
// └──────────────────────────────────────────────────────────────┘
//
// CONTROLLER KHÔNG:
// ❌ Làm việc trực tiếp với database (việc của Model)
// ❌ Render HTML (việc của View)
// ❌ Định nghĩa routes (việc của Routes file)
//
// CONTROLLER CHỈ:
// ✅ Nhận request từ Routes
// ✅ Validate dữ liệu (kiểm tra có hợp lệ không?)
// ✅ Kiểm tra quyền (user có được phép làm việc này không?)
// ✅ Gọi Model để thao tác database
// ✅ Format dữ liệu và trả response về client
//
// ============================================================================
// 📦 IMPORT CÁC MODULE CẦN THIẾT
// ============================================================================

const Course = require('../models/Course');
// 📌 Giải thích:
// - `const` = khai báo biến không thay đổi được (constant)
// - `Course` = tên biến, chứa Course Model (class)
// - `require()` = function để import module trong Node.js
// - `'../models/Course'` = đường dẫn tới file Course.js
//   + `..` = lùi 1 cấp thư mục (từ controllers/ lên server/)
//   + `/models/Course` = vào thư mục models, lấy file Course.js
// - Sau dòng này, có thể gọi: Course.create(), Course.findAll(), Course.delete(), v.v.

const Lesson = require('../models/Lesson');
// 📌 Import Lesson Model để lấy danh sách lessons của mỗi course

const User = require('../models/User');
// 📌 Import User Model để lấy thông tin giảng viên (teacher)

// ============================================================================
// 📖 GIẢI THÍCH KHÁI NIỆM - "Async/Await"
// ============================================================================
//
// 🤔 "async/await" là gì?
// - async = từ khóa đánh dấu hàm bất đồng bộ (asynchronous function)
// - await = đợi Promise hoàn thành rồi mới chạy tiếp
//
// 🎯 VÍ DỤ THỰC TẾ - GỌI PIZZA:
// CÁCH 1: ĐỒNG BỘ (Synchronous) - Chậm ❌
//   - Bạn gọi điện đặt pizza
//   - Đứng ở cửa ĐỢI pizza đến (30 phút)
//   - KHÔNG làm gì được trong 30 phút
//   - Pizza đến → nhận pizza
//
// CÁCH 2: BẤT ĐỒNG BỘ (Asynchronous) - Nhanh ✅
//   - Bạn gọi điện đặt pizza
//   - Trong lúc chờ, BẠN LÀM VIỆC KHÁC (xem TV, học bài)
//   - Pizza đến → chuông reo → bạn ra nhận
//
// TRONG CODE:
// ❌ KHÔNG DÙNG async/await (callback hell):
// getCourse(id, function(course) {
//   getTeacher(course.teacher_id, function(teacher) {
//     getLessons(course.id, function(lessons) {
//       // Code vào sâu quá! Khó đọc!
//     });
//   });
// });
//
// ✅ DÙNG async/await (code đẹp, dễ đọc):
// async function getCourseData(id) {
//   const course = await getCourse(id);    // Đợi xong mới chạy tiếp
//   const teacher = await getTeacher(course.teacher_id);
//   const lessons = await getLessons(course.id);
//   return { course, teacher, lessons };
// }
//
// ============================================================================
// FUNCTION 1: TẠO KHÓA HỌC MỚI (CREATE COURSE)
// ============================================================================
// Create a new course
exports.createCourse = async (req, res) => {
// 📌 Giải thích từng phần:
// - `exports.createCourse` = export function này để file khác có thể import
//   + routes/courseRoutes.js sẽ import: const { createCourse } = require('./controllers/courseController')
// - `async` = đánh dấu đây là async function (hàm bất đồng bộ)
//   + Cho phép dùng `await` bên trong
//   + Tự động return Promise
// - `(req, res)` = 2 tham số:
//   + `req` (request) = object chứa thông tin từ client (body, headers, params, query)
//   + `res` (response) = object để gửi phản hồi về client
// - `=>` = arrow function (cách viết ngắn gọn của function)
//
// 🎯 VÍ DỤ THỰC TẾ:
// Admin điền form tạo khóa học:
// ┌─────────────────────────────────────────┐
// │ TẠO KHÓA HỌC MỚI                       │
// ├─────────────────────────────────────────┤
// │ Tên khóa học: JavaScript Cơ Bản        │
// │ Mô tả: Học JS từ con số 0              │
// │ Giá: 299000                            │
// │ Danh mục: programming                  │
// │ Giảng viên: teacher123                 │
// │                                         │
// │ [Tạo khóa học]                         │
// └─────────────────────────────────────────┘

    try {
    // 📌 `try` = bắt đầu khối code có thể gây lỗi
    // - Nếu có lỗi → nhảy xuống khối `catch` để xử lý

        const courseData = {
        // 📌 Tạo object chứa dữ liệu khóa học sẽ lưu vào database
            ...req.body,
            // 📌 `...req.body` = SPREAD OPERATOR - giải nén tất cả fields từ req.body
            // - Ví dụ req.body = { title: 'JS', description: '...', price: '299000' }
            // - Sau spread: courseData = { title: 'JS', description: '...', price: '299000' }
            // - Dùng spread để copy tất cả fields một lúc, không phải viết từng cái

            // Ensure price is number
            price: req.body.price !== undefined ? parseFloat(req.body.price) : 0,
            // 📌 Giải thích:
            // - `req.body.price !== undefined` = kiểm tra price có tồn tại không?
            //   + `!==` = không bằng (so sánh chặt chẽ, kiểm tra cả type)
            //   + `undefined` = giá trị không tồn tại
            // - `?` và `:` = TERNARY OPERATOR (toán tử 3 ngôi)
            //   + Cú pháp: điều_kiện ? giá_trị_nếu_đúng : giá_trị_nếu_sai
            // - `parseFloat(req.body.price)` = convert string → số thập phân
            //   + Ví dụ: parseFloat('299000') → 299000 (number)
            //   + Ví dụ: parseFloat('299.99') → 299.99
            // - Nếu không có price → default = 0
            //
            // 🎯 TẠI SAO CẦN parseFloat?
            // - Dữ liệu từ HTML form hoặc JSON luôn là STRING
            // - Database cần NUMBER để tính toán, so sánh
            // - "299000" (string) !== 299000 (number)

            // Support both camelCase and snake_case
            instructorId: req.body.instructorId || req.body.teacher_id,
            // 📌 `||` = toán tử OR (hoặc)
            // - Nếu instructorId có giá trị → dùng instructorId
            // - Nếu instructorId rỗng/null/undefined → dùng teacher_id
            // - Đảm bảo tương thích với cả 2 naming conventions:
            //   + Frontend mới: dùng camelCase (instructorId)
            //   + Code cũ: dùng snake_case (teacher_id)

            teacher_id: req.body.teacher_id || req.body.instructorId
            // 📌 Lưu CẢ 2 formats để đảm bảo backward compatibility
            // - Database có thể query bằng cả 2 tên field
        };

        const newCourse = await Course.create(courseData);
        // 📌 Giải thích:
        // - `await` = đợi Promise hoàn thành rồi mới chạy tiếp
        // - `Course.create()` = gọi static method create() trong Course Model
        //   + ĐÂY LÀ NƠI CONTROLLER GỌI MODEL! ⭐
        //   + Model sẽ lưu data vào Firestore collection "courses"
        // - `newCourse` = Course object được trả về, chứa data vừa tạo + id từ database
        //
        // 🔄 FLOW:
        // Controller → Course.create(courseData)
        //                      ↓
        //            Course Model xử lý:
        //            - Validate data
        //            - Generate ID
        //            - Save to Firestore
        //                      ↓
        //            Return new Course object
        //                      ↓
        //            Controller nhận newCourse

        res.status(201).json({
        // 📌 Giải thích:
        // - `res` = response object
        // - `.status(201)` = set HTTP status code = 201 (Created - Tạo thành công)
        //   + 200 = OK (thành công chung chung)
        //   + 201 = Created (tạo resource mới thành công)
        //   + 400 = Bad Request (request không hợp lệ)
        //   + 401 = Unauthorized (chưa đăng nhập)
        //   + 403 = Forbidden (không có quyền)
        //   + 404 = Not Found (không tìm thấy)
        //   + 500 = Internal Server Error (lỗi server)
        // - `.json()` = gửi response dạng JSON về client
        //   + Tự động set header Content-Type: application/json
        //   + Convert object thành JSON string

            success: true,
            // 📌 Đánh dấu request thành công
            // - Frontend có thể check: if (response.success) { ... }

            data: newCourse.toJSON()
            // 📌 `newCourse.toJSON()` = gọi instance method để convert Course object → plain object
            // - Course object có thể có methods, getters, setters
            // - Plain object chỉ có data thuần túy, dễ serialize thành JSON
            // - Loại bỏ các internal properties không cần thiết
        });

    } catch (err) {
    // 📌 `catch (err)` = bắt lỗi nếu có lỗi xảy ra trong khối `try`
    // - `err` = object chứa thông tin lỗi
    // - Ví dụ lỗi: database connection failed, validation error, v.v.

        console.error("Create Course Error:", err);
        // 📌 `console.error()` = in lỗi ra console (terminal)
        // - Màu đỏ trong terminal, dễ nhận biết
        // - Dùng để debug, xem lỗi gì xảy ra

        res.status(400).json({ success: false, error: err.message });
        // 📌 Trả response lỗi về client
        // - Status 400 = Bad Request (request không hợp lệ)
        // - success: false = đánh dấu thất bại
        // - error: err.message = message lỗi (ví dụ: "Title is required")
    }
};

// ============================================================================
// FUNCTION 2: LẤY TẤT CẢ KHÓA HỌC (GET ALL COURSES) - OPTIMIZED!
// ============================================================================
// Get all courses (Bao gồm lessons và thông tin giảng viên)
// FR2.4: Supports filtering by category, price, and instructor
// OPTIMIZED: Uses Course.getAllWithDetails() to fix N+1 query problem
exports.getCourses = async (req, res) => {
// 📌 Function này:
// - PUBLIC - ai cũng xem được, không cần đăng nhập
// - Có FILTERING - lọc theo category, price range, instructor
// - OPTIMIZED - dùng batch queries để tránh N+1 problem
//
// 🎯 VÍ DỤ THỰC TẾ:
// User vào trang chủ, muốn tìm khóa học:
// ┌─────────────────────────────────────────┐
// │ TÌM KHÓA HỌC                           │
// ├─────────────────────────────────────────┤
// │ Danh mục: [Programming ▼]             │
// │ Giá từ: [0] đến [500000]              │
// │ Giảng viên: [Thầy Phong]              │
// │                                         │
// │ [Tìm kiếm]                             │
// └─────────────────────────────────────────┘
//
// → URL: /api/courses?category=programming&minPrice=0&maxPrice=500000&instructor=Phong

    try {
        const { category, minPrice, maxPrice, instructorId, instructor } = req.query;
        // 📌 `req.query` = object chứa query parameters từ URL
        // - URL: /api/courses?category=programming&minPrice=0
        // - req.query = { category: 'programming', minPrice: '0' }
        // - Destructuring để lấy từng param thành biến riêng
        //
        // 🔍 CÁC QUERY PARAMS:
        // - category: Danh mục khóa học (programming, design, marketing, ...)
        // - minPrice: Giá tối thiểu
        // - maxPrice: Giá tối đa
        // - instructorId: ID của giảng viên
        // - instructor: Tên giảng viên (search theo tên)

        // Build filters for Course.getAllWithDetails()
        const filters = {};
        // 📌 Tạo object rỗng để chứa filters
        // - Sau đó sẽ thêm filters vào nếu có

        if (category) {
        // 📌 `if (category)` = kiểm tra category có giá trị không?
        // - Nếu category = null/undefined/'' → false → không chạy vào if
        // - Nếu category = 'programming' → true → chạy vào if

            filters.category = category;
            // 📌 Thêm category vào filters
            // - filters = { category: 'programming' }
        }

        if (instructorId) {
            filters.instructorId = instructorId;
            // 📌 Lọc theo ID của giảng viên
        }

        // Get all courses with teacher and enrollment data (3 queries total instead of N+1)
        let courses = await Course.getAllWithDetails(filters);
        // 📌 Giải thích:
        // - `let` = khai báo biến CÓ THỂ THAY ĐỔI (khác với const)
        //   + Dùng let vì courses sẽ được filter thêm ở dưới
        // - `Course.getAllWithDetails(filters)` = gọi Model method
        //   + ĐÂY LÀ NƠI CONTROLLER GỌI MODEL! ⭐
        //   + Model sẽ:
        //     1. Query courses với filters
        //     2. BATCH query tất cả teachers cùng lúc
        //     3. Join data trong memory
        //   + Thay vì N+1 queries (1 + 50 + 50 = 101), chỉ cần 2-3 queries!
        //
        // 🚀 OPTIMIZATION:
        // BEFORE:
        //   - Query 1: Lấy 50 courses
        //   - Query 2-51: Lấy teacher từng course (50 queries)
        //   → TOTAL: 51 queries ❌
        // AFTER:
        //   - Query 1: Lấy 50 courses
        //   - Query 2: Lấy TẤT CẢ 50 teachers cùng lúc (1 query)
        //   → TOTAL: 2 queries ✅

        // Client-side filtering for price range (Firestore doesn't support range queries well)
        if (minPrice !== undefined) {
        // 📌 Kiểm tra có filter minPrice không?
        // - `!== undefined` = khác undefined (có giá trị)
        // - minPrice có thể = 0, nên không dùng `if (minPrice)` (0 = falsy)

            const min = parseFloat(minPrice);
            // 📌 Convert string → number
            // - req.query luôn trả về string, phải convert

            courses = courses.filter(course => (course.price || 0) >= min);
            // 📌 Giải thích:
            // - `.filter()` = METHOD CỦA ARRAY - lọc array, chỉ giữ items thỏa điều kiện
            // - `course => ...` = arrow function, nhận từng course, return true/false
            // - `(course.price || 0)` = nếu price rỗng → dùng 0
            // - `>= min` = lớn hơn hoặc bằng giá tối thiểu
            // - Kết quả: array mới chỉ chứa courses có giá >= minPrice
            //
            // 🎯 VÍ DỤ:
            // courses = [
            //   { title: 'Course A', price: 100000 },
            //   { title: 'Course B', price: 300000 },
            //   { title: 'Course C', price: 500000 }
            // ]
            // minPrice = 200000
            // → Kết quả: [
            //   { title: 'Course B', price: 300000 },
            //   { title: 'Course C', price: 500000 }
            // ]
        }

        if (maxPrice !== undefined) {
            const max = parseFloat(maxPrice);
            courses = courses.filter(course => (course.price || 0) <= max);
            // 📌 `<=` = nhỏ hơn hoặc bằng giá tối đa
            // - Lọc chỉ giữ courses có giá <= maxPrice
        }

        // Filter by instructor name
        if (instructor) {
        // 📌 Lọc theo TÊN giảng viên (search)

            const instructorLower = instructor.toLowerCase();
            // 📌 `.toLowerCase()` = convert thành chữ thường
            // - Ví dụ: "Thầy PHONG" → "thầy phong"
            // - Dùng để CASE-INSENSITIVE SEARCH (không phân biệt hoa thường)

            courses = courses.filter(course =>
                course.teacher &&
                course.teacher.name &&
                course.teacher.name.toLowerCase().includes(instructorLower)
            );
            // 📌 Giải thích:
            // - `course.teacher &&` = kiểm tra course có teacher không?
            //   + && = AND operator, nếu teacher null → dừng ngay, không check tiếp
            // - `course.teacher.name &&` = kiểm tra teacher có name không?
            // - `.toLowerCase()` = convert tên thành chữ thường
            // - `.includes(instructorLower)` = kiểm tra string có chứa substring
            //   + Ví dụ: "Nguyễn Văn Phong".includes("phong") → true
            //   + Ví dụ: "Trần Thị Mai".includes("phong") → false
            //
            // 🎯 VÍ DỤ:
            // instructor = "Phong"
            // courses = [
            //   { teacher: { name: "Nguyễn Văn Phong" } },  ← MATCH!
            //   { teacher: { name: "Trần Thị Mai" } },      ← NO
            //   { teacher: { name: "Lê Phong Lan" } }       ← MATCH!
            // ]
            // → Kết quả: 2 courses có tên chứa "Phong"
        }

        // Fetch lessons for each course (batch by courseIds)
        if (courses.length > 0) {
        // 📌 Nếu có ít nhất 1 course → fetch lessons
        // - `.length` = số lượng phần tử trong array
        // - `> 0` = lớn hơn 0 (có phần tử)

            const courseIds = courses.map(c => c.id);
            // 📌 Giải thích:
            // - `.map()` = METHOD CỦA ARRAY - duyệt qua từng phần tử, transform
            // - `c => c.id` = arrow function, nhận course `c`, return `c.id`
            // - Kết quả: array chứa tất cả IDs
            //
            // 🎯 VÍ DỤ:
            // courses = [
            //   { id: 'course1', title: 'JS' },
            //   { id: 'course2', title: 'React' },
            //   { id: 'course3', title: 'Node' }
            // ]
            // → courseIds = ['course1', 'course2', 'course3']

            const allLessons = await Lesson.findByCourseIds(courseIds);
            // 📌 GỌI MODEL ĐỂ BATCH QUERY LESSONS! ⭐
            // - Thay vì query từng course (N queries):
            //   + Query 1: Lấy lessons của course1
            //   + Query 2: Lấy lessons của course2
            //   + Query 3: Lấy lessons của course3
            // - Chỉ cần 1 QUERY:
            //   + Query: Lấy lessons WHERE course_id IN ['course1', 'course2', 'course3']
            //
            // 🚀 OPTIMIZATION:
            // - N courses → 1 query thay vì N queries!

            // Group lessons by courseId
            const lessonsByCourse = {};
            // 📌 Tạo object để group lessons theo courseId
            // - Kết quả sẽ là: { course1: [lessons...], course2: [...], ... }

            allLessons.forEach(lesson => {
            // 📌 `.forEach()` = duyệt qua từng lesson, thực hiện hành động
            // - Không return gì (khác với .map())

                if (!lessonsByCourse[lesson.courseId]) {
                // 📌 Nếu chưa có array cho courseId này

                    lessonsByCourse[lesson.courseId] = [];
                    // 📌 Tạo array rỗng
                }

                lessonsByCourse[lesson.courseId].push(lesson);
                // 📌 `.push()` = thêm lesson vào array
                //
                // 🎯 VÍ DỤ:
                // allLessons = [
                //   { id: 'l1', courseId: 'course1', title: 'Lesson 1' },
                //   { id: 'l2', courseId: 'course1', title: 'Lesson 2' },
                //   { id: 'l3', courseId: 'course2', title: 'Lesson 1' }
                // ]
                // → lessonsByCourse = {
                //   course1: [
                //     { id: 'l1', courseId: 'course1', title: 'Lesson 1' },
                //     { id: 'l2', courseId: 'course1', title: 'Lesson 2' }
                //   ],
                //   course2: [
                //     { id: 'l3', courseId: 'course2', title: 'Lesson 1' }
                //   ]
                // }
            });

            // Attach lessons to courses
            courses = courses.map(course => ({
            // 📌 `.map()` = transform từng course, thêm lessons vào

                ...course,
                // 📌 Spread operator - copy tất cả properties của course

                lessons: lessonsByCourse[course.id] || []
                // 📌 Thêm property lessons
                // - lessonsByCourse[course.id] = array lessons của course này
                // - Nếu không có (undefined) → dùng array rỗng []
                //
                // 🎯 KẾT QUẢ:
                // courses = [
                //   {
                //     id: 'course1',
                //     title: 'JavaScript Cơ Bản',
                //     price: 299000,
                //     lessons: [
                //       { id: 'l1', title: 'Lesson 1' },
                //       { id: 'l2', title: 'Lesson 2' }
                //     ]
                //   },
                //   {
                //     id: 'course2',
                //     title: 'React Nâng Cao',
                //     price: 499000,
                //     lessons: [
                //       { id: 'l3', title: 'Lesson 1' }
                //     ]
                //   }
                // ]
            }));
        }

        res.status(200).json(courses);
        // 📌 Trả về danh sách courses
        // - Status 200 = OK (thành công)
        // - Trả trực tiếp array, không wrap trong { success, data }

    } catch (err) {
        console.error("Get Courses Error:", err);
        res.status(500).json({ error: err.message });
        // 📌 Status 500 = Internal Server Error
        // - Lỗi xảy ra từ phía server (không phải lỗi của client)
    }
};

// ============================================================================
// FUNCTION 3: LẤY THÔNG TIN 1 KHÓA HỌC CỤ THỂ (GET COURSE BY ID)
// ============================================================================
// Get course by ID (Bao gồm lessons và quizzes)
exports.getCourseById = async (req, res) => {
// 📌 Function này lấy chi tiết 1 khóa học cụ thể
// - Kèm theo: lessons, quizzes, thông tin giảng viên
//
// 🎯 VÍ DỤ THỰC TẾ:
// User click vào 1 khóa học để xem chi tiết:
// ┌─────────────────────────────────────────────────────────┐
// │ 📚 JavaScript Từ Cơ Bản Đến Nâng Cao                   │
// ├─────────────────────────────────────────────────────────┤
// │ 👨‍🏫 Giảng viên: Nguyễn Văn Phong                        │
// │ 💰 Giá: 299,000đ                                        │
// │ 📖 Danh mục: Programming                                │
// │                                                          │
// │ 📝 Mô tả: Khóa học dành cho người mới bắt đầu...       │
// │                                                          │
// │ 📚 NỘI DUNG KHÓA HỌC (15 bài học)                       │
// │ ├─ 📄 Lesson 1: Giới thiệu JavaScript                  │
// │ ├─ 📄 Lesson 2: Biến và Kiểu dữ liệu                   │
// │ └─ ...                                                  │
// │                                                          │
// │ 📝 BÀI KIỂM TRA (2 quizzes)                            │
// │ ├─ ✅ Quiz 1: Kiểm tra Cơ Bản (10 câu)                 │
// │ └─ ✅ Quiz 2: Kiểm tra Nâng Cao (15 câu)               │
// │                                                          │
// │ [Đăng ký học]                                           │
// └─────────────────────────────────────────────────────────┘

    try {
        const courseId = req.params.id;
        // 📌 `req.params` = object chứa URL parameters (dynamic parts)
        // - Route: /api/courses/:id
        // - URL thực tế: /api/courses/course123
        // - req.params = { id: 'course123' }
        // - courseId = 'course123'

        const course = await Course.findById(courseId);
        // 📌 GỌI MODEL ĐỂ TÌM COURSE! ⭐
        // - Tìm trong Firestore collection "courses" WHERE id = courseId

        if (!course) {
        // 📌 Nếu không tìm thấy course (course = null/undefined)

            return res.status(404).json({ success: false, error: 'Course not found' });
            // 📌 Status 404 = Not Found (không tìm thấy resource)
            // - return = dừng function ngay, không chạy code phía dưới
        }

        const courseData = course.toJSON();
        // 📌 Convert Course object → plain object

        let teacherData = null;
        // 📌 Khai báo biến để lưu thông tin giảng viên
        // - Ban đầu = null (chưa có data)

        // 1. Lấy thông tin giảng viên
        if (courseData.instructorId || courseData.teacher_id) {
        // 📌 Kiểm tra course có teacher không?
        // - Support cả 2 naming: instructorId và teacher_id

            const teacherId = courseData.instructorId || courseData.teacher_id;
            // 📌 Lấy ID của teacher (dùng cái nào có giá trị)

            const teacher = await User.findById(teacherId);
            // 📌 GỌI MODEL ĐỂ TÌM USER (TEACHER)! ⭐

            if (teacher) {
            // 📌 Nếu tìm thấy teacher

                teacherData = teacher.toJSON();
                // 📌 Convert User object → plain object
            }
        }

        // 2. Lấy tất cả lessons của khóa học
        const lessons = await Lesson.findByCourseId(courseId);
        // 📌 GỌI MODEL ĐỂ TÌM LESSONS! ⭐
        // - Query Firestore: WHERE course_id = courseId

        // 3. Lấy tất cả quizzes của khóa học
        const Quiz = require('../models/Quiz');
        // 📌 Import Quiz Model (lazy loading - chỉ import khi cần)

        const quizzes = await Quiz.findByCourseId(courseId);
        // 📌 GỌI MODEL ĐỂ TÌM QUIZZES! ⭐

        // Return direct object for consistency with other endpoints (no wrapping)
        res.status(200).json({
            ...courseData,
            // 📌 Spread tất cả properties của course

            teacher: teacherData,
            // 📌 Thêm thông tin giảng viên

            lessons: lessons.map(l => l.toJSON()),
            // 📌 Convert array of Lesson objects → array of plain objects

            quizzes: quizzes.map(q => q.toJSON()),
            // 📌 Convert array of Quiz objects → array of plain objects
        });
        // 📌 Response structure:
        // {
        //   id: "course123",
        //   title: "JavaScript Cơ Bản",
        //   description: "...",
        //   price: 299000,
        //   teacher: {
        //     id: "teacher123",
        //     name: "Nguyễn Văn Phong",
        //     email: "phong@example.com"
        //   },
        //   lessons: [
        //     { id: "l1", title: "Lesson 1", order: 1 },
        //     { id: "l2", title: "Lesson 2", order: 2 }
        //   ],
        //   quizzes: [
        //     { id: "q1", title: "Quiz 1", questionCount: 10 }
        //   ]
        // }

    } catch (err) {
        console.error("Get Course By ID Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============================================================================
// FUNCTION 4: CẬP NHẬT KHÓA HỌC (UPDATE COURSE)
// ============================================================================
// Update course
exports.updateCourse = async (req, res) => {
// 📌 Chỉ admin/teacher được phép update
// - Routes sẽ check quyền trước khi gọi function này
//
// 🎯 VÍ DỤ THỰC TẾ:
// Admin muốn sửa giá khóa học từ 299,000đ → 249,000đ:
// - Admin vào trang quản lý course
// - Sửa giá: 249000
// - Nhấn "Cập nhật"
// - Frontend gửi: PUT /api/courses/course123 + body: { price: 249000 }

    try {
        const courseId = req.params.id;
        // 📌 Lấy ID từ URL params

        // Prepare update data, ensure price is number if provided
        const updateData = { ...req.body };
        // 📌 Copy tất cả fields từ request body

        if (updateData.price !== undefined) {
        // 📌 Nếu có update price

            updateData.price = parseFloat(updateData.price);
            // 📌 Convert string → number
        }

        const updatedCourse = await Course.update(courseId, updateData);
        // 📌 GỌI MODEL ĐỂ UPDATE! ⭐
        // - Model sẽ:
        //   1. Tìm course theo ID
        //   2. Update các fields trong updateData
        //   3. Save vào Firestore
        //   4. Return updated course object

        res.status(200).json({
            success: true,
            data: updatedCourse.toJSON()
        });

    } catch (err) {
        console.error("Update Course Error:", err);

        if (err.message.includes('not found')) {
        // 📌 Nếu message lỗi chứa "not found"
        // - `.includes()` = kiểm tra string có chứa substring

            res.status(404).json({ success: false, error: err.message });
            // 📌 Status 404 = Not Found

        } else {
            res.status(400).json({ success: false, error: 'Failed to update course: ' + err.message });
            // 📌 Status 400 = Bad Request (lỗi validation, ...)
        }
    }
};

// ============================================================================
// FUNCTION 5: XÓA KHÓA HỌC (DELETE COURSE) - CASCADE DELETE!
// ============================================================================
// Delete course (Xóa khóa học và tất cả lessons/quizzes liên quan)
exports.deleteCourse = async (req, res) => {
// 📌 CASCADE DELETE - xóa course → tự động xóa tất cả nội dung liên quan
//
// 🎯 VÍ DỤ THỰC TẾ:
// Admin muốn xóa khóa học "JavaScript Cơ Bản":
// 1. Admin vào danh sách courses
// 2. Nhấn nút "Xóa" ở course "JavaScript Cơ Bản"
// 3. Popup xác nhận:
//    ┌──────────────────────────────────────┐
//    │ ⚠️  XÁC NHẬN XÓA KHÓA HỌC            │
//    ├──────────────────────────────────────┤
//    │ Bạn có chắc muốn xóa:                │
//    │ "JavaScript Cơ Bản"?                 │
//    │                                       │
//    │ ⚠️  Lưu ý:                            │
//    │ - Sẽ xóa 15 lessons                  │
//    │ - Sẽ xóa 2 quizzes (27 câu hỏi)     │
//    │ - KHÔNG THỂ hoàn tác!                │
//    │                                       │
//    │ [Hủy]  [Xóa]                         │
//    └──────────────────────────────────────┘
// 4. Admin nhấn "Xóa"
// 5. System thực hiện CASCADE DELETE:
//    Step 1: Xóa tất cả QUESTIONS trong mỗi QUIZ
//    Step 2: Xóa tất cả QUIZZES
//    Step 3: Xóa tất cả LESSONS
//    Step 4: Xóa COURSE
//
// 🔄 FLOW XÓA:
// Course (1)
//    ├─ Lessons (15)  ← Xóa đầu tiên
//    └─ Quizzes (2)
//         └─ Questions (27)  ← Xóa trước quizzes

    try {
        const courseId = req.params.id;

        // Check if course exists
        const course = await Course.findById(courseId);
        // 📌 GỌI MODEL ĐỂ TÌM COURSE! ⭐
        // - Kiểm tra course có tồn tại không trước khi xóa

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // 1. Delete all lessons related to this course
        const lessons = await Lesson.findByCourseId(courseId);
        // 📌 GỌI MODEL ĐỂ TÌM TẤT CẢ LESSONS! ⭐

        for (const lesson of lessons) {
        // 📌 `for...of` = vòng lặp duyệt qua từng phần tử trong array
        // - `const lesson` = từng lesson trong array lessons
        // - Dùng for...of thay vì forEach vì có thể dùng await

            await Lesson.delete(lesson.id);
            // 📌 GỌI MODEL ĐỂ XÓA LESSON! ⭐
            // - Xóa từng lesson một
            // - await = đợi xóa xong mới xóa cái tiếp theo
        }

        // 2. Delete all quizzes related to this course
        const Quiz = require('../models/Quiz');
        const Question = require('../models/Question');

        const quizzes = await Quiz.findByCourseId(courseId);
        // 📌 GỌI MODEL ĐỂ TÌM TẤT CẢ QUIZZES! ⭐

        for (const quiz of quizzes) {
            // Delete questions in each quiz
            const questions = await Question.findByQuizId(quiz.id);
            // 📌 GỌI MODEL ĐỂ TÌM TẤT CẢ QUESTIONS TRONG QUIZ! ⭐

            for (const question of questions) {
                await Question.delete(question.id);
                // 📌 GỌI MODEL ĐỂ XÓA QUESTION! ⭐
            }

            await Quiz.delete(quiz.id);
            // 📌 GỌI MODEL ĐỂ XÓA QUIZ! ⭐
        }

        // 3. Delete the course itself
        await Course.delete(courseId);
        // 📌 GỌI MODEL ĐỂ XÓA COURSE! ⭐
        // - Xóa cuối cùng sau khi đã xóa hết nội dung liên quan

        res.status(200).json({
            success: true,
            message: 'Course and all related content deleted successfully'
        });
        // 📌 Thông báo xóa thành công

    } catch (err) {
        console.error("Delete Course Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============================================================================
// FUNCTION 6: LẤY LESSONS CỦA 1 KHÓA HỌC (GET COURSE LESSONS)
// ============================================================================
// Get lessons for a course
exports.getCourseLessons = async (req, res) => {
// 📌 Lấy danh sách lessons của 1 course cụ thể
// - Dùng khi cần CHỈ lessons, không cần toàn bộ course data

    try {
        const courseId = req.params.id;

        const lessons = await Lesson.findByCourseId(courseId);
        // 📌 GỌI MODEL ĐỂ TÌM LESSONS! ⭐

        res.status(200).json({
            success: true,
            data: lessons.map(l => l.toJSON())
            // 📌 Convert array of Lesson objects → plain objects
        });

    } catch (err) {
        console.error("Get Course Lessons Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============================================================================
// FUNCTION 7: LẤY QUIZZES CỦA 1 KHÓA HỌC (GET COURSE QUIZZES)
// ============================================================================
// Get quizzes for a course
exports.getCourseQuizzes = async (req, res) => {
// 📌 Lấy danh sách quizzes của 1 course cụ thể

    try {
        const courseId = req.params.id;

        const Quiz = require('../models/Quiz');
        const quizzes = await Quiz.findByCourseId(courseId);
        // 📌 GỌI MODEL ĐỂ TÌM QUIZZES! ⭐

        res.status(200).json({
            success: true,
            data: quizzes.map(q => q.toJSON())
        });

    } catch (err) {
        console.error("Get Course Quizzes Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============================================================================
// 📚 TÓM TẮT FILE NÀY
// ============================================================================
// File courseController.js chứa 7 functions xử lý COURSES:
//
// 1. createCourse (POST /api/courses)
//    - Tạo course mới
//    - Chỉ admin/teacher
//    - parseFloat(price) để convert string → number
//    - Support dual naming (instructorId/teacher_id)
//    - Gọi Course.create()
//
// 2. getCourses (GET /api/courses)
//    - Lấy danh sách courses
//    - PUBLIC (ai cũng xem được)
//    - OPTIMIZED: Batch queries (3 queries thay vì N+1)
//    - Filters: category, price range, instructor name
//    - Client-side filtering cho price (Firestore không support range tốt)
//    - Gọi Course.getAllWithDetails(), Lesson.findByCourseIds()
//
// 3. getCourseById (GET /api/courses/:id)
//    - Lấy 1 course cụ thể
//    - Kèm: lessons, quizzes, teacher info
//    - Gọi Course.findById(), User.findById(), Lesson.findByCourseId(), Quiz.findByCourseId()
//
// 4. updateCourse (PUT /api/courses/:id)
//    - Cập nhật course
//    - Chỉ admin/teacher
//    - parseFloat(price) nếu có update price
//    - Gọi Course.update()
//
// 5. deleteCourse (DELETE /api/courses/:id)
//    - Xóa course
//    - Chỉ admin
//    - CASCADE DELETE: xóa course → lessons → quizzes → questions
//    - for...of loop để xóa từng item
//    - Gọi Course.delete(), Lesson.delete(), Quiz.delete(), Question.delete()
//
// 6. getCourseLessons (GET /api/courses/:id/lessons)
//    - Lấy lessons của course
//    - Gọi Lesson.findByCourseId()
//
// 7. getCourseQuizzes (GET /api/courses/:id/quizzes)
//    - Lấy quizzes của course
//    - Gọi Quiz.findByCourseId()
//
// ============================================================================
// 🔑 KEY CONCEPTS & KEYWORDS
// ============================================================================
// - `const` = khai báo biến không đổi
// - `let` = khai báo biến có thể đổi
// - `async/await` = xử lý bất đồng bộ
// - `req.body` = dữ liệu từ request body (POST/PUT)
// - `req.params` = URL parameters (:id, :slug)
// - `req.query` = query string (?category=programming&minPrice=0)
// - `res.status()` = set HTTP status code
// - `res.json()` = gửi response dạng JSON
// - `try...catch` = bắt lỗi
// - `parseFloat()` = convert string → number thập phân
// - `parseInt()` = convert string → integer
// - `...` (spread operator) = giải nén object/array
// - `||` (OR operator) = hoặc, fallback value
// - `&&` (AND operator) = và
// - `!` (NOT operator) = phủ định
// - `!==` = không bằng (so sánh chặt chẽ)
// - `>=`, `<=` = lớn hơn bằng, nhỏ hơn bằng
// - `.toLowerCase()` = convert thành chữ thường
// - `.includes()` = kiểm tra có chứa substring
// - `.map()` = duyệt và transform array
// - `.filter()` = lọc array theo điều kiện
// - `.forEach()` = duyệt array (không return)
// - `for...of` = vòng lặp duyệt array (có thể dùng await)
// - `.push()` = thêm phần tử vào array
// - `.toJSON()` = convert object → plain object
//
// ============================================================================
// 📊 OPTIMIZATION TECHNIQUES
// ============================================================================
// 1. BATCH QUERIES: Lấy nhiều items cùng lúc thay vì từng cái
//    - Course.getAllWithDetails() lấy courses + teachers trong 2-3 queries
//    - Lesson.findByCourseIds() lấy tất cả lessons cùng lúc
//
// 2. IN-MEMORY JOIN: Join data trong RAM thay vì database
//    - Group lessons by courseId trong lessonsByCourse object
//    - Attach lessons vào courses bằng .map()
//
// 3. CLIENT-SIDE FILTERING: Lọc data ở controller thay vì database
//    - Price range filtering (.filter())
//    - Instructor name search (.includes())
//
// 4. LAZY LOADING: Import module khi cần
//    - const Quiz = require('./Quiz') chỉ khi cần dùng Quiz
//
// ============================================================================
