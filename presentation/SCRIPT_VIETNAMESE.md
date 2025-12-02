# 🇻🇳 Script Thuyết Trình Tiếng Việt (10 phút)

## Mở đầu (30 giây)

> "Xin chào thầy/cô và các bạn. Hôm nay em xin trình bày về đồ án **UniLearn** - một hệ thống quản lý học tập trực tuyến (LMS) được xây dựng bằng Node.js và Firebase."

---

## Phần 1: Giới thiệu vấn đề (1 phút)

> "Trong bối cảnh giáo dục trực tuyến ngày càng phát triển, em nhận thấy cần có một nền tảng:
>
> - Cho phép **học sinh** học tập linh hoạt, theo dõi tiến độ
> - Cho phép **giáo viên** dễ dàng tạo và quản lý khóa học
> - Cho phép **admin** quản lý toàn bộ hệ thống
>
> Từ đó, em đã xây dựng UniLearn với đầy đủ các chức năng của một LMS."

---

## Phần 2: Kiến trúc hệ thống (1.5 phút)

> "UniLearn được xây dựng theo kiến trúc **MVC** gồm:
>
> - **Frontend**: Sử dụng EJS template engine và TailwindCSS
> - **Backend**: Node.js với Express.js framework
> - **Database**: Firebase Firestore - một NoSQL database
>
> Lý do em chọn Firestore thay vì SQL là vì:
> 1. Schema linh hoạt - dễ thay đổi cấu trúc dữ liệu
> 2. Hỗ trợ real-time sync
> 3. Tự động scale
> 4. Tích hợp sẵn với Firebase Auth"

---

## Phần 3: Cấu trúc dự án (1 phút)

> "Dự án được tổ chức rõ ràng:
>
> - Thư mục **controllers** chứa 16 file xử lý logic
> - Thư mục **models** chứa 15 data models
> - Thư mục **routes** định nghĩa API endpoints
> - Thư mục **views** chứa các trang EJS
>
> Mỗi feature được tách riêng, dễ maintain và mở rộng."

---

## Phần 4: Các chức năng chính (2 phút)

> "UniLearn có 3 loại người dùng với các chức năng khác nhau:
>
> **Học sinh** có thể:
> - Đăng ký, đăng nhập bằng email hoặc Google
> - Xem và ghi danh khóa học
> - Học bài, xem video
> - Làm quiz và xem điểm
> - Theo dõi tiến độ học tập
> - Nhận chứng chỉ khi hoàn thành
>
> **Giáo viên** có thêm:
> - Tạo và quản lý khóa học
> - Upload bài học với video, text
> - Tạo quiz với nhiều loại câu hỏi
>
> **Admin** có thể:
> - Quản lý tất cả users
> - Thay đổi role người dùng trực tiếp
> - Quản lý blogs, orders"

---

## Phần 5: Database Design (1 phút)

> "Database gồm 14 collections chính:
>
> - **users** - lưu thông tin người dùng
> - **courses** - khóa học
> - **lessons** - bài học thuộc khóa học
> - **quizzes** và **questions** - bài kiểm tra
> - **enrollments** - ghi danh
> - **progress** - tiến độ học
> - **grades** - điểm quiz
> - **certificates** - chứng chỉ
>
> Các collections liên kết với nhau qua ID references."

---

## Phần 6: Demo (2 phút)

> "Em xin demo nhanh các chức năng chính..."

*(Thực hiện demo theo DEMO_SCRIPT.md)*

> "Đây là trang chủ với giao diện modern..."
> 
> "Login bằng Google OAuth..."
>
> "Danh sách khóa học với filter và search..."
>
> "Khi vào học, có video player với nút play, progress tracking..."
>
> "Admin Dashboard để quản lý users, có thể đổi role trực tiếp..."

---

## Phần 7: Kết luận (30 giây)

> "Tóm lại, UniLearn là một hệ thống LMS hoàn chỉnh với:
>
> - Hệ thống phân quyền 3 roles
> - Hơn 50 API endpoints
> - Authentication đa phương thức
> - Giao diện responsive với Dark mode
>
> Hướng phát triển tiếp theo sẽ là: real-time chat, mobile app, và AI recommendations.
>
> Em xin kết thúc phần trình bày. Xin mời thầy/cô đặt câu hỏi ạ."

---

## 💡 Lưu ý khi nói:

1. **Nói chậm, rõ ràng** - không vội
2. **Nhìn vào giảng viên** - không nhìn màn hình suốt
3. **Tự tin** - bạn hiểu project của mình
4. **Không đọc slide** - nói tự nhiên
5. **Dừng lại giữa các phần** - cho người nghe tiếp thu

## ⏱️ Phân bổ thời gian:

| Phần | Thời gian |
|------|-----------|
| Mở đầu | 0:30 |
| Vấn đề | 1:00 |
| Kiến trúc | 1:30 |
| Cấu trúc | 1:00 |
| Chức năng | 2:00 |
| Database | 1:00 |
| Demo | 2:00 |
| Kết luận | 0:30 |
| **Tổng** | **10:00** |
