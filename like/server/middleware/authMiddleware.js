// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BÁC BẢO VỆ KIỂM TRA THẺ" ở cổng lớp!
// Mỗi khi bạn muốn vào một phòng học (chức năng đặc biệt),
// bác bảo vệ sẽ kiểm tra:
// 1. Bạn có mang thẻ không? (có token không?)
// 2. Thẻ có hợp lệ không? (token có đúng không?)
// 3. Thẻ có trong danh sách không? (user có trong database không?)
// Nếu OK → Cho vào! Nếu không → Đuổi ra!

// ============================================
// GIẢI THÍCH KHÁI NIỆM MIDDLEWARE 🔧
// ============================================
// MIDDLEWARE là gì?
// - "Middle" = ở giữa, "Ware" = phần mềm
// - Middleware = Phần mềm ở giữa
//
// Hành trình của một yêu cầu (request):
// 1. User gửi yêu cầu → 2. Middleware kiểm tra → 3. Đến controller xử lý
//                          ↑ ĐỨNG Ở GIỮA!
//
// Giống như:
// Bạn muốn vào lớp → Bác bảo vệ kiểm tra thẻ → Vào lớp được
//                    ↑ BÁC BẢO VỆ = MIDDLEWARE!

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// JWT: Công cụ để KIỂM TRA token (thẻ thông hành)
// Giống như máy quét mã vạch để kiểm tra thẻ có hợp lệ không
const jwt = require('jsonwebtoken');

// Firestore: Cơ sở dữ liệu để kiểm tra user có tồn tại không
// Giống như sổ danh sách học sinh
const { getFirestore } = require('firebase-admin/firestore');

// ============================================
// BƯỚC 2: TẠO HÀM MIDDLEWARE 🚦
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const authMiddleware: Tạo hộp tên "authMiddleware"
// = async (req, res, next): Gán một hàm bất đồng bộ
//   - req (request): Yêu cầu từ user
//   - res (response): Phản hồi trả về cho user
//   - next: Hàm để cho phép đi tiếp (như cái chuông báo "qua được")
// => : Dấu mũi tên tạo hàm
const authMiddleware = async (req, res, next) => {
  // try: Thử chạy code, nếu lỗi sẽ nhảy vào catch
  try {
    // ============================================
    // BƯỚC 3: LẤY TOKEN TỪ HEADER 📨
    // ============================================

    // GIẢI THÍCH CỚ PHÁP CHI TIẾT:
    // const token: Tạo hộp tên "token"
    // = : Dấu bằng để gán giá trị
    // req.header('Authorization'): Lấy giá trị từ header "Authorization"
    //   - req: Request object
    //   - .header(): Method lấy giá trị header
    //   - ('Authorization'): Tên của header
    //   Header Authorization thường có dạng: "Bearer eyJhbGci..."
    //   (Bearer = người mang, nghĩa là "người mang token này")
    //
    // ?. : Toán tử "Optional Chaining" (chuỗi tuỳ chọn)
    //   - Nếu req.header('Authorization') TỒN TẠI → gọi .replace()
    //   - Nếu req.header('Authorization') là NULL/UNDEFINED → trả về undefined
    //   - Tại sao dùng? Để tránh lỗi khi header không tồn tại
    //
    // .replace('Bearer ', ''): Xoá chữ "Bearer " khỏi chuỗi
    //   - .replace(): Method thay thế chuỗi
    //   - ('Bearer ', ''): Thay "Bearer " bằng "" (rỗng)
    //   Ví dụ: "Bearer abc123" → "abc123"
    //   Tại sao? Vì chúng ta chỉ cần phần token, không cần chữ "Bearer"
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // GIẢI THÍCH CÚ PHÁP:
    // if (!token): Nếu KHÔNG có token
    // !token: Phủ định token
    //   - Nếu token = "abc123" → !token = false → không vào if
    //   - Nếu token = null/undefined → !token = true → vào if
    if (!token) {
      // GIẢI THÍCH CÚ PHÁP:
      // return: Dừng hàm ngay lập tức
      // res.status(401): Đặt mã trạng thái 401
      //   - 401 = Unauthorized (không được phép)
      //   - Nghĩa là: "Bạn chưa đăng nhập hoặc không có quyền"
      // .json(): Trả về JSON
      // { error: '...' }: Object có thuộc tính error
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // ============================================
    // BƯỚC 4: GIẢI MÃ TOKEN 🔓
    // ============================================

    // GIẢI THÍCH CÚ PHÁP:
    // const decoded: Tạo hộp tên "decoded" (đã giải mã)
    // jwt.verify(): Hàm KIỂM TRA và GIẢI MÃ token
    //   - jwt: Object JWT
    //   - .verify(): Method kiểm tra token có hợp lệ không
    //   Tham số 1: token - Token cần kiểm tra
    //   Tham số 2: process.env.JWT_SECRET - Chìa khóa bí mật
    //
    // Cách hoạt động:
    //   1. Lấy token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    //   2. Dùng JWT_SECRET để giải mã
    //   3. Nếu token HỢP LỆ → trả về dữ liệu bên trong (ví dụ: {userId: "123", role: "student"})
    //   4. Nếu token KHÔNG hợp lệ → ném lỗi (throw error)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ============================================
    // BƯỚC 5: LẤY THÔNG TIN USER TỪ DATABASE 📚
    // ============================================

    // GIẢI THÍCH CÚ PHÁP:
    // const db: Tạo hộp tên "db"
    // getFirestore(): Gọi hàm để lấy database
    const db = getFirestore();

    // GIẢI THÍCH CÚ PHÁP:
    // const userRef: Tạo hộp tên "userRef" (reference - tham chiếu)
    // db.collection('users'): Lấy collection "users"
    //   - db: Database
    //   - .collection(): Method lấy collection
    //   - ('users'): Tên collection
    // .doc(decoded.userId): Lấy document có ID = decoded.userId
    //   - .doc(): Method lấy document
    //   - (decoded.userId): ID của document
    //   - decoded.userId: Lấy thuộc tính userId từ object decoded
    //
    // userRef KHÔNG PHẢI là dữ liệu, mà chỉ là "địa chỉ" của document
    // Giống như địa chỉ nhà, chưa phải là ngôi nhà
    const userRef = db.collection('users').doc(decoded.userId);

    // GIẢI THÍCH CÚ PHÁP:
    // const userSnap: Tạo hộp tên "userSnap" (snapshot - ảnh chụp)
    // await: Đợi lấy dữ liệu xong
    // userRef.get(): Lấy dữ liệu từ document
    //   - userRef: Reference (địa chỉ)
    //   - .get(): Method LẤY dữ liệu thực tế
    //
    // userSnap là "ảnh chụp" của document tại thời điểm này
    // Giống như chụp ảnh ngôi nhà
    const userSnap = await userRef.get();

    // GIẢI THÍCH CÚ PHÁP:
    // if (!userSnap.exists): Nếu document KHÔNG tồn tại
    // userSnap.exists: Thuộc tính kiểm tra document có tồn tại không
    //   - true: Document tồn tại
    //   - false: Document không tồn tại
    // !userSnap.exists: Phủ định
    //   - Nếu tồn tại → !true = false → không vào if
    //   - Nếu không tồn tại → !false = true → vào if
    if (!userSnap.exists) {
      // Token hợp lệ NHƯNG user không còn trong database
      // (Có thể đã bị xóa)
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // ============================================
    // BƯỚC 6: LƯU THÔNG TIN USER VÀO REQUEST 💾
    // ============================================

    // GIẢI THÍCH CÚ PHÁP:
    // req.user: Tạo thuộc tính "user" trong object req
    // = : Gán giá trị
    // { id: userSnap.id, ...userSnap.data() }: Object mới
    //
    // Giải thích từng phần:
    // 1. { }: Tạo object mới
    // 2. id: userSnap.id: Thuộc tính "id" có giá trị là userSnap.id
    // 3. , : Dấu phẩy ngăn cách các thuộc tính
    // 4. ...userSnap.data(): Toán tử "Spread" (rải)
    //    - ... : Ba dấu chấm = toán tử spread
    //    - userSnap.data(): Lấy TẤT CẢ dữ liệu từ document
    //    - ...userSnap.data(): "Rải" tất cả dữ liệu ra
    //
    // Ví dụ:
    // userSnap.id = "abc123"
    // userSnap.data() = { name: "An", email: "an@gmail.com" }
    //
    // Kết quả:
    // req.user = {
    //   id: "abc123",
    //   name: "An",
    //   email: "an@gmail.com"
    // }
    //
    // Tại sao lưu vào req.user?
    // Vì các hàm xử lý sau này sẽ cần biết "ai đang đăng nhập"
    // req.user sẽ được truyền đến controller tiếp theo
    req.user = { id: userSnap.id, ...userSnap.data() };

    // ============================================
    // BƯỚC 7: CHO PHÉP ĐI TIẾP ✅
    // ============================================

    // GIẢI THÍCH CÚ PHÁP:
    // next(): Gọi hàm next
    // next: Tham số thứ 3 của middleware
    //
    // Khi gọi next():
    // - Báo cho Express: "OK rồi, cho qua được!"
    // - Request sẽ đi tiếp đến middleware hoặc controller tiếp theo
    // - Giống như bác bảo vệ mở cổng cho bạn vào lớp
    //
    // Nếu KHÔNG gọi next():
    // - Request sẽ "kẹt" ở đây
    // - User sẽ không nhận được phản hồi
    // - Giống như bác bảo vệ không mở cổng, bạn đứng đợi mãi
    next();

  // ============================================
  // BƯỚC 8: BẮT LỖI ❌
  // ============================================

  // catch: Bắt lỗi nếu code trong try có lỗi
  // (error): Tham số chứa thông tin lỗi
  } catch (error) {
    // Lỗi có thể xảy ra khi:
    // 1. jwt.verify() thất bại (token không hợp lệ, đã hết hạn, sai chìa khóa)
    // 2. Lỗi kết nối database
    // 3. Lỗi khác...

    // GIẢI THÍCH CÚ PHÁP:
    // res.status(400): Đặt mã trạng thái 400
    //   - 400 = Bad Request (yêu cầu sai)
    // .json(): Trả về JSON
    res.status(400).json({ error: 'Invalid token.' });
  }
// }; : Dấu ngoặc nhọn đóng hàm, dấu chấm phẩy kết thúc
};

// ============================================
// BƯỚC 9: XUẤT HÀM RA NGOÀI 📤
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// module.exports: Xuất hàm authMiddleware
// module: Object đặc biệt trong Node.js đại diện cho file hiện tại
// .exports: Thuộc tính để xuất code
// = authMiddleware: Gán hàm authMiddleware
//
// Sau khi export, file khác có thể dùng:
// const authMiddleware = require('./authMiddleware');
module.exports = authMiddleware;

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là MIDDLEWARE kiểm tra đăng nhập:
//
// 1. Lấy token từ header "Authorization"
// 2. Kiểm tra có token không? (Không → Lỗi 401)
// 3. Giải mã token bằng JWT_SECRET
// 4. Lấy userId từ token đã giải mã
// 5. Tìm user trong database theo userId
// 6. Kiểm tra user có tồn tại không? (Không → Lỗi 401)
// 7. Lưu thông tin user vào req.user
// 8. Gọi next() để cho phép request đi tiếp
// 9. Nếu có lỗi → Lỗi 400
//
// CÁCH SỬ DỤNG:
// Trong file route:
// router.get('/profile', authMiddleware, getProfile);
//                        ↑ MIDDLEWARE ĐỨNG Ở GIỮA!
//
// Hành trình request:
// 1. User gửi GET /profile (kèm token trong header)
// 2. authMiddleware kiểm tra token
// 3. Nếu OK: Lưu user vào req.user, gọi next()
// 4. Đến controller getProfile xử lý
// 5. getProfile có thể dùng req.user để biết ai đang đăng nhập
//
// VÍ DỤ THỰC TẾ:
// Bạn muốn xem trang "Hồ sơ của tôi":
// 1. Trình duyệt gửi yêu cầu kèm token
// 2. authMiddleware kiểm tra token có hợp lệ không
// 3. Nếu token đúng: Cho phép xem hồ sơ
// 4. Nếu token sai: Trả về lỗi "Invalid token"
//
// KEYWORD MỚI:
// - middleware: Hàm đứng giữa request và controller
// - next(): Hàm cho phép request đi tiếp
// - ?. : Optional chaining (chuỗi tuỳ chọn)
// - ... : Spread operator (toán tử rải)
// - req.user: Thuộc tính tự tạo để lưu user
