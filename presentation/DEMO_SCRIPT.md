# 🎤 Demo Script - UniLearn (2 phút)

## Chuẩn bị trước demo:
- [ ] Mở sẵn localhost:5000
- [ ] Đăng nhập sẵn tài khoản Admin
- [ ] Mở thêm 1 tab incognito cho Student demo
- [ ] Tắt notifications trên máy
- [ ] Zoom browser 100-125%

---

## Demo Flow (2 phút):

### 1. Trang chủ (15 giây)
> "Đây là trang chủ UniLearn với thiết kế modern, responsive. Có thể thấy các khóa học nổi bật, thống kê, và navigation rõ ràng."

**Actions:**
- Scroll nhẹ để show layout
- Toggle Dark mode (nếu có thời gian)

---

### 2. Đăng nhập Google OAuth (15 giây)
> "Hệ thống hỗ trợ đăng nhập bằng Google OAuth 2.0, đảm bảo bảo mật và tiện lợi cho người dùng."

**Actions:**
- Click "Login with Google"
- Chọn account
- Show redirect về trang chủ với user info

---

### 3. Courses Page (20 giây)
> "Đây là trang danh sách khóa học. Học viên có thể filter theo category, search, và xem chi tiết từng khóa học."

**Actions:**
- Show list courses với thumbnails
- Click vào 1 course để xem details

---

### 4. Course Detail & Learning (30 giây)
> "Khi vào khóa học, học viên thấy danh sách bài học bên trái, video/nội dung bên phải. Có nút Mark as Complete để theo dõi tiến độ."

**Actions:**
- Show sidebar với lessons
- Play video (click nút play xanh)
- Click "Mark as Complete"
- Show progress bar update

---

### 5. Quiz (20 giây)
> "Quiz system cho phép kiểm tra kiến thức. Có multiple choice, true/false. Sau khi submit sẽ thấy điểm và đáp án đúng."

**Actions:**
- Mở 1 quiz
- Trả lời vài câu
- Submit và show kết quả

---

### 6. Admin Dashboard (20 giây)
> "Admin Dashboard quản lý toàn bộ hệ thống: users, courses, blogs, orders. Có thể thay đổi role user trực tiếp bằng cách click vào badge role."

**Actions:**
- Show User Management
- Click vào role badge → dropdown đổi role
- Show Blog Management với thumbnails
- Show Course Management với images

---

## Backup Plans:

### Nếu login fail:
> "Do demo environment, em sẽ show tài khoản đã đăng nhập sẵn."

### Nếu video không load:
> "Video được lưu local/Cloudinary. Em sẽ show một bài học text thay thế."

### Nếu hết thời gian:
> "Các chức năng khác như Teacher Dashboard, Payment có thể demo trong phần Q&A nếu cần."

---

## 🎯 Key points to mention:

1. **3 Roles**: Student, Teacher, Admin
2. **Real progress tracking**: % completion
3. **Responsive design**: Works on mobile
4. **Modern UI**: TailwindCSS, Dark mode
5. **Security**: JWT + Google OAuth
