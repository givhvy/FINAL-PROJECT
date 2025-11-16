// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BẢN ĐỒ CHỈ ĐƯỜNG" cho thanh toán!
// Khi bạn muốn mua khóa học → Bạn phải THANH TOÁN
// (Giống như đi siêu thị mua đồ → Phải trả tiền!)
//
// File này định nghĩa các đường dẫn (routes) để:
// - Xem lịch sử thanh toán 📋
// - Tạo phiên thanh toán mới (Stripe Checkout) 💳
// - Xác minh thanh toán và tạo đơn hàng ✅
// - Cập nhật/xóa thông tin thanh toán 🔧
//
// File này KHÔNG XỬ LÝ logic, chỉ CHỈ ĐƯỜNG đến controller xử lý!

// ============================================
// GIẢI THÍCH KHÁI NIỆM PAYMENT (THANH TOÁN) 💰
// ============================================
// Payment là gì?
// - Payment = Thanh toán
// - Giống như: Khi bạn mua đồ chơi → Phải trả tiền cho cô bán hàng
// - Trong website học online:
//   + Bạn muốn học khóa học → Phải mua (thanh toán)
//   + Thanh toán bằng thẻ tín dụng, ví điện tử, chuyển khoản, v.v.
//
// Tại sao cần tính năng thanh toán?
// - Giáo viên làm khóa học → Phải được trả công
// - Website cần tiền để duy trì hoạt động
// - Người học trả tiền → Có động lực học tập hơn

// ============================================
// GIẢI THÍCH KHÁI NIỆM STRIPE 💳
// ============================================
// Stripe là gì?
// - Stripe: Công ty cung cấp dịch vụ thanh toán online
// - Giống như: "Máy quẹt thẻ" ở cửa hàng, nhưng dành cho website
// - Stripe giúp:
//   + Nhận tiền từ khách hàng một cách an toàn
//   + Hỗ trợ nhiều loại thẻ (Visa, Mastercard, v.v.)
//   + Xử lý thanh toán quốc tế
//   + Bảo mật thông tin thẻ
//
// Cách hoạt động của Stripe:
// 1. User bấm "Mua khóa học"
// 2. Website tạo "phiên thanh toán" (checkout session) trên Stripe
// 3. User được chuyển đến trang thanh toán của Stripe
// 4. User điền thông tin thẻ và thanh toán
// 5. Stripe xử lý thanh toán
// 6. Stripe chuyển user về website kèm kết quả
// 7. Website kiểm tra kết quả → Kích hoạt khóa học cho user

// ============================================
// GIẢI THÍCH KHÁI NIỆM CHECKOUT SESSION 🛒
// ============================================
// Checkout Session là gì?
// - Checkout = Thanh toán
// - Session = Phiên (khoảng thời gian)
// - Checkout Session = Phiên thanh toán
// - Giống như: Khi bạn đi siêu thị, từ lúc bỏ đồ vào giỏ đến lúc trả tiền xong → Đó là 1 phiên mua sắm
//
// Trong Stripe:
// - Checkout Session là một "phiên thanh toán" tạm thời
// - Có thời hạn (ví dụ: 30 phút)
// - Chứa thông tin: Mua gì, giá bao nhiêu, ai mua
// - Có link thanh toán duy nhất

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const express = require('express'):
// - Mượn thư viện Express (framework xây dựng website)
// - Express giống như "bộ lego" có sẵn để xây nhà
const express = require('express');

// GIẢI THÍCH CÚ PHÁP:
// const router = express.Router():
// - Tạo một "bộ định tuyến" (router)
// - Router giống như tấm bảng chỉ đường nhỏ
// - Dùng để định nghĩa nhiều route (đường đi)
const router = express.Router();

// GIẢI THÍCH CÚ PHÁP:
// const paymentController = require(...):
// - Mượn paymentController
// - Controller chứa các hàm xử lý logic thanh toán
// - Ví dụ: Hàm tạo phiên thanh toán, hàm xác minh thanh toán, v.v.
const paymentController = require('../controllers/paymentController');

// ============================================
// BƯỚC 2: ĐỊNH NGHĨA CÁC ROUTE CHO THANH TOÁN 🛣️
// ============================================

// ============================================
// PHẦN 1: ROUTES CRUD CƠ BẢN 📋
// ============================================
// CRUD là gì?
// - C = Create (Tạo mới)
// - R = Read (Đọc/Lấy dữ liệu)
// - U = Update (Cập nhật)
// - D = Delete (Xóa)
//
// Các route CRUD này dành cho QUẢN LÝ THANH TOÁN
// (Admin xem lịch sử thanh toán, cập nhật trạng thái, v.v.)

// ============================================
// ROUTE 1: LẤY TẤT CẢ THANH TOÁN 📋
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.get('/', ...):
// - Định nghĩa route với phương thức GET
// - GET: Phương thức LẤY dữ liệu
// - '/': Đường dẫn gốc
// - paymentController.getPayments: Hàm xử lý
//
// URL đầy đủ: GET /api/payments
// (Giả sử trong server.js có: app.use('/api/payments', paymentRoutes))
//
// Cách hoạt động:
// 1. Admin muốn xem lịch sử tất cả thanh toán
// 2. Frontend gửi GET đến /api/payments
// 3. Hàm getPayments() sẽ:
//    - Truy vấn database lấy tất cả thanh toán
//    - Trả về danh sách thanh toán kèm thông tin:
//      + ID thanh toán
//      + User mua
//      + Khóa học mua
//      + Số tiền
//      + Trạng thái (thành công, thất bại, đang chờ)
//      + Ngày thanh toán
router.get('/', paymentController.getPayments);

// ============================================
// ROUTE 2: TẠO THANH TOÁN MỚI (THỦ CÔNG) ✨
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/', ...):
// - Định nghĩa route với phương thức POST
// - POST: Phương thức GỬI dữ liệu (để tạo mới)
// - '/': Đường dẫn gốc
// - paymentController.createPayment: Hàm xử lý
//
// URL đầy đủ: POST /api/payments
//
// LƯU Ý:
// Route này dùng để TẠO RECORD THANH TOÁN THỦ CÔNG
// KHÔNG PHẢI để user thanh toán thực sự!
// User thanh toán thực sự → Dùng route /create-checkout-session
//
// Cách hoạt động:
// 1. Admin muốn tạo record thanh toán thủ công (ví dụ: user thanh toán offline)
// 2. Admin gửi POST đến /api/payments kèm dữ liệu:
//    Body: {
//      userId: "abc123",
//      courseId: "xyz789",
//      amount: 500000,
//      paymentMethod: "bank_transfer",
//      status: "completed"
//    }
// 3. Hàm createPayment() sẽ:
//    - Tạo record thanh toán mới
//    - Lưu vào database
//    - Trả về thông tin thanh toán
router.post('/', paymentController.createPayment);

// ============================================
// ROUTE 3: LẤY THANH TOÁN THEO ID 🔎
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.get('/:id', ...):
// - Định nghĩa route với phương thức GET
// - '/:id': Đường dẫn có THAM SỐ ĐỘNG
// - :id: Placeholder cho payment ID
// - Ví dụ: /api/payments/payment123
//   → id = "payment123"
//
// URL đầy đủ: GET /api/payments/:id
//
// Cách hoạt động:
// 1. User muốn xem chi tiết 1 thanh toán
// 2. Frontend gửi GET đến /api/payments/payment123
// 3. Hàm getPaymentById() sẽ:
//    - Tìm thanh toán trong database theo ID
//    - Trả về thông tin đầy đủ
router.get('/:id', paymentController.getPaymentById);

// ============================================
// ROUTE 4: CẬP NHẬT THANH TOÁN ✏️
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.put('/:id', ...):
// - Định nghĩa route với phương thức PUT
// - PUT: Phương thức CẬP NHẬT dữ liệu
// - '/:id': Đường dẫn có THAM SỐ ĐỘNG
//
// URL đầy đủ: PUT /api/payments/:id
//
// Cách hoạt động:
// 1. Admin muốn cập nhật trạng thái thanh toán (ví dụ: từ "pending" → "completed")
// 2. Admin gửi PUT đến /api/payments/payment123 kèm dữ liệu:
//    Body: {
//      status: "completed"
//    }
// 3. Hàm updatePayment() sẽ:
//    - Tìm thanh toán theo ID
//    - Cập nhật thông tin mới
//    - Lưu vào database
//    - Trả về thanh toán đã cập nhật
router.put('/:id', paymentController.updatePayment);

// ============================================
// ROUTE 5: XÓA THANH TOÁN ❌
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.delete('/:id', ...):
// - Định nghĩa route với phương thức DELETE
// - DELETE: Phương thức XÓA dữ liệu
// - '/:id': Đường dẫn có THAM SỐ ĐỘNG
//
// URL đầy đủ: DELETE /api/payments/:id
//
// LƯU Ý:
// XÓA THANH TOÁN LÀ HÀNH ĐỘNG NGUY HIỂM!
// Chỉ nên dùng trong trường hợp:
// - Thanh toán lỗi
// - Thanh toán trùng lặp
// - Testing
//
// Cách hoạt động:
// 1. Admin muốn xóa thanh toán (ví dụ: thanh toán test)
// 2. Admin gửi DELETE đến /api/payments/payment123
// 3. Hàm deletePayment() sẽ:
//    - Tìm thanh toán theo ID
//    - Xóa khỏi database
//    - Trả về thông báo "Xóa thành công"
router.delete('/:id', paymentController.deletePayment);

// ============================================
// PHẦN 2: ROUTES TÍCH HỢP STRIPE 💳
// ============================================
// Các route này dành cho THANH TOÁN THỰC SỰ với Stripe

// ============================================
// ROUTE 6: TẠO PHIÊN THANH TOÁN STRIPE (CHECKOUT SESSION) 🚀
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/create-checkout-session', ...):
// - Định nghĩa route với phương thức POST
// - POST: Phương thức GỬI dữ liệu
// - '/create-checkout-session': Đường dẫn
// - paymentController.createCheckoutSession: Hàm xử lý
//
// URL đầy đủ: POST /api/payments/create-checkout-session
//
// ĐÂY LÀ ROUTE QUAN TRỌNG NHẤT!
// Route này BẮT ĐẦU QUY TRÌNH THANH TOÁN với Stripe
//
// Cách hoạt động:
// 1. User bấm nút "Mua khóa học"
// 2. Frontend gửi POST đến /api/payments/create-checkout-session kèm dữ liệu:
//    Body: {
//      courseId: "xyz789",
//      courseName: "JavaScript cơ bản",
//      coursePrice: 500000
//    }
// 3. Hàm createCheckoutSession() sẽ:
//    a) Lấy userId từ token (user đã đăng nhập)
//    b) Tạo Checkout Session trên Stripe:
//       - Gọi Stripe API
//       - Gửi thông tin: Tên sản phẩm, giá, số lượng
//       - Stripe trả về:
//         + Session ID
//         + URL thanh toán
//    c) Lưu thông tin session vào database (tùy chọn)
//    d) Trả về cho frontend:
//       - Session ID
//       - URL thanh toán
// 4. Frontend nhận response và chuyển user đến URL thanh toán của Stripe
// 5. User điền thông tin thẻ và thanh toán trên trang Stripe
// 6. Stripe xử lý thanh toán
// 7. Stripe chuyển user về website (success hoặc cancel)
//
// Response trả về:
// {
//   sessionId: "cs_test_abc123...",
//   url: "https://checkout.stripe.com/pay/cs_test_abc123..."
// }
router.post('/create-checkout-session', paymentController.createCheckoutSession);

// ============================================
// ROUTE 7: XÁC MINH THANH TOÁN VÀ TẠO ĐƠN HÀNG ✅
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/verify-and-create-order', ...):
// - Định nghĩa route với phương thức POST
// - POST: Phương thức GỬI dữ liệu
// - '/verify-and-create-order': Đường dẫn
// - paymentController.verifyPaymentAndCreateOrder: Hàm xử lý
//
// URL đầy đủ: POST /api/payments/verify-and-create-order
//
// ĐÂY LÀ ROUTE QUAN TRỌNG THỨ HAI!
// Route này XÁC MINH THANH TOÁN VÀ TẠO ĐƠN HÀNG
//
// Cách hoạt động:
// 1. User thanh toán thành công trên Stripe
// 2. Stripe chuyển user về trang success của website
// 3. Frontend lấy session_id từ URL (query parameter)
//    Ví dụ: https://yourdomain.com/success?session_id=cs_test_abc123...
// 4. Frontend gửi POST đến /api/payments/verify-and-create-order kèm dữ liệu:
//    Body: {
//      sessionId: "cs_test_abc123..."
//    }
// 5. Hàm verifyPaymentAndCreateOrder() sẽ:
//    a) Gọi Stripe API để LẤY THÔNG TIN SESSION:
//       - Session có tồn tại không?
//       - Session có trạng thái "paid" (đã thanh toán) không?
//       - Lấy thông tin: userId, courseId, amount
//    b) Nếu session hợp lệ và đã thanh toán:
//       - Tạo record PAYMENT trong database:
//         + userId: Người mua
//         + courseId: Khóa học mua
//         + amount: Số tiền
//         + paymentMethod: "stripe"
//         + status: "completed"
//         + stripeSessionId: Session ID
//       - Tạo record ORDER (đơn hàng):
//         + userId: Người mua
//         + courseId: Khóa học mua
//         + status: "completed"
//       - Tạo ENROLLMENT (đăng ký khóa học):
//         + userId: Người học
//         + courseId: Khóa học
//         + Kích hoạt khóa học cho user
//    c) Nếu session không hợp lệ hoặc chưa thanh toán:
//       - Trả về lỗi "Thanh toán không hợp lệ"
//    d) Trả về kết quả cho frontend
// 6. Frontend hiển thị "Thanh toán thành công!" và chuyển user đến trang khóa học
//
// Response trả về (nếu thành công):
// {
//   success: true,
//   message: "Payment verified and order created successfully",
//   payment: { ... },
//   order: { ... },
//   enrollment: { ... }
// }
//
// Response trả về (nếu thất bại):
// {
//   success: false,
//   error: "Invalid session or payment not completed"
// }
//
// LƯU Ý:
// Route này PHẢI ĐƯỢC GỌI SAU KHI USER THANH TOÁN THÀNH CÔNG
// Nếu không gọi route này:
// - User đã trả tiền
// - Nhưng KHÔNG ĐƯỢC KÍCH HOẠT KHÓA HỌC
// - User sẽ khiếu nại!
router.post('/verify-and-create-order', paymentController.verifyPaymentAndCreateOrder);

// ============================================
// BƯỚC 3: XUẤT ROUTER RA NGOÀI 📤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// module.exports = router:
// - Xuất router để file khác có thể dùng
// - Trong server.js có thể:
//   const paymentRoutes = require('./routes/paymentRoutes');
//   app.use('/api/payments', paymentRoutes);
module.exports = router;

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là ROUTE FILE cho thanh toán với 7 routes:
//
// PHẦN 1: CRUD CƠ BẢN (5 routes - Dành cho Admin)
// 1. GET / → Lấy tất cả thanh toán
// 2. POST / → Tạo thanh toán mới (thủ công)
// 3. GET /:id → Lấy thanh toán theo ID
// 4. PUT /:id → Cập nhật thanh toán
// 5. DELETE /:id → Xóa thanh toán
//
// PHẦN 2: TÍCH HỢP STRIPE (2 routes - Dành cho User)
// 6. POST /create-checkout-session → Tạo phiên thanh toán Stripe
// 7. POST /verify-and-create-order → Xác minh thanh toán và tạo đơn hàng
//
// CÁCH SỬ DỤNG:
// Trong server.js:
// app.use('/api/payments', paymentRoutes);
//
// Kết quả:
// - Tất cả route có prefix "/api/payments"
// - Ví dụ: router.get('/') → GET /api/payments
//
// VÍ DỤ THỰC TẾ - QUY TRÌNH MUA KHÓA HỌC:
// 1. User vào trang khóa học "JavaScript cơ bản"
// 2. User bấm nút "Mua ngay - 500,000đ"
// 3. Frontend gọi:
//    POST /api/payments/create-checkout-session
//    Body: {
//      courseId: "xyz789",
//      courseName: "JavaScript cơ bản",
//      coursePrice: 500000
//    }
// 4. Backend tạo Checkout Session trên Stripe
// 5. Backend trả về:
//    {
//      sessionId: "cs_test_abc123...",
//      url: "https://checkout.stripe.com/pay/cs_test_abc123..."
//    }
// 6. Frontend chuyển user đến URL thanh toán Stripe
// 7. User điền thông tin thẻ:
//    - Số thẻ: 4242 4242 4242 4242
//    - Ngày hết hạn: 12/25
//    - CVC: 123
// 8. User bấm "Thanh toán"
// 9. Stripe xử lý thanh toán (2-3 giây)
// 10. Stripe chuyển user về:
//     https://yourdomain.com/success?session_id=cs_test_abc123...
// 11. Frontend (trang success) gọi:
//     POST /api/payments/verify-and-create-order
//     Body: {
//       sessionId: "cs_test_abc123..."
//     }
// 12. Backend:
//     - Xác minh thanh toán với Stripe
//     - Tạo record Payment
//     - Tạo record Order
//     - Tạo Enrollment → Kích hoạt khóa học
// 13. Frontend hiển thị:
//     "🎉 Thanh toán thành công!
//      Khóa học đã được kích hoạt.
//      Bắt đầu học ngay!"
// 14. User vào trang "Khóa học của tôi" → Thấy khóa học mới
//
// KEYWORD MỚI:
// - Payment: Thanh toán
// - Stripe: Dịch vụ thanh toán online
// - Checkout Session: Phiên thanh toán
// - Session ID: Mã định danh phiên
// - Verify: Xác minh
// - Enrollment: Đăng ký khóa học
// - CRUD: Create, Read, Update, Delete
