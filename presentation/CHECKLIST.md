# 📋 Presentation Checklist - UniLearn

## 🔧 Trước ngày thuyết trình

### Chuẩn bị kỹ thuật
- [ ] Test localhost hoạt động bình thường
- [ ] Đảm bảo database có dữ liệu demo đầy đủ
- [ ] Kiểm tra tất cả accounts (Admin, Teacher, Student)
- [ ] Test Google OAuth login
- [ ] Kiểm tra videos load được
- [ ] Test tất cả features chính

### Chuẩn bị nội dung
- [ ] Đọc kỹ SLIDE_OUTLINE.md
- [ ] Học thuộc QA_PREPARATION.md
- [ ] Thực hành DEMO_SCRIPT.md 2-3 lần
- [ ] Chuẩn bị laptop backup (nếu có)

### Tài khoản demo
```
Admin:
- Email: admin@gmail.com
- Password: [your password]

Teacher:
- Email: teacher@gmail.com  
- Password: [your password]

Student:
- Email: student@gmail.com
- Password: [your password]
```

---

## 📅 Ngày thuyết trình

### 30 phút trước
- [ ] Khởi động laptop, mở project
- [ ] Run `npm start`
- [ ] Mở browser, test localhost:5000
- [ ] Đăng nhập sẵn Admin account
- [ ] Mở thêm tab incognito (cho demo Student)
- [ ] Tắt notifications
- [ ] Set browser zoom 100-125%
- [ ] Chuẩn bị nước uống

### 10 phút trước
- [ ] Kiểm tra kết nối internet
- [ ] Kiểm tra projector/màn hình
- [ ] Test microphone (nếu có)
- [ ] Mở sẵn các tab cần thiết:
  - Tab 1: Home page
  - Tab 2: Admin Dashboard (đã login)
  - Tab 3: Incognito - Login page

---

## 🎤 Trong lúc thuyết trình

### Intro (30 giây)
- [ ] Chào giảng viên
- [ ] Giới thiệu tên project: UniLearn
- [ ] Nói ngắn gọn mục tiêu

### Slides (7-8 phút)
- [ ] Vấn đề & Giải pháp
- [ ] Kiến trúc hệ thống
- [ ] Tech stack
- [ ] Cấu trúc thư mục
- [ ] Database design
- [ ] Các chức năng chính

### Demo (2 phút)
- [ ] Trang chủ
- [ ] Login (Google OAuth)
- [ ] Courses list
- [ ] Course detail & learning
- [ ] Admin Dashboard

### Kết thúc (30 giây)
- [ ] Tổng kết những gì đã làm
- [ ] Hướng phát triển
- [ ] "Xin mời thầy/cô đặt câu hỏi"

---

## ❓ Q&A (20 phút)

### Câu hỏi hay gặp (đã chuẩn bị)
- [x] Tại sao chọn Firestore NoSQL?
- [x] Giải thích authentication flow?
- [x] Tại sao không dùng React/Vue?
- [x] Role-based access control?
- [x] Progress tracking hoạt động?
- [x] Khó khăn khi làm project?
- [x] Hướng phát triển?

### Tips trả lời
- Trả lời ngắn gọn 30-60 giây
- Đưa ví dụ từ code nếu cần
- Nếu không biết: "Em chưa implement, đó là hướng phát triển"
- Thừa nhận limitations, đề xuất solutions

---

## 🚨 Backup Plans

### Nếu localhost không chạy
```bash
# Restart server
npm start

# Nếu port bị chiếm
npx kill-port 5000
npm start
```

### Nếu database error
- Show code structure thay vì demo live
- Giải thích từ slides

### Nếu Google OAuth fail
- Dùng email/password login
- "Do environment demo..."

### Nếu hết thời gian
- Skip demo chi tiết
- Tập trung Q&A
- Offer demo sau nếu cần

---

## 🎯 Key Messages (Nhớ nhắc!)

1. **Full-stack project** - Frontend + Backend + Database
2. **3 User roles** - Student, Teacher, Admin
3. **Real features** - Progress tracking, certificates
4. **Modern tech** - Node.js, Firebase, TailwindCSS
5. **Security** - JWT, OAuth, bcrypt
6. **Scalable** - NoSQL, cloud services

---

## ✅ Sau thuyết trình

- [ ] Cảm ơn giảng viên
- [ ] Lưu feedback để cải thiện
- [ ] Commit code cuối cùng lên GitHub
- [ ] Celebrate! 🎉
