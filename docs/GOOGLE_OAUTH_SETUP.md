# Hướng dẫn cấu hình Google OAuth

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. **KHÔNG CẦN** kích hoạt billing - OAuth hoàn toàn miễn phí!

## Bước 2: Kích hoạt Google+ API

1. Vào menu "APIs & Services" > "Library"
2. Tìm "Google+ API"
3. Click "Enable"

## Bước 3: Tạo OAuth 2.0 Credentials

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Chọn "Web application"
4. Điền thông tin:
   - **Name**: UniLearn OAuth
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:5000
     https://yourdomain.com (cho production)
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5000/api/auth/google/callback
     https://yourdomain.com/api/auth/google/callback (cho production)
     ```

5. Click "Create"
6. Sao chép **Client ID** và **Client Secret**

## Bước 4: Cấu hình Environment Variables

1. Tạo file `.env` trong thư mục gốc project (nếu chưa có)
2. Thêm các dòng sau:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=your-random-session-secret
```

3. Thay thế `your-client-id-here` và `your-client-secret-here` bằng giá trị từ bước 3

## Bước 5: Test OAuth Flow

1. Khởi động server: `npm start`
2. Mở trình duyệt và truy cập `http://localhost:5000/login`
3. Click nút "Sign in with Google"
4. Chọn tài khoản Google
5. Cho phép quyền truy cập
6. Bạn sẽ được redirect về trang chủ và đăng nhập thành công

## Lưu ý quan trọng

### Cho Development:
- Sử dụng `http://localhost:5000` (không dùng HTTPS)
- Đảm bảo callback URL khớp chính xác

### Cho Production:
- **BẮT BUỘC** sử dụng HTTPS
- Cập nhật `GOOGLE_CALLBACK_URL` trong `.env`
- Thêm domain production vào "Authorized JavaScript origins" và "Authorized redirect URIs"

### Bảo mật:
- **KHÔNG BAO GIỜ** commit file `.env` lên Git
- Thêm `.env` vào `.gitignore`
- Sử dụng biến môi trường trên server production (Vercel, Heroku, etc.)

## Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra lại URL trong Google Console khớp với `GOOGLE_CALLBACK_URL`
- Không có dấu `/` cuối URL
- Protocol phải khớp (http vs https)

### Lỗi "Access blocked"
- Cần thêm test users trong "OAuth consent screen"
- Hoặc publish app để public

### User không được tạo trong database
- Kiểm tra Firebase connection
- Xem console log để debug
- Kiểm tra quyền truy cập Firestore

## Cấu trúc OAuth Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Redirect to Google login
   ↓
3. User authorizes app
   ↓
4. Google redirects to /api/auth/google/callback
   ↓
5. Server validates & creates/updates user in Firebase
   ↓
6. Generate JWT token
   ↓
7. Redirect to homepage with token
   ↓
8. Frontend saves token & user to localStorage
   ↓
9. User is logged in
```

## Support

Nếu gặp vấn đề, kiểm tra:
- Server logs: `npm start`
- Browser console (F12)
- Google Cloud Console logs
