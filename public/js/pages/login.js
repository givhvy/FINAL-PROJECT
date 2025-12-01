// --- COMMON ELEMENTS ---
const loginForm = document.getElementById('loginForm');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const verifyResetModal = document.getElementById('verify-reset-modal');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const resetPasswordForm = document.getElementById('reset-password-form');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const resetMessageDiv1 = document.getElementById('reset-message-1');
const resetMessageDiv2 = document.getElementById('reset-message-2');
const errorMessageDiv = document.getElementById('errorMessage');

const API_BASE = (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin) + '/api/auth';

// --- UTILITY FUNCTIONS ---
function showMessage(element, message, isSuccess = false) {
    element.textContent = message;
    element.classList.remove('hidden');
    if (isSuccess) {
        element.className = 'text-sm p-3 rounded-lg bg-green-100 border border-green-200 text-green-700';
    } else {
        element.className = 'text-sm p-3 rounded-lg bg-red-100 border border-red-200 text-red-700';
    }
}

// --- LOGIN LOGIC ---
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    errorMessageDiv.classList.add('hidden');

    const API_URL = API_BASE + '/login';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Invalid email or password.');
        }

        // --- XỬ LÝ KHI ĐĂNG NHẬP THÀNH CÔNG ---
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if(data.user.role === 'admin') {
            window.location.href = '/admin';
        } else if (data.user.role === 'teacher') {
            window.location.href = '/teacher';
        } else {
            window.location.href = '/courses';
        }

    } catch (error) {
        console.error('Login Error:', error);
        errorMessageDiv.querySelector('p').textContent = 'Login failed: ' + error.message;
        errorMessageDiv.classList.remove('hidden');
    }
});

// --- FORGOT PASSWORD MODAL 1 (Send Code) ---
let currentResetUserId = null; // Lưu trữ ID người dùng để dùng cho Modal 2

// 1. Mở Modal 1
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.classList.remove('hidden');
    verifyResetModal.classList.add('hidden'); // Đảm bảo Modal 2 đóng
    document.getElementById('reset-email').value = document.getElementById('email').value;
    resetMessageDiv1.classList.add('hidden');
});

// 2. Đóng Modal 1
document.getElementById('cancel-reset-btn').addEventListener('click', () => {
    forgotPasswordModal.classList.add('hidden');
});

// 3. Xử lý gửi yêu cầu Code
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    const submitBtn = document.getElementById('send-reset-email-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    resetMessageDiv1.classList.add('hidden');

    try {
        const response = await fetch(API_BASE + '/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            // Nếu API trả về lỗi (ví dụ: email không hợp lệ)
            throw new Error(data.error || 'Failed to process request.');
        }

        // THÀNH CÔNG: Chuyển sang Modal 2 (chuyển sang cảnh 2)
        currentResetUserId = data.userId; // Lấy ID người dùng từ Backend
        document.getElementById('reset-email-field').value = email; // Lưu email để hiển thị nếu cần
        document.getElementById('reset-user-id').value = currentResetUserId; // Lưu ID người dùng

        showMessage(resetMessageDiv1, 'A verification code has been sent to your email address, if the account exists. Proceed to enter the code.', true);

        setTimeout(() => {
            forgotPasswordModal.classList.add('hidden');
            verifyResetModal.classList.remove('hidden');
            document.getElementById('verification-code').focus();
        }, 1500);

    } catch (error) {
        console.error("Forgot Password Fetch Error:", error);
        showMessage(resetMessageDiv1, error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Link';
    }
});

// --- RESET PASSWORD MODAL 2 (Verify Code & New Password) ---

// Nút Back to Login
document.getElementById('back-to-login-btn').addEventListener('click', () => {
    verifyResetModal.classList.add('hidden');
});

// 4. Xử lý Reset Mật khẩu cuối cùng
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('verification-code').value;
    const newPassword = document.getElementById('new-password').value;
    const userId = document.getElementById('reset-user-id').value; // Lấy ID từ hidden field
    const submitBtn = document.getElementById('verify-and-reset-btn');

    if (!userId) {
        showMessage(resetMessageDiv2, 'Error: User session lost. Please restart the process from Forgot Password.', false);
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';
    resetMessageDiv2.classList.add('hidden');

    try {
        const response = await fetch(API_BASE + '/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, code, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Verification failed. Invalid code or timeout.');
        }

        // Thành công
        showMessage(resetMessageDiv2, 'Password successfully reset! You can now log in.', true);

        setTimeout(() => {
            verifyResetModal.classList.add('hidden');
            // Xóa trường mật khẩu mới và code
            document.getElementById('new-password').value = '';
            document.getElementById('verification-code').value = '';
        }, 3000);

    } catch (error) {
        console.error("Reset Error:", error);
        showMessage(resetMessageDiv2, error.message, false);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset Password';
    }
});
