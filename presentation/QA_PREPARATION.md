# 🎯 Q&A Preparation - Các câu hỏi thường gặp

## 1. DATABASE & ARCHITECTURE

### ❓ Tại sao chọn Firebase Firestore (NoSQL) thay vì SQL?

**Trả lời:**
> "Chúng em chọn Firebase Firestore vì những lý do sau:
>
> 1. **Flexible Schema**: Dữ liệu LMS thường xuyên thay đổi cấu trúc (thêm fields mới cho courses, lessons). NoSQL cho phép thay đổi schema mà không cần migration.
>
> 2. **Real-time Sync**: Firestore hỗ trợ real-time listeners, phù hợp cho việc cập nhật tiến độ học tập ngay lập tức.
>
> 3. **Scalability**: Firestore auto-scale theo nhu cầu, không cần quản lý server database.
>
> 4. **Serverless**: Không cần setup database server, tiết kiệm thời gian deployment.
>
> 5. **Nested Data**: Courses chứa lessons, quizzes chứa questions - NoSQL lưu nested data tự nhiên hơn.
>
> 6. **Free Tier**: Firebase cung cấp free tier đủ cho học tập và demo."

**Nếu hỏi thêm về nhược điểm:**
> "NoSQL có nhược điểm là không có JOIN như SQL, nên em phải query nhiều lần. Em giải quyết bằng cách denormalize data và cache ở frontend."

---

### ❓ Tại sao không dùng MongoDB?

**Trả lời:**
> "MongoDB cũng là lựa chọn tốt, nhưng Firestore có:
> - Tích hợp sẵn với Firebase Auth
> - Real-time listeners built-in
> - Không cần setup server (MongoDB Atlas cần config nhiều hơn)
> - Security rules dễ viết hơn"

---

### ❓ Giải thích kiến trúc MVC của project?

**Trả lời:**
> "Project theo kiến trúc MVC:
> - **Model** (`server/models/`): 15 models như User, Course, Lesson... xử lý CRUD với Firestore
> - **View** (`views/`): EJS templates render HTML
> - **Controller** (`server/controllers/`): 16 controllers xử lý business logic
> - **Routes** (`server/routes/`): Định nghĩa API endpoints, kết nối URL với Controller"

---

## 2. AUTHENTICATION & SECURITY

### ❓ Giải thích cách authentication hoạt động?

**Trả lời:**
> "Em sử dụng 2 phương thức:
>
> 1. **JWT (JSON Web Token)**:
>    - User đăng nhập → Server tạo JWT token
>    - Token lưu ở localStorage
>    - Mỗi request gửi token trong header `Authorization: Bearer <token>`
>    - Middleware verify token trước khi xử lý request
>
> 2. **Google OAuth 2.0**:
>    - User click 'Sign in with Google'
>    - Redirect đến Google consent screen
>    - Google trả về user info
>    - Server tạo/update user và trả JWT token"

---

### ❓ Làm sao bảo vệ API endpoints?

**Trả lời:**
> "Em dùng middleware `authMiddleware.js`:
> ```javascript
> // Verify JWT token
> const decoded = jwt.verify(token, process.env.JWT_SECRET);
> req.user = decoded;
> ```
> - Endpoints public: `/api/courses` (GET)
> - Endpoints protected: `/api/users`, `/api/progress`
> - Role-based: Admin-only endpoints check `req.user.role === 'admin'`"

---

### ❓ Password được lưu như thế nào?

**Trả lời:**
> "Password được hash bằng **bcrypt** trước khi lưu vào database:
> ```javascript
> const hashedPassword = await bcrypt.hash(password, 10);
> ```
> Khi đăng nhập, so sánh bằng `bcrypt.compare()`. Password gốc không bao giờ được lưu."

---

## 3. FEATURES & FUNCTIONALITY

### ❓ Giải thích hệ thống Role-based Access Control?

**Trả lời:**
> "UniLearn có 3 roles:
>
> | Role | Permissions |
> |------|-------------|
> | **Student** | Xem courses, enroll, học, làm quiz |
> | **Teacher** | Tất cả Student + tạo/edit courses |
> | **Admin** | Tất cả + quản lý users, change roles |
>
> Middleware kiểm tra role trước khi cho phép truy cập:
> ```javascript
> if (req.user.role !== 'admin') {
>     return res.status(403).json({ error: 'Access denied' });
> }
> ```"

---

### ❓ Progress tracking hoạt động như thế nào?

**Trả lời:**
> "Khi student hoàn thành lesson:
> 1. Frontend gọi `POST /api/progress/lesson`
> 2. Server lưu record vào collection `progress`
> 3. Tính % hoàn thành = (lessons completed / total lessons) × 100
> 4. Khi 100% → Tự động tạo certificate"

---

### ❓ Quiz system hoạt động như thế nào?

**Trả lời:**
> "Quiz flow:
> 1. Teacher tạo quiz với nhiều questions (multiple choice, true/false)
> 2. Student submit answers
> 3. Server so sánh với correct answers
> 4. Tính điểm và lưu vào `grades` collection
> 5. Hiển thị kết quả và đáp án đúng"

---

## 4. TECHNICAL IMPLEMENTATION

### ❓ Tại sao dùng EJS thay vì React/Vue?

**Trả lời:**
> "Em chọn EJS (Server-side rendering) vì:
> 1. **Đơn giản hơn** cho project học tập
> 2. **SEO-friendly** - HTML render sẵn từ server
> 3. **Không cần build step** - deploy trực tiếp
> 4. **Learning curve thấp** - chỉ cần biết HTML + JS
>
> Nếu scale lớn hơn, em sẽ migrate sang React/Next.js."

---

### ❓ Upload file hoạt động như thế nào?

**Trả lời:**
> "Em dùng 2 phương pháp:
>
> 1. **Images** → Cloudinary (cloud storage)
>    - Upload qua Cloudinary API
>    - Trả về URL lưu vào database
>
> 2. **Videos** → Local storage (`/uploads/videos/`)
>    - Dùng `multer` middleware
>    - Lưu file vào server
>    - Videos lớn nên không upload cloud (tốn phí)"

---

### ❓ Stripe payment integration?

**Trả lời:**
> "Flow thanh toán:
> 1. User chọn subscription plan
> 2. Frontend tạo Stripe Checkout Session
> 3. Redirect đến Stripe payment page
> 4. Sau khi thanh toán, Stripe redirect về success URL
> 5. Webhook cập nhật order status trong database"

---

## 5. CHALLENGES & SOLUTIONS

### ❓ Khó khăn lớn nhất khi làm project?

**Trả lời:**
> "1. **NoSQL Relationships**: Firestore không có JOIN, em phải query nhiều collections và combine data ở backend.
>
> 2. **Progress Calculation**: Tính % hoàn thành phức tạp khi có cả lessons và quizzes.
>
> 3. **File Upload**: Handle video upload lớn, cần streaming và progress bar.
>
> 4. **Role-based UI**: Hiển thị UI khác nhau cho Student/Teacher/Admin."

---

### ❓ Nếu có thêm thời gian, sẽ cải thiện gì?

**Trả lời:**
> "1. **Unit Tests** với Jest
> 2. **Real-time chat** cho Q&A
> 3. **Mobile responsive** tốt hơn
> 4. **Caching** với Redis
> 5. **CI/CD pipeline** với GitHub Actions"

---

## 6. DEPLOYMENT & SCALABILITY

### ❓ Deploy project như thế nào?

**Trả lời:**
> "Em có thể deploy lên:
> - **Vercel**: Serverless, free tier tốt
> - **Railway**: Easy Node.js hosting
> - **Render**: Free tier với sleep mode
>
> Config trong `vercel.json` đã sẵn sàng."

---

### ❓ Project có thể scale như thế nào?

**Trả lời:**
> "1. **Database**: Firestore tự động scale
> 2. **Server**: Deploy lên multiple instances với load balancer
> 3. **Static files**: CDN (Cloudinary đã dùng)
> 4. **Caching**: Thêm Redis cho session và frequent queries"

---

## 7. CODE QUALITY

### ❓ Làm sao đảm bảo code quality?

**Trả lời:**
> "1. **Cấu trúc rõ ràng**: MVC pattern, tách routes/controllers/models
> 2. **Error handling**: Try-catch trong mọi async function
> 3. **Validation**: Validate input trước khi xử lý
> 4. **Comments**: JSDoc cho các functions quan trọng
> 5. **Git**: Commit messages rõ ràng, feature branches"

---

### ❓ Testing strategy?

**Trả lời:**
> "Do thời gian hạn chế, em dùng:
> 1. **Manual testing**: Test từng feature trên browser
> 2. **API testing**: Postman để test endpoints
> 3. **Console logging**: Debug trong development
>
> Nếu có thêm thời gian, sẽ thêm Jest unit tests."

---

## 💡 Tips trả lời:

1. **Trả lời ngắn gọn** - 30-60 giây mỗi câu
2. **Đưa ví dụ cụ thể** từ code
3. **Thừa nhận limitations** - cho thấy bạn hiểu project
4. **Đề xuất improvements** - cho thấy bạn có vision

## 🎯 Câu hỏi trap thường gặp:

- "Tại sao không dùng X?" → Giải thích trade-offs
- "Làm sao handle Y?" → Nếu chưa làm, nói "Đó là hướng phát triển"
- "Security issues?" → Thừa nhận và đề xuất giải pháp
