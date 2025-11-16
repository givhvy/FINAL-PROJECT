// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "bác bảo vệ" ở cổng trường!
// Nó quản lý việc:
// 1. Đăng ký tài khoản mới (như đăng ký học sinh mới)
// 2. Đăng nhập vào website (như kiểm tra thẻ học sinh)
// 3. Quên mật khẩu (như xin làm lại thẻ)
// 4. Đổi mật khẩu mới (như cấp thẻ mới)

// ============================================
// GIẢI THÍCH VỀ SYNTAX (CÚ PHÁP) JAVASCRIPT 📖
// ============================================
// QUAN TRỌNG! Đọc phần này trước để hiểu code:
//
// 1. const = "constant" (hằng số) - Tạo một "hộp" không đổi được
//    Ví dụ: const name = "An" → Tạo hộp tên "name" chứa giá trị "An"
//    Sau đó KHÔNG thể đổi: name = "Bình" ❌ (sẽ báo lỗi)
//
// 2. let = "let" (để cho phép) - Tạo một "hộp" có thể đổi được
//    Ví dụ: let age = 5 → Tạo hộp tên "age" chứa số 5
//    Sau đó CÓ THỂ đổi: age = 6 ✅ (không lỗi)
//
// 3. var = "variable" (biến) - Giống "let" nhưng cũ hơn
//    Ngày nay người ta ít dùng var, dùng const hoặc let nhiều hơn
//
// 4. async = "asynchronous" (không đồng bộ)
//    Từ khóa này cho phép hàm chạy MÀ KHÔNG chờ đợi
//    Giống như bạn gửi thư rồi tiếp tục chơi, không đứng đợi thư đến
//
// 5. await = "chờ đợi"
//    Từ khóa này BẮT BUỘC phải đợi một việc hoàn thành
//    Chỉ dùng được TRONG hàm có "async"
//    Giống như bạn phải đợi xe bus đến mới lên được
//
// 6. require() = "yêu cầu" - Mượn code từ file khác
//    Ví dụ: require('jwt') → Mượn thư viện jwt
//
// 7. exports = "xuất khẩu" - Cho phép file khác dùng code này
//    Ví dụ: exports.login = ... → File khác có thể dùng hàm login
//
// 8. => = "arrow function" (hàm mũi tên) - Cách viết hàm ngắn gọn
//    Ví dụ: (x) => x + 1 nghĩa là "nhận x, trả về x cộng 1"
//
// 9. {} = dấu ngoặc nhọn có 2 ý nghĩa:
//    a) Nhóm nhiều câu lệnh lại: if (x) { lệnh 1; lệnh 2; }
//    b) Tạo object (đối tượng): const person = { name: "An", age: 5 }
//
// 10. try...catch = "thử...bắt lỗi"
//     try { code có thể lỗi } catch (err) { xử lý khi lỗi }
//     Giống như thử làm việc gì đó, nếu thất bại thì làm việc khác
//
// 11. . (dấu chấm) = truy cập thuộc tính hoặc gọi hàm
//     Ví dụ: user.name → Lấy tên của user
//     Ví dụ: math.random() → Gọi hàm random của math

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// const: Tạo hộp không đổi tên "jwt"
// require: Mượn thư viện jsonwebtoken
// jwt: Công cụ tạo "thẻ thông hành" (token)
const jwt = require('jsonwebtoken');

// { getFirestore }: Chỉ lấy hàm getFirestore từ firebase-admin/firestore
// Dấu {} nghĩa là "destructuring" - chỉ lấy phần cần thiết
const { getFirestore } = require('firebase-admin/firestore');

// Lấy 2 hàm gửi email: sendResetPasswordEmail và sendWelcomeEmail
// Từ file emailService.js trong folder services
// ../ nghĩa là "lùi lên 1 cấp folder"
const { sendResetPasswordEmail, sendWelcomeEmail } = require('../services/emailService');

// Lấy Model User - khuôn mẫu cho người dùng
const User = require('../models/User');

// Lấy 2 hàm kiểm tra email
const { isEducationalEmail, isValidEmailFormat } = require('../utils/emailValidator');

// ============================================
// HÀM TẠO MÃ NGẪU NHIÊN 6 CHỮ SỐ 🎲
// ============================================

// const generateResetCode: Tạo hộp chứa hàm tên "generateResetCode"
// = (): Dấu bằng và ngoặc tròn nghĩa là gán một hàm
// => : Dấu mũi tên tạo hàm (arrow function)
// Math: Đối tượng toán học có sẵn trong JavaScript
// Math.floor(): Hàm làm tròn số xuống (5.9 → 5)
// Math.random(): Hàm tạo số ngẫu nhiên từ 0 đến 1 (ví dụ: 0.5472)
// * 900000: Nhân với 900000 để có số lớn
// + 100000: Cộng 100000 để đảm bảo số có 6 chữ số
// .toString(): Chuyển số thành chữ (123456 → "123456")
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// ============================================
// HÀM ĐĂNG KÝ TÀI KHOẢN MỚI 📝
// ============================================

// exports.register: Xuất hàm "register" cho file khác dùng
// async: Từ khóa cho phép dùng "await" bên trong
// (req, res): Hàm nhận 2 tham số
//   - req (request): Yêu cầu từ người dùng (chứa data họ gửi lên)
//   - res (response): Phản hồi trả về cho người dùng
// => : Dấu mũi tên tạo hàm
// {}: Ngoặc nhọn bắt đầu nội dung hàm
exports.register = async (req, res) => {
    // try: Thử chạy code bên trong
    try {
        // GIẢI THÍCH CÚ PHÁP:
        // const { name, email, password, role }: Destructuring (phá cấu trúc)
        // Lấy 4 thuộc tính name, email, password, role từ req.body
        // req.body: Dữ liệu người dùng gửi lên (ví dụ: form đăng ký)
        const { name, email, password, role } = req.body;

        // GIẢI THÍCH CÚ PHÁP:
        // if: Từ khóa kiểm tra điều kiện
        // !: Dấu chấm than nghĩa là "NOT" (phủ định)
        // isValidEmailFormat(email): Gọi hàm kiểm tra email
        //   - Nếu email ĐÚNG → trả về true
        //   - Nếu email SAI → trả về false
        // !isValidEmailFormat(email): Phủ định
        //   - Nếu email ĐÚNG → !true = false → không vào if
        //   - Nếu email SAI → !false = true → vào if
        // (): Ngoặc tròn để chứa điều kiện
        if (!isValidEmailFormat(email)) {
            // return: Từ khóa "trả về" và DỪNG hàm ngay lập tức
            // res.status(400): Đặt mã trạng thái 400 (Bad Request - yêu cầu sai)
            // .json(): Trả về dữ liệu dạng JSON
            // { error: 'Invalid email format' }: Object có thuộc tính error
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // GIẢI THÍCH CÚ PHÁP:
        // const userRole: Tạo hộp tên userRole
        // role || 'student': Toán tử OR (hoặc)
        //   - Nếu role có giá trị → dùng giá trị role
        //   - Nếu role KHÔNG có (null/undefined) → dùng 'student'
        // Ví dụ: role = 'teacher' → userRole = 'teacher'
        // Ví dụ: role = null → userRole = 'student'
        const userRole = role || 'student';

        // GIẢI THÍCH CÚ PHÁP:
        // if (userRole === 'student'): Kiểm tra BẰNG CHÍNH XÁC
        // === : So sánh bằng CHÍNH XÁC (cả giá trị và kiểu dữ liệu)
        // == : So sánh bằng (chỉ giá trị, không quan tâm kiểu)
        // Ví dụ: '5' == 5 → true (vì giá trị bằng nhau)
        // Ví dụ: '5' === 5 → false (vì kiểu khác nhau: string vs number)
        if (userRole === 'student') {
            if (!isEducationalEmail(email)) {
                // return: Dừng hàm và trả về lỗi
                return res.status(400).json({
                    error: 'Students must register with an educational email address (e.g., .edu, .edu.vn, .ac.uk)',
                    hint: 'Please use your school or university email address'
                });
            }
        }

        // GIẢI THÍCH CÚ PHÁP:
        // const newUser: Tạo hộp tên newUser
        // await: Chờ đợi User.create hoàn thành
        //   - Không dùng await: Code chạy tiếp ngay (không đợi)
        //   - Dùng await: Code đợi cho đến khi xong
        // User.create(): Gọi hàm create của User model
        // {}: Object chứa data người dùng
        //   name: name → Có thể viết ngắn: name (ES6 shorthand)
        const newUser = await User.create({
            name,           // Giống: name: name
            email,          // Giống: email: email
            password,       // Giống: password: password
            role: userRole  // Phải viết đầy đủ vì tên khác nhau
        });

        // GIẢI THÍCH CÚ PHÁP:
        // Gọi hàm sendWelcomeEmail KHÔNG có await
        // → Hàm sẽ chạy ngầm (background), không chờ đợi
        // Tại sao? Vì gửi email chậm, không muốn người dùng đợi
        sendWelcomeEmail(email, name);

        // GIẢI THÍCH CÚ PHÁP:
        // res.status(201): Đặt mã trạng thái 201 (Created - đã tạo)
        // .json(): Trả về JSON
        // { message: ..., userId: ... }: Object có 2 thuộc tính
        res.status(201).json({
            message: 'User registered successfully',
            userId: newUser.id
        });

    // catch: Bắt lỗi nếu code trong try có lỗi
    // (err): Tham số err chứa thông tin lỗi
    } catch (err) {
        // console.error(): In lỗi ra console (màn hình developer)
        // console: Object có sẵn trong JavaScript để in thông tin
        console.error('Register Error:', err);

        // if: Kiểm tra nếu lỗi là "Email đã dùng"
        // err.message: Thuộc tính message của object err
        // ===: So sánh chính xác
        if (err.message === 'Email already in use') {
            return res.status(400).json({ error: err.message });
        }

        // Nếu không phải lỗi email, trả về lỗi chung
        res.status(500).json({ error: 'Something went wrong during registration' });
    }
// }; : Dấu ngoặc nhọn đóng hàm, dấu chấm phẩy kết thúc câu lệnh
};

// ============================================
// HÀM ĐĂNG NHẬP 🔐
// ============================================

exports.login = async (req, res) => {
    try {
        // GIẢI THÍCH CÚ PHÁP:
        // Destructuring: Lấy email và password từ req.body
        const { email, password } = req.body;

        // GIẢI THÍCH CÚ PHÁP:
        // await User.findByEmail(email): Đợi tìm user theo email
        // User: Object model
        // .findByEmail(): Method (phương thức) của User
        // (email): Tham số truyền vào hàm findByEmail
        const user = await User.findByEmail(email);

        // GIẢI THÍCH CÚ PHÁP:
        // if (!user): Nếu user KHÔNG tồn tại (null/undefined)
        // !user: Phủ định user
        //   - user có giá trị → !user = false → không vào if
        //   - user = null → !user = true → vào if
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }   
    

        // GIẢI THÍCH CÚ PHÁP:
        // await user.comparePassword(password): Đợi so sánh mật khẩu
        // user.comparePassword: Method của object user
        // Trả về true (đúng) hoặc false (sai)
        const isMatch = await user.comparePassword(password);

        // GIẢI THÍCH CÚ PHÁP:
        // if (!isMatch): Nếu mật khẩu KHÔNG khớp
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // GIẢI THÍCH CÚ PHÁP:
        // jwt.sign(): Tạo token (thẻ thông hành)
        // Tham số 1: { userId: user.id, role: user.role } - Data trong token
        // Tham số 2: process.env.JWT_SECRET - Chìa khóa bí mật
        //   - process: Object toàn cục trong Node.js
        //   - .env: Thuộc tính env (environment - môi trường)
        //   - .JWT_SECRET: Biến môi trường lưu chìa khóa bí mật
        // Tham số 3: { expiresIn: '1d' } - Tuỳ chọn: token hết hạn sau 1 ngày
        //   - expiresIn: "expires in" (hết hạn trong)
        //   - '1d': 1 day (1 ngày)
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // GIẢI THÍCH CÚ PHÁP:
        // res.json(): Trả về JSON (không cần .status vì mặc định 200)
        // {}: Object chứa 2 thuộc tính: token và user
        res.json({
            token,  // Giống: token: token
            user: { // Object lồng bên trong
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

// ============================================
// HÀM QUÊN MẬT KHẨU 🔒
// ============================================

exports.forgotPassword = async (req, res) => {
    try {
        // GIẢI THÍCH CÚ PHÁP:
        // const db: Tạo hộp tên db
        // getFirestore(): Gọi hàm getFirestore để lấy database
        const db = getFirestore();

        // GIẢI THÍCH CÚ PHÁP:
        // const { email }: Destructuring, chỉ lấy email
        // = req.body: Từ body của request
        const { email } = req.body;

        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(200).json({
                message: 'If the email is registered, a password reset email has been sent.'
            });
        }

        // GIẢI THÍCH CÚ PHÁP:
        // const resetCode: Tạo hộp resetCode
        // generateResetCode(): Gọi hàm tạo mã 6 số
        const resetCode = generateResetCode();

        // GIẢI THÍCH CÚ PHÁP:
        // new Date(): Tạo object Date mới (thời gian hiện tại)
        // Date.now(): Lấy thời gian hiện tại dạng số (milliseconds)
        // + 10 * 60000: Cộng thêm 10 phút (10 * 60000 ms = 10 phút)
        // new Date(...): Chuyển số milliseconds thành Date object
        const expiryTime = new Date(Date.now() + 10 * 60000);

        // GIẢI THÍCH CÚ PHÁP:
        // await user.saveResetCode(): Đợi lưu mã reset
        // (resetCode, expiryTime): 2 tham số truyền vào hàm
        await user.saveResetCode(resetCode, expiryTime);

        // GIẢI THÍCH CÚ PHÁP:
        // await db.collection('password_resets'): Lấy collection
        //   - db: Database
        //   - .collection(): Method lấy collection
        //   - ('password_resets'): Tên collection
        // .doc(user.id): Lấy document có ID = user.id
        //   - .doc(): Method lấy document
        //   - (user.id): ID của document
        // .set({...}): Đặt dữ liệu cho document
        //   - .set(): Method đặt/ghi dữ liệu
        //   - ({...}): Object chứa data
        await db.collection('password_resets').doc(user.id).set({
            userId: user.id,
            code: resetCode,
            expiresAt: expiryTime.toISOString(), // .toISOString(): Chuyển Date thành string
            createdAt: new Date().toISOString()
        });

        // GIẢI THÍCH CÚ PHÁP:
        // await sendResetPasswordEmail(): Đợi gửi email
        // (email, resetCode): 2 tham số: địa chỉ email và mã reset
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

// ============================================
// HÀM ĐẶT LẠI MẬT KHẨU 🔄
// ============================================

exports.resetPassword = async (req, res) => {
    try {
        const db = getFirestore();

        // GIẢI THÍCH CÚ PHÁP:
        // Destructuring 3 biến: userId, code, newPassword
        const { userId, code, newPassword } = req.body;

        // GIẢI THÍCH CÚ PHÁP:
        // const resetDocRef: Tạo hộp chứa reference đến document
        // Reference = "tham chiếu" = "địa chỉ" của document
        const resetDocRef = db.collection('password_resets').doc(userId);

        // GIẢI THÍCH CÚ PHÁP:
        // await resetDocRef.get(): Đợi LẤY document từ database
        // .get(): Method lấy dữ liệu
        const resetDoc = await resetDocRef.get();

        // GIẢI THÍCH CÚ PHÁP:
        // if (!resetDoc.exists): Nếu document KHÔNG tồn tại
        // .exists: Thuộc tính kiểm tra document có tồn tại không
        //   - true: document tồn tại
        //   - false: document không tồn tại
        if (!resetDoc.exists) {
            return res.status(400).json({
                error: 'Invalid or expired request. Please restart the process.'
            });
        }

        // GIẢI THÍCH CÚ PHÁP:
        // resetDoc.data(): Lấy dữ liệu từ document
        // .data(): Method trả về object chứa tất cả data
        const resetData = resetDoc.data();

        // GIẢI THÍCH CÚ PHÁP:
        // new Date(): Tạo Date mới = thời gian hiện tại
        const now = new Date();

        // GIẢI THÍCH CÚ PHÁP:
        // new Date(resetData.expiresAt): Chuyển string thành Date
        const expiresAt = new Date(resetData.expiresAt);

        // GIẢI THÍCH CÚ PHÁP:
        // if (... || ...): Toán tử OR (hoặc)
        // resetData.code !== code: So sánh mã KHÔNG BẰNG
        //   - !==: Không bằng chính xác
        //   - Nếu mã khác nhau → true
        // now > expiresAt: So sánh thời gian
        //   - >: Lớn hơn
        //   - Nếu thời gian hiện tại > thời gian hết hạn → true (đã hết hạn)
        // A || B: Nếu A hoặc B là true → kết quả là true
        if (resetData.code !== code || now > expiresAt) {
            // GIẢI THÍCH CÚ PHÁP:
            // await resetDocRef.delete(): Đợi XÓA document
            // .delete(): Method xóa document
            await resetDocRef.delete();
            return res.status(400).json({
                error: 'Invalid or expired verification code.'
            });
        }

        // GIẢI THÍCH CÚ PHÁP:
        // await User.update(): Đợi CẬP NHẬT user
        // (userId, {...}): 2 tham số
        //   - Tham số 1: userId - ID của user cần update
        //   - Tham số 2: {...} - Data cần update
        await User.update(userId, { password: newPassword });

        // GIẢI THÍCH CÚ PHÁP:
        // await User.findById(): Tìm user theo ID
        const user = await User.findById(userId);

        // GIẢI THÍCH CÚ PHÁP:
        // if (user): Nếu user TỒN TẠI (có giá trị)
        // Không cần ! vì đã là điều kiện "có"
        if (user) {
            await user.clearResetCode();
        }

        await resetDocRef.delete();

        res.status(200).json({
            message: 'Password updated successfully. You can now login with your new password.'
        });

    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ error: 'Something went wrong during password reset.' });
    }
};

// ============================================
// TÓM TẮT CÁC KEYWORD QUAN TRỌNG 📚
// ============================================
//
// 1. const - Tạo biến không đổi
// 2. let - Tạo biến có thể đổi
// 3. async - Cho phép dùng await
// 4. await - Đợi một việc hoàn thành
// 5. require() - Mượn code từ file khác
// 6. exports - Cho file khác dùng code này
// 7. => - Tạo hàm (arrow function)
// 8. {} - Nhóm code hoặc tạo object
// 9. . (chấm) - Truy cập thuộc tính/gọi method
// 10. try...catch - Thử chạy code, bắt lỗi
// 11. if - Kiểm tra điều kiện
// 12. return - Trả về giá trị và dừng hàm
// 13. === - So sánh bằng chính xác
// 14. !== - So sánh không bằng
// 15. ! - Phủ định (NOT)
// 16. || - Hoặc (OR)
// 17. && - Và (AND)
// 18. () - Ngoặc tròn: gọi hàm hoặc nhóm điều kiện
// 19. [] - Ngoặc vuông: tạo array hoặc truy cập phần tử
// 20. new - Tạo object mới
//
// CÁCH ĐỌC CODE:
// user.comparePassword(password)
// ↓
// Đọc: "user chấm comparePassword ngoặc password đóng ngoặc"
// Nghĩa: Gọi method comparePassword của object user với tham số password
