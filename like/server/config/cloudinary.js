// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "cái chìa khóa" để mở cửa vào kho lưu trữ ảnh trên mây (Cloudinary)
// Cloudinary là nơi chúng ta cất giữ tất cả các hình ảnh của website
// Giống như bạn có một cái tủ đựng ảnh trên internet vậy!

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// Dòng này "mượn" công cụ Cloudinary để làm việc với ảnh
// Giống như bạn mượn cây bút màu của bạn để vẽ tranh
const cloudinary = require('cloudinary').v2;

// Dòng này "mở" file .env (file bí mật) để đọc các thông tin quan trọng
// File .env giống như cuốn sổ ghi chép bí mật của bạn
// Trong đó có ghi những thông tin như: tên tài khoản, mật khẩu, v.v.
require('dotenv').config();

// ============================================
// BƯỚC 2: CHO CLOUDINARY BIẾT CHÚNG TA LÀ AI 🎫
// ============================================

// Dòng này "cấu hình" (setup) Cloudinary
// Giống như bạn phải cho biết tên và mật khẩu để vào phòng chơi
cloudinary.config({
    // Đây là "tên" của kho lưu trữ ảnh của chúng ta trên Cloudinary
    // Giống như tên của tủ đựng ảnh của bạn
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    // Đây là "chìa khóa công khai" (public key)
    // Giống như tên đăng nhập của bạn
    api_key: process.env.CLOUDINARY_API_KEY,

    // Đây là "chìa khóa bí mật" (secret key)
    // Giống như mật khẩu của bạn - PHẢI GIỮ BÍ MẬT!
    // Không được cho ai biết nhé!
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// BƯỚC 3: CHO PHÉP CÁC FILE KHÁC SỬ DỤNG 📦
// ============================================

// Dòng này "xuất khẩu" (export) cloudinary đã được cấu hình
// Giống như bạn cho bạn bè mượn cây bút màu đã chuẩn bị sẵn
// Các file khác có thể dùng cloudinary này để upload và quản lý ảnh
module.exports = cloudinary;

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// 1. Kết nối với Cloudinary (dịch vụ lưu trữ ảnh trên mây)
// 2. Cho Cloudinary biết chúng ta là ai (bằng tên và mật khẩu)
// 3. Cho phép các file khác sử dụng kết nối này để làm việc với ảnh
//
// VÍ DỤ THỰC TẾ:
// - Khi bạn upload ảnh đại diện (avatar) → file này giúp lưu ảnh lên Cloudinary
// - Khi bạn upload ảnh bìa khóa học → file này giúp lưu ảnh lên Cloudinary
// - Khi bạn muốn xóa ảnh cũ → file này giúp xóa ảnh từ Cloudinary
