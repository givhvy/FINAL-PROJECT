// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BƯU ĐIỆN ĐIỆN TỬ" của website!
// Khi có sự kiện quan trọng xảy ra (đăng ký, quên mật khẩu),
// file này sẽ gửi email thông báo cho người dùng
// Giống như bưu tá gửi thư đến nhà bạn!
//
// Ví dụ:
// - Bạn đăng ký tài khoản mới → Gửi email chào mừng
// - Bạn quên mật khẩu → Gửi mã xác thực qua email
// - Bạn đăng ký nhận tin → Gửi email xác nhận

// ============================================
// GIẢI THÍCH KHÁI NIỆM EMAIL SERVICE 📧
// ============================================
// EMAIL SERVICE là gì?
// - "Service" = Dịch vụ
// - "Email Service" = Dịch vụ gửi email
// - Là một module riêng chuyên xử lý việc gửi email
//
// Tại sao cần Email Service?
// - Tách biệt logic gửi email khỏi controller
// - Có thể tái sử dụng ở nhiều nơi
// - Dễ bảo trì và thay đổi
//
// Kiến trúc:
// Controller → Email Service → SMTP Server → Email của người dùng
//   ↓              ↓               ↓              ↓
// "Cần gửi      "Tạo nội     "Gửi thư       "Nhận email"
//  email"        dung email"   qua mạng"

// ============================================
// GIẢI THÍCH KHÁI NIỆM SMTP 📬
// ============================================
// SMTP là gì?
// - SMTP: Simple Mail Transfer Protocol
// - Giao thức truyền thư đơn giản
// - Là "đường cao tốc" để gửi email trên internet
//
// Cách hoạt động:
// 1. Ứng dụng của chúng ta kết nối đến SMTP server (Gmail)
// 2. Đăng nhập bằng tài khoản email và mật khẩu
// 3. Gửi thông tin email (người nhận, tiêu đề, nội dung)
// 4. SMTP server gửi email đến người nhận
//
// Các thông tin cần thiết:
// - host: Địa chỉ SMTP server (ví dụ: smtp.gmail.com)
// - port: Cổng kết nối (587 hoặc 465)
// - user: Địa chỉ email gửi
// - pass: Mật khẩu ứng dụng (không phải mật khẩu thường)

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const nodemailer: Tạo hộp tên "nodemailer"
// require('nodemailer'): Mượn thư viện Nodemailer
//
// Nodemailer là gì?
// - Nodemailer: Thư viện Node.js để gửi email
// - Giống như "bưu tá điện tử" giúp gửi thư
// - Hỗ trợ nhiều dịch vụ email: Gmail, Outlook, Yahoo, v.v.
// - Có thể gửi email văn bản thuần hoặc HTML đẹp mắt
const nodemailer = require('nodemailer');

// ============================================
// BƯỚC 2: THIẾT LẬP TRANSPORTER (BƯU TÁ) 📮
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const transporter: Tạo hộp tên "transporter"
// nodemailer.createTransport(): Tạo một "transporter"
//   - nodemailer: Object Nodemailer
//   - .createTransport(): Method tạo transporter
//   - Tham số: Object cấu hình
//
// Transporter là gì?
// - Transporter: "Phương tiện vận chuyển" (bưu tá)
// - Là object chịu trách nhiệm GỬI email
// - Cần được cấu hình với thông tin SMTP trước khi dùng
//
// { ... }: Object cấu hình SMTP
const transporter = nodemailer.createTransport({
    // GIẢI THÍCH CÚ PHÁP:
    // host: 'smtp.gmail.com': Địa chỉ SMTP server của Gmail
    //   - host: Thuộc tính "máy chủ"
    //   - 'smtp.gmail.com': Địa chỉ SMTP của Gmail
    //
    // Giống như: Địa chỉ bưu điện mà bưu tá sẽ đến lấy thư
    host: 'smtp.gmail.com',

    // GIẢI THÍCH CÚ PHÁP:
    // port: 587: Cổng kết nối SMTP
    //   - port: Thuộc tính "cổng"
    //   - 587: Số cổng cho TLS/STARTTLS
    //
    // Port là gì?
    // - Port: "Cổng" để kết nối đến dịch vụ
    // - Giống như "cửa số" của bưu điện
    // - Mỗi dịch vụ có cổng riêng:
    //   + 587: TLS (bảo mật, khuyên dùng)
    //   + 465: SSL (bảo mật cũ hơn)
    //   + 25: Không bảo mật (không nên dùng)
    port: 587,

    // GIẢI THÍCH CÚ PHÁP:
    // secure: false: Không dùng SSL ngay từ đầu
    //   - secure: Thuộc tính "an toàn"
    //   - false: Không dùng SSL/TLS ban đầu
    //   - true: Dùng SSL/TLS ngay từ đầu (cổng 465)
    //
    // Tại sao false?
    // - Cổng 587 dùng STARTTLS (nâng cấp lên TLS sau khi kết nối)
    // - Không phải SSL ngay từ đầu
    secure: false,

    // GIẢI THÍCH CÚ PHÁP:
    // auth: { ... }: Object chứa thông tin đăng nhập
    //   - auth: Thuộc tính "xác thực"
    //   - { user, pass }: Object có 2 thuộc tính
    auth: {
        // GIẢI THÍCH CÚ PHÁP:
        // user: process.env.EMAIL_USER: Địa chỉ email gửi
        //   - user: Thuộc tính "người dùng"
        //   - process.env.EMAIL_USER: Lấy từ file .env
        //
        // Ví dụ: EMAIL_USER=unilearn@gmail.com
        user: process.env.EMAIL_USER,

        // GIẢI THÍCH CÚ PHÁP:
        // pass: process.env.EMAIL_PASS: Mật khẩu ứng dụng
        //   - pass: Thuộc tính "mật khẩu"
        //   - process.env.EMAIL_PASS: Lấy từ file .env
        //
        // Chú ý:
        // - KHÔNG PHẢI mật khẩu Gmail thường
        // - Là "App Password" (Mật khẩu ứng dụng)
        // - Tạo tại: Google Account → Security → App passwords
        pass: process.env.EMAIL_PASS
    },

    // GIẢI THÍCH CÚ PHÁP:
    // tls: { ... }: Cấu hình TLS (bảo mật)
    //   - tls: Thuộc tính "Transport Layer Security"
    //   - { rejectUnauthorized: false }: Object cấu hình
    tls: {
        // GIẢI THÍCH CÚ PHÁP:
        // rejectUnauthorized: false: Bỏ qua xác thực chứng chỉ TLS
        //   - rejectUnauthorized: "Từ chối khi không được ủy quyền"
        //   - false: Không từ chối (cho phép chứng chỉ tự ký)
        //
        // Tại sao false?
        // - Trong môi trường dev/localhost
        // - Chứng chỉ có thể không hợp lệ
        // - Trong production nên để true để bảo mật hơn
        rejectUnauthorized: false
    }
});

// GIẢI THÍCH CÚ PHÁP:
// const SENDER_EMAIL: Tạo hộp tên "SENDER_EMAIL"
// process.env.EMAIL_USER: Lấy email từ file .env
//
// Tại sao tạo biến này?
// - Để dùng lại nhiều lần trong các hàm
// - Không phải gõ process.env.EMAIL_USER mỗi lần
const SENDER_EMAIL = process.env.EMAIL_USER;

// ============================================
// BƯỚC 3: HÀM GỬI EMAIL CHÀO MỪNG 🎉
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// exports.sendWelcomeEmail: Xuất hàm sendWelcomeEmail
//   - exports: Object để xuất các hàm ra ngoài
//   - .sendWelcomeEmail: Tên hàm
//   - = async (...) => { ... }: Gán hàm async
//
// async: Hàm bất đồng bộ
// (userEmail, userName): Hai tham số
//   - userEmail: Địa chỉ email người dùng
//   - userName: Tên người dùng
//
// Khi nào dùng?
// - Khi người dùng đăng ký tài khoản thành công
// - authController gọi hàm này để gửi email chào mừng
exports.sendWelcomeEmail = async (userEmail, userName) => {
    // GIẢI THÍCH CÚ PHÁP:
    // if (!SENDER_EMAIL): Kiểm tra có email gửi không
    //   - !SENDER_EMAIL: Phủ định SENDER_EMAIL
    //   - Nếu không có (undefined/null) → vào if
    //
    // Tại sao kiểm tra?
    // - Nếu chưa cấu hình EMAIL_USER trong .env
    // - Không thể gửi email được
    // - Cần báo lỗi và dừng ngay
    if (!SENDER_EMAIL) {
        // In lỗi ra console
        console.error("[Email Error] EMAIL_USER not configured. Skipping welcome email.");
        // return: Dừng hàm, không gửi email
        return;
    }

    // GIẢI THÍCH CÚ PHÁP:
    // const mailOptions: Tạo hộp tên "mailOptions"
    // { ... }: Object chứa thông tin email
    //
    // mailOptions là gì?
    // - "Mail options" = Các tuỳ chọn thư
    // - Object chứa tất cả thông tin cần thiết để gửi email:
    //   + from: Người gửi
    //   + to: Người nhận
    //   + subject: Tiêu đề
    //   + html: Nội dung HTML
    const mailOptions = {
        // GIẢI THÍCH CÚ PHÁP:
        // from: `"UniLearn" <${SENDER_EMAIL}>`: Người gửi
        //   - from: Thuộc tính "từ"
        //   - ` `: Template string (dấu backtick)
        //   - "UniLearn": Tên hiển thị
        //   - <...>: Địa chỉ email thực
        //   - ${SENDER_EMAIL}: Nhúng biến vào chuỗi
        //
        // Kết quả: "UniLearn" <unilearn@gmail.com>
        // - Trong hộp thư: Hiển thị tên "UniLearn"
        // - Khi trả lời: Gửi đến unilearn@gmail.com
        from: `"UniLearn" <${SENDER_EMAIL}>`,

        // GIẢI THÍCH CÚ PHÁP:
        // to: userEmail: Người nhận
        //   - to: Thuộc tính "đến"
        //   - userEmail: Địa chỉ email người nhận (tham số)
        to: userEmail,

        // GIẢI THÍCH CÚ PHÁP:
        // subject: '...': Tiêu đề email
        //   - subject: Thuộc tính "chủ đề"
        //   - '...': Chuỗi tiêu đề
        //   - 🎉: Emoji (biểu tượng cảm xúc)
        //
        // Tiêu đề này sẽ hiển thị trong danh sách email
        subject: '🎉 Welcome to UniLearn! Start Your Learning Journey.',

        // GIẢI THÍCH CÚ PHÁP:
        // html: `...`: Nội dung email dạng HTML
        //   - html: Thuộc tính "HTML"
        //   - `...`: Template string nhiều dòng
        //
        // HTML là gì?
        // - HTML: HyperText Markup Language
        // - Ngôn ngữ đánh dấu để tạo nội dung web
        // - Cho phép định dạng đẹp: màu sắc, font chữ, nút bấm
        //
        // Các thẻ HTML cơ bản:
        // - <div>: Khối nội dung (division)
        // - <h2>: Tiêu đề cấp 2 (heading 2)
        // - <p>: Đoạn văn (paragraph)
        // - <a>: Liên kết (anchor/link)
        //
        // Thuộc tính style:
        // - style="...": Định dạng CSS inline
        // - Ví dụ: style="color: red;" → Chữ màu đỏ
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #4f46e5;">Hello, ${userName}!</h2>
                <p>Thank you for registering an account with UniLearn. We are excited to accompany you on your programming journey.</p>
                <p>You can log in now and explore hundreds of high-quality courses:</p>
                <a href="http://localhost:5000/LoginPage.html"
                   style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Log in now
                </a>
                <p style="margin-top: 20px; font-size: 0.8em; color: #777;">Best regards,<br>The UniLearn Team.</p>
            </div>
        `
    };

    // GIẢI THÍCH TRY-CATCH:
    // try: Thử gửi email
    // catch: Bắt lỗi nếu gửi thất bại
    try {
        // GIẢI THÍCH CÚ PHÁP:
        // await transporter.sendMail(mailOptions): Gửi email
        //   - await: Đợi gửi xong
        //   - transporter: Bưu tá đã tạo ở trên
        //   - .sendMail(): Method gửi email
        //   - (mailOptions): Object chứa thông tin email
        //
        // Quá trình gửi:
        // 1. Kết nối đến SMTP server (Gmail)
        // 2. Đăng nhập bằng EMAIL_USER và EMAIL_PASS
        // 3. Gửi email đến userEmail
        // 4. Đóng kết nối
        await transporter.sendMail(mailOptions);

        // In log thành công
        console.log(`[Email] Sent WELCOME email to: ${userEmail}`);

    } catch (error) {
        // Nếu có lỗi, in lỗi ra console
        // Lỗi có thể do:
        // - Sai EMAIL_USER hoặc EMAIL_PASS
        // - Không có kết nối internet
        // - Gmail chặn email (bảo mật)
        console.error(`[Email Error] Failed to send welcome email to ${userEmail}:`, error);
        // Không throw lỗi vì gửi email thất bại không nên làm crash app
    }
};

// ============================================
// BƯỚC 4: HÀM GỬI MÃ RESET MẬT KHẨU 🔐
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// exports.sendResetPasswordEmail: Xuất hàm sendResetPasswordEmail
// async (userEmail, resetCode): Hàm async nhận 2 tham số
//   - userEmail: Địa chỉ email người dùng
//   - resetCode: Mã xác thực (6 số ngẫu nhiên)
//
// Khi nào dùng?
// - Khi người dùng quên mật khẩu
// - authController tạo mã resetCode
// - Gọi hàm này để gửi mã qua email
exports.sendResetPasswordEmail = async (userEmail, resetCode) => {
    // Kiểm tra có email gửi không (tương tự như trên)
    if (!SENDER_EMAIL) {
        console.error("[Email Error] EMAIL_USER not configured. Skipping reset password email.");
        return;
    }

    // Tạo thông tin email
    const mailOptions = {
        // Người gửi: "UniLearn Security" (nhấn mạnh bảo mật)
        from: `"UniLearn Security" <${SENDER_EMAIL}>`,
        to: userEmail,
        subject: '🔐 Yêu cầu Đặt lại Mật khẩu của UniLearn',

        // Nội dung HTML chứa mã reset
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #ef4444;">Đặt lại mật khẩu</h2>
                <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã xác thực sau:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 10px; background-color: #f3f4f6; border-radius: 5px; text-align: center;">
                    ${resetCode}
                </div>
                <p>Mã này sẽ hết hạn sau 10 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <p style="margin-top: 20px; font-size: 0.8em; color: #777;">Trân trọng,<br>Đội ngũ UniLearn.</p>
            </div>
        `
    };

// ============================================
// BƯỚC 5: HÀM GỬI EMAIL XÁC NHẬN ĐĂNG KÝ NHẬN TIN ✅
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// exports.sendMailListConfirmation: Xuất hàm sendMailListConfirmation
// async (userEmail): Hàm async nhận 1 tham số
//   - userEmail: Địa chỉ email người dùng
//
// Khi nào dùng?
// - Khi người dùng đăng ký nhận tin tức/newsletter
// - Controller gọi hàm này để gửi email xác nhận
exports.sendMailListConfirmation = async (userEmail) => {
    // GIẢI THÍCH CÚ PHÁP:
    // if (!process.env.EMAIL_USER): Kiểm tra có email gửi không
    //   - Giống như các hàm trên
    //   - Dùng process.env.EMAIL_USER thay vì SENDER_EMAIL (cũng được)
    if (!process.env.EMAIL_USER) {
        console.error("[Email Error] EMAIL_USER not configured. Skipping mail list confirmation.");
        return;
    }

    // Tạo thông tin email
    const mailOptions = {
        from: `"UniLearn" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '✅ Chúc mừng! Bạn đã đăng ký nhận tin thành công!',

        // GIẢI THÍCH HTML:
        // <ul>: Unordered List (danh sách không thứ tự)
        // <li>: List Item (mục trong danh sách)
        //
        // Ví dụ:
        // <ul>
        //   <li>Mục 1</li>
        //   <li>Mục 2</li>
        // </ul>
        //
        // Kết quả:
        // • Mục 1
        // • Mục 2
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #10b981;">Chào mừng bạn gia nhập!</h2>
                <p>Cảm ơn bạn đã đăng ký nhận thông báo từ UniLearn. Kể từ bây giờ, bạn sẽ là người đầu tiên nhận được các thông tin sau:</p>
                <ul>
                    <li>Thông báo về các khóa học mới.</li>
                    <li>Ưu đãi độc quyền.</li>
                    <li>Tin tức công nghệ và lập trình hàng tuần.</li>
                </ul>
                <p style="margin-top: 20px;">Trân trọng,<br>Đội ngũ UniLearn.</p>
            </div>
        `
    };

    try {
        // Gửi email
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent MAILLIST CONFIRMATION to: ${userEmail}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send MAILLIST confirmation to ${userEmail}:`, error);
        // Không throw lỗi vì không phải lỗi ứng dụng chính
    }
};

    // CHÚ Ý: Khối try-catch này thuộc hàm sendResetPasswordEmail
    // (Cấu trúc code có vẻ bị lệch do copy-paste)
    try {
        // Gửi email reset password
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent RESET CODE email to: ${userEmail}. Code: ${resetCode}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send reset email to ${userEmail}:`, error);

        // GIẢI THÍCH CÚ PHÁP:
        // throw new Error('...'): Ném lỗi
        //   - throw: Từ khóa "ném" (throw)
        //   - new Error('...'): Tạo object lỗi mới
        //   - '...': Thông điệp lỗi
        //
        // Tại sao throw lỗi?
        // - Đối với reset password, GỬI EMAIL LÀ QUAN TRỌNG
        // - Nếu gửi thất bại, user không nhận được mã
        // - Cần báo lỗi cho controller để xử lý
        // - Controller sẽ trả về lỗi 500 cho frontend
        throw new Error('Failed to send reset email via SMTP.');
    }
};

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là EMAIL SERVICE (dịch vụ gửi email):
//
// 1. Thiết lập Transporter (Bưu tá điện tử):
//    - Kết nối đến Gmail SMTP server
//    - Sử dụng EMAIL_USER và EMAIL_PASS từ .env
//    - Port 587 với TLS để bảo mật
//
// 2. Xuất 3 hàm gửi email:
//    a) sendWelcomeEmail(userEmail, userName):
//       - Gửi email chào mừng khi đăng ký
//       - Chứa nút "Đăng nhập ngay"
//
//    b) sendResetPasswordEmail(userEmail, resetCode):
//       - Gửi mã xác thực để reset mật khẩu
//       - Mã hết hạn sau 10 phút
//       - THROW lỗi nếu gửi thất bại
//
//    c) sendMailListConfirmation(userEmail):
//       - Gửi email xác nhận đăng ký nhận tin
//       - Liệt kê lợi ích của việc đăng ký
//
// 3. Xử lý lỗi:
//    - Kiểm tra EMAIL_USER có được cấu hình không
//    - Bắt lỗi khi gửi email thất bại
//    - In log chi tiết để debug
//
// CÁCH SỬ DỤNG:
// Trong authController.js:
// const emailService = require('../services/emailService');
// await emailService.sendWelcomeEmail('user@gmail.com', 'An');
//
// VÍ DỤ THỰC TẾ:
// 1. User đăng ký tài khoản mới
// 2. authController tạo user trong database
// 3. authController gọi sendWelcomeEmail()
// 4. sendWelcomeEmail() gửi email qua Gmail SMTP
// 5. User nhận được email chào mừng trong hộp thư
//
// KEYWORD MỚI:
// - Email Service: Dịch vụ gửi email
// - SMTP: Simple Mail Transfer Protocol (Giao thức gửi email)
// - Transporter: Bưu tá (object gửi email)
// - Nodemailer: Thư viện Node.js gửi email
// - Port: Cổng kết nối
// - TLS/SSL: Giao thức bảo mật
// - mailOptions: Thông tin email (from, to, subject, html)
// - HTML Email: Email có định dạng đẹp
// - Template String: Chuỗi nhiều dòng với ${...}
// - throw new Error(): Ném lỗi
