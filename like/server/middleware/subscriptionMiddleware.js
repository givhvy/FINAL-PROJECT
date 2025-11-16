// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BÁC BẢO VỆ KIỂM TRA THẺ THÀNH VIÊN"!
// Trong website học online có 2 loại thành viên:
// 1. FREE (Miễn phí): Chỉ học được 3 khóa, chỉ xem bài 1
// 2. PRO (Trả phí): Học không giới hạn, xem tất cả bài
//
// File này kiểm tra:
// - Bạn là thành viên gì? (FREE hay PRO)
// - Bạn có quyền học khóa này không?
// - Bạn có quyền xem bài này không?
// Giống như bác bảo vệ kiểm tra thẻ xem bạn vào được phòng nào!

// ============================================
// GIẢI THÍCH KHÁI NIỆM SUBSCRIPTION TIER (CẤP ĐỘ GÓI) 📊
// ============================================
// SUBSCRIPTION TIER là gì?
// - Tier = Cấp độ, hạng
// - Subscription Tier = Cấp độ gói đăng ký
//
// Trong website này có 2 tier:
// 1. FREE TIER (Miễn phí):
//    - Giá: 0đ
//    - Giới hạn: Chỉ học 3 khóa
//    - Giới hạn: Chỉ xem bài 1 của khóa chưa đăng ký
//
// 2. PRO TIER (Trả phí):
//    - Giá: 199,000đ/tháng
//    - Không giới hạn khóa học
//    - Xem tất cả bài học
//
// Ví dụ thực tế:
// - Bạn dùng FREE → Học được JavaScript, Python, HTML (3 khóa)
// - Muốn học CSS → Phải trả tiền nâng cấp lên PRO
// - Hoặc bỏ 1 khóa cũ để học khóa mới

// ============================================
// GIẢI THÍCH KHÁI NIỆM MIDDLEWARE (AGAIN!) 🔧
// ============================================
// Nhắc lại: MIDDLEWARE = Bác bảo vệ đứng ở giữa
// Request → Middleware kiểm tra → Controller xử lý
//
// File này có 4 middleware:
// 1. requireProTier: Chỉ cho phép PRO vào
// 2. checkCourseAccess: Kiểm tra có quyền học khóa không
// 3. attachTierInfo: Gắn thông tin tier vào request
// 4. checkLessonAccess: Kiểm tra có quyền xem bài không

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const User = require('../models/User'):
// - Mượn User model
// - Dùng để tìm kiếm user trong database
// - Ví dụ: User.findById(userId) → Tìm user theo ID
const User = require('../models/User');

// GIẢI THÍCH CÚ PHÁP:
// const Enrollment = require('../models/Enrollment'):
// - Mượn Enrollment model
// - Enrollment = Đăng ký khóa học
// - Dùng để kiểm tra user đã đăng ký khóa nào
const Enrollment = require('../models/Enrollment');

// ============================================
// MIDDLEWARE 1: YÊU CẦU PHẢI LÀ PRO 💎
// ============================================
// GIẢI THÍCH:
// Middleware này CHỈ CHO PHÉP user PRO đi qua
// Dùng cho các tính năng ĐẶC BIỆT chỉ dành cho PRO
// Ví dụ: Tải chứng chỉ, xem thống kê chi tiết, v.v.
//
// Quy trình:
// 1. User gửi request
// 2. Middleware kiểm tra: User có phải PRO không?
// 3. Nếu PRO → Cho qua (next())
// 4. Nếu FREE → Chặn lại, trả về lỗi 403

// GIẢI THÍCH CÚ PHÁP:
// const requireProTier = async (req, res, next) => { ... }:
// - const requireProTier: Tạo hằng số tên requireProTier
// - = async (req, res, next) => { ... }: Gán hàm async
// - async: Hàm bất đồng bộ (có thể dùng await)
// - (req, res, next): 3 tham số của middleware
//   + req: Request (yêu cầu từ user)
//   + res: Response (phản hồi trả về)
//   + next: Hàm gọi middleware tiếp theo
const requireProTier = async (req, res, next) => {
    // GIẢI THÍCH TRY-CATCH:
    // try: Thử chạy code
    // catch: Bắt lỗi nếu có
    try {
        // ============================================
        // BƯỚC 1: LẤY USER ID TỪ REQUEST 🔑
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // const userId = req.user.id:
        // - req.user: Object chứa thông tin user (được gắn bởi authMiddleware)
        // - .id: Lấy thuộc tính id
        // - Ví dụ: req.user = { id: "abc123", email: "an@gmail.com" }
        //   → userId = "abc123"
        const userId = req.user.id;

        // ============================================
        // BƯỚC 2: TÌM USER TRONG DATABASE 🔍
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // const user = await User.findById(userId):
        // - await: Đợi kết quả trả về
        // - User.findById(userId): Tìm user theo ID
        // - Kết quả trả về:
        //   + Nếu tìm thấy: Object user
        //   + Nếu không: null
        const user = await User.findById(userId);

        // ============================================
        // BƯỚC 3: KIỂM TRA USER CÓ TỒN TẠI KHÔNG ❓
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // if (!user):
        // - !: Phủ định (NOT)
        // - !user: Nếu user KHÔNG tồn tại (null hoặc undefined)
        if (!user) {
            // GIẢI THÍCH CÚ PHÁP:
            // return res.status(404).json({ ... }):
            // - return: Dừng hàm, không chạy code phía dưới
            // - res.status(404): Đặt HTTP status code = 404 (Not Found - Không tìm thấy)
            // - .json({ ... }): Trả về dữ liệu JSON
            return res.status(404).json({ error: 'User not found' });
        }

        // ============================================
        // BƯỚC 4: KIỂM TRA USER CÓ PHẢI PRO KHÔNG 💎
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // if (user.subscriptionTier !== 'pro'):
        // - user.subscriptionTier: Cấp độ gói của user ('free' hoặc 'pro')
        // - !==: So sánh KHÔNG BẰNG
        // - 'pro': Chuỗi 'pro'
        // - Điều kiện: Nếu subscriptionTier KHÔNG PHẢI 'pro' → true
        //
        // Ví dụ:
        // - user.subscriptionTier = 'free' → 'free' !== 'pro' → true → Vào if
        // - user.subscriptionTier = 'pro' → 'pro' !== 'pro' → false → Không vào if
        if (user.subscriptionTier !== 'pro') {
            // GIẢI THÍCH CÚ PHÁP:
            // return res.status(403).json({ ... }):
            // - 403: Forbidden (Cấm) - Không có quyền truy cập
            // - Trả về lỗi kèm message (thông báo)
            return res.status(403).json({
                error: 'Pro subscription required',
                message: 'This feature requires a Pro subscription. Please upgrade your account.'
                // Thông báo: "Tính năng này cần gói PRO. Vui lòng nâng cấp tài khoản."
            });
        }

        // ============================================
        // BƯỚC 5: CHO QUA (NEXT) ✅
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // next():
        // - Gọi middleware tiếp theo hoặc controller
        // - Giống như: "OK, bạn qua được, tiếp tục đi!"
        // - Request tiếp tục hành trình của nó
        next();
    } catch (error) {
        // GIẢI THÍCH CATCH:
        // Nếu có lỗi bất ngờ (ví dụ: database down)
        // → In lỗi ra console để debug
        console.error('Subscription check error:', error);
        // → Trả về lỗi 500 (Internal Server Error)
        res.status(500).json({ error: 'Error checking subscription status' });
    }
};

// ============================================
// MIDDLEWARE 2: KIỂM TRA QUYỀN TRUY CẬP KHÓA HỌC 📚
// ============================================
// GIẢI THÍCH:
// Middleware này kiểm tra user có quyền học khóa này không
// Quy tắc:
// - PRO: Học tất cả khóa
// - FREE: Chỉ học 3 khóa
//
// Quy trình:
// 1. Kiểm tra user là PRO hay FREE
// 2. Nếu PRO → Cho qua
// 3. Nếu FREE → Kiểm tra đã đăng ký khóa này chưa
// 4. Nếu đã đăng ký → Cho qua
// 5. Nếu chưa → Kiểm tra số lượng khóa đã đăng ký
// 6. Nếu < 3 khóa → Cho qua
// 7. Nếu >= 3 khóa → Chặn lại (đã đủ 3 khóa)

// GIẢI THÍCH CÚ PHÁP:
// const checkCourseAccess = async (req, res, next) => { ... }:
// - Tạo hàm middleware checkCourseAccess
// - async: Hàm bất đồng bộ
const checkCourseAccess = async (req, res, next) => {
    try {
        // ============================================
        // BƯỚC 1: LẤY THÔNG TIN CẦN THIẾT 📋
        // ============================================
        // Lấy userId từ req.user (gắn bởi authMiddleware)
        const userId = req.user.id;

        // GIẢI THÍCH CÚ PHÁP:
        // const courseId = req.params.courseId || req.body.courseId:
        // - req.params.courseId: courseId từ URL (ví dụ: /courses/:courseId)
        // - req.body.courseId: courseId từ body của request
        // - ||: Toán tử OR (hoặc)
        // - Lấy từ params trước, nếu không có thì lấy từ body
        //
        // Ví dụ:
        // - URL: GET /courses/abc123/enroll → req.params.courseId = "abc123"
        // - Body: POST /enrollments { courseId: "xyz789" } → req.body.courseId = "xyz789"
        const courseId = req.params.courseId || req.body.courseId;

        // Tìm user trong database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // ============================================
        // BƯỚC 2: KIỂM TRA PRO TIER → CHO QUA LUÔN 💎
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // if (user.subscriptionTier === 'pro'):
        // - ===: So sánh BẰNG
        // - Nếu là PRO → Cho qua không cần kiểm tra thêm
        if (user.subscriptionTier === 'pro') {
            // GIẢI THÍCH CÚ PHÁP:
            // req.hasCourseAccess = true:
            // - Gắn thuộc tính hasCourseAccess vào req
            // - Controller có thể dùng: if (req.hasCourseAccess) { ... }
            // - Giống như đóng dấu "Có quyền truy cập" lên request
            req.hasCourseAccess = true;
            return next(); // Cho qua
        }

        // ============================================
        // BƯỚC 3: FREE TIER - KIỂM TRA SỐ LƯỢNG KHÓA ĐÃ ĐĂNG KÝ 🔢
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // const enrollments = await Enrollment.findByUserId(userId):
        // - Enrollment.findByUserId(userId): Tìm tất cả enrollments của user
        // - enrollments: Mảng các enrollment
        // - Ví dụ:
        //   [
        //     { id: "e1", userId: "abc", courseId: "c1" },
        //     { id: "e2", userId: "abc", courseId: "c2" },
        //     { id: "e3", userId: "abc", courseId: "c3" }
        //   ]
        const enrollments = await Enrollment.findByUserId(userId);

        // GIẢI THÍCH CÚ PHÁP:
        // const enrolledCourseIds = enrollments.map(e => e.courseId):
        // - .map(): Hàm biến đổi mảng
        // - e => e.courseId: Arrow function lấy courseId từ mỗi enrollment
        // - Kết quả: Mảng các courseId
        //
        // Ví dụ:
        // enrollments = [
        //   { id: "e1", courseId: "c1" },
        //   { id: "e2", courseId: "c2" }
        // ]
        // → enrolledCourseIds = ["c1", "c2"]
        const enrolledCourseIds = enrollments.map(e => e.courseId);

        // ============================================
        // BƯỚC 4: KIỂM TRA ĐÃ ĐĂNG KÝ KHÓA NÀY CHƯA ✅
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // if (enrolledCourseIds.includes(courseId)):
        // - .includes(courseId): Kiểm tra mảng có chứa courseId không
        // - Trả về true nếu có, false nếu không
        //
        // Ví dụ:
        // enrolledCourseIds = ["c1", "c2", "c3"]
        // courseId = "c2"
        // → ["c1", "c2", "c3"].includes("c2") → true
        if (enrolledCourseIds.includes(courseId)) {
            // Đã đăng ký khóa này rồi → Cho qua
            req.hasCourseAccess = true;
            return next();
        }

        // ============================================
        // BƯỚC 5: KIỂM TRA SỐ LƯỢNG < 3 KHÓA 🔢
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // if (enrollments.length < 3):
        // - enrollments.length: Số lượng enrollments
        // - < 3: Nhỏ hơn 3
        // - Nếu đăng ký dưới 3 khóa → Còn chỗ → Cho qua
        if (enrollments.length < 3) {
            req.hasCourseAccess = true;
            return next();
        }

        // ============================================
        // BƯỚC 6: ĐÃ ĐỦ 3 KHÓA → CHẶN LẠI ❌
        // ============================================
        // GIẢI THÍCH:
        // User FREE đã đăng ký 3 khóa rồi
        // Muốn học thêm → Phải nâng cấp PRO hoặc bỏ 1 khóa cũ
        return res.status(403).json({
            error: 'Course limit reached',
            message: 'Free tier users can only access 3 courses. Upgrade to Pro for unlimited access.',
            enrollmentCount: enrollments.length,  // Số khóa đã đăng ký (3)
            maxFreeEnrollments: 3                  // Giới hạn tối đa (3)
        });
    } catch (error) {
        console.error('Course access check error:', error);
        res.status(500).json({ error: 'Error checking course access' });
    }
};

// ============================================
// MIDDLEWARE 3: GẮNTHÔNG TIN TIER VÀO REQUEST 🏷️
// ============================================
// GIẢI THÍCH:
// Middleware này KHÔNG CHẶN, chỉ GẮN THÔNG TIN
// Gắn 2 thuộc tính vào req:
// - req.subscriptionTier: 'free' hoặc 'pro'
// - req.isPro: true hoặc false
//
// Controller có thể dùng:
// if (req.isPro) {
//   // Làm gì đó đặc biệt cho PRO
// }

// GIẢI THÍCH CÚ PHÁP:
// const attachTierInfo = async (req, res, next) => { ... }:
// - Tạo middleware attachTierInfo
const attachTierInfo = async (req, res, next) => {
    try {
        // GIẢI THÍCH CÚ PHÁP:
        // const userId = req.user?.id:
        // - req.user?.id: Optional chaining (chuỗi tùy chọn)
        // - ?: Toán tử kiểm tra null/undefined
        // - Nếu req.user tồn tại → Lấy .id
        // - Nếu req.user null/undefined → Trả về undefined (không lỗi)
        //
        // Ví dụ:
        // - req.user = { id: "abc" } → userId = "abc"
        // - req.user = null → userId = undefined (không crash)
        const userId = req.user?.id;

        // ============================================
        // TRƯỜNG HỢP 1: KHÔNG CÓ USER ID → MẶC ĐỊNH FREE 🆓
        // ============================================
        if (!userId) {
            req.subscriptionTier = 'free';
            req.isPro = false;
            return next();
        }

        // ============================================
        // TRƯỜNG HỢP 2: TÌM USER TRONG DATABASE 🔍
        // ============================================
        const user = await User.findById(userId);

        if (!user) {
            // Không tìm thấy user → Mặc định FREE
            req.subscriptionTier = 'free';
            req.isPro = false;
            return next();
        }

        // ============================================
        // TRƯỜNG HỢP 3: GẮN THÔNG TIN TỪ USER 📊
        // ============================================
        // GIẢI THÍCH CÚ PHÁP:
        // req.subscriptionTier = user.subscriptionTier || 'free':
        // - user.subscriptionTier: Tier của user
        // - || 'free': Nếu không có thì mặc định 'free'
        //
        // Ví dụ:
        // - user.subscriptionTier = 'pro' → req.subscriptionTier = 'pro'
        // - user.subscriptionTier = null → req.subscriptionTier = 'free'
        req.subscriptionTier = user.subscriptionTier || 'free';

        // GIẢI THÍCH CÚ PHÁP:
        // req.isPro = user.subscriptionTier === 'pro':
        // - So sánh subscriptionTier với 'pro'
        // - Kết quả: true hoặc false
        //
        // Ví dụ:
        // - user.subscriptionTier = 'pro' → req.isPro = true
        // - user.subscriptionTier = 'free' → req.isPro = false
        req.isPro = user.subscriptionTier === 'pro';

        next(); // Cho qua
    } catch (error) {
        // Nếu có lỗi → Mặc định FREE và cho qua (không chặn)
        console.error('Error attaching tier info:', error);
        req.subscriptionTier = 'free';
        req.isPro = false;
        next();
    }
};

// ============================================
// MIDDLEWARE 4: KIỂM TRA QUYỀN XEM BÀI HỌC 📖
// ============================================
// GIẢI THÍCH:
// Middleware này kiểm tra user có quyền xem bài này không
// Quy tắc:
// - PRO: Xem tất cả bài
// - FREE đã đăng ký khóa: Xem tất cả bài
// - FREE chưa đăng ký khóa: Chỉ xem bài 1 (preview)
//
// Quy trình:
// 1. Kiểm tra user là PRO → Cho qua
// 2. Kiểm tra đã đăng ký khóa này → Cho qua
// 3. Kiểm tra lessonIndex = 0 (bài 1) → Cho qua (preview)
// 4. Còn lại → Chặn (cần đăng ký hoặc nâng cấp PRO)

// GIẢI THÍCH CÚ PHÁP:
// const checkLessonAccess = async (req, res, next) => { ... }:
// - Tạo middleware checkLessonAccess
const checkLessonAccess = async (req, res, next) => {
    try {
        // ============================================
        // BƯỚC 1: LẤY THÔNG TIN CẦN THIẾT 📋
        // ============================================
        const userId = req.user.id;
        const courseId = req.params.courseId;

        // GIẢI THÍCH CÚ PHÁP:
        // const lessonIndex = parseInt(req.params.lessonIndex || req.query.lessonIndex || 0):
        // - req.params.lessonIndex: lessonIndex từ URL (ví dụ: /lessons/:lessonIndex)
        // - req.query.lessonIndex: lessonIndex từ query string (ví dụ: ?lessonIndex=2)
        // - || 0: Mặc định là 0 nếu không có
        // - parseInt(): Chuyển chuỗi thành số nguyên
        //
        // Ví dụ:
        // - URL: /courses/c1/lessons/2 → lessonIndex = 2
        // - URL: /courses/c1/lessons?lessonIndex=3 → lessonIndex = 3
        // - URL: /courses/c1/lessons → lessonIndex = 0
        const lessonIndex = parseInt(req.params.lessonIndex || req.query.lessonIndex || 0);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // ============================================
        // BƯỚC 2: PRO TIER → CHO QUA 💎
        // ============================================
        if (user.subscriptionTier === 'pro') {
            req.hasLessonAccess = true;
            return next();
        }

        // ============================================
        // BƯỚC 3: KIỂM TRA ĐÃ ĐĂNG KÝ KHÓA CHƯA 📚
        // ============================================
        const enrollments = await Enrollment.findByUserId(userId);

        // GIẢI THÍCH CÚ PHÁP:
        // const isEnrolled = enrollments.some(e => e.courseId === courseId):
        // - .some(): Hàm kiểm tra có ít nhất 1 phần tử thỏa điều kiện không
        // - e => e.courseId === courseId: Điều kiện kiểm tra
        // - Trả về true nếu có, false nếu không
        //
        // Ví dụ:
        // enrollments = [
        //   { courseId: "c1" },
        //   { courseId: "c2" }
        // ]
        // courseId = "c2"
        // → enrollments.some(e => e.courseId === "c2") → true
        const isEnrolled = enrollments.some(e => e.courseId === courseId);

        if (isEnrolled) {
            // Đã đăng ký khóa này → Cho xem tất cả bài
            req.hasLessonAccess = true;
            return next();
        }

        // ============================================
        // BƯỚC 4: CHƯA ĐĂNG KÝ - CHỈ CHO XEM BÀI 1 👀
        // ============================================
        // GIẢI THÍCH:
        // Bài 1 có index = 0 (mảng bắt đầu từ 0)
        // FREE chưa đăng ký → Cho xem bài 1 để "thử"
        // Muốn xem bài 2, 3, ... → Phải đăng ký
        if (lessonIndex === 0) {
            // Cho xem bài 1 (preview mode)
            req.hasLessonAccess = true;

            // GIẢI THÍCH CÚ PHÁP:
            // req.isPreviewOnly = true:
            // - Gắn cờ "chỉ xem thử"
            // - Controller có thể hiển thị thông báo: "Đây là bài xem thử. Đăng ký để xem tiếp!"
            req.isPreviewOnly = true;
            return next();
        }

        // ============================================
        // BƯỚC 5: MUỐN XEM BÀI 2, 3, ... → CHẶN ❌
        // ============================================
        return res.status(403).json({
            error: 'Lesson locked',
            message: 'Free tier users can only preview lesson 1. Enroll in this course or upgrade to Pro for full access.',
            previewOnly: true
        });
    } catch (error) {
        console.error('Lesson access check error:', error);
        res.status(500).json({ error: 'Error checking lesson access' });
    }
};

// ============================================
// XUẤT CÁC MIDDLEWARE RA NGOÀI 📤
// ============================================
// GIẢI THÍCH CÚ PHÁP:
// module.exports = { ... }:
// - Xuất nhiều middleware cùng lúc
// - File khác có thể import:
//   const { requireProTier, checkCourseAccess } = require('./middleware/subscriptionMiddleware');
module.exports = {
    requireProTier,      // Middleware 1: Yêu cầu PRO
    checkCourseAccess,   // Middleware 2: Kiểm tra quyền học khóa
    attachTierInfo,      // Middleware 3: Gắn thông tin tier
    checkLessonAccess    // Middleware 4: Kiểm tra quyền xem bài
};

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này có 4 middleware kiểm tra quyền truy cập theo tier:
//
// 1. requireProTier:
//    - Chỉ cho phép PRO
//    - Dùng cho tính năng đặc biệt (tải chứng chỉ, v.v.)
//
// 2. checkCourseAccess:
//    - Kiểm tra có quyền học khóa không
//    - FREE: Tối đa 3 khóa
//    - PRO: Không giới hạn
//
// 3. attachTierInfo:
//    - Gắn thông tin tier vào request
//    - Controller có thể dùng req.isPro, req.subscriptionTier
//    - Không chặn, chỉ gắn thông tin
//
// 4. checkLessonAccess:
//    - Kiểm tra có quyền xem bài không
//    - FREE chưa đăng ký: Chỉ xem bài 1
//    - FREE đã đăng ký hoặc PRO: Xem tất cả
//
// CÁCH SỬ DỤNG:
// const { requireProTier } = require('./middleware/subscriptionMiddleware');
// router.get('/premium-feature', authMiddleware, requireProTier, controller.function);
//
// VÍ DỤ THỰC TẾ:
// 1. User FREE muốn tải chứng chỉ (tính năng PRO)
// 2. Request đi qua requireProTier
// 3. Middleware kiểm tra → User không phải PRO
// 4. Trả về lỗi 403: "Cần nâng cấp PRO"
// 5. Frontend hiển thị popup: "Nâng cấp PRO để tải chứng chỉ!"
//
// KEYWORD MỚI:
// - Subscription Tier: Cấp độ gói đăng ký
// - FREE tier: Gói miễn phí (giới hạn)
// - PRO tier: Gói trả phí (không giới hạn)
// - Enrollment: Đăng ký khóa học
// - Preview: Xem thử
// - Optional Chaining (?.): Kiểm tra null/undefined an toàn
// - .map(): Biến đổi mảng
// - .includes(): Kiểm tra phần tử có trong mảng
// - .some(): Kiểm tra có ít nhất 1 phần tử thỏa điều kiện
