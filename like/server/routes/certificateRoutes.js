// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BẢN ĐỒ CHỈ ĐƯỜNG" cho chứng chỉ!
// Khi bạn hoàn thành khóa học và đủ điều kiện → Bạn nhận CHỨNG CHỈ
// (Giống như học xong lớp 1 → Nhận bằng khen!)
//
// File này định nghĩa các đường dẫn (routes) để:
// - Xem danh sách chứng chỉ của bạn 📜
// - Tạo chứng chỉ mới 🎓
// - Tải chứng chỉ dạng PDF 📄
// - Xác minh chứng chỉ có thật không 🔍
// - Và nhiều chức năng khác!
//
// File này KHÔNG XỬ LÝ logic, chỉ CHỈ ĐƯỜNG đến controller xử lý!

// ============================================
// GIẢI THÍCH KHÁI NIỆM CERTIFICATE (CHỨNG CHỈ) 🎓
// ============================================
// Certificate là gì?
// - Certificate = Chứng chỉ, bằng khen
// - Giống như: Khi bạn thi đua học tập giỏi → Nhận BẰNG KHEN
// - Trong website học online:
//   + Bạn hoàn thành khóa học → Nhận CHỨNG CHỈ
//   + Chứng chỉ ghi: Tên bạn, tên khóa học, ngày hoàn thành
//   + Có thể tải về dạng PDF để in ra hoặc gửi cho người khác
//
// Tại sao cần chứng chỉ?
// - Chứng minh bạn đã học xong khóa học
// - Có thể dùng để xin việc, khoe với bạn bè
// - Tăng động lực học tập

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
// const certificateController = require(...):
// - Mượn certificateController
// - Controller chứa các hàm xử lý logic
// - Ví dụ: Hàm tạo chứng chỉ, hàm xóa chứng chỉ, v.v.
const certificateController = require('../controllers/certificateController');

// GIẢI THÍCH CÚ PHÁP:
// const { generateMissingCertificates } = require(...):
// - Destructuring: Lấy hàm generateMissingCertificates từ file utils
// - Hàm này dùng để TẠO CHỨNG CHỈ THIẾU
// - Ví dụ: Có 100 học viên hoàn thành khóa học nhưng chưa có chứng chỉ
//   → Gọi hàm này để tạo 100 chứng chỉ cùng lúc
const { generateMissingCertificates } = require('../utils/generateMissingCertificates');

// ============================================
// BƯỚC 2: ĐỊNH NGHĨA CÁC ROUTE CHO CHỨNG CHỈ 🛣️
// ============================================

// ============================================
// ROUTE 1: LẤY TẤT CẢ CHỨNG CHỈ 📋
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.get('/', ...):
// - Định nghĩa route với phương thức GET
// - GET: Phương thức LẤY dữ liệu (không thay đổi dữ liệu)
// - '/': Đường dẫn gốc
// - certificateController.getCertificates: Hàm xử lý
//
// URL đầy đủ: GET /api/certificates
// (Giả sử trong server.js có: app.use('/api/certificates', certificateRoutes))
//
// Cách hoạt động:
// 1. User gửi yêu cầu GET đến /api/certificates
// 2. Express gọi hàm getCertificates() từ controller
// 3. Hàm này sẽ:
//    - Truy vấn database
//    - Lấy danh sách TẤT CẢ chứng chỉ
//    - Trả về cho user
router.get('/', certificateController.getCertificates);

// ============================================
// ROUTE 2: TẠO CHỨNG CHỈ MỚI ✨
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/', ...):
// - Định nghĩa route với phương thức POST
// - POST: Phương thức GỬI dữ liệu (để tạo mới)
// - '/': Đường dẫn gốc
// - certificateController.createCertificate: Hàm xử lý
//
// URL đầy đủ: POST /api/certificates
//
// Cách hoạt động:
// 1. User gửi yêu cầu POST đến /api/certificates kèm dữ liệu:
//    Body: {
//      userId: "abc123",
//      courseId: "xyz789",
//      userName: "Nguyễn Văn A",
//      courseName: "JavaScript cơ bản"
//    }
// 2. Express gọi hàm createCertificate() từ controller
// 3. Hàm này sẽ:
//    - Kiểm tra user đã hoàn thành khóa học chưa
//    - Tạo chứng chỉ mới
//    - Lưu vào database
//    - Trả về thông tin chứng chỉ
router.post('/', certificateController.createCertificate);

// ============================================
// ROUTE 3: TẠO CHỨNG CHỈ (GENERATE) 🎨
// ============================================
// GIẢI THÍCH:
// Route này KHÁC với route POST '/' ở trên:
// - POST '/' : Tạo chứng chỉ THỦ CÔNG (admin tạo)
// - POST '/generate' : Tạo chứng chỉ TỰ ĐỘNG (hệ thống tạo)
//
// URL đầy đủ: POST /api/certificates/generate
//
// Cách hoạt động:
// 1. User hoàn thành khóa học
// 2. Frontend tự động gửi yêu cầu POST đến /api/certificates/generate
// 3. Hàm generateCertificate() sẽ:
//    - Kiểm tra điều kiện hoàn thành (100% lessons, pass tất cả quiz)
//    - Tạo mã chứng chỉ duy nhất (certificate number)
//    - Tạo PDF chứng chỉ
//    - Lưu vào database
//    - Trả về link tải chứng chỉ
router.post('/generate', certificateController.generateCertificate);

// ============================================
// ROUTE 4: TẠO CHỨNG CHỈ THIẾU (BULK GENERATE) 🔧
// ============================================
// GIẢI THÍCH:
// Route này dùng để TẠO NHIỀU CHỨNG CHỈ CÙNG LÚC
// Tình huống sử dụng:
// - Trước đây website không có tính năng chứng chỉ
// - Giờ thêm tính năng chứng chỉ
// - Cần tạo chứng chỉ cho TẤT CẢ học viên cũ đã hoàn thành khóa học
//
// URL đầy đủ: POST /api/certificates/generate-missing
//
// GIẢI THÍCH CÚ PHÁP:
// router.post('/generate-missing', async (req, res) => { ... }):
// - async: Hàm bất đồng bộ (có thể dùng await)
// - (req, res): Tham số request và response
// - { ... }: Khối code xử lý
//
// Tại sao không dùng controller?
// - Route này là route ĐẶC BIỆT, chỉ chạy 1 lần
// - Không cần tạo hàm riêng trong controller
// - Viết trực tiếp trong route cho nhanh
router.post('/generate-missing', async (req, res) => {
    // GIẢI THÍCH TRY-CATCH:
    // try: Thử chạy code
    // catch: Bắt lỗi nếu code có lỗi
    try {
        // GIẢI THÍCH CÚ PHÁP:
        // await generateMissingCertificates():
        // - await: Đợi hàm chạy xong mới chạy tiếp
        // - generateMissingCertificates(): Hàm tạo chứng chỉ thiếu
        // - Hàm này sẽ:
        //   1. Tìm tất cả enrollments đã hoàn thành
        //   2. Kiểm tra xem có chứng chỉ chưa
        //   3. Nếu chưa → Tạo chứng chỉ mới
        await generateMissingCertificates();

        // Trả về kết quả thành công
        res.json({
            success: true,
            message: 'Missing certificates generated successfully'
        });
    } catch (error) {
        // Nếu có lỗi → Trả về lỗi 500
        // 500 = Internal Server Error (Lỗi server nội bộ)
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// ROUTE 5: DEBUG ENROLLMENTS (KIỂM TRA LỖI) 🐛
// ============================================
// GIẢI THÍCH:
// Route này dùng để KIỂM TRA LỖI (debug)
// Admin có thể gọi route này để xem:
// - Có bao nhiêu enrollments (đăng ký khóa học)
// - Thông tin 5 enrollments đầu tiên
//
// URL đầy đủ: GET /api/certificates/debug-enrollments
//
// Tại sao cần route này?
// - Khi có lỗi về chứng chỉ
// - Admin cần xem dữ liệu enrollments để tìm nguyên nhân
// - Route này giúp DEBUG nhanh hơn
router.get('/debug-enrollments', async (req, res) => {
    try {
        // GIẢI THÍCH CÚ PHÁP:
        // const { getFirestore } = require('firebase-admin/firestore'):
        // - Destructuring: Lấy hàm getFirestore từ module
        // - require() TRONG hàm (không phải đầu file):
        //   + Chỉ load module khi cần
        //   + Tiết kiệm bộ nhớ nếu route không được gọi
        const { getFirestore } = require('firebase-admin/firestore');

        // GIẢI THÍCH CÚ PHÁP:
        // const db = getFirestore():
        // - getFirestore(): Lấy Firestore database instance
        // - db: Biến để tương tác với database
        const db = getFirestore();

        // GIẢI THÍCH CÚ PHÁP:
        // await db.collection('enrollments').get():
        // - db.collection('enrollments'): Truy cập collection "enrollments"
        // - .get(): Lấy TẤT CẢ documents trong collection
        // - await: Đợi kết quả trả về
        // - enrollmentsSnapshot: Snapshot chứa dữ liệu
        const enrollmentsSnapshot = await db.collection('enrollments').get();

        // GIẢI THÍCH CÚ PHÁP:
        // const enrollments = []:
        // - Tạo mảng rỗng để lưu enrollments
        const enrollments = [];

        // GIẢI THÍCH CÚ PHÁP:
        // enrollmentsSnapshot.forEach(doc => { ... }):
        // - forEach: Lặp qua từng document
        // - doc: Từng document trong snapshot
        // - => { ... }: Arrow function
        enrollmentsSnapshot.forEach(doc => {
            // GIẢI THÍCH CÚ PHÁP:
            // enrollments.push({ id: doc.id, ...doc.data() }):
            // - .push(): Thêm phần tử vào mảng
            // - { ... }: Tạo object mới
            // - id: doc.id: Lấy ID của document
            // - ...doc.data(): Spread operator - Sao chép tất cả thuộc tính
            enrollments.push({ id: doc.id, ...doc.data() });
        });

        // Trả về kết quả
        res.json({
            count: enrollments.length, // Tổng số enrollments
            enrollments: enrollments.slice(0, 5) // 5 enrollments đầu tiên
            // .slice(0, 5): Cắt mảng từ vị trí 0 đến 5
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROUTE 6: LẤY CHỨNG CHỈ THEO USER ID 👤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.get('/user/:userId', ...):
// - '/user/:userId': Đường dẫn có THAM SỐ ĐỘNG
// - :userId: Placeholder cho user ID
// - Ví dụ: /api/certificates/user/abc123
//   → userId = "abc123"
//
// URL đầy đủ: GET /api/certificates/user/:userId
//
// Cách hoạt động:
// 1. User đăng nhập và muốn xem chứng chỉ của mình
// 2. Frontend gửi GET đến /api/certificates/user/abc123
// 3. Hàm getUserCertificates() nhận userId từ req.params
// 4. Truy vấn database lấy tất cả chứng chỉ của user đó
// 5. Trả về danh sách chứng chỉ
router.get('/user/:userId', certificateController.getUserCertificates);

// ============================================
// ROUTE 7: XÁC MINH CHỨNG CHỈ 🔍
// ============================================
// GIẢI THÍCH:
// Route này dùng để KIỂM TRA CHỨNG CHỈ CÓ THẬT KHÔNG
// Tình huống sử dụng:
// - Bạn gửi chứng chỉ cho nhà tuyển dụng
// - Nhà tuyển dụng muốn kiểm tra chứng chỉ có thật không
// - Họ vào website, nhập MÃ CHỨNG CHỈ
// - Website kiểm tra và trả về thông tin
//
// URL đầy đủ: GET /api/certificates/verify/:certificateNumber
// Ví dụ: GET /api/certificates/verify/CERT-2024-001
//
// Cách hoạt động:
// 1. User nhập mã chứng chỉ: CERT-2024-001
// 2. Frontend gửi GET đến /api/certificates/verify/CERT-2024-001
// 3. Hàm verifyCertificate() tìm chứng chỉ trong database
// 4. Nếu tìm thấy → Trả về thông tin (tên người học, khóa học, ngày hoàn thành)
// 5. Nếu không tìm thấy → Trả về lỗi "Chứng chỉ không hợp lệ"
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);

// ============================================
// ROUTE 8: TẢI CHỨNG CHỈ DẠNG PDF 📄
// ============================================
// GIẢI THÍCH:
// Route này dùng để TẢI CHỨNG CHỈ về máy tính
//
// URL đầy đủ: GET /api/certificates/:id/download
// Ví dụ: GET /api/certificates/abc123/download
//
// Cách hoạt động:
// 1. User bấm nút "Tải chứng chỉ"
// 2. Frontend gửi GET đến /api/certificates/abc123/download
// 3. Hàm downloadCertificatePDF() sẽ:
//    - Tìm chứng chỉ trong database
//    - Tạo file PDF từ template
//    - Điền thông tin vào PDF (tên, khóa học, ngày)
//    - Trả về file PDF cho user
// 4. Trình duyệt tự động tải file về
//
// LƯU Ý THỨ TỰ ROUTE:
// Route này phải ĐẶT TRƯỚC route '/:id'
// Tại sao?
// - Nếu đặt sau → Express sẽ hiểu "download" là một ID
// - Ví dụ: /api/certificates/download
//   → Express nghĩ id = "download" → GỌI SAI HÀM!
router.get('/:id/download', certificateController.downloadCertificatePDF);

// ============================================
// ROUTE 9: LẤY CHỨNG CHỈ THEO ID 🔎
// ============================================
// GIẢI THÍCH:
// Route này dùng để LẤY THÔNG TIN CHI TIẾT của 1 chứng chỉ
//
// URL đầy đủ: GET /api/certificates/:id
// Ví dụ: GET /api/certificates/abc123
//
// Cách hoạt động:
// 1. User bấm vào 1 chứng chỉ để xem chi tiết
// 2. Frontend gửi GET đến /api/certificates/abc123
// 3. Hàm getCertificateById() sẽ:
//    - Tìm chứng chỉ trong database theo ID
//    - Trả về thông tin đầy đủ (tên, khóa học, ngày, URL PDF, v.v.)
router.get('/:id', certificateController.getCertificateById);

// ============================================
// ROUTE 10: CẬP NHẬT CHỨNG CHỈ ✏️
// ============================================
// GIẢI THÍCH:
// Route này dùng để SỬA THÔNG TIN chứng chỉ
// (Chỉ admin mới được phép sửa)
//
// URL đầy đủ: PUT /api/certificates/:id
// Ví dụ: PUT /api/certificates/abc123
//
// GIẢI THÍCH HTTP METHOD:
// PUT vs POST:
// - POST: TẠO MỚI
// - PUT: CẬP NHẬT TOÀN BỘ
// - PATCH: CẬP NHẬT MỘT PHẦN
//
// Cách hoạt động:
// 1. Admin muốn sửa chứng chỉ (ví dụ: sửa tên user)
// 2. Admin gửi PUT đến /api/certificates/abc123 kèm dữ liệu mới:
//    Body: {
//      userName: "Nguyễn Văn B" // Sửa tên
//    }
// 3. Hàm updateCertificate() sẽ:
//    - Tìm chứng chỉ theo ID
//    - Cập nhật thông tin mới
//    - Lưu vào database
//    - Trả về chứng chỉ đã cập nhật
router.put('/:id', certificateController.updateCertificate);

// ============================================
// ROUTE 11: XÓA CHỨNG CHỈ ❌
// ============================================
// GIẢI THÍCH:
// Route này dùng để XÓA chứng chỉ
// (Chỉ admin mới được phép xóa)
//
// URL đầy đủ: DELETE /api/certificates/:id
// Ví dụ: DELETE /api/certificates/abc123
//
// Cách hoạt động:
// 1. Admin muốn xóa chứng chỉ (ví dụ: chứng chỉ bị lỗi)
// 2. Admin gửi DELETE đến /api/certificates/abc123
// 3. Hàm deleteCertificate() sẽ:
//    - Tìm chứng chỉ theo ID
//    - Xóa file PDF trên cloud (nếu có)
//    - Xóa chứng chỉ khỏi database
//    - Trả về thông báo "Xóa thành công"
router.delete('/:id', certificateController.deleteCertificate);

// ============================================
// BƯỚC 3: XUẤT ROUTER RA NGOÀI 📤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// module.exports = router:
// - Xuất router để file khác có thể dùng
// - Trong server.js có thể:
//   const certificateRoutes = require('./routes/certificateRoutes');
//   app.use('/api/certificates', certificateRoutes);
module.exports = router;

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là ROUTE FILE cho chứng chỉ với 11 routes:
//
// 1. GET / → Lấy tất cả chứng chỉ
// 2. POST / → Tạo chứng chỉ mới (thủ công)
// 3. POST /generate → Tạo chứng chỉ tự động
// 4. POST /generate-missing → Tạo nhiều chứng chỉ thiếu cùng lúc
// 5. GET /debug-enrollments → Kiểm tra lỗi enrollments
// 6. GET /user/:userId → Lấy chứng chỉ của 1 user
// 7. GET /verify/:certificateNumber → Xác minh chứng chỉ có thật không
// 8. GET /:id/download → Tải chứng chỉ dạng PDF
// 9. GET /:id → Lấy thông tin chi tiết 1 chứng chỉ
// 10. PUT /:id → Cập nhật chứng chỉ (admin)
// 11. DELETE /:id → Xóa chứng chỉ (admin)
//
// CÁCH SỬ DỤNG:
// Trong server.js:
// app.use('/api/certificates', certificateRoutes);
//
// Kết quả:
// - Tất cả route có prefix "/api/certificates"
// - Ví dụ: router.get('/') → GET /api/certificates
//
// VÍ DỤ THỰC TẾ:
// 1. User hoàn thành khóa học "JavaScript cơ bản"
// 2. Frontend tự động gọi: POST /api/certificates/generate
// 3. Backend kiểm tra → Tạo chứng chỉ → Lưu database
// 4. User vào trang "Chứng chỉ của tôi"
// 5. Frontend gọi: GET /api/certificates/user/abc123
// 6. Backend trả về danh sách chứng chỉ
// 7. User bấm "Tải về" → Frontend gọi: GET /api/certificates/xyz/download
// 8. Backend trả về file PDF → Trình duyệt tải về
//
// KEYWORD MỚI:
// - Certificate: Chứng chỉ
// - Route Parameter: Tham số động trong URL (:id, :userId)
// - Spread Operator: ... (sao chép thuộc tính)
// - Slice: Cắt mảng
// - Try-Catch: Bắt lỗi
// - Debug: Kiểm tra lỗi
// - Snapshot: Ảnh chụp dữ liệu tại thời điểm checkpoint 2:13 PM 14/11 
