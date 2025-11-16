// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "THÁM TỬ KIỂM TRA EMAIL"!
// Nó có 3 nhiệm vụ chính:
// 1. Kiểm tra email có phải của trường học không? (như kiểm tra thẻ học sinh)
// 2. Kiểm tra email có đúng định dạng không? (có @ và dấu chấm)
// 3. Lấy tên miền từ email (phần sau dấu @)

// ============================================
// GIẢI THÍCH KHÁI NIỆM QUAN TRỌNG 📖
// ============================================
//
// 1. ARRAY (Mảng) là gì?
//    - Array = Danh sách các phần tử
//    - Viết trong dấu [] (ngoặc vuông)
//    - Ví dụ: const fruits = ['táo', 'cam', 'chuối']
//    - Mỗi phần tử cách nhau bởi dấu phẩy
//
// 2. for...of là gì?
//    - Vòng lặp để duyệt qua từng phần tử trong array
//    - Giống như đọc từng tên trong danh sách
//    - for (const item of array) { ... }
//
// 3. REGEX (Regular Expression) là gì?
//    - Regex = Biểu thức chính quy
//    - Công cụ để kiểm tra mẫu chuỗi
//    - Ví dụ: /^[a-z]+$/ kiểm tra chuỗi chỉ có chữ thường
//    - Viết trong dấu / / (hai dấu gạch chéo)
//
// 4. typeof là gì?
//    - Toán tử kiểm tra KIỂU DỮ LIỆU của biến
//    - typeof "hello" → "string" (chuỗi)
//    - typeof 123 → "number" (số)
//    - typeof true → "boolean" (đúng/sai)

// ============================================
// BƯỚC 1: DANH SÁCH ĐuÔI EMAIL TRƯỜNG HỌC 🏫
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// /**...*/ : Comment nhiều dòng (JSDoc format)
// Dùng để viết tài liệu cho code
// Các công cụ như VSCode có thể đọc và hiển thị khi hover chuột
/**
 * Email Validation Utilities
 * Provides functions to validate educational email addresses
 */
// Dịch: "Tiện ích kiểm tra Email - Cung cấp các hàm để kiểm tra email trường học"

/**
 * List of common educational email domain patterns
 * Supports various international educational institutions
 */
// Dịch: "Danh sách các mẫu tên miền email trường học phổ biến - Hỗ trợ nhiều trường quốc tế"

// GIẢI THÍCH CÚ PHÁP:
// const EDUCATIONAL_DOMAINS: Tạo hộp tên "EDUCATIONAL_DOMAINS"
// Quy ước: Tên viết HOA toàn bộ = hằng số (không đổi)
// = []: Gán một array (mảng)
// [...]: Nội dung của array
const EDUCATIONAL_DOMAINS = [
    // GIẢI THÍCH TỪNG DÒNG:
    // Mỗi dòng là một PHẦN TỬ trong array
    // Dạng string (chuỗi) viết trong dấu nháy đơn ''
    // Dấu phẩy , ngăn cách các phần tử

    '.edu',        // US educational institutions - Trường ở Mỹ
                   // Ví dụ: student@mit.edu

    '.edu.vn',     // Vietnamese educational institutions - Trường ở Việt Nam
                   // Ví dụ: student@uit.edu.vn

    '.ac.uk',      // UK academic institutions - Trường ở Anh
                   // Ví dụ: student@oxford.ac.uk

    '.ac.jp',      // Japanese academic institutions - Trường ở Nhật
    '.ac.in',      // Indian academic institutions - Trường ở Ấn Độ
    '.edu.au',     // Australian educational institutions - Trường ở Úc
    '.edu.sg',     // Singapore educational institutions - Trường ở Singapore
    '.edu.my',     // Malaysian educational institutions - Trường ở Malaysia
    '.edu.ph',     // Philippine educational institutions - Trường ở Philippines
    '.edu.tw',     // Taiwanese educational institutions - Trường ở Đài Loan
    '.edu.hk',     // Hong Kong educational institutions - Trường ở Hồng Kông
    '.edu.cn',     // Chinese educational institutions - Trường ở Trung Quốc
    '.edu.kr',     // Korean educational institutions - Trường ở Hàn Quốc
    '.ac.nz',      // New Zealand academic institutions - Trường ở New Zealand
    '.ac.th',      // Thai academic institutions - Trường ở Thái Lan
    '.ac.id',      // Indonesian academic institutions - Trường ở Indonesia
    // ]; : Dấu ngoặc vuông đóng array, dấu chấm phẩy kết thúc
];

// ============================================
// BƯỚC 2: DANH SÁCH TRƯỜNG CỤ THỂ 🎓
// ============================================

/**
 * Additional specific educational institutions
 * Add custom domains for specific schools
 */
// Dịch: "Các trường cụ thể bổ sung - Thêm tên miền tuỳ chỉnh cho từng trường"

const SPECIFIC_EDUCATIONAL_DOMAINS = [
    'fpt.edu.vn',   // FPT University - Đại học FPT
    'hcmut.edu.vn', // HCMC University of Technology - Đại học Bách Khoa TPHCM
    'mit.edu',      // MIT - Viện Công nghệ Massachusetts
    'stanford.edu', // Stanford - Đại học Stanford
    // Có thể thêm nhiều trường khác...
];

// ============================================
// BƯỚC 3: HÀM KIỂM TRA EMAIL TRƯỜNG HỌC ✅
// ============================================

/**
 * Validates if an email address belongs to an educational institution
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if the email is from an educational institution
 */
// Dịch:
// "Kiểm tra xem địa chỉ email có thuộc trường học không
// @param {string} email - Email cần kiểm tra
// @returns {boolean} - Trả về true nếu email từ trường học"

// GIẢI THÍCH CÚ PHÁP:
// const isEducationalEmail: Tạo hộp tên "isEducationalEmail"
// = (email): Gán một hàm nhận tham số "email"
// => : Dấu mũi tên tạo hàm
// {}: Nội dung hàm
const isEducationalEmail = (email) => {
    // BƯỚC 3.1: KIỂM TRA EMAIL CÓ HỢP LỆ KHÔNG 🔍

    // GIẢI THÍCH CÚ PHÁP:
    // if (!email || typeof email !== 'string'):
    //   Kiểm tra 2 điều kiện (kết nối bởi ||)
    //
    // Điều kiện 1: !email
    //   - !: Phủ định
    //   - Nếu email = null/undefined/'' → !email = true → vào if
    //   - Nếu email = "abc@gmail.com" → !email = false
    //
    // ||: Toán tử OR (hoặc)
    //   - Nếu điều kiện 1 HOẶC điều kiện 2 là true → vào if
    //
    // Điều kiện 2: typeof email !== 'string'
    //   - typeof email: Kiểm tra kiểu dữ liệu của email
    //   - !== 'string': So sánh KHÔNG BẰNG 'string'
    //   - Nếu email là số (typeof = 'number') → true → vào if
    //   - Nếu email là string (typeof = 'string') → false
    if (!email || typeof email !== 'string') {
        // return false: Trả về false (không phải email trường học)
        // và DỪNG hàm ngay
        return false;
    }

    // BƯỚC 3.2: CHUẨN HÓA EMAIL 📝

    // GIẢI THÍCH CÚ PHÁP:
    // const emailLower: Tạo hộp tên "emailLower"
    // = email.toLowerCase().trim();
    //
    // Giải thích từng phần:
    // 1. email: Biến email ban đầu
    // 2. .toLowerCase(): Method chuyển CHỮ HOA → chữ thường
    //    - Ví dụ: "STUDENT@MIT.EDU" → "student@mit.edu"
    //    - Tại sao? Để so sánh dễ dàng (không phân biệt hoa/thường)
    // 3. .trim(): Method XÓA khoảng trắng đầu cuối
    //    - Ví dụ: "  abc@gmail.com  " → "abc@gmail.com"
    //    - Tại sao? User có thể gõ nhầm khoảng trắng
    const emailLower = email.toLowerCase().trim();

    // BƯỚC 3.3: KIỂM TRA VỚI DANH SÁCH TRƯỜNG CỤ THỂ 🏫

    // GIẢI THÍCH CÚ PHÁP:
    // for (const domain of SPECIFIC_EDUCATIONAL_DOMAINS):
    //   Vòng lặp for...of
    //
    // Cách hoạt động:
    //   - Lấy từng phần tử trong array SPECIFIC_EDUCATIONAL_DOMAINS
    //   - Gán vào biến "domain"
    //   - Chạy code trong {} cho mỗi phần tử
    //
    // Ví dụ:
    //   Lần 1: domain = 'fpt.edu.vn'
    //   Lần 2: domain = 'hcmut.edu.vn'
    //   Lần 3: domain = 'mit.edu'
    //   ...
    //
    // for: Từ khóa bắt đầu vòng lặp
    // const domain: Tạo biến domain (mỗi lần lặp tạo mới)
    // of: Từ khóa "từ" (lấy từ)
    // SPECIFIC_EDUCATIONAL_DOMAINS: Array cần duyệt
    for (const domain of SPECIFIC_EDUCATIONAL_DOMAINS) {
        // GIẢI THÍCH CÚ PHÁP:
        // if (emailLower.endsWith(`@${domain}`) || emailLower.includes(`@${domain}`)):
        //   Kiểm tra 2 điều kiện (kết nối bởi ||)
        //
        // Điều kiện 1: emailLower.endsWith(`@${domain}`)
        //   - emailLower: Email đã chuẩn hóa
        //   - .endsWith(): Method kiểm tra chuỗi có KẾT THÚC bằng... không
        //   - (`@${domain}`): Template string (chuỗi mẫu)
        //     - Dấu `: Backtick (dấu nháy ngược) - tạo template string
        //     - ${ }: Placeholder để chèn biến
        //     - ${domain}: Chèn giá trị của biến domain
        //     Ví dụ: domain = 'mit.edu' → `@${domain}` = '@mit.edu'
        //   - Ví dụ: "student@mit.edu".endsWith('@mit.edu') → true
        //
        // ||: Toán tử OR
        //
        // Điều kiện 2: emailLower.includes(`@${domain}`)
        //   - .includes(): Method kiểm tra chuỗi có CHỨA... không
        //   - Ví dụ: "abc@mit.edu.vn".includes('@mit.edu') → true
        if (emailLower.endsWith(`@${domain}`) || emailLower.includes(`@${domain}`)) {
            // return true: Trả về true (là email trường học)
            // và DỪNG hàm ngay (không kiểm tra nữa)
            return true;
        }
    }
    // Nếu không tìm thấy trong danh sách trường cụ thể, tiếp tục...

    // BƯỚC 3.4: KIỂM TRA VỚI DANH SÁCH ĐuÔI EMAIL 📧

    // Tương tự như vòng lặp trên, nhưng duyệt array EDUCATIONAL_DOMAINS
    for (const pattern of EDUCATIONAL_DOMAINS) {
        // GIẢI THÍCH CÚ PHÁP:
        // if (emailLower.includes(pattern)):
        //   Kiểm tra email có CHỨA pattern không
        //
        // Ví dụ:
        //   pattern = '.edu.vn'
        //   email = 'student@uit.edu.vn'
        //   email.includes('.edu.vn') → true → vào if
        if (emailLower.includes(pattern)) {
            return true;
        }
    }

    // BƯỚC 3.5: KHÔNG PHẢI EMAIL TRƯỜNG HỌC ❌

    // Nếu không khớp với bất kỳ pattern nào...
    // return false: Trả về false (không phải email trường học)
    return false;
// }; : Đóng hàm, kết thúc câu lệnh
};

// ============================================
// BƯỚC 4: HÀM KIỂM TRA ĐỊNH DẠNG EMAIL 📧
// ============================================

/**
 * Validates email format using regex
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email format is valid
 */
// Dịch: "Kiểm tra định dạng email bằng regex - Trả về true nếu định dạng hợp lệ"

const isValidEmailFormat = (email) => {
    // GIẢI THÍCH CÚ PHÁP:
    // const emailRegex: Tạo hộp tên "emailRegex"
    // = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   Gán một REGEX (biểu thức chính quy)
    //
    // GIẢI THÍCH REGEX CHI TIẾT:
    // / /: Dấu gạch chéo bao quanh regex
    //
    // ^: Ký tự bắt đầu chuỗi
    //    Nghĩa là: "Bắt đầu từ đầu chuỗi"
    //
    // [^\s@]+: Phần TÊN (trước @)
    //   - []: Tập hợp ký tự
    //   - ^: Phủ định (trong [])
    //   - \s: Khoảng trắng (space)
    //   - @: Ký tự @
    //   - [^\s@]: Ký tự KHÔNG PHẢI khoảng trắng KHÔNG PHẢI @
    //   - +: Một hoặc nhiều lần
    //   Ví dụ: "student123" ✅ | "stu dent" ❌ (có space)
    //
    // @: Ký tự @ (phải có)
    //
    // [^\s@]+: Phần TÊN MIỀN (giữa @ và .)
    //   Tương tự như trên
    //   Ví dụ: "gmail" ✅ | "gm ail" ❌
    //
    // \.: Dấu chấm (phải có)
    //   - \: Escape character (ký tự thoát)
    //   - .: Dấu chấm thật (không phải regex)
    //   Tại sao cần \? Vì . trong regex có ý nghĩa đặc biệt
    //
    // [^\s@]+: Phần ĐuÔI (sau dấu chấm)
    //   Ví dụ: "com" ✅ | "vn" ✅
    //
    // $: Ký tự kết thúc chuỗi
    //    Nghĩa là: "Kết thúc tại đây, không có gì thêm"
    //
    // KẾT QUẢ:
    // Email hợp lệ: name@domain.extension
    // Ví dụ: "student@gmail.com" ✅
    // Ví dụ: "abc" ❌ (không có @)
    // Ví dụ: "@gmail.com" ❌ (không có tên)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // GIẢI THÍCH CÚ PHÁP:
    // return emailRegex.test(email);
    //   Trả về kết quả của emailRegex.test(email)
    //
    // emailRegex.test(email):
    //   - emailRegex: Object regex đã tạo ở trên
    //   - .test(): Method KIỂM TRA chuỗi có khớp regex không
    //   - (email): Chuỗi cần kiểm tra
    //   - Trả về: true (khớp) hoặc false (không khớp)
    //
    // Ví dụ:
    //   emailRegex.test("abc@gmail.com") → true
    //   emailRegex.test("abc") → false
    //   emailRegex.test("@gmail.com") → false
    return emailRegex.test(email);
};

// ============================================
// BƯỚC 5: HÀM LẤY TÊN MIỀN TỪ EMAIL 🌐
// ============================================

/**
 * Gets the domain from an email address
 * @param {string} email - The email address
 * @returns {string|null} - The domain or null if invalid
 */
// Dịch: "Lấy tên miền từ địa chỉ email - Trả về tên miền hoặc null nếu không hợp lệ"

const getEmailDomain = (email) => {
    // BƯỚC 5.1: KIỂM TRA EMAIL HỢP LỆ

    if (!email || typeof email !== 'string') {
        // return null: Trả về null (giá trị rỗng)
        // null nghĩa là "không có giá trị"
        return null;
    }

    // BƯỚC 5.2: TÁCH EMAIL THÀNH 2 PHẦN

    // GIẢI THÍCH CÚ PHÁP:
    // const parts: Tạo hộp tên "parts" (các phần)
    // = email.trim().split('@');
    //
    // email.trim(): Xóa khoảng trắng đầu cuối
    //
    // .split('@'): Method TÁCH chuỗi thành array
    //   - .split(): Method tách
    //   - ('@'): Ký tự dùng để tách
    //   - Trả về: Array các phần
    //
    // Ví dụ:
    //   email = "student@gmail.com"
    //   email.split('@') → ['student', 'gmail.com']
    //   parts = ['student', 'gmail.com']
    //
    // Ví dụ 2:
    //   email = "abc"
    //   email.split('@') → ['abc'] (chỉ 1 phần)
    const parts = email.trim().split('@');

    // BƯỚC 5.3: KIỂM TRA VÀ TRẢ VỀ TÊN MIỀN

    // GIẢI THÍCH CÚ PHÁP:
    // return parts.length === 2 ? parts[1].toLowerCase() : null;
    //   Toán tử TERNARY (ba ngôi)
    //
    // Cú pháp: điều_kiện ? giá_trị_nếu_đúng : giá_trị_nếu_sai
    //
    // Giải thích:
    // parts.length === 2: Kiểm tra array có ĐÚNG 2 phần không
    //   - parts.length: Số phần tử trong array
    //   - === 2: Bằng 2
    //   - Nếu đúng → lấy giá trị sau ?
    //   - Nếu sai → lấy giá trị sau :
    //
    // ?: Dấu hỏi của toán tử ternary
    //
    // parts[1].toLowerCase(): Nếu điều kiện ĐÚNG
    //   - parts[1]: Lấy phần tử thứ 2 của array (index = 1)
    //     (Index bắt đầu từ 0: parts[0] là phần tử đầu, parts[1] là phần tử thứ 2)
    //   - .toLowerCase(): Chuyển chữ thường
    //   Ví dụ: parts = ['student', 'GMAIL.COM']
    //          parts[1] = 'GMAIL.COM'
    //          parts[1].toLowerCase() = 'gmail.com'
    //
    // :: Dấu hai chấm của toán tử ternary
    //
    // null: Nếu điều kiện SAI
    //   Trả về null (không có tên miền)
    //
    // Ví dụ:
    //   parts = ['student', 'gmail.com'] → length = 2 → parts[1].toLowerCase() → 'gmail.com'
    //   parts = ['abc'] → length = 1 → null
    return parts.length === 2 ? parts[1].toLowerCase() : null;
};

// ============================================
// BƯỚC 6: XUẤT CÁC HÀM RA NGOÀI 📤
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// module.exports = { ... };
//   Xuất nhiều thứ cùng lúc
//
// module.exports: Thuộc tính xuất của module
// = { ... }: Gán một object
//
// Bên trong object:
// isEducationalEmail,
//   Tương đương: isEducationalEmail: isEducationalEmail
//   ES6 shorthand: Nếu tên thuộc tính = tên biến, viết ngắn gọn
//
// File khác sẽ import:
// const { isEducationalEmail, isValidEmailFormat } = require('./emailValidator');
module.exports = {
    isEducationalEmail,           // Hàm kiểm tra email trường học
    isValidEmailFormat,           // Hàm kiểm tra định dạng email
    getEmailDomain,               // Hàm lấy tên miền
    EDUCATIONAL_DOMAINS,          // Array các đuôi email trường học
    SPECIFIC_EDUCATIONAL_DOMAINS  // Array các trường cụ thể
};

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này cung cấp 3 hàm chính:
//
// 1. isEducationalEmail(email):
//    - Kiểm tra email có phải của trường học không
//    - Duyệt qua 2 danh sách: trường cụ thể và đuôi email
//    - Trả về true/false
//
// 2. isValidEmailFormat(email):
//    - Kiểm tra email có đúng định dạng không
//    - Dùng regex để kiểm tra pattern: name@domain.extension
//    - Trả về true/false
//
// 3. getEmailDomain(email):
//    - Lấy tên miền từ email
//    - Tách email bằng @, lấy phần sau
//    - Trả về tên miền hoặc null
//
// VÍ DỤ SỬ DỤNG:
//
// const { isEducationalEmail, isValidEmailFormat } = require('./emailValidator');
//
// // Kiểm tra email trường học
// isEducationalEmail('student@mit.edu')        → true ✅
// isEducationalEmail('student@uit.edu.vn')     → true ✅
// isEducationalEmail('abc@gmail.com')          → false ❌
//
// // Kiểm tra định dạng
// isValidEmailFormat('abc@gmail.com')          → true ✅
// isValidEmailFormat('abc')                    → false ❌
// isValidEmailFormat('@gmail.com')             → false ❌
//
// // Lấy tên miền
// getEmailDomain('student@mit.edu')            → 'mit.edu'
// getEmailDomain('abc')                        → null
//
// KEYWORD MỚI:
// - array: Danh sách các phần tử []
// - for...of: Vòng lặp duyệt array
// - regex: Biểu thức chính quy / /
// - typeof: Toán tử kiểm tra kiểu dữ liệu
// - template string: Chuỗi mẫu `${biến}`
// - ternary: Toán tử ba ngôi ? :
// - .split(): Tách chuỗi thành array
// - .includes(): Kiểm tra có chứa không
// - .endsWith(): Kiểm tra kết thúc bằng
// - .test(): Kiểm tra regex khớp
