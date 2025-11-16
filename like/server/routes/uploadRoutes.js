// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BẢN ĐỒ CHỈ ĐƯỜNG" cho tải file lên (Upload)!
// Khi bạn muốn tải ảnh, video lên website → Cần chức năng UPLOAD
// (Giống như đăng ảnh lên Facebook, đăng video lên YouTube!)
//
// File này định nghĩa các đường dẫn (routes) để:
// - Tải ảnh lên (cho khóa học, bài học) 🖼️
// - Tải video lên (cho bài học) 🎥
// - Tải ảnh đại diện (avatar) của user 👤
//
// File này KHÔNG XỬ LÝ logic, chỉ CHỈ ĐƯỜNG đến controller xử lý!

// ============================================
// GIẢI THÍCH KHÁI NIỆM UPLOAD (TẢI LÊN) 📤
// ============================================
// Upload là gì?
// - Upload = Tải lên
// - Giống như: Đưa ảnh từ điện thoại lên Facebook
// - Trong website:
//   + Giáo viên upload video bài giảng
//   + User upload ảnh đại diện
//   + Admin upload ảnh thumbnail cho khóa học
//
// Quy trình upload:
// 1. User chọn file từ máy tính
// 2. User bấm "Tải lên"
// 3. File được gửi đến server
// 4. Server xử lý file (kiểm tra, nén, v.v.)
// 5. Server lưu file lên cloud (Cloudinary, AWS S3)
// 6. Server trả về URL của file
// 7. Website hiển thị file đã upload

// ============================================
// GIẢI THÍCH KHÁI NIỆM MULTER 📦
// ============================================
// Multer là gì?
// - Multer: Thư viện Node.js để xử lý upload file
// - Giống như: "Nhân viên bưu điện" nhận và kiểm tra hàng
// - Multer giúp:
//   + Nhận file từ frontend
//   + Kiểm tra loại file (ảnh, video, v.v.)
//   + Giới hạn dung lượng file
//   + Lưu file vào bộ nhớ hoặc ổ đĩa
//
// Tại sao cần Multer?
// - Upload file phức tạp hơn gửi text
// - Cần xử lý multipart/form-data
// - Cần kiểm tra file hợp lệ trước khi lưu
// - Multer làm việc này tự động!

// ============================================
// GIẢI THÍCH KHÁI NIỆM MEMORY STORAGE (LƯU TẠM) 💾
// ============================================
// Memory Storage là gì?
// - Memory = Bộ nhớ RAM
// - Storage = Lưu trữ
// - Memory Storage = Lưu file trong RAM tạm thời
//
// Tại sao lưu trong RAM?
// - Nhanh hơn lưu vào ổ đĩa
// - File chỉ ở server 1 chút (2-3 giây)
// - Sau khi xử lý xong → Upload lên cloud → Xóa khỏi RAM
//
// Quy trình:
// 1. User chọn file (ảnh 5MB)
// 2. File được gửi đến server
// 3. Multer lưu file vào RAM tạm thời (memory storage)
// 4. Server upload file lên Cloudinary
// 5. Cloudinary trả về URL
// 6. File trong RAM được xóa tự động
// 7. Server trả URL về cho frontend

// ============================================
// GIẢI THÍCH KHÁI NIỆM FILE SIZE LIMIT (GIỚI HẠN DUNG LƯỢNG) 📏
// ============================================
// File Size Limit là gì?
// - Giới hạn dung lượng file tối đa được phép upload
// - Ví dụ: Giới hạn 5MB cho ảnh, 100MB cho video
//
// Tại sao cần giới hạn?
// - Tránh user upload file quá lớn (vài GB)
// - File quá lớn → Tốn băng thông
// - File quá lớn → Chậm, dễ timeout
// - File quá lớn → Tốn tiền cloud storage
//
// Trong file này:
// - Ảnh đại diện: Tối đa 5MB
// - Ảnh/video khóa học: Tối đa 100MB

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
// const multer = require('multer'):
// - Mượn thư viện Multer
// - Multer: Thư viện xử lý upload file
// - Giúp nhận file từ frontend một cách dễ dàng
const multer = require('multer');

// GIẢI THÍCH CÚ PHÁP:
// const uploadController = require(...):
// - Mượn uploadController
// - Controller chứa các hàm xử lý logic upload
// - Ví dụ: Hàm upload ảnh lên Cloudinary, hàm upload video, v.v.
const uploadController = require('../controllers/uploadController');

// GIẢI THÍCH CÚ PHÁP:
// const authMiddleware = require(...):
// - Mượn authMiddleware
// - Middleware kiểm tra user đã đăng nhập chưa
// - Upload file → Phải đăng nhập trước!
// - Nếu chưa đăng nhập → Trả về lỗi "Unauthorized"
const authMiddleware = require('../middleware/authMiddleware');

// ============================================
// BƯỚC 2: CẤU HÌNH MULTER (SETUP) ⚙️
// ============================================

// ============================================
// CẤU HÌNH 1: MEMORY STORAGE CHO ẢNH/VIDEO KHÓA HỌC 💾
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// const storage = multer.memoryStorage():
// - Tạo cấu hình storage (lưu trữ)
// - memoryStorage(): Lưu file vào RAM (bộ nhớ)
// - Không lưu vào ổ đĩa
//
// Tại sao dùng memoryStorage?
// - Nhanh hơn diskStorage (lưu ổ đĩa)
// - File chỉ cần tồn tại tạm thời
// - Sau khi upload lên cloud → Xóa ngay
// - Tiết kiệm ổ đĩa server
const storage = multer.memoryStorage();

// GIẢI THÍCH CÚ PHÁP:
// const upload = multer({ ... }):
// - Tạo instance Multer với cấu hình
// - Object { ... } chứa các option (tùy chọn)
//
// Option 1: storage
// - storage: storage → Dùng memory storage đã tạo ở trên
//
// Option 2: limits
// - limits: Giới hạn
// - limits.fileSize: Giới hạn dung lượng file
// - 100 * 1024 * 1024: 100MB
//   + 1024 bytes = 1 KB (Kilobyte)
//   + 1024 KB = 1 MB (Megabyte)
//   + 100 MB = 100 * 1024 * 1024 bytes = 104,857,600 bytes
//
// Nếu user upload file > 100MB:
// - Multer sẽ TỪ CHỐI
// - Trả về lỗi "File too large"
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// ============================================
// CẤU HÌNH 2: MEMORY STORAGE CHO ẢNH ĐẠI DIỆN (PROFILE PICTURE) 👤
// ============================================
// GIẢI THÍCH:
// Ảnh đại diện khác với ảnh khóa học:
// - Ảnh đại diện: Nhỏ hơn (5MB)
// - Chỉ chấp nhận file ảnh (image/*)
// - Không chấp nhận video, PDF, v.v.
//
// Tại sao tạo cấu hình riêng?
// - Giới hạn nhỏ hơn → Tiết kiệm bandwidth
// - Chỉ cho phép ảnh → Bảo mật hơn
// - Tránh user upload file không phải ảnh

// GIẢI THÍCH CÚ PHÁP:
// const profileUpload = multer({ ... }):
// - Tạo instance Multer riêng cho ảnh đại diện
// - Có 3 option: storage, limits, fileFilter
const profileUpload = multer({
    // Option 1: storage
    // - Dùng memory storage (giống như upload thường)
    storage: storage,

    // Option 2: limits
    // - Giới hạn 5MB cho ảnh đại diện
    // - 5 * 1024 * 1024 = 5MB = 5,242,880 bytes
    // - Nhỏ hơn 20 lần so với ảnh/video khóa học (100MB)
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for profile pictures
    },

    // Option 3: fileFilter
    // - Hàm lọc file (kiểm tra file hợp lệ không)
    // - Chỉ chấp nhận file ảnh
    //
    // GIẢI THÍCH CÚ PHÁP:
    // (req, file, cb) => { ... }:
    // - Hàm nhận 3 tham số:
    //   + req: Request (yêu cầu)
    //   + file: File đang upload
    //   + cb: Callback (hàm gọi lại để trả kết quả)
    //
    // file object có các thuộc tính:
    // - file.fieldname: Tên field trong form (ví dụ: "avatar")
    // - file.originalname: Tên file gốc (ví dụ: "photo.jpg")
    // - file.mimetype: Loại file (ví dụ: "image/jpeg", "video/mp4")
    // - file.size: Dung lượng (bytes)
    // - file.buffer: Dữ liệu file (nếu dùng memory storage)
    fileFilter: (req, file, cb) => {
        // GIẢI THÍCH CÚ PHÁP:
        // if (file.mimetype.startsWith('image/')):
        // - Kiểm tra mimetype có bắt đầu bằng 'image/' không
        // - Các mimetype của ảnh:
        //   + 'image/jpeg' → Ảnh JPEG
        //   + 'image/png' → Ảnh PNG
        //   + 'image/gif' → Ảnh GIF
        //   + 'image/webp' → Ảnh WebP
        // - .startsWith('image/'): Hàm kiểm tra chuỗi bắt đầu bằng...
        //
        // Ví dụ:
        // - 'image/jpeg'.startsWith('image/') → true ✓
        // - 'video/mp4'.startsWith('image/') → false ✗
        // - 'application/pdf'.startsWith('image/') → false ✗
        if (file.mimetype.startsWith('image/')) {
            // GIẢI THÍCH CÚ PHÁP:
            // cb(null, true):
            // - Gọi callback với 2 tham số
            // - Tham số 1: null → Không có lỗi
            // - Tham số 2: true → Chấp nhận file
            // - Multer sẽ tiếp tục xử lý file
            cb(null, true);
        } else {
            // GIẢI THÍCH CÚ PHÁP:
            // cb(new Error('...')):
            // - Gọi callback với lỗi
            // - new Error('...'): Tạo object lỗi mới
            // - Multer sẽ TỪ CHỐI file và trả về lỗi này
            cb(new Error('Only image files are allowed for profile pictures'));
        }
    }
});

// ============================================
// BƯỚC 3: ĐỊNH NGHĨA CÁC ROUTE CHO UPLOAD 🛣️
// ============================================

// ============================================
// ROUTE 1: UPLOAD ẢNH (CHO KHÓA HỌC, BÀI HỌC) 🖼️
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/image', authMiddleware, upload.single('file'), uploadController.uploadImage):
// - Định nghĩa route với phương thức POST
// - POST: Phương thức GỬI dữ liệu (upload)
// - '/image': Đường dẫn
// - authMiddleware: Middleware 1 - Kiểm tra đăng nhập
// - upload.single('file'): Middleware 2 - Xử lý upload 1 file
// - uploadController.uploadImage: Middleware 3 - Hàm xử lý cuối cùng
//
// URL đầy đủ: POST /api/uploads/image
// (Giả sử trong server.js có: app.use('/api/uploads', uploadRoutes))
//
// GIẢI THÍCH MIDDLEWARE CHAIN (CHUỖI MIDDLEWARE):
// Request đi qua 3 middleware theo thứ tự:
// 1. authMiddleware → Kiểm tra user đã đăng nhập chưa
// 2. upload.single('file') → Xử lý file upload
// 3. uploadController.uploadImage → Upload file lên cloud
//
// GIẢI THÍCH upload.single('file'):
// - upload.single(): Hàm xử lý upload 1 file
// - 'file': Tên field trong form
//   + Frontend phải gửi file trong field tên "file"
//   + Ví dụ trong HTML: <input type="file" name="file">
// - Multer sẽ:
//   + Nhận file từ request
//   + Lưu vào RAM (memory storage)
//   + Đặt file vào req.file
//
// Cách hoạt động:
// 1. Giáo viên muốn upload ảnh thumbnail cho khóa học
// 2. Giáo viên chọn ảnh từ máy tính
// 3. Frontend gửi POST đến /api/uploads/image
//    - Header: Authorization: Bearer <token>
//    - Body: FormData với field "file" chứa ảnh
//    - Content-Type: multipart/form-data
// 4. Request đi qua authMiddleware:
//    - Kiểm tra token
//    - Nếu hợp lệ → req.user = { id, email, role }
//    - Nếu không → Trả về lỗi 401
// 5. Request đi qua upload.single('file'):
//    - Nhận file từ FormData
//    - Kiểm tra dung lượng (< 100MB)
//    - Lưu file vào RAM
//    - Đặt file vào req.file
// 6. Request đến uploadController.uploadImage:
//    - Lấy file từ req.file
//    - Upload file lên Cloudinary
//    - Cloudinary trả về URL
//    - Trả URL về cho frontend
// 7. Frontend nhận URL và lưu vào database
router.post('/image', authMiddleware, upload.single('file'), uploadController.uploadImage);

// ============================================
// ROUTE 2: UPLOAD VIDEO (CHO BÀI HỌC) 🎥
// ============================================
// GIẢI THÍCH:
// Route này GIỐNG ROUTE 1, chỉ khác:
// - Đường dẫn: '/video' thay vì '/image'
// - Controller: uploadController.uploadVideo
//
// URL đầy đủ: POST /api/uploads/video
//
// Cách hoạt động:
// 1. Giáo viên muốn upload video bài giảng
// 2. Giáo viên chọn video từ máy tính (ví dụ: lesson1.mp4 - 50MB)
// 3. Frontend gửi POST đến /api/uploads/video
//    - Header: Authorization: Bearer <token>
//    - Body: FormData với field "file" chứa video
// 4. authMiddleware: Kiểm tra đăng nhập
// 5. upload.single('file'): Nhận video, lưu vào RAM (50MB)
// 6. uploadController.uploadVideo:
//    - Upload video lên Cloudinary
//    - Cloudinary xử lý video (encode, optimize)
//    - Cloudinary trả về URL
// 7. Frontend nhận URL và lưu vào database
//
// LƯU Ý:
// - Video thường lớn (vài chục MB)
// - Upload chậm hơn ảnh
// - Có thể tốn vài giây hoặc vài phút
router.post('/video', authMiddleware, upload.single('file'), uploadController.uploadVideo);

// ============================================
// ROUTE 3: UPLOAD ẢNH ĐẠI DIỆN (PROFILE PICTURE) 👤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// router.post('/profile-picture', authMiddleware, profileUpload.single('file'), uploadController.uploadProfilePicture):
// - Giống route 1 và 2, nhưng dùng profileUpload thay vì upload
// - profileUpload: Cấu hình riêng cho ảnh đại diện (5MB, chỉ ảnh)
//
// URL đầy đủ: POST /api/uploads/profile-picture
//
// Cách hoạt động:
// 1. User muốn đổi ảnh đại diện
// 2. User chọn ảnh từ máy tính
// 3. Frontend gửi POST đến /api/uploads/profile-picture
//    - Header: Authorization: Bearer <token>
//    - Body: FormData với field "file" chứa ảnh
// 4. authMiddleware: Kiểm tra đăng nhập
// 5. profileUpload.single('file'):
//    - Nhận file
//    - Kiểm tra mimetype → Phải là ảnh (image/*)
//    - Kiểm tra dung lượng → Phải < 5MB
//    - Nếu OK → Lưu vào RAM, đặt vào req.file
//    - Nếu không OK → Trả về lỗi
// 6. uploadController.uploadProfilePicture:
//    - Upload ảnh lên Cloudinary
//    - Cloudinary trả về URL
//    - Cập nhật avatarUrl trong database (user table)
//    - Trả URL về cho frontend
// 7. Frontend hiển thị ảnh đại diện mới
//
// LƯU Ý:
// Nếu user upload file KHÔNG PHẢI ảnh (ví dụ: video.mp4):
// - profileUpload.fileFilter sẽ từ chối
// - Trả về lỗi: "Only image files are allowed for profile pictures"
// - Request KHÔNG đến uploadController.uploadProfilePicture
router.post('/profile-picture', authMiddleware, profileUpload.single('file'), uploadController.uploadProfilePicture);

// ============================================
// BƯỚC 4: XUẤT ROUTER RA NGOÀI 📤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// module.exports = router:
// - Xuất router để file khác có thể dùng
// - Trong server.js có thể:
//   const uploadRoutes = require('./routes/uploadRoutes');
//   app.use('/api/uploads', uploadRoutes);
module.exports = router;

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là ROUTE FILE cho upload file với 3 routes:
//
// 1. POST /image → Upload ảnh (khóa học, bài học) - Tối đa 100MB
// 2. POST /video → Upload video (bài học) - Tối đa 100MB
// 3. POST /profile-picture → Upload ảnh đại diện - Tối đa 5MB, chỉ ảnh
//
// CẤU HÌNH MULTER:
// - Dùng memory storage (lưu file vào RAM tạm thời)
// - Giới hạn dung lượng:
//   + Ảnh/video khóa học: 100MB
//   + Ảnh đại diện: 5MB
// - Lọc file:
//   + Ảnh đại diện: Chỉ chấp nhận file ảnh (image/*)
//
// MIDDLEWARE CHAIN:
// Request → authMiddleware → multer → controller
// 1. authMiddleware: Kiểm tra đăng nhập
// 2. multer: Nhận file, kiểm tra, lưu vào RAM
// 3. controller: Upload lên cloud, trả về URL
//
// CÁCH SỬ DỤNG:
// Trong server.js:
// app.use('/api/uploads', uploadRoutes);
//
// Kết quả:
// - Tất cả route có prefix "/api/uploads"
// - Ví dụ: router.post('/image') → POST /api/uploads/image
//
// VÍ DỤ THỰC TẾ - UPLOAD ẢNH ĐẠI DIỆN:
// 1. User vào trang "Hồ sơ"
// 2. User bấm vào ảnh đại diện → Hiện dialog chọn file
// 3. User chọn ảnh "avatar.jpg" (2MB)
// 4. Frontend tạo FormData:
//    const formData = new FormData();
//    formData.append('file', avatarFile);
// 5. Frontend gọi:
//    POST /api/uploads/profile-picture
//    Headers: {
//      'Authorization': 'Bearer eyJhbGci...',
//    }
//    Body: formData
// 6. Backend (authMiddleware):
//    - Kiểm tra token → OK
// 7. Backend (profileUpload):
//    - Kiểm tra file:
//      + mimetype: 'image/jpeg' → OK ✓
//      + size: 2MB → OK (< 5MB) ✓
//    - Lưu file vào RAM
// 8. Backend (uploadController.uploadProfilePicture):
//    - Upload lên Cloudinary
//    - Cloudinary trả về URL:
//      "https://res.cloudinary.com/.../avatar.jpg"
//    - Cập nhật database:
//      UPDATE users SET avatar_url = '...' WHERE id = 'abc123'
//    - Trả về response:
//      { success: true, url: '...' }
// 9. Frontend nhận URL
// 10. Frontend cập nhật ảnh đại diện trên UI
// 11. User thấy ảnh đại diện mới ngay lập tức!
//
// VÍ DỤ THỰC TẾ - UPLOAD VIDEO BÀI HỌC:
// 1. Giáo viên vào trang "Tạo bài học"
// 2. Giáo viên điền form:
//    - Tên bài: "Biến trong JavaScript"
//    - Mô tả: "..."
// 3. Giáo viên bấm "Chọn video" → Chọn "lesson1.mp4" (80MB)
// 4. Frontend hiển thị: "Đang tải lên... 0%"
// 5. Frontend gọi:
//    POST /api/uploads/video
//    Body: FormData với video
// 6. Backend xử lý (mất ~30 giây vì file lớn):
//    - authMiddleware: OK
//    - upload.single('file'): OK (< 100MB)
//    - uploadController.uploadVideo: Upload lên Cloudinary
// 7. Backend trả về URL video
// 8. Frontend hiển thị: "Tải lên thành công! ✓"
// 9. Giáo viên bấm "Lưu bài học"
// 10. Frontend lưu bài học vào database với videoUrl
//
// KEYWORD MỚI:
// - Upload: Tải lên
// - Multer: Thư viện xử lý upload file
// - Memory Storage: Lưu file vào RAM tạm thời
// - File Size Limit: Giới hạn dung lượng file
// - FileFilter: Hàm lọc file
// - Mimetype: Loại file (image/jpeg, video/mp4, v.v.)
// - FormData: Định dạng dữ liệu để gửi file
// - multipart/form-data: Content-Type khi upload file
// - Middleware Chain: Chuỗi middleware xử lý request
// - Single Upload: Upload 1 file duy nhất
