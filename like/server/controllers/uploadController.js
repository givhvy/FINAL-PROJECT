// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "TRUNG TÂM UPLOAD" của website!
// Nó xử lý việc:
// - Upload ảnh (course thumbnails, blog images)
// - Upload video (lesson videos)
// - Upload ảnh đại diện (profile pictures)
//
// Giống như:
// - Trung tâm chuyển phát nhanh: Nhận đồ → Đóng gói → Gửi đến kho (Cloudinary)

// ============================================
// GIẢI THÍCH KHÁI NIỆM FILE UPLOAD 📤
// ============================================
// FILE UPLOAD là gì?
// - Cho phép người dùng tải file lên server
// - File có thể là: ảnh, video, PDF, v.v.
//
// Quy trình upload:
// 1. User chọn file từ máy tính
// 2. Frontend gửi file đến backend (form data)
// 3. Backend nhận file (req.file)
// 4. Backend upload file lên cloud storage (Cloudinary)
// 5. Cloudinary trả về URL
// 6. Backend lưu URL vào database
// 7. Trả URL về cho frontend
//
// Tại sao dùng Cloud Storage?
// - Không lưu file trực tiếp trên server (tốn dung lượng)
// - Cloudinary xử lý tối ưu ảnh/video
// - Có CDN (Content Delivery Network) - tải nhanh
// - Dễ quản lý

// ============================================
// GIẢI THÍCH PROMISE 🤝
// ============================================
// PROMISE là gì?
// - Promise: "Lời hứa"
// - Đại diện cho giá trị có thể có trong tương lai
// - 3 trạng thái:
//   + Pending: Đang chờ
//   + Fulfilled: Thành công (resolve)
//   + Rejected: Thất bại (reject)
//
// Ví dụ đời thực:
// - Bạn đặt pizza qua điện thoại
// - Nhà hàng: "OK, tôi sẽ giao trong 30 phút" (Promise)
// - Sau 30 phút:
//   + Pizza đến → Fulfilled (resolve)
//   + Quên đơn → Rejected (reject)
//
// Cú pháp:
// new Promise((resolve, reject) => {
//   // Làm việc gì đó
//   if (thành công) resolve(kết quả);
//   else reject(lỗi);
// })
//
// Dùng Promise:
// promise.then(result => { /* thành công */ });
// promise.catch(error => { /* thất bại */ });
// // Hoặc dùng async/await:
// const result = await promise;

// ============================================
// GIẢI THÍCH BUFFER 💾
// ============================================
// BUFFER là gì?
// - Buffer: "Bộ đệm"
// - Vùng nhớ tạm thời chứa dữ liệu nhị phân
// - Dữ liệu thô của file (bytes)
//
// Ví dụ:
// - File ảnh "photo.jpg" = Chuỗi bytes: [255, 216, 255, 224, ...]
// - Buffer chứa chuỗi bytes này
// - Có thể đọc, ghi, truyền đi
//
// Tại sao dùng Buffer?
// - Middleware (multer) đọc file thành buffer
// - Cloudinary cần buffer để upload
// - Không cần lưu file tạm trên disk

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const cloudinary: Tạo hộp tên "cloudinary"
// require('../config/cloudinary'): Mượn module cloudinary đã cấu hình
//
// cloudinary là gì?
// - Object đã được cấu hình với API key
// - Có method .uploader.upload_stream() để upload
const cloudinary = require('../config/cloudinary');

// GIẢI THÍCH CÚ PHÁP:
// const User: Tạo hộp tên "User"
// require('../models/User'): Mượn User model
//
// Tại sao cần User model?
// - Để cập nhật avatarUrl khi upload ảnh đại diện
const User = require('../models/User');

// ============================================
// BƯỚC 2: HÀM UPLOAD ẢNH 🖼️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// exports.uploadImage = async (req, res) => { ... }:
//   - exports.uploadImage: Xuất hàm uploadImage
//   - async (req, res): Hàm async nhận req và res
//
// Hàm này sẽ được gọi khi:
// - Route POST /api/upload/image được gọi
// - Middleware multer đã xử lý file
// - req.file chứa thông tin file
//
// Upload image to Cloudinary
exports.uploadImage = async (req, res) => {
    try {
        // GIẢI THÍCH CÚ PHÁP:
        // if (!req.file): Kiểm tra có file không
        //   - req.file: Object chứa thông tin file
        //   - Middleware multer tạo req.file
        //   - Nếu không có → Người dùng không chọn file
        if (!req.file) {
            // GIẢI THÍCH CÚ PHÁP:
            // return res.status(400).json({ error: '...' }):
            //   - return: Dừng hàm
            //   - res.status(400): Đặt status code 400 (Bad Request)
            //   - .json(): Trả về JSON
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Cloudinary with buffer
        // GIẢI THÍCH CÚ PHÁP:
        // const result = await new Promise((resolve, reject) => { ... }):
        //   - await: Đợi promise hoàn thành
        //   - new Promise(): Tạo promise mới
        //   - (resolve, reject): 2 tham số callback
        //     + resolve(value): Gọi khi thành công
        //     + reject(error): Gọi khi thất bại
        //
        // Tại sao cần wrap trong Promise?
        // - Cloudinary dùng callback style (cũ)
        // - Chúng ta muốn dùng async/await (mới)
        // - Promise wrap giúp chuyển callback → async/await
        const result = await new Promise((resolve, reject) => {
            // GIẢI THÍCH CÚ PHÁP:
            // const uploadStream = cloudinary.uploader.upload_stream(...):
            //   - cloudinary.uploader: Object uploader
            //   - .upload_stream(): Method upload từ stream
            //   - Tham số 1: Options (cấu hình)
            //   - Tham số 2: Callback (error, result)
            //
            // upload_stream() là gì?
            // - Upload từ buffer/stream (không cần file path)
            // - Trả về writable stream
            // - Ghi dữ liệu vào stream → Upload
            const uploadStream = cloudinary.uploader.upload_stream(
                // GIẢI THÍCH CÚ PHÁP:
                // { folder, resource_type }: Object options
                {
                    // GIẢI THÍCH CÚ PHÁP:
                    // folder: 'codemaster/courses': Thư mục trên Cloudinary
                    //   - Tổ chức file theo thư mục
                    //   - 'codemaster/courses': Đường dẫn thư mục
                    folder: 'codemaster/courses',

                    // GIẢI THÍCH CÚ PHÁP:
                    // resource_type: 'auto': Tự động nhận diện loại file
                    //   - 'image': Chỉ ảnh
                    //   - 'video': Chỉ video
                    //   - 'auto': Tự nhận diện (jpg → image, mp4 → video)
                    resource_type: 'auto'
                },
                // GIẢI THÍCH CÚ PHÁP:
                // (error, result) => { ... }: Callback khi upload xong
                //   - error: Có lỗi xảy ra
                //   - result: Kết quả upload (URL, public_id, v.v.)
                (error, result) => {
                    // GIẢI THÍCH CÚ PHÁP:
                    // if (error) reject(error):
                    //   - Nếu có lỗi → Gọi reject()
                    //   - Promise chuyển sang Rejected
                    //   - await sẽ throw error
                    if (error) reject(error);
                    // GIẢI THÍCH CÚ PHÁP:
                    // else resolve(result):
                    //   - Không có lỗi → Gọi resolve()
                    //   - Promise chuyển sang Fulfilled
                    //   - await nhận result
                    else resolve(result);
                }
            );

            // GIẢI THÍCH CÚ PHÁP:
            // uploadStream.end(req.file.buffer):
            //   - uploadStream: Writable stream
            //   - .end(): Kết thúc stream
            //   - req.file.buffer: Buffer của file (dữ liệu nhị phân)
            //
            // Cách hoạt động:
            // 1. uploadStream được tạo (sẵn sàng nhận dữ liệu)
            // 2. .end(buffer) ghi toàn bộ buffer vào stream
            // 3. Stream đóng lại
            // 4. Cloudinary nhận dữ liệu và upload
            // 5. Callback được gọi với result
            uploadStream.end(req.file.buffer);
        });

        // GIẢI THÍCH CÚ PHÁP:
        // res.status(200).json({ ... }):
        //   - res.status(200): Đặt status code 200 (OK)
        //   - .json(): Trả về JSON
        res.status(200).json({
            success: true,
            // GIẢI THÍCH CÚ PHÁP:
            // url: result.secure_url: URL HTTPS của file đã upload
            //   - result: Kết quả từ Cloudinary
            //   - .secure_url: URL an toàn (HTTPS)
            //   - Ví dụ: "https://res.cloudinary.com/.../image.jpg"
            url: result.secure_url,

            // GIẢI THÍCH CÚ PHÁP:
            // public_id: result.public_id: ID công khai của file
            //   - Dùng để xóa hoặc cập nhật file sau này
            //   - Ví dụ: "codemaster/courses/abc123"
            public_id: result.public_id
        });
    } catch (error) {
        // GIẢI THÍCH CÚ PHÁP:
        // console.error(): In lỗi ra console
        //   - Khác với console.log()
        //   - Màu đỏ trong console
        //   - Dùng cho lỗi
        console.error('Upload Error:', error);

        // GIẢI THÍCH CÚ PHÁP:
        // res.status(500).json({ error: '...' }):
        //   - 500: Internal Server Error (Lỗi server)
        //   - 'Failed to upload image: ' + error.message: Nối chuỗi
        res.status(500).json({ error: 'Failed to upload image: ' + error.message });
    }
};

// ============================================
// BƯỚC 3: HÀM UPLOAD VIDEO 🎬
// ============================================

// GIẢI THÍCH:
// Hàm này tương tự uploadImage
// Khác biệt:
// - folder: 'codemaster/videos' (thư mục khác)
// - resource_type: 'video' (chỉ định video)
// - chunk_size: 6000000 (chia video thành chunk 6MB)
//
// Tại sao cần chunk_size?
// - Video thường lớn (vài trăm MB)
// - Upload toàn bộ cùng lúc → Chậm, dễ timeout
// - Chia thành chunk nhỏ → Upload từng phần
// Upload video to Cloudinary
exports.uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload video to Cloudinary with buffer
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'codemaster/videos',
                    resource_type: 'video',
                    // GIẢI THÍCH CÚ PHÁP:
                    // chunk_size: 6000000: Kích thước mỗi chunk (bytes)
                    //   - 6000000 bytes = 6 MB
                    //   - Video chia thành các chunk 6MB
                    //   - Upload từng chunk
                    //   - Tốt cho video lớn
                    chunk_size: 6000000 // 6MB chunks for large videos
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Video Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload video: ' + error.message });
    }
};

// ============================================
// BƯỚC 4: HÀM UPLOAD ẢNH ĐẠI DIỆN 👤
// ============================================

// GIẢI THÍCH:
// Hàm này upload ảnh đại diện và CẬP NHẬT database
// Khác biệt so với uploadImage:
// 1. Lấy userId từ req.user (từ authMiddleware)
// 2. Upload ảnh lên Cloudinary
// 3. Cập nhật avatarUrl trong database
// 4. Có transformation (resize, crop ảnh)
//
// Upload profile picture to Cloudinary and update user avatarUrl cho student và teacher role
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // GIẢI THÍCH CÚ PHÁP:
        // const userId = req.user.id:
        //   - req.user: Object user được authMiddleware thêm vào
        //   - authMiddleware (line 195): req.user = { id: userSnap.id, ... }
        //   - req.user.id: ID của user đang đăng nhập
        //
        // From auth middleware (line 23: req.user = { id: userSnap.id, ...})
        const userId = req.user.id;

        // Upload to Cloudinary in profile pictures folder
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'codemaster/profiles',
                    resource_type: 'image',
                    // GIẢI THÍCH CÚ PHÁP:
                    // transformation: [ ... ]: Mảng các phép biến đổi ảnh
                    //   - Cloudinary có thể:
                    //     + Resize (thay đổi kích thước)
                    //     + Crop (cắt ảnh)
                    //     + Filter (áp dụng hiệu ứng)
                    //     + Optimize (tối ưu chất lượng)
                    transformation: [
                        // GIẢI THÍCH CÚ PHÁP:
                        // { width, height, crop, gravity }: Phép biến đổi 1
                        {
                            // GIẢI THÍCH CÚ PHÁP:
                            // width: 500, height: 500: Kích thước đích
                            //   - Resize ảnh thành 500x500 pixels
                            //   - Ảnh đại diện thường là hình vuông
                            width: 500,
                            height: 500,

                            // GIẢI THÍCH CÚ PHÁP:
                            // crop: 'fill': Chế độ cắt
                            //   - 'fill': Lấp đầy khung, cắt phần thừa
                            //   - 'fit': Thu nhỏ để vừa khung, có viền
                            //   - 'scale': Kéo giãn để vừa khung
                            crop: 'fill',

                            // GIẢI THÍCH CÚ PHÁP:
                            // gravity: 'face': Điểm trọng tâm khi crop
                            //   - 'face': Tập trung vào khuôn mặt
                            //   - 'center': Tập trung vào giữa
                            //   - 'north': Phía trên
                            //
                            // Tại sao dùng 'face'?
                            // - Cloudinary nhận diện khuôn mặt
                            // - Cắt ảnh sao cho khuôn mặt ở giữa
                            // - Ảnh đại diện đẹp hơn
                            gravity: 'face'
                        },
                        // GIẢI THÍCH CÚ PHÁP:
                        // { quality, fetch_format }: Phép biến đổi 2
                        {
                            // GIẢI THÍCH CÚ PHÁP:
                            // quality: 'auto': Tự động tối ưu chất lượng
                            //   - Cloudinary tự điều chỉnh
                            //   - Cân bằng giữa chất lượng và kích thước file
                            quality: 'auto',

                            // GIẢI THÍCH CÚ PHÁP:
                            // fetch_format: 'auto': Tự động chọn định dạng
                            //   - Cloudinary chọn định dạng tốt nhất
                            //   - WebP cho Chrome
                            //   - JPEG cho browser cũ
                            //   - Giảm kích thước file
                            fetch_format: 'auto'
                        }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        // Update user's avatarUrl in database (checkpoint)
        // GIẢI THÍCH CÚ PHÁP:
        // await User.update(userId, { avatarUrl: result.secure_url }):
        //   - User.update(): Static method của User model
        //   - userId: ID của user cần cập nhật
        //   - { avatarUrl: result.secure_url }: Dữ liệu cập nhật
        //
        // Tại sao cập nhật database?
        // - Lưu URL ảnh đại diện mới
        // - Frontend lấy avatarUrl từ database để hiển thị
        // - Ảnh đại diện đồng bộ trên toàn website
        await User.update(userId, { avatarUrl: result.secure_url });

        res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            message: 'Profile picture updated successfully'
        });
    } catch (error) {
        console.error('Profile Picture Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload profile picture: ' + error.message });
    }
};

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là UPLOAD CONTROLLER (controller upload):
//
// 1. Xuất 3 hàm xử lý upload:
//    a) uploadImage(req, res):
//       - Upload ảnh chung (course, blog)
//       - Lưu vào folder 'codemaster/courses'
//       - resource_type: 'auto'
//       - Trả về URL và public_id
//
//    b) uploadVideo(req, res):
//       - Upload video (lesson)
//       - Lưu vào folder 'codemaster/videos'
//       - resource_type: 'video'
//       - chunk_size: 6MB (cho video lớn)
//       - Trả về URL và public_id
//
//    c) uploadProfilePicture(req, res):
//       - Upload ảnh đại diện
//       - Lưu vào folder 'codemaster/profiles'
//       - Có transformation (500x500, crop face)
//       - Cập nhật avatarUrl trong database
//       - Trả về URL, public_id và message
//
// 2. Xử lý lỗi:
//    - Kiểm tra req.file có tồn tại không
//    - try-catch bắt lỗi upload
//    - Trả về status code phù hợp (400, 500)
//
// 3. Sử dụng Promise wrapper:
//    - Wrap callback Cloudinary thành Promise
//    - Cho phép dùng async/await
//    - Code sạch hơn, dễ đọc hơn
//
// CÁCH SỬ DỤNG:
// // Trong route file (uploadRoutes.js):
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });
// const { uploadImage, uploadVideo, uploadProfilePicture } = require('./uploadController');
//
// router.post('/upload/image', upload.single('image'), uploadImage);
// router.post('/upload/video', upload.single('video'), uploadVideo);
// router.post('/upload/profile', authMiddleware, upload.single('avatar'), uploadProfilePicture);
//
// // Trong frontend:
// const formData = new FormData();
// formData.append('image', file);
// const response = await fetch('/api/upload/image', {
//   method: 'POST',
//   body: formData
// });
// const data = await response.json();
// console.log(data.url); // URL ảnh đã upload
//
// VÍ DỤ THỰC TẾ:
// 1. Teacher tạo khóa học mới:
//    - Chọn ảnh thumbnail
//    - Frontend gọi POST /api/upload/image
//    - Backend upload lên Cloudinary
//    - Trả về URL
//    - Teacher dùng URL này khi tạo course
//
// 2. User cập nhật ảnh đại diện:
//    - Chọn ảnh mới
//    - Frontend gọi POST /api/upload/profile
//    - Backend upload, resize 500x500, crop face
//    - Cập nhật avatarUrl trong database
//    - Ảnh đại diện mới hiển thị trên toàn website
//
// 3. Teacher upload video bài giảng:
//    - Chọn video (200MB)
//    - Frontend gọi POST /api/upload/video
//    - Backend upload với chunk_size 6MB
//    - Cloudinary xử lý video
//    - Trả về URL
//    - Teacher dùng URL này cho lesson
//
// LỢI ÍCH:
// - Không lưu file trực tiếp trên server
// - Cloudinary tối ưu ảnh/video tự động
// - CDN giúp tải nhanh toàn cầu
// - Transformation linh hoạt (resize, crop)
// - Dễ quản lý file trên Cloudinary dashboard
//
// KEYWORD MỚI:
// - Upload: Tải lên
// - Buffer: Bộ đệm (dữ liệu nhị phân)
// - Stream: Luồng dữ liệu
// - Promise: Lời hứa
// - resolve(): Hoàn thành promise
// - reject(): Từ chối promise
// - Callback: Hàm gọi lại
// - Cloud Storage: Lưu trữ đám mây
// - CDN: Content Delivery Network
// - Transformation: Phép biến đổi ảnh
// - Crop: Cắt ảnh
// - Gravity: Điểm trọng tâm
// - chunk_size: Kích thước mảnh
// - secure_url: URL HTTPS an toàn
// - public_id: ID công khai của file
// - multer: Middleware xử lý file upload
// - FormData: Định dạng dữ liệu form
