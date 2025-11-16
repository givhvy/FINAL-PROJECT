// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BẢN ĐỒ CHỈ ĐƯỜNG" cho GÓI ĐĂNG KÝ (Subscription)!
// Trong website học online, có 2 cách mua khóa học:
// 1. Mua từng khóa học riêng lẻ (như mua từng quyển sách)
// 2. Mua GÓI ĐĂNG KÝ (subscription) - Trả tiền hàng tháng/năm để học TẤT CẢ khóa học
//    (Giống như Netflix: Trả tiền 1 tháng → Xem tất cả phim!)
//
// File này định nghĩa các đường dẫn (routes) để:
// - Xem danh sách các gói đăng ký 📋
// - Tạo gói đăng ký mới (Admin) ✨
// - Cập nhật gói đăng ký (Admin) ✏️
// - Xóa gói đăng ký (Admin) ❌
//
// File này KHÔNG XỬ LÝ logic, chỉ CHỈ ĐƯỜNG đến controller xử lý!

// ============================================
// GIẢI THÍCH KHÁI NIỆM SUBSCRIPTION (GÓI ĐĂNG KÝ) 📦
// ============================================
// Subscription là gì?
// - Subscription = Đăng ký định kỳ
// - Giống như: Thuê bao điện thoại hàng tháng
//   + Bạn trả 100,000đ/tháng
//   + Được gọi thoại, nhắn tin không giới hạn
//
// Trong website học online:
// - Subscription = Gói đăng ký học tập
// - User trả tiền theo tháng/quý/năm
// - Được học TẤT CẢ khóa học trên website
// - Khi hết hạn → Cần gia hạn (renew) để tiếp tục học
//
// Ví dụ:
// - Gói Basic: 99,000đ/tháng → Học tất cả khóa học miễn phí
// - Gói Pro: 199,000đ/tháng → Học tất cả + Chứng chỉ + Hỗ trợ 1-1
// - Gói Premium: 499,000đ/tháng → Học tất cả + Chứng chỉ + Hỗ trợ + Mentor

// ============================================
// GIẢI THÍCH SỰ KHÁC BIỆT: MUA LẺ vs ĐĂNG KÝ 🤔
// ============================================
// MUA LẺ (One-time Purchase):
// - Mua 1 khóa học: 500,000đ
// - Sở hữu vĩnh viễn
// - Chỉ học được 1 khóa học đó
// - Muốn học khóa khác → Phải mua thêm
//
// ĐĂNG KÝ (Subscription):
// - Trả 199,000đ/tháng
// - Được học TẤT CẢ khóa học
// - Khi hết hạn → Phải gia hạn
// - Tiết kiệm hơn nếu học nhiều khóa
//
// Ví dụ:
// - Website có 10 khóa học, mỗi khóa 500,000đ
// - Mua lẻ cả 10 khóa: 10 × 500,000đ = 5,000,000đ
// - Đăng ký 1 năm: 199,000đ × 12 = 2,388,000đ
// → Tiết kiệm được 2,612,000đ!

// ============================================
// GIẢI THÍCH KHÁI NIỆM SUBSCRIPTION PLAN (GÓI ĐĂNG KÝ) 📋
// ============================================
// Subscription Plan là gì?
// - Plan = Kế hoạch, gói
// - Subscription Plan = Gói đăng ký
// - Mỗi website thường có nhiều gói để user chọn
//
// Các thuộc tính của 1 gói:
// - name: Tên gói (ví dụ: "Basic", "Pro", "Premium")
// - price: Giá (ví dụ: 99000, 199000, 499000)
// - duration: Thời hạn (ví dụ: "1 month", "3 months", "1 year")
// - features: Tính năng (ví dụ: ["Học tất cả khóa", "Chứng chỉ", "Hỗ trợ 24/7"])
// - isActive: Gói còn hoạt động không (có thể tạm ẩn gói)
//
// Ví dụ 1 gói:
// {
//   id: "plan123",
//   name: "Pro",
//   price: 199000,
//   duration: "1 month",
//   features: [
//     "Học tất cả khóa học",
//     "Chứng chỉ hoàn thành",
//     "Hỗ trợ email 24/7"
//   ],
//   isActive: true
// }

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
// const subscriptionController = require(...):
// - Mượn subscriptionController
// - Controller chứa các hàm xử lý logic gói đăng ký
// - Ví dụ: Hàm tạo gói, hàm xóa gói, hàm cập nhật gói, v.v.
const subscriptionController = require('../controllers/subscriptionController');

// ============================================
// BƯỚC 2: ĐỊNH NGHĨA CÁC ROUTE CHO GÓI ĐĂNG KÝ 🛣️
// ============================================

// ============================================
// ROUTE 1: LẤY TẤT CẢ CÁC GÓI ĐĂNG KÝ 📋
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.get('/', ...):
// - Định nghĩa route với phương thức GET
// - GET: Phương thức LẤY dữ liệu
// - '/': Đường dẫn gốc
// - subscriptionController.getSubscriptionPlans: Hàm xử lý
//
// URL đầy đủ: GET /api/subscriptions
// (Giả sử trong server.js có: app.use('/api/subscriptions', subscriptionRoutes))
//
// Cách hoạt động:
// 1. User vào trang "Gói đăng ký" để xem các gói có sẵn
// 2. Frontend gửi GET đến /api/subscriptions
// 3. Hàm getSubscriptionPlans() sẽ:
//    - Truy vấn database lấy tất cả gói đăng ký
//    - Lọc chỉ lấy các gói đang hoạt động (isActive: true)
//    - Trả về danh sách gói kèm thông tin:
//      + ID gói
//      + Tên gói (Basic, Pro, Premium)
//      + Giá (99000, 199000, 499000)
//      + Thời hạn (1 month, 3 months, 1 year)
//      + Tính năng (features)
//
// Thông tin trả về:
// [
//   {
//     id: "plan123",
//     name: "Basic",
//     price: 99000,
//     duration: "1 month",
//     features: ["Học tất cả khóa học miễn phí"],
//     isActive: true
//   },
//   {
//     id: "plan456",
//     name: "Pro",
//     price: 199000,
//     duration: "1 month",
//     features: [
//       "Học tất cả khóa học",
//       "Chứng chỉ hoàn thành",
//       "Hỗ trợ email 24/7"
//     ],
//     isActive: true
//   },
//   {
//     id: "plan789",
//     name: "Premium",
//     price: 499000,
//     duration: "1 month",
//     features: [
//       "Học tất cả khóa học",
//       "Chứng chỉ hoàn thành",
//       "Hỗ trợ 1-1 với mentor",
//       "Truy cập khóa học độc quyền"
//     ],
//     isActive: true
//   }
// ]
router.get('/', subscriptionController.getSubscriptionPlans);

// ============================================
// ROUTE 2: TẠO GÓI ĐĂNG KÝ MỚI ✨
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/', ...):
// - Định nghĩa route với phương thức POST
// - POST: Phương thức GỬI dữ liệu (để tạo mới)
// - '/': Đường dẫn gốc
// - subscriptionController.createSubscriptionPlan: Hàm xử lý
//
// URL đầy đủ: POST /api/subscriptions
//
// QUAN TRỌNG:
// Route này CHỈ DÀNH CHO ADMIN!
// User thường KHÔNG ĐƯỢC PHÉP tạo gói
//
// Cách hoạt động:
// 1. Admin muốn thêm gói đăng ký mới (ví dụ: gói "VIP")
// 2. Admin điền form tạo gói:
//    - Tên gói: "VIP"
//    - Giá: 999000đ
//    - Thời hạn: 1 year
//    - Tính năng: ["Học tất cả", "Mentor 1-1", "Khóa học độc quyền"]
// 3. Frontend gửi POST đến /api/subscriptions kèm dữ liệu:
//    Body: {
//      name: "VIP",
//      price: 999000,
//      duration: "1 year",
//      features: [
//        "Học tất cả khóa học",
//        "Mentor 1-1 hàng tuần",
//        "Khóa học độc quyền",
//        "Ưu tiên hỗ trợ"
//      ]
//    }
// 4. Hàm createSubscriptionPlan() sẽ:
//    - Kiểm tra user có phải admin không
//    - Nếu không → Trả về lỗi "Bạn không có quyền"
//    - Nếu có → Tạo gói mới
//    - Lưu vào database
//    - Trả về thông tin gói vừa tạo
router.post('/', subscriptionController.createSubscriptionPlan);

// ============================================
// ROUTE 3: CẬP NHẬT GÓI ĐĂNG KÝ ✏️
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.put('/:id', ...):
// - Định nghĩa route với phương thức PUT
// - PUT: Phương thức CẬP NHẬT dữ liệu
// - '/:id': Đường dẫn có THAM SỐ ĐỘNG
// - :id: Placeholder cho plan ID
// - Ví dụ: /api/subscriptions/plan123
//   → id = "plan123"
//
// URL đầy đủ: PUT /api/subscriptions/:id
//
// QUAN TRỌNG:
// Route này CHỈ DÀNH CHO ADMIN!
//
// Cách hoạt động:
// 1. Admin muốn cập nhật gói (ví dụ: tăng giá, thêm tính năng)
// 2. Admin gửi PUT đến /api/subscriptions/plan123 kèm dữ liệu:
//    Body: {
//      price: 249000,  // Tăng giá từ 199000 → 249000
//      features: [
//        "Học tất cả khóa học",
//        "Chứng chỉ hoàn thành",
//        "Hỗ trợ email 24/7",
//        "Truy cập sớm khóa học mới"  // Thêm tính năng mới
//      ]
//    }
// 3. Hàm updateSubscriptionPlan() sẽ:
//    - Kiểm tra user có phải admin không
//    - Nếu không → Trả về lỗi "Bạn không có quyền"
//    - Nếu có → Tìm gói theo ID
//    - Cập nhật thông tin mới
//    - Lưu vào database
//    - Trả về gói đã cập nhật
//
// LƯU Ý:
// Khi tăng giá gói:
// - User ĐÃ ĐĂNG KÝ GÓI CŨ → Giữ nguyên giá cũ (đến hết hạn)
// - User MỚI ĐĂNG KÝ → Áp dụng giá mới
router.put('/:id', subscriptionController.updateSubscriptionPlan);

// ============================================
// ROUTE 4: XÓA GÓI ĐĂNG KÝ ❌
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.delete('/:id', ...):
// - Định nghĩa route với phương thức DELETE
// - DELETE: Phương thức XÓA dữ liệu
// - '/:id': Đường dẫn có THAM SỐ ĐỘNG
//
// URL đầy đủ: DELETE /api/subscriptions/:id
//
// QUAN TRỌNG:
// Route này CHỈ DÀNH CHO ADMIN!
//
// LƯU Ý:
// XÓA GÓI ĐĂNG KÝ LÀ HÀNH ĐỘNG NGUY HIỂM!
// Nếu có user đang sử dụng gói này → KHÔNG NÊN XÓA!
// Thay vào đó:
// - Đặt isActive = false → Ẩn gói (không cho user mới đăng ký)
// - Nhưng user cũ vẫn dùng được đến hết hạn
//
// Cách hoạt động:
// 1. Admin muốn xóa gói (ví dụ: gói test, gói cũ không còn dùng)
// 2. Admin gửi DELETE đến /api/subscriptions/plan123
// 3. Hàm deleteSubscriptionPlan() sẽ:
//    - Kiểm tra user có phải admin không
//    - Nếu không → Trả về lỗi "Bạn không có quyền"
//    - Nếu có → Kiểm tra có user nào đang dùng gói này không
//    - Nếu có user đang dùng → Trả về cảnh báo "Không thể xóa, có user đang dùng"
//    - Nếu không có user nào → Xóa gói khỏi database
//    - Trả về thông báo "Xóa thành công"
//
// BEST PRACTICE (Thực hành tốt):
// Thay vì xóa → Nên làm:
// 1. Đặt isActive = false (soft delete)
// 2. Gói sẽ bị ẩn, không hiện trên trang "Gói đăng ký"
// 3. Nhưng vẫn tồn tại trong database
// 4. User cũ vẫn dùng được đến hết hạn
// 5. Có thể khôi phục lại sau nếu cần
router.delete('/:id', subscriptionController.deleteSubscriptionPlan);

// ============================================
// BƯỚC 3: XUẤT ROUTER RA NGOÀI 📤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// module.exports = router:
// - Xuất router để file khác có thể dùng
// - Trong server.js có thể:
//   const subscriptionRoutes = require('./routes/subscriptionRoutes');
//   app.use('/api/subscriptions', subscriptionRoutes);
module.exports = router;

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là ROUTE FILE cho gói đăng ký với 4 routes CRUD:
//
// 1. GET / → Lấy tất cả gói đăng ký (Public)
// 2. POST / → Tạo gói mới (Admin only)
// 3. PUT /:id → Cập nhật gói (Admin only)
// 4. DELETE /:id → Xóa gói (Admin only)
//
// CÁCH SỬ DỤNG:
// Trong server.js:
// app.use('/api/subscriptions', subscriptionRoutes);
//
// Kết quả:
// - Tất cả route có prefix "/api/subscriptions"
// - Ví dụ: router.get('/') → GET /api/subscriptions
//
// VÍ DỤ THỰC TẾ - USER CHỌN GÓI ĐĂNG KÝ:
// 1. User vào trang "Gói đăng ký"
// 2. Frontend gọi:
//    GET /api/subscriptions
// 3. Backend trả về 3 gói: Basic, Pro, Premium
// 4. Frontend hiển thị 3 gói dạng card:
//
//    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
//    │   BASIC     │  │    PRO      │  │  PREMIUM    │
//    ├─────────────┤  ├─────────────┤  ├─────────────┤
//    │ 99,000đ     │  │ 199,000đ    │  │ 499,000đ    │
//    │ /tháng      │  │ /tháng      │  │ /tháng      │
//    ├─────────────┤  ├─────────────┤  ├─────────────┤
//    │ ✓ Tất cả    │  │ ✓ Tất cả    │  │ ✓ Tất cả    │
//    │   khóa học  │  │   khóa học  │  │   khóa học  │
//    │             │  │ ✓ Chứng chỉ │  │ ✓ Chứng chỉ │
//    │             │  │ ✓ Hỗ trợ    │  │ ✓ Mentor    │
//    │             │  │   24/7      │  │ ✓ Độc quyền │
//    ├─────────────┤  ├─────────────┤  ├─────────────┤
//    │  [Chọn gói] │  │  [Chọn gói] │  │  [Chọn gói] │
//    └─────────────┘  └─────────────┘  └─────────────┘
//
// 5. User bấm "Chọn gói" (ví dụ: gói Pro)
// 6. Frontend chuyển user đến trang thanh toán
// 7. User thanh toán → Được kích hoạt gói Pro
// 8. User có thể học TẤT CẢ khóa học trên website trong 1 tháng
//
// VÍ DỤ THỰC TẾ - ADMIN TẠO GÓI MỚI:
// 1. Admin vào trang "Quản lý gói đăng ký"
// 2. Admin bấm nút "Thêm gói mới"
// 3. Admin điền form:
//    - Tên: "Student"
//    - Giá: 49,000đ
//    - Thời hạn: 1 month
//    - Tính năng: ["Học tất cả khóa học", "Giảm 50% cho sinh viên"]
// 4. Frontend gọi:
//    POST /api/subscriptions
//    Body: { name: "Student", price: 49000, ... }
// 5. Backend tạo gói mới → Lưu database
// 6. Frontend hiển thị: "Tạo gói thành công!"
// 7. Gói mới xuất hiện trên trang "Gói đăng ký"
//
// KEYWORD MỚI:
// - Subscription: Đăng ký định kỳ
// - Plan: Gói, kế hoạch
// - Duration: Thời hạn
// - Features: Tính năng
// - isActive: Đang hoạt động
// - Soft Delete: Xóa mềm (ẩn thay vì xóa hẳn)
// - One-time Purchase: Mua 1 lần
// - Recurring Payment: Thanh toán định kỳ
