const jwt = require('jsonwebtoken');
const { getFirestore } = require('firebase-admin/firestore');
// Import email services
const { sendResetPasswordEmail, sendWelcomeEmail } = require('../services/emailService');
// Import User Model
const User = require('../models/User');
// Import email validator
const { isEducationalEmail, isValidEmailFormat } = require('../utils/emailValidator');

// Hàm tạo mã ngẫu nhiên 6 chữ số (giữ nguyên)
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Hàm đăng ký người dùng mới
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate email format
        if (!isValidEmailFormat(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Determine the user role (default to 'student' if not specified)
        const userRole = role || 'student';

        // FR1.5: Verify student status for users registering as students
        if (userRole === 'student') {
            if (!isEducationalEmail(email)) {
                return res.status(400).json({
                    error: 'Students must register with an educational email address (e.g., .edu, .edu.vn, .ac.uk)',
                    hint: 'Please use your school or university email address'
                });
            }
        }

        // Sử dụng User Model để tạo người dùng mới
        const newUser = await User.create({
            name,
            email,
            password,
            role: userRole
        });

        // --- KÍCH HOẠT: Gửi email chào mừng ---
        // Không dùng await để quá trình đăng ký không bị chậm lại
        sendWelcomeEmail(email, name);

        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });

    } catch (err) {
        console.error('Register Error:', err);
        if (err.message === 'Email already in use') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Something went wrong during registration' });
    }
};

// Hàm đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sử dụng User Model để tìm người dùng theo email
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // So sánh password sử dụng method của User model
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Something went wrong during login' });
    }
};

// Hàm Forget Password (Gửi Mã Xác thực)
exports.forgotPassword = async (req, res) => {
    try {
        const db = getFirestore();
        const { email } = req.body;

        // Sử dụng User Model để tìm người dùng
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(200).json({ message: 'If the email is registered, a password reset email has been sent.' });
        }

        const resetCode = generateResetCode();
        const expiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes expiry

        // Lưu mã reset vào user model
        await user.saveResetCode(resetCode, expiryTime);

        // Cũng lưu vào collection password_resets để dễ quản lý
        await db.collection('password_resets').doc(user.id).set({
            userId: user.id,
            code: resetCode,
            expiresAt: expiryTime.toISOString(),
            createdAt: new Date().toISOString()
        });

        await sendResetPasswordEmail(email, resetCode);

        res.status(200).json({
            message: 'A verification code has been sent to your email address.',
            userId: user.id,
        });

    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ error: 'Could not process password reset request.' });
    }
};

// Hàm Đặt lại Mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const db = getFirestore();
        const { userId, code, newPassword } = req.body;

        const resetDocRef = db.collection('password_resets').doc(userId);
        const resetDoc = await resetDocRef.get();

        if (!resetDoc.exists) {
            return res.status(400).json({ error: 'Invalid or expired request. Please restart the process.' });
        }

        const resetData = resetDoc.data();
        const now = new Date();
        const expiresAt = new Date(resetData.expiresAt);

        if (resetData.code !== code || now > expiresAt) {
            await resetDocRef.delete();
            return res.status(400).json({ error: 'Invalid or expired verification code.' });
        }

        // Sử dụng User Model để cập nhật password
        await User.update(userId, { password: newPassword });

        // Xóa mã reset từ user
        const user = await User.findById(userId);
        if (user) {
            await user.clearResetCode();
        }

        await resetDocRef.delete();

        res.status(200).json({ message: 'Password updated successfully. You can now login with your new password.' });

    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ error: 'Something went wrong during password reset.' });
    }
};