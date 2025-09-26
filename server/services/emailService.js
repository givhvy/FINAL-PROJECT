const nodemailer = require('nodemailer');

// -----------------------------------------------------------
// CHÚ Ý QUAN TRỌNG:
// Đảm bảo bạn đã cài đặt EMAIL_USER và EMAIL_PASS trong file .env
// và sử dụng Mật khẩu Ứng dụng (App Password) cho tài khoản Google/FPT của mình.
// -----------------------------------------------------------

// 1. Cấu hình Transporter (sử dụng cài đặt SMTP của Gmail/Google Workspace)
const transporter = nodemailer.createTransport({
    // Sử dụng host và port chuẩn cho Gmail/Google Workspace SMTP
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports (like 587)
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    },
    // Tùy chọn chỉ định để bỏ qua xác minh TLS/SSL (cần thiết cho môi trường dev/localhost)
    tls: {
        rejectUnauthorized: false
    }
});

const SENDER_EMAIL = process.env.EMAIL_USER;

// 2. Hàm gửi Email chào mừng khi đăng ký
exports.sendWelcomeEmail = async (userEmail, userName) => {
    if (!SENDER_EMAIL) {
        console.error("[Email Error] EMAIL_USER not configured. Skipping welcome email.");
        return;
    }

    const mailOptions = {
        from: `"CodeMaster" <${SENDER_EMAIL}>`, // Địa chỉ gửi đi là email của bạn
        to: userEmail,
        subject: '🎉 Chào mừng đến với CodeMaster! Hãy bắt đầu hành trình học tập của bạn.',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #4f46e5;">Xin chào, ${userName}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại CodeMaster. Chúng tôi rất vui được đồng hành cùng bạn trên hành trình chinh phục lập trình.</p>
                <p>Bạn có thể đăng nhập ngay và khám phá hàng trăm khóa học chất lượng cao:</p>
                <a href="http://localhost:5000/LoginPage.html" 
                   style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Đăng nhập ngay
                </a>
                <p style="margin-top: 20px; font-size: 0.8em; color: #777;">Trân trọng,<br>Đội ngũ CodeMaster.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent WELCOME email to: ${userEmail}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send welcome email to ${userEmail}:`, error);
    }
};

// 3. Hàm gửi Email Đặt lại Mật khẩu
exports.sendResetPasswordEmail = async (userEmail, resetCode) => {
    if (!SENDER_EMAIL) {
        console.error("[Email Error] EMAIL_USER not configured. Skipping reset password email.");
        return;
    }
    
    const mailOptions = {
        from: `"CodeMaster Security" <${SENDER_EMAIL}>`,
        to: userEmail,
        subject: '🔐 Yêu cầu Đặt lại Mật khẩu của CodeMaster',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #ef4444;">Đặt lại mật khẩu</h2>
                <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã xác thực sau:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 10px; background-color: #f3f4f6; border-radius: 5px; text-align: center;">
                    ${resetCode}
                </div>
                <p>Mã này sẽ hết hạn sau 10 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <p style="margin-top: 20px; font-size: 0.8em; color: #777;">Trân trọng,<br>Đội ngũ CodeMaster.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent RESET CODE email to: ${userEmail}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send reset email to ${userEmail}:`, error);
        throw new Error('Failed to send reset email via SMTP.');
    }
};
