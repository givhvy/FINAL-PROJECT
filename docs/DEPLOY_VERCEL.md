# Hướng dẫn Deploy lên Vercel

## Bước 1: Chuẩn bị trước khi deploy

### 1.1. Cài đặt Vercel CLI (Tùy chọn)
```bash
npm install -g vercel
```

### 1.2. Đảm bảo file serviceAccountKey.json được bảo mật
File `serviceAccountKey.json` chứa thông tin nhạy cảm của Firebase. **KHÔNG BAO GIỜ** commit file này lên Git.

## Bước 2: Deploy qua Vercel Dashboard (Khuyến nghị)

### 2.1. Tạo tài khoản Vercel
1. Truy cập https://vercel.com
2. Đăng nhập bằng GitHub/GitLab/Bitbucket

### 2.2. Push code lên Git Repository
```bash
cd Codemaster
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git remote add origin <your-repository-url>
git push -u origin main
```

### 2.3. Import Project từ Git
1. Vào Vercel Dashboard
2. Click "Add New..." → "Project"
3. Chọn repository của bạn
4. Click "Import"

### 2.4. Configure Project
- **Framework Preset**: Other
- **Root Directory**: `./` (hoặc để trống)
- **Build Command**: (để trống)
- **Output Directory**: (để trống)

## Bước 3: Setup Environment Variables trên Vercel

Vào **Settings** → **Environment Variables** và thêm các biến sau:

### Firebase Service Account (Quan trọng!)
Vì không thể upload file `serviceAccountKey.json`, bạn cần chuyển nội dung file thành biến môi trường:

1. **Cách 1: Dùng FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)**
   - Tên biến: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Giá trị: Copy toàn bộ nội dung file `serviceAccountKey.json` (dạng JSON string)

2. **Cách 2: Tách riêng từng field**
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   ```

### Các biến môi trường khác:
```
PORT=5000
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=production
```

**Lưu ý**: Thay thế các giá trị placeholder bằng giá trị thật từ file `.env` của bạn.

## Bước 4: Cập nhật code để đọc Firebase credentials từ biến môi trường

Cần sửa file `server.js` để đọc Firebase credentials từ environment variables thay vì file:

```javascript
// Thay thế đoạn code cũ:
const serviceAccount = require('./serviceAccountKey.json');

// Bằng đoạn code mới:
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Nếu có biến môi trường JSON string
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  // Fallback cho local development
  serviceAccount = require('./serviceAccountKey.json');
}
```

## Bước 5: Deploy

### Deploy qua Dashboard:
1. Click "Deploy" trên Vercel Dashboard
2. Đợi quá trình build và deploy hoàn tất

### Deploy qua CLI:
```bash
cd Codemaster
vercel
```

## Bước 6: Kiểm tra và Test

1. Sau khi deploy xong, Vercel sẽ cung cấp URL (ví dụ: `https://your-app.vercel.app`)
2. Truy cập URL để kiểm tra:
   - Frontend: `https://your-app.vercel.app`
   - API: `https://your-app.vercel.app/api`

## Troubleshooting

### Lỗi: Firebase Admin SDK không khởi tạo được
- Kiểm tra biến `FIREBASE_SERVICE_ACCOUNT_KEY` đã được setup đúng chưa
- Đảm bảo JSON string không bị lỗi format

### Lỗi: Module not found
- Đảm bảo tất cả dependencies đã có trong `package.json`
- Chạy `npm install` để kiểm tra

### Lỗi: API endpoints không hoạt động
- Kiểm tra routes trong `vercel.json`
- Xem logs tại Vercel Dashboard → Project → Deployments → View Function Logs

## Custom Domain (Tùy chọn)

1. Vào Project Settings → Domains
2. Add domain của bạn
3. Cấu hình DNS theo hướng dẫn của Vercel

## Cập nhật sau khi deploy

Mỗi khi bạn push code mới lên Git repository:
```bash
git add .
git commit -m "Your commit message"
git push
```

Vercel sẽ tự động detect và deploy lại.

## Lưu ý quan trọng

1. **Không commit file .env và serviceAccountKey.json** lên Git
2. **Thay đổi tất cả secret keys** trong production (JWT_SECRET, API keys, etc.)
3. **Sử dụng Stripe Live keys** thay vì Test keys khi đưa vào production thực tế
4. **Bật 2FA** cho tài khoản Vercel để bảo mật
5. **Monitor logs** thường xuyên để phát hiện lỗi sớm

## Liên hệ & Support

- Vercel Docs: https://vercel.com/docs
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
