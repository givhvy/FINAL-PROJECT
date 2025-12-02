# 🆘 Emergency Answers - Câu hỏi khó & Trap Questions

## 🔴 Câu hỏi "Trap" thường gặp

### 1. "Tại sao không dùng TypeScript?"

**Trả lời:**
> "JavaScript đủ cho scope của project này. TypeScript sẽ thêm complexity và build step. Tuy nhiên, nếu project scale lớn hơn, em sẽ migrate sang TypeScript để có type safety và better IDE support."

---

### 2. "Security có vấn đề gì không?"

**Trả lời:**
> "Em đã implement các biện pháp cơ bản:
> - Password hashing với bcrypt
> - JWT tokens với expiry
> - Input validation
> - Role-based access control
>
> Tuy nhiên, nếu deploy production thực sự, cần thêm:
> - Rate limiting
> - HTTPS enforcement
> - Security headers (helmet.js)
> - Input sanitization chống XSS"

---

### 3. "NoSQL không có ACID, làm sao đảm bảo data consistency?"

**Trả lời:**
> "Firestore có hỗ trợ **transactions** cho các operations cần atomicity. Ví dụ khi tạo enrollment, em có thể dùng batch writes để đảm bảo cả enrollment và progress được tạo cùng lúc.
>
> Tuy nhiên, với scope của LMS này, eventual consistency của Firestore là đủ vì không có critical financial transactions."

---

### 4. "Tại sao không viết Unit Tests?"

**Trả lời:**
> "Do thời gian hạn chế, em ưu tiên hoàn thành features trước. Testing hiện tại là manual và API testing với Postman.
>
> Nếu có thêm thời gian, em sẽ thêm:
> - Jest cho unit tests
> - Supertest cho API integration tests
> - Test coverage cho các models và controllers"

---

### 5. "Code có thể scale không? Nếu có 1 triệu users thì sao?"

**Trả lời:**
> "Kiến trúc hiện tại có thể scale:
> - **Firestore** tự động scale
> - **Cloudinary** là CDN toàn cầu
> - **Stateless server** có thể chạy multiple instances
>
> Để handle 1 triệu users, cần thêm:
> - Load balancer
> - Redis caching
> - Database indexing optimization
> - CDN cho static files"

---

### 6. "Tại sao dùng EJS mà không dùng React?"

**Trả lời:**
> "Em chọn EJS vì:
> 1. Server-side rendering tốt cho SEO
> 2. Đơn giản hơn, không cần build step
> 3. Đủ cho requirements của project
>
> React sẽ phù hợp nếu cần:
> - Rich interactivity
> - Single Page Application
> - Mobile app với React Native"

---

### 7. "Làm sao handle concurrent users editing same data?"

**Trả lời:**
> "Hiện tại em dùng **last-write-wins** strategy. Nếu cần handle concurrent editing:
> - Dùng Firestore transactions
> - Implement optimistic locking với version field
> - Real-time listeners để sync data"

---

### 8. "Password reset có secure không?"

**Trả lời:**
> "Flow hiện tại:
> 1. User request reset
> 2. Server tạo random 6-digit code
> 3. Code được gửi qua email
> 4. Code có expiry time
> 5. User nhập code để reset password
>
> Để secure hơn có thể dùng:
> - Longer token (UUID)
> - Shorter expiry (15 phút)
> - One-time use tokens"

---

### 9. "Tại sao store JWT ở localStorage? Có XSS risk không?"

**Trả lời:**
> "Đúng là localStorage có XSS risk. Alternatives:
> - **HttpOnly cookies**: Secure hơn nhưng cần handle CSRF
> - **Memory**: Mất khi refresh
>
> Với project này, em chọn localStorage vì đơn giản. Production nên dùng HttpOnly cookies với CSRF protection."

---

### 10. "Nếu làm lại từ đầu, sẽ làm khác gì?"

**Trả lời:**
> "Em sẽ:
> 1. Dùng TypeScript từ đầu
> 2. Viết tests song song với features
> 3. Dùng React/Next.js cho frontend
> 4. Setup CI/CD từ đầu
> 5. Document API với Swagger"

---

## 🟡 Câu hỏi về Features chưa có

### "Có real-time notifications không?"
> "Chưa implement. Có thể dùng Firebase Cloud Messaging hoặc Socket.io"

### "Có mobile app không?"
> "Chưa có. Giao diện web đã responsive. Có thể phát triển React Native app"

### "Có analytics dashboard không?"
> "Dashboard hiện tại show basic stats. Có thể tích hợp với Google Analytics hoặc custom analytics"

### "Có video conferencing không?"
> "Chưa có. Có thể tích hợp Zoom API hoặc WebRTC"

---

## 🟢 Câu hỏi dễ - Trả lời tự tin

### "Project mất bao lâu?"
> "Khoảng X tuần, làm việc Y giờ/tuần"

### "Làm một mình hay team?"
> "Em làm một mình / Team X người"

### "Học được gì từ project?"
> "Full-stack development, database design, authentication, deployment, project management"

### "Phần nào khó nhất?"
> "Progress tracking system vì phải tính toán % completion chính xác với cả lessons và quizzes"

### "Phần nào thích nhất?"
> "Admin dashboard với role management - click trực tiếp để đổi role rất tiện"

---

## 🎯 Golden Rules khi trả lời:

1. **Không nói "Em không biết"** → Nói "Em chưa implement, đó là hướng phát triển"

2. **Thừa nhận limitations** → Cho thấy bạn hiểu hệ thống

3. **Đề xuất solutions** → Cho thấy bạn có khả năng problem-solving

4. **Keep it short** → 30-60 giây mỗi câu, không lan man

5. **Be honest** → Nếu thực sự không biết, nói "Em cần research thêm về vấn đề này"
