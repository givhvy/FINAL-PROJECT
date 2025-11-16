// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giúp người dùng đăng nhập bằng tài khoản Google
// Giống như khi bạn vào chơi game và có thể dùng tài khoản Google để đăng nhập
// Thay vì phải nhớ mật khẩu mới, bạn chỉ cần bấm "Đăng nhập với Google"!

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// Passport là "công cụ bảo vệ" giúp kiểm tra xem ai đang đăng nhập
// Giống như bác bảo vệ ở cổng trường kiểm tra thẻ học sinh
const passport = require('passport');

// GoogleStrategy là "cách thức" để đăng nhập bằng Google
// Giống như quy trình kiểm tra thẻ Google của bạn
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Firestore là "cơ sở dữ liệu" nơi lưu thông tin người dùng
// Giống như sổ điểm danh có ghi tên tất cả học sinh
const { getFirestore } = require('firebase-admin/firestore');

// ============================================
// BƯỚC 2: XUẤT RA HÀM THIẾT LẬP 📤
// ============================================

// Dòng này tạo một "hàm" (function) nhận vào app
// Hàm này sẽ thiết lập tất cả các quy tắc đăng nhập
module.exports = function(app) {
  // ============================================
  // BƯỚC 3: KIỂM TRA XEM CÓ KHÓA GOOGLE KHÔNG 🔑
  // ============================================

  // Lấy "ID khách hàng" của Google từ file bí mật (.env)
  // Giống như số thẻ học sinh của bạn
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  // Lấy "Mật khẩu bí mật" của Google từ file bí mật (.env)
  // Giống như mật khẩu cánh cổng vào trường
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // In ra màn hình để kiểm tra xem có đủ thông tin không
  console.log('🔍 Checking Google OAuth config...');
  console.log('Client ID:', googleClientId ? '✅ Found' : '❌ Missing');
  console.log('Client Secret:', googleClientSecret ? '✅ Found' : '❌ Missing');

  // Nếu KHÔNG có ID hoặc mật khẩu Google...
  if (!googleClientId || !googleClientSecret) {
    // In cảnh báo ra màn hình
    console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
    console.warn('📖 See docs/GOOGLE_OAUTH_SETUP.md for setup instructions');
    // Trả về passport mà không có Google (không thể đăng nhập bằng Google)
    return passport;
  }

  // Nếu CÓ đủ thông tin, in thông báo thành công
  console.log('✅ Google OAuth configured! Registering strategy...');

  // ============================================
  // BƯỚC 4: LƯU THÔNG TIN NGƯỜI DÙNG VÀO SESSION 💾
  // ============================================

  // "Serialize" nghĩa là "chuyển thành dạng đơn giản để lưu"
  // Giống như khi bạn xếp đồ chơi vào hộp để cất đi
  // Thay vì lưu TẤT CẢ thông tin người dùng, chỉ lưu ID (số nhận dạng)
  passport.serializeUser((user, done) => {
    // "done" nghĩa là "xong rồi, đây là kết quả"
    // Chỉ lưu ID của người dùng thôi (user.id)
    done(null, user.id);
  });

  // ============================================
  // BƯỚC 5: LẤY LẠI THÔNG TIN NGƯỜI DÙNG 🔍
  // ============================================

  // "Deserialize" nghĩa là "lấy ra từ dạng đơn giản"
  // Giống như khi bạn mở hộp đồ chơi ra để chơi lại
  // Dùng ID để tìm lại TẤT CẢ thông tin người dùng
  passport.deserializeUser(async (id, done) => {
    try {
      // Mở cơ sở dữ liệu Firestore
      const db = getFirestore();

      // Tìm người dùng có ID này trong cơ sở dữ liệu
      // Giống như tìm tên bạn trong sổ điểm danh
      const userDoc = await db.collection('users').doc(id).get();

      // Nếu TÌM THẤY người dùng...
      if (userDoc.exists) {
        // Trả về thông tin đầy đủ của người dùng
        done(null, { id: userDoc.id, ...userDoc.data() });
      } else {
        // Nếu KHÔNG tìm thấy, trả về "false" (không có người này)
        done(null, false);
      }
    } catch (error) {
      // Nếu có lỗi, báo lỗi
      done(error, null);
    }
  });

  // ============================================
  // BƯỚC 6: THIẾT LẬP CÁCH ĐĂNG NHẬP GOOGLE 🔐
  // ============================================

  // Đây là "chiến lược" (strategy) đăng nhập bằng Google
  passport.use(new GoogleStrategy({
      // ID khách hàng của Google (đã lấy từ .env)
      clientID: process.env.GOOGLE_CLIENT_ID,

      // Mật khẩu bí mật của Google (đã lấy từ .env)
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // Đây là "địa chỉ trở về" sau khi đăng nhập Google xong
      // Giống như địa chỉ nhà bạn sau khi đi chơi về
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback'
    },
    // ============================================
    // BƯỚC 7: XỬ LÝ SAU KHI GOOGLE CHO PHÉP ĐĂNG NHẬP ✅
    // ============================================

    // Hàm này chạy sau khi Google nói "OK, người này được vào!"
    // accessToken: "chìa khóa truy cập" để lấy thông tin từ Google
    // refreshToken: "chìa khóa làm mới" để lấy chìa khóa mới khi hết hạn
    // profile: Thông tin cá nhân từ Google (tên, email, ảnh)
    // done: Hàm gọi khi xong việc
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Mở cơ sở dữ liệu
        const db = getFirestore();
        const usersRef = db.collection('users');

        // ============================================
        // BƯỚC 8: KIỂM TRA NGƯỜI DÙNG ĐÃ TỒN TẠI CHƯA? 🔍
        // ============================================

        // Tìm xem có người dùng nào có email này chưa
        // Giống như kiểm tra xem bạn đã có tên trong sổ điểm danh chưa
        const existingUser = await usersRef
          .where('email', '==', profile.emails[0].value) // Tìm theo email
          .limit(1) // Chỉ lấy 1 kết quả thôi
          .get();

        // ============================================
        // TRƯỜNG HỢP 1: NGƯỜI DÙNG ĐÃ CÓ TÀI KHOẢN 👤
        // ============================================

        // Nếu tìm THẤY người dùng (không rỗng - not empty)...
        if (!existingUser.empty) {
          // Lấy thông tin người dùng đã có
          const userDoc = existingUser.docs[0];

          // Cập nhật một số thông tin mới từ Google
          await userDoc.ref.update({
            googleId: profile.id,                      // ID Google của họ
            avatarUrl: profile.photos[0]?.value || null, // Ảnh đại diện mới
            lastLogin: new Date()                      // Thời gian đăng nhập gần nhất
          });

          // Trả về thông tin người dùng đã cập nhật
          return done(null, { id: userDoc.id, ...userDoc.data() });

        } else {
          // ============================================
          // TRƯỜNG HỢP 2: NGƯỜI DÙNG CHƯA CÓ TÀI KHOẢN 🆕
          // ============================================

          // Tạo một "người dùng mới" với thông tin từ Google
          const newUser = {
            googleId: profile.id,                      // ID Google
            email: profile.emails[0].value,             // Email từ Google
            name: profile.displayName,                  // Tên hiển thị từ Google
            avatarUrl: profile.photos[0]?.value || null, // Ảnh đại diện từ Google
            role: 'student',                            // Vai trò mặc định là học sinh
            createdAt: new Date(),                      // Ngày tạo tài khoản
            lastLogin: new Date(),                      // Lần đăng nhập đầu tiên
            provider: 'google'                          // Đăng nhập bằng Google
          };

          // Thêm người dùng mới vào cơ sở dữ liệu
          const userRef = await usersRef.add(newUser);

          // Lấy lại thông tin người dùng vừa tạo
          const createdUser = await userRef.get();

          // Trả về thông tin người dùng mới
          return done(null, { id: createdUser.id, ...createdUser.data() });
        }
      } catch (error) {
        // Nếu có lỗi, in lỗi ra màn hình và báo lỗi
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  ));

  // ============================================
  // BƯỚC 9: TRẢ VỀ PASSPORT ĐÃ THIẾT LẬP 📤
  // ============================================

  // Trả về passport đã được thiết lập xong
  // Giống như bác bảo vệ đã sẵn sàng kiểm tra thẻ
  return passport;
};

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// 1. Kiểm tra xem có thông tin Google OAuth không (ID và mật khẩu)
// 2. Thiết lập cách lưu và lấy thông tin người dùng (serialize/deserialize)
// 3. Thiết lập cách đăng nhập bằng Google (GoogleStrategy)
// 4. Khi có người đăng nhập Google:
//    - Nếu đã có tài khoản: Cập nhật thông tin
//    - Nếu chưa có: Tạo tài khoản mới
// 5. Trả về thông tin người dùng để họ có thể vào website
//
// VÍ DỤ THỰC TẾ:
// - Bạn bấm nút "Đăng nhập bằng Google"
// - Google hỏi: "Bạn có muốn cho phép website này truy cập không?"
// - Bạn bấm "Đồng ý"
// - File này nhận thông tin từ Google
// - File này kiểm tra xem bạn đã có tài khoản chưa
// - Nếu chưa có: Tạo tài khoản mới cho bạn
// - Nếu có rồi: Cho bạn đăng nhập luôn
// - Bạn vào được website! 🎉
