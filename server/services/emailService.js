const nodemailer = require('nodemailer');

// Configure Transporter (using Gmail/Google Workspace SMTP settings)
const transporter = nodemailer.createTransport({
    // Use standard host and port for Gmail/Google Workspace SMTP
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports (like 587)
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    },
    // Option to bypass TLS/SSL verification (needed for dev/localhost environments)
    tls: {
        rejectUnauthorized: false
    }
});

const SENDER_EMAIL = process.env.EMAIL_USER;

// Send Welcome Email on Registration
exports.sendWelcomeEmail = async (userEmail, userName) => {
    if (!SENDER_EMAIL) {
        console.error("[Email Error] EMAIL_USER not configured. Skipping welcome email.");
        return;
    }

    const mailOptions = {
        from: `"UniLearn" <${SENDER_EMAIL}>`,
        to: userEmail,
        subject: '🎉 Welcome to UniLearn! Start Your Learning Journey.',
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

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent WELCOME email to: ${userEmail}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send welcome email to ${userEmail}:`, error);
    }
};


// Send Password Reset Code Email
exports.sendResetPasswordEmail = async (userEmail, resetCode) => {
    if (!SENDER_EMAIL) {
        console.error("[Email Error] EMAIL_USER not configured. Skipping reset password email.");
        return;
    }
    
    const mailOptions = {
        from: `"UniLearn Security" <${SENDER_EMAIL}>`,
        to: userEmail,
        subject: '🔐 UniLearn Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #ef4444;">Password Reset</h2>
                <p>We received a request to reset the password for your account. Please use the following verification code:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 10px; background-color: #f3f4f6; border-radius: 5px; text-align: center;">
                    ${resetCode}
                </div>
                <p>This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
                <p style="margin-top: 20px; font-size: 0.8em; color: #777;">Best regards,<br>The UniLearn Team.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent RESET CODE email to: ${userEmail}. Code: ${resetCode}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send reset email to ${userEmail}:`, error);
        throw new Error('Failed to send reset email via SMTP.');
    }
};
