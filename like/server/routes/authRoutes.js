// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BẢN ĐỒ CHỈ ĐƯỜNG" trong website!
// Khi bạn muốn đi đến một địa điểm (ví dụ: trang đăng ký, trang đăng nhập),
// file này sẽ chỉ cho Express biết: "Khi có người đến đường này, hãy làm việc này!"
//
// Ví dụ:
// - Người dùng gửi yêu cầu POST đến "/api/auth/register" → Gọi hàm register
// - Người dùng gửi yêu cầu POST đến "/api/auth/login" → Gọi hàm login
//
// File này KHÔNG XỬ LÝ logic, chỉ CHỈ ĐƯỜNG đến controller xử lý!

// ============================================
// GIẢI THÍCH KHÁI NIỆM ROUTING 🗺️
// ============================================
// ROUTING là gì?
// - "Route" = Đường đi, tuyến đường
// - "Routing" = Việc xác định đường đi
//
// Trong website:
// - URL: /api/auth/register → Route: đường đến trang đăng ký
// - URL: /api/auth/login → Route: đường đến trang đăng nhập
//
// Giống như:
// - Bạn muốn đến phòng tin học → Đi hành lang A, phòng 101
// - Bạn muốn đến phòng thể dục → Đi hành lang B, phòng 201
//                                 ↑ ROUTING = CHỈ ĐƯỜNG!

// ============================================
// GIẢI THÍCH HTTP METHODS (GET, POST) 📬
// ============================================
// HTTP METHODS là gì?
// - HTTP: Giao thức truyền tải dữ liệu trên web
// - Methods: Các phương thức (cách thức) gửi yêu cầu
//
// Các phương thức phổ biến:
// 1. GET: LẤY dữ liệu (như xem trang web, xem danh sách)
//    - Giống như: "Cho tôi xem menu nhà hàng"
//    - Không thay đổi dữ liệu trên server
//
// 2. POST: GỬI dữ liệu mới (như đăng ký, đăng nhập)
//    - Giống như: "Tôi muốn đặt món ăn này"
//    - Tạo dữ liệu mới hoặc xử lý thông tin
//
// 3. PUT: CẬP NHẬT toàn bộ dữ liệu
//    - Giống như: "Thay đổi toàn bộ đơn hàng của tôi"
//
// 4. PATCH: CẬP NHẬT một phần dữ liệu
//    - Giống như: "Chỉ thay đổi số lượng món trong đơn"
//
// 5. DELETE: XÓA dữ liệu
//    - Giống như: "Hủy đơn hàng"

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const express: Tạo hộp tên "express"
// require('express'): Mượn thư viện Express
//
// Express là gì?
// - Express là "framework" (khung sườn) để xây dựng website với Node.js
// - Giống như một bộ lego có sẵn các mảnh ghép để bạn xây nhà
// - Express cung cấp các công cụ để:
//   + Xử lý route (đường dẫn)
//   + Xử lý request (yêu cầu)
//   + Xử lý response (phản hồi)
const express = require('express');

// GIẢI THÍCH CÚ PHÁP:
// const router: Tạo hộp tên "router"
// express.Router(): Tạo một "bộ định tuyến" mới
//
// Router là gì?
// - Router = Bộ định tuyến (từ "route" = đường đi)
// - Giống như một tấm bảng chỉ đường nhỏ
// - Có thể định nghĩa nhiều đường đi (route) trên một router
// - Sau đó gắn router này vào ứng dụng chính
//
// Tại sao dùng Router?
// - Tổ chức code gọn gàng hơn
// - Mỗi module (auth, user, course) có router riêng
// - Dễ bảo trì và mở rộng
const router = express.Router();

// GIẢI THÍCH CÚ PHÁP:
// const jwt: Tạo hộp tên "jwt"
// require('jsonwebtoken'): Mượn thư viện jsonwebtoken
//
// JWT (JSON Web Token) là gì?
// - JWT: Một loại "thẻ thông hành" điện tử
// - Giống như thẻ học sinh có mã vạch
// - Dùng để:
//   + Xác minh người dùng đã đăng nhập
//   + Lưu thông tin người dùng (id, email, role)
//   + Có thời hạn (hết hạn phải đăng nhập lại)
const jwt = require('jsonwebtoken');

// GIẢI THÍCH CÚ PHÁP:
// const passport: Tạo hộp tên "passport"
// require('passport'): Mượn thư viện Passport
//
// Passport là gì?
// - Passport: Thư viện xác thực người dùng
// - Giống như "bác bảo vệ" kiểm tra thẻ
// - Hỗ trợ nhiều cách đăng nhập:
//   + Đăng nhập bằng email/password
//   + Đăng nhập bằng Google
//   + Đăng nhập bằng Facebook
//   + v.v.
const passport = require('passport');

// ============================================
// BƯỚC 2: LẤY CÁC HÀM XỬ LÝ TỪ CONTROLLER 📦
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const { register, login, forgotPassword, resetPassword }: Destructuring (phá cấu trúc)
//
// Destructuring là gì?
// - Cách viết ngắn gọn để lấy nhiều thuộc tính từ object
// - Thay vì:
//   const authController = require('...');
//   const register = authController.register;
//   const login = authController.login;
// - Viết gọn thành:
//   const { register, login } = require('...');
//
// Cú pháp:
// - { }: Dấu ngoặc nhọn cho destructuring
// - register, login, ...: Tên các thuộc tính cần lấy
// - Phải trùng với tên thuộc tính trong object nguồn
//
// require('../controllers/authController'): Mượn file authController
// - '../': Lùi lên 1 thư mục cha
// - 'controllers/': Vào thư mục controllers
// - 'authController': File authController.js
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// ============================================
// BƯỚC 3: ĐỊNH NGHĨA CÁC ROUTE CHO XÁC THỰC 🛣️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// router.post(): Định nghĩa route với phương thức POST
//   - router: Bộ định tuyến đã tạo ở trên
//   - .post(): Method định nghĩa route POST
//   - Tham số 1: '/register' - Đường dẫn (path)
//   - Tham số 2: register - Hàm xử lý (handler)
//
// Cách hoạt động:
// - Khi có yêu cầu POST đến "/api/auth/register"
// - Express sẽ gọi hàm register() từ authController
// - Hàm register() sẽ xử lý đăng ký người dùng
//
// POST vs GET:
// - POST: Gửi dữ liệu trong BODY (ẩn, an toàn hơn)
//   Ví dụ: { email: "an@gmail.com", password: "123456" }
// - GET: Gửi dữ liệu trong URL (hiện, không an toàn)
//   Ví dụ: /login?email=an@gmail.com&password=123456
//
// Tại sao dùng POST cho đăng ký/đăng nhập?
// - Mật khẩu không hiện trên URL
// - Không bị lưu trong lịch sử trình duyệt
// - Không bị ghi lại trong server log
router.post('/register', register);

// Route đăng nhập
// Tương tự như route đăng ký
// POST /api/auth/login → Gọi hàm login()
router.post('/login', login);

// Route quên mật khẩu
// POST /api/auth/forgot-password → Gọi hàm forgotPassword()
// Hàm này sẽ:
// 1. Nhận email từ người dùng
// 2. Tạo mã reset password
// 3. Gửi email chứa link reset password
router.post('/forgot-password', forgotPassword);

// Route đặt lại mật khẩu
// POST /api/auth/reset-password → Gọi hàm resetPassword()
// Hàm này sẽ:
// 1. Nhận mã reset và mật khẩu mới
// 2. Kiểm tra mã có hợp lệ không
// 3. Cập nhật mật khẩu mới
router.post('/reset-password', resetPassword);

// ============================================
// BƯỚC 4: ĐỊNH NGHĨA ROUTE CHO GOOGLE OAUTH 🔐
// ============================================

// GIẢI THÍCH KHÁI NIỆM GOOGLE OAUTH:
// OAuth là gì?
// - OAuth: Giao thức cho phép đăng nhập bằng tài khoản khác
// - Giống như: "Dùng thẻ học sinh để vào thư viện"
// - Không cần tạo tài khoản mới, dùng tài khoản Google có sẵn
//
// Quy trình Google OAuth:
// 1. User bấm "Đăng nhập bằng Google"
// 2. Website chuyển user đến trang Google
// 3. User đăng nhập Google và cho phép website truy cập thông tin
// 4. Google chuyển user về website kèm thông tin (email, tên, ảnh)
// 5. Website tạo tài khoản hoặc đăng nhập user

// Route TEST để kiểm tra Google OAuth có hoạt động không
// GET /api/auth/google/test → Trả về thông tin debug
router.get('/google/test', (req, res) => {
  // GIẢI THÍCH CÚ PHÁP:
  // (req, res): Hàm nhận 2 tham số
  //   - req (request): Yêu cầu từ người dùng
  //   - res (response): Phản hồi trả về cho người dùng
  // => : Dấu mũi tên tạo arrow function
  // { ... }: Khối code thực thi
  //
  // res.json(): Trả về dữ liệu dạng JSON
  // Object.keys(): Lấy danh sách tên thuộc tính của object
  // passport._strategies: Object chứa các strategy đã đăng ký
  // || {}: Nếu undefined thì trả về object rỗng
  res.json({
    message: 'Google OAuth route is working!',
    passportStrategies: Object.keys(passport._strategies || {})
  });
});

// ============================================
// BƯỚC 5: ROUTE BẮT ĐẦU QUY TRÌNH GOOGLE OAUTH 🚀
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// router.get('/google', ...): Định nghĩa route GET
//   - GET: Phương thức lấy dữ liệu
//   - '/google': Đường dẫn
//   - Tham số 2: Hàm middleware
//
// (req, res, next): Ba tham số của middleware
//   - req: Request (yêu cầu)
//   - res: Response (phản hồi)
//   - next: Hàm gọi middleware tiếp theo
//
// next là gì?
// - next: Hàm để chuyển sang middleware kế tiếp
// - Giống như: "OK xong, người tiếp theo xử lý"
// - Nếu không gọi next(): Request sẽ "kẹt" ở đây
router.get('/google', (req, res, next) => {
  // In log để debug (kiểm tra lỗi)
  console.log('🔵 /api/auth/google route hit!');
  console.log('Available strategies:', Object.keys(passport._strategies || {}));

  // GIẢI THÍCH CÚ PHÁP:
  // if (!passport._strategies || !passport._strategies.google): Kiểm tra điều kiện
  //   - !: Phủ định (NOT)
  //   - ||: Hoặc (OR)
  //   - Điều kiện 1: !passport._strategies
  //     + Nếu _strategies KHÔNG tồn tại → true
  //   - Điều kiện 2: !passport._strategies.google
  //     + Nếu strategy "google" KHÔNG tồn tại → true
  //   - Nếu MỘT trong hai true → vào if
  //
  // Tại sao kiểm tra?
  // - Nếu chưa setup Google OAuth (thiếu GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
  // - passport.use(GoogleStrategy) chưa được gọi
  // - Cần báo lỗi ngay thay vì để crash
  if (!passport._strategies || !passport._strategies.google) {
    // Trả về lỗi 500 (Internal Server Error - Lỗi server nội bộ)
    return res.status(500).json({ error: 'Google OAuth strategy not configured' });
  }

  // GIẢI THÍCH CÚ PHÁP:
  // passport.authenticate('google', { ... }): Gọi hàm xác thực
  //   - passport.authenticate(): Method để xác thực
  //   - 'google': Tên strategy (phải trùng với tên đã đăng ký)
  //   - { scope: [...] }: Object cấu hình
  //
  // scope là gì?
  // - scope: Phạm vi quyền truy cập (những thông tin được phép lấy)
  // - ['profile', 'email']: Mảng các quyền
  //   + 'profile': Lấy thông tin cá nhân (tên, ảnh)
  //   + 'email': Lấy địa chỉ email
  //
  // (req, res, next): Gọi hàm ngay lập tức
  // - passport.authenticate() trả về một hàm middleware
  // - (req, res, next) gọi hàm đó ngay
  // - Giống như: const func = passport.authenticate(...); func(req, res, next);
  //
  // Cách hoạt động:
  // 1. passport.authenticate() trả về hàm middleware
  // 2. Hàm middleware này sẽ:
  //    - Chuyển hướng user đến trang đăng nhập Google
  //    - Google sẽ hỏi user: "Bạn có cho phép website này truy cập không?"
  //    - User bấm "Đồng ý"
  //    - Google chuyển user về route callback (bước tiếp theo)
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// ============================================
// BƯỚC 6: ROUTE NHẬN KẾT QUẢ TỪ GOOGLE (CALLBACK) 🔙
// ============================================

// GIẢI THÍCH CALLBACK:
// Callback là gì?
// - "Call back" = Gọi lại
// - Là route mà Google sẽ "gọi lại" sau khi user đăng nhập thành công
// - Giống như: Bạn đặt hàng online, shipper sẽ "gọi lại" để giao hàng
//
// Quy trình:
// 1. User đăng nhập Google thành công
// 2. Google chuyển user về route "/google/callback"
// 3. Route này xử lý kết quả từ Google

// GIẢI THÍCH CÚ PHÁP:
// router.get('/google/callback', ...): Định nghĩa route callback
//   - Tham số 2: passport.authenticate() - Middleware xác thực
//   - Tham số 3: (req, res) => { ... } - Hàm xử lý sau khi xác thực xong
//
// Tại sao có 2 hàm?
// - Hàm 1 (middleware): Kiểm tra kết quả từ Google có hợp lệ không
// - Hàm 2 (handler): Xử lý sau khi kiểm tra xong
router.get('/google/callback',
  // MIDDLEWARE 1: Xác thực kết quả từ Google
  passport.authenticate('google', {
    // GIẢI THÍCH CÚ PHÁP:
    // failureRedirect: '/login': Nếu thất bại thì chuyển đến trang login
    //   - failureRedirect: Thuộc tính "chuyển hướng khi thất bại"
    //   - '/login': Đường dẫn trang login
    //   - Thất bại khi:
    //     + User bấm "Hủy" trên trang Google
    //     + User từ chối cho phép website truy cập
    //     + Lỗi kỹ thuật khác
    failureRedirect: '/login',

    // session: false: Không lưu session
    //   - session: Phiên làm việc (thời gian user đăng nhập)
    //   - false: Không dùng session
    //   - Tại sao false?
    //     + Chúng ta dùng JWT token thay vì session
    //     + JWT token tự chứa thông tin, không cần lưu trên server
    session: false
  }),

  // MIDDLEWARE 2: Xử lý sau khi xác thực thành công
  (req, res) => {
    // GIẢI THÍCH TRY-CATCH:
    // try: Thử chạy code
    // catch: Bắt lỗi nếu code trong try có lỗi
    try {
      // ============================================
      // BƯỚC 6.1: TẠO JWT TOKEN 🎫
      // ============================================

      // GIẢI THÍCH CÚ PHÁP:
      // const token: Tạo hộp tên "token"
      // jwt.sign(): Hàm TẠO token mới
      //   - jwt: Object JSON Web Token
      //   - .sign(): Method "ký" (tạo token)
      //   Tham số 1: Payload (dữ liệu cần lưu trong token)
      //   Tham số 2: Secret key (chìa khóa bí mật)
      //   Tham số 3: Options (cấu hình)
      //
      // Payload là gì?
      // - Payload: "Hàng hóa" (dữ liệu) mang theo
      // - Object chứa thông tin user:
      //   + userId: ID của user
      //   + email: Email của user
      //   + role: Vai trò (student, teacher, admin)
      //
      // req.user: Thông tin user từ Google
      // - passport.authenticate() đã lưu user vào req.user
      // - Lấy thông tin này để tạo token
      //
      // process.env.JWT_SECRET: Chìa khóa bí mật từ file .env
      // - Dùng để MÃ HÓA token
      // - Chỉ server biết chìa khóa này
      // - || 'your-secret-key': Nếu không có thì dùng giá trị mặc định
      //
      // { expiresIn: '7d' }: Token hết hạn sau 7 ngày
      //   - expiresIn: "Hết hạn trong"
      //   - '7d': 7 days (7 ngày)
      //   - Sau 7 ngày, token không còn hiệu lực, phải đăng nhập lại
      const token = jwt.sign(
        {
          userId: req.user.id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // ============================================
      // BƯỚC 6.2: CHUYỂN HƯỚNG VỀ TRANG CHỦ KÈM TOKEN 🏠
      // ============================================

      // GIẢI THÍCH CÚ PHÁP:
      // res.redirect(): Chuyển hướng trình duyệt đến URL khác
      //   - res: Response object
      //   - .redirect(): Method chuyển hướng
      //   - Tham số: URL đích
      //
      // Template String (Chuỗi mẫu):
      // - ` `: Dấu backtick (nút bên trái số 1 trên bàn phím)
      // - ${...}: Nhúng biến/biểu thức vào chuỗi
      // - Ví dụ:
      //   const name = "An";
      //   `Xin chào ${name}!` → "Xin chào An!"
      //
      // encodeURIComponent(): Mã hóa chuỗi để dùng trong URL
      // - Chuyển ký tự đặc biệt thành dạng %XX
      // - Ví dụ: " " (khoảng trắng) → "%20"
      // - Ví dụ: "{" → "%7B"
      // - Tại sao cần?
      //   + URL không chấp nhận một số ký tự đặc biệt
      //   + Cần mã hóa để truyền an toàn
      //
      // JSON.stringify(): Chuyển object thành chuỗi JSON
      // - Ví dụ: { id: "123" } → "{\"id\":\"123\"}"
      // - Tại sao cần?
      //   + URL chỉ chấp nhận chuỗi
      //   + Cần chuyển object thành chuỗi trước
      //
      // URL kết quả:
      // /?token=eyJhbGci...&user=%7B%22id%22%3A%22123%22...
      //   ↑ Token JWT    ↑ Thông tin user đã mã hóa
      //
      // Frontend sẽ:
      // 1. Đọc token và user từ URL
      // 2. Lưu token vào localStorage
      // 3. Lưu user vào state
      // 4. User đã đăng nhập thành công!
      res.redirect(`/?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        avatarUrl: req.user.avatarUrl
      }))}`);

    // GIẢI THÍCH CATCH:
    // catch (error): Bắt lỗi
    //   - error: Biến chứa thông tin lỗi
    } catch (error) {
      // In lỗi ra console để debug
      console.error('OAuth callback error:', error);

      // Chuyển về trang login kèm thông báo lỗi
      // ?error=auth_failed: Query parameter báo lỗi
      // Frontend sẽ đọc và hiển thị: "Đăng nhập thất bại"
      res.redirect('/login?error=auth_failed');
    }
  }
);

// ============================================
// BƯỚC 7: XUẤT ROUTER RA NGOÀI 📤
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// module.exports: Xuất router
// - module: Object đại diện cho file hiện tại
// - .exports: Thuộc tính để xuất code
// - = router: Gán router
//
// Sau khi export, file khác (ví dụ: server.js) có thể dùng:
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);
//
// Kết quả:
// - POST /api/auth/register → Đăng ký
// - POST /api/auth/login → Đăng nhập
// - POST /api/auth/forgot-password → Quên mật khẩu
// - POST /api/auth/reset-password → Đặt lại mật khẩu
// - GET /api/auth/google → Bắt đầu đăng nhập Google
// - GET /api/auth/google/callback → Nhận kết quả từ Google
module.exports = router;

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là ROUTE FILE (file định tuyến) cho xác thực:
//
// 1. Định nghĩa 6 route (đường dẫn):
//    - POST /register: Đăng ký tài khoản mới
//    - POST /login: Đăng nhập bằng email/password
//    - POST /forgot-password: Gửi email quên mật khẩu
//    - POST /reset-password: Đặt lại mật khẩu mới
//    - GET /google: Bắt đầu đăng nhập Google OAuth
//    - GET /google/callback: Nhận kết quả từ Google
//
// 2. Mỗi route CHỈ ĐƯỜNG đến controller tương ứng
//    - Không xử lý logic ở đây
//    - Logic xử lý ở authController.js
//
// 3. Đối với Google OAuth:
//    - Sử dụng passport.authenticate() để xác thực
//    - Tạo JWT token sau khi đăng nhập thành công
//    - Chuyển hướng về trang chủ kèm token
//
// CÁCH SỬ DỤNG:
// Trong file server.js:
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);
//
// Kết quả:
// - Tất cả route trong file này có prefix "/api/auth"
// - Ví dụ: router.post('/register') → POST /api/auth/register
//
// VÍ DỤ THỰC TẾ:
// 1. User điền form đăng ký, bấm nút "Đăng ký"
// 2. Frontend gửi POST request đến /api/auth/register
// 3. Express tìm route phù hợp trong authRoutes
// 4. Route gọi hàm register() từ authController
// 5. authController xử lý: Tạo user mới, lưu vào database
// 6. Trả về kết quả cho user
//
// KEYWORD MỚI:
// - Router: Bộ định tuyến
// - Route: Đường dẫn (path)
// - HTTP Methods: GET, POST, PUT, PATCH, DELETE
// - Middleware: Hàm xử lý trung gian
// - next(): Hàm gọi middleware tiếp theo
// - Callback: Hàm gọi lại
// - OAuth: Giao thức đăng nhập bằng tài khoản khác
// - Scope: Phạm vi quyền truy cập
// - JWT Token: Thẻ thông hành điện tử
// - res.redirect(): Chuyển hướng
// - Template String: Chuỗi mẫu với ${...}
// - encodeURIComponent(): Mã hóa chuỗi cho URL
// - JSON.stringify(): Chuyển object thành chuỗi JSON
