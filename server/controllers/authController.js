const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getFirestore } = require('firebase-admin/firestore');
// BỔ SUNG: Import cả sendWelcomeEmail
const { sendResetPasswordEmail, sendWelcomeEmail } = require('../services/emailService'); 

// Hàm tạo mã ngẫu nhiên 6 chữ số (giữ nguyên)
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Hàm đăng ký người dùng mới
exports.register = async (req, res) => {
    try {
        const db = getFirestore();
        const { name, email, password, role } = req.body;

        const usersRef = db.collection('users');
        const q = usersRef.where('email', '==', email);
        const snapshot = await q.get();

        if (!snapshot.empty) {
            return res.status(400).json({ error: 'Email already in use' });
        }
       
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserRef = await db.collection('users').add({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            createdAt: new Date().toISOString()
        });
        
        // --- KÍCH HOẠT: Gửi email chào mừng ---
        // Không dùng await để quá trình đăng ký không bị chậm lại
        sendWelcomeEmail(email, name); 

        res.status(201).json({ message: 'User registered successfully', userId: newUserRef.id });

    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: 'Something went wrong during registration' });
    }
};

// Hàm đăng nhập (Giữ nguyên)
exports.login = async (req, res) => {
    try {
        const db = getFirestore();
        const { email, password } = req.body;

        const usersRef = db.collection('users');
        const q = usersRef.where('email', '==', email);
        const snapshot = await q.get();

        if (snapshot.empty) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
       
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: userDoc.id, role: userData.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: userDoc.id,
                name: userData.name,
                email: userData.email,
                role: userData.role
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

        const usersRef = db.collection('users');
        const q = usersRef.where('email', '==', email);
        const snapshot = await q.get();

        if (snapshot.empty) {
            return res.status(200).json({ message: 'If the email is registered, a password reset email has been sent.' });
        }

        const userDoc = snapshot.docs[0];
        const userId = userDoc.id;
        const resetCode = generateResetCode();

        const expiryTime = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes expiry

        await db.collection('password_resets').doc(userId).set({
            userId: userId,
            code: resetCode,
            expiresAt: expiryTime,
            createdAt: new Date().toISOString()
        });

        await sendResetPasswordEmail(email, resetCode);
        
        res.status(200).json({ 
            message: 'A verification code has been sent to your email address.',
            userId: userId,
        });

    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ error: 'Could not process password reset request.' });
    }
};

// Hàm Đặt lại Mật khẩu (Giữ nguyên)
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

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const userRef = db.collection('users').doc(userId);

        await userRef.update({
            password: hashedPassword 
        });

        await resetDocRef.delete();

        res.status(200).json({ message: 'Password updated successfully. You can now login with your new password.' });

    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ error: 'Something went wrong during password reset.' });
    }
};