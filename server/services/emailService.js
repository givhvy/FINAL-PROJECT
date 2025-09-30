const nodemailer = require('nodemailer');

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
        from: `"UniLearn" <${SENDER_EMAIL}>`, // Địa chỉ gửi đi là email của bạn
        to: userEmail,
        subject: '🎉 Chào mừng đến với UniLearn! Hãy bắt đầu hành trình học tập của bạn.',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #4f46e5;">Xin chào, ${userName}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại UniLearn. Chúng tôi rất vui được đồng hành cùng bạn trên hành trình chinh phục lập trình.</p>
                <p>Bạn có thể đăng nhập ngay và khám phá hàng trăm khóa học chất lượng cao:</p>
                <a href="http://localhost:5000/LoginPage.html" 
                   style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Đăng nhập ngay
                </a>
                <p style="margin-top: 20px; font-size: 0.8em; color: #777;">Trân trọng,<br>Đội ngũ UniLearn.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent WELCOME email to: ${userEmail}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send welcome email to ${userEmail}:`, error);
        // THÔNG BÁO LỖI THỰC TẾ TRONG CONSOLE
    }
};


// 3. Hàm gửi Mã Đặt lại Mật khẩu
exports.sendResetPasswordEmail = async (userEmail, resetCode) => {
    if (!SENDER_EMAIL) {
        console.error("[Email Error] EMAIL_USER not configured. Skipping reset password email.");
        return;
    }
    
    const mailOptions = {
        from: `"UniLearn Security" <${SENDER_EMAIL}>`,
        to: userEmail,
        subject: '🔐 Yêu cầu Đặt lại Mật khẩu của UniLearn',
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

// NEW: 3. Hàm gửi Email Xác nhận Join Mail List
exports.sendMailListConfirmation = async (userEmail) => {
    // Giả định SENDER_EMAIL đã được khai báo ở trên
    if (!process.env.EMAIL_USER) {
        console.error("[Email Error] EMAIL_USER not configured. Skipping mail list confirmation.");
        return;
    }
    
    const mailOptions = {
        from: `"UniLearn" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '✅ Chúc mừng! Bạn đã đăng ký nhận tin thành công!',
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
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent MAILLIST CONFIRMATION to: ${userEmail}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send MAILLIST confirmation to ${userEmail}:`, error);
        // Không throw lỗi 500 ở đây vì nó không phải lỗi ứng dụng chính
    }
};
    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent RESET CODE email to: ${userEmail}. Code: ${resetCode}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send reset email to ${userEmail}:`, error);
        throw new Error('Failed to send reset email via SMTP.');
    }
};
