# 🗣️ Vietnamese Presentation Script (Bản Tiếng Việt)

## ⏱️ Phân Bổ Thời Gian (10 phút)
| Phần | Thời gian | Tích lũy |
|------|-----------|----------|
| Giới thiệu | 1 phút | 1:00 |
| Vấn đề & Giải pháp | 1.5 phút | 2:30 |
| Demo trực tiếp | 4 phút | 6:30 |
| Kiến trúc kỹ thuật | 2 phút | 8:30 |
| Kết luận | 1.5 phút | 10:00 |

---

## 📍 SLIDE 1: Trang Tiêu Đề (30 giây)

**Nói:**
> "Xin chào quý thầy cô và các bạn. Em tên là Phạm Trần Gia Huy, mã số sinh viên GCS220124. Hôm nay em sẽ trình bày đồ án tốt nghiệp của mình: UniLearn - Hệ Thống Quản Lý Học Tập Trực Tuyến Toàn Diện."

**Hiển thị:** Logo, URL: https://unilearn.huy.global/

---

## 📍 SLIDE 2: Vấn Đề (1 phút)

**Nói:**
> "Đại dịch COVID-19 đã thúc đẩy giáo dục trực tuyến phát triển nhanh chóng, nhưng các nền tảng hiện có gặp nhiều vấn đề:
> 
> 1. **Phân mảnh** - Sinh viên phải sử dụng 4-5 công cụ khác nhau: một để xem bài giảng, một để làm bài kiểm tra, một để lấy chứng chỉ
> 2. **Chi phí cao** - Các hệ thống như Canvas có giá $60-180 mỗi người dùng mỗi năm
> 3. **Trải nghiệm kém** - Các hệ thống như Moodle có giao diện lỗi thời, khó sử dụng
> 
> UniLearn giải quyết vấn đề này bằng cách cung cấp một nền tảng TẤT CẢ TRONG MỘT: hiện đại, giá cả phải chăng và dễ sử dụng."

---

## 📍 SLIDE 3: Tính Năng Chính (30 giây)

**Nói:**
> "UniLearn cung cấp 8 module chính:
> - Xác thực người dùng với Google OAuth
> - Quản lý khóa học với bài giảng video
> - Bài kiểm tra với chấm điểm tự động
> - Tạo chứng chỉ tự động
> - Tích hợp thanh toán Stripe
> - Tính năng cộng đồng với bảng xếp hạng
> - Dashboard quản trị
> - Hệ thống đăng ký Pro"

---

## 📍 DEMO TRỰC TIẾP (4 phút)

### Thứ tự Demo:

#### 1️⃣ Trang Landing (30 giây)
- Mở https://unilearn.huy.global/
- Chỉ vào animation 3D Spline
- Giới thiệu responsive design, dark mode
- Click "Get Started"

**Nói:** "Đây là trang chủ với thiết kế hiện đại, background 3D và hỗ trợ dark mode"

#### 2️⃣ Đăng Nhập (30 giây)
- Hiển thị trang Login
- Click "Sign in with Google"
- Hoặc đăng nhập với tài khoản test

**Nói:** "Hệ thống hỗ trợ đăng nhập với Google OAuth hoặc email/password. Token JWT được lưu an toàn, mật khẩu được mã hóa bằng bcrypt"

#### 3️⃣ Danh Sách Khóa Học (45 giây)
- Duyệt trang courses
- Sử dụng search/filter
- Click vào một khóa học
- Xem video bài giảng
- Click "Mark as Complete"

**Nói:** "Sinh viên có thể tìm kiếm, lọc khóa học theo danh mục. Mỗi bài học có video và tiến độ được theo dõi tự động"

#### 4️⃣ Hệ Thống Quiz (45 giây)
- Vào một quiz
- Trả lời 2-3 câu hỏi
- Submit và xem kết quả

**Nói:** "Hệ thống chấm điểm tự động ngay lập tức. Điểm được lưu vào database và hiển thị trong dashboard của sinh viên"

#### 5️⃣ Chứng Chỉ (30 giây)
- Vào "My Learning" → Certificates
- Hiển thị chứng chỉ
- Download PDF

**Nói:** "Khi hoàn thành khóa học, hệ thống tự động tạo chứng chỉ PDF chuyên nghiệp sử dụng Puppeteer"

#### 6️⃣ Thanh Toán (30 giây)
- Click "Upgrade to Pro"
- Hiển thị Stripe Checkout

**Nói:** "Thanh toán được xử lý qua Stripe. Thông tin thẻ không bao giờ đi qua server của chúng ta, đảm bảo tuân thủ PCI DSS"

#### 7️⃣ Admin Dashboard (30 giây)
- Đăng nhập admin
- Hiển thị thống kê
- Hiển thị quản lý user

**Nói:** "Admin có thể xem thống kê toàn hệ thống, quản lý người dùng và khóa học. Phân quyền RBAC đảm bảo chỉ admin mới truy cập được"

---

## 📍 SLIDE 4: Kiến Trúc Kỹ Thuật (1.5 phút)

**Nói:**
> "UniLearn sử dụng kiến trúc MVC:
> 
> **Frontend:**
> - EJS templating cho server-side rendering
> - Tailwind CSS cho responsive design
> - Vanilla JavaScript cho tương tác
> 
> **Backend:**
> - Node.js với Express.js framework
> - RESTful API với 97 endpoints
> - JWT cho authentication
> 
> **Database:**
> - Firebase Firestore - NoSQL document database
> - 16 collections: Users, Courses, Quizzes, Certificates...
> 
> **Cloud Services:**
> - Vercel cho serverless deployment với CI/CD
> - Cloudinary CDN cho hình ảnh và video
> - Stripe cho xử lý thanh toán
> - Nodemailer cho gửi email"

---

## 📍 SLIDE 5: Bảo Mật (30 giây)

**Nói:**
> "Bảo mật là ưu tiên hàng đầu. Em đã implement:
> - Tuân thủ OWASP Top 10
> - Mã hóa mật khẩu bcrypt với 12 salt rounds
> - HTTPS toàn bộ qua Vercel
> - Phân quyền RBAC (Student, Teacher, Admin)
> - Tuân thủ PCI DSS qua Stripe tokenization"

---

## 📍 SLIDE 6: Kiểm Thử (30 giây)

**Nói:**
> "Kết quả kiểm thử xác nhận độ tin cậy của hệ thống:
> - 100% requirements pass
> - Response time dưới 500ms với 100 concurrent users
> - Không có lỗ hổng bảo mật nghiêm trọng trong OWASP ZAP scan
> - Tương thích đa trình duyệt: Chrome, Firefox, Safari, Edge"

---

## 📍 SLIDE 7: Kết Luận (1 phút)

**Nói:**
> "Tóm lại, UniLearn đã đạt được:
> 
> ✅ Nền tảng LMS hoàn chỉnh, tích hợp
> ✅ Tech stack hiện đại theo chuẩn công nghiệp
> ✅ Thanh toán và xác thực an toàn
> ✅ Kiến trúc cloud-native có khả năng mở rộng
> 
> **Hướng phát triển tương lai** có thể bao gồm:
> - Ứng dụng mobile native
> - AI đề xuất khóa học
> - Video conferencing real-time
> 
> Hệ thống đang hoạt động tại **unilearn.huy.global**
> 
> Cảm ơn thầy cô đã lắng nghe. Em sẵn sàng trả lời câu hỏi."

---

## 🇻🇳 Một Số Câu Hỏi Bằng Tiếng Việt

### Câu hỏi: Tại sao em chọn Node.js?
**Trả lời:**
> "Em chọn Node.js vì:
> 1. JavaScript cả frontend và backend - giảm context switching
> 2. Non-blocking I/O - phù hợp cho ứng dụng real-time
> 3. NPM ecosystem phong phú với hàng nghìn packages
> 4. Được sử dụng bởi Netflix, LinkedIn - đã được chứng minh trong production"

### Câu hỏi: Firestore hay SQL?
**Trả lời:**
> "Em chọn Firestore NoSQL vì:
> 1. Không cần schema migrations - phát triển nhanh hơn
> 2. Tự động scale - không cần cấu hình
> 3. Free tier đủ cho development
> 4. Tích hợp tốt với Firebase ecosystem
> 
> Tuy nhiên, em nhận thức được trade-offs như limited query capabilities và có thể cần migrate sang PostgreSQL nếu scale lớn"

### Câu hỏi: Khó khăn lớn nhất?
**Trả lời:**
> "Khó khăn lớn nhất là tích hợp Google OAuth. Ban đầu callback bị lỗi vì passport strategy được gọi trước khi Firebase khởi tạo xong. Em đã debug bằng cách thêm logging và phát hiện thứ tự initialization quan trọng. Bài học rút ra là luôn chú ý đến dependency order trong Node.js"

### Câu hỏi: Em học được gì từ project này?
**Trả lời:**
> "Em học được rất nhiều:
> - **Kỹ thuật:** OAuth 2.0, payment gateway, cloud deployment
> - **Software Engineering:** API-first design, security by design
> - **Project Management:** Scope management, version control
> - **Professional:** Third-party API integration, production vs development differences"

---

## 💡 Mẹo Trả Lời Câu Hỏi

1. **Nếu không biết:** "Đây là câu hỏi hay. Em chưa implement tính năng này, nhưng em sẽ approach bằng cách..."

2. **Nếu câu hỏi không rõ:** "Thầy/cô có thể giải thích rõ hơn ạ?"

3. **Giữ câu trả lời ngắn gọn:** 1-2 phút mỗi câu

4. **Thành thật về limitations:** Cho thấy sự trưởng thành và tự nhận thức

---

**Chúc bạn thành công! 💪**
