// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "BẢN THIẾT KẾ NGƯỜI DÙNG" trong website!
// Nó định nghĩa:
// - Người dùng có những thông tin gì (tên, email, mật khẩu, vai trò)
// - Có thể làm gì với người dùng (tạo mới, tìm kiếm, cập nhật, xóa)
//
// Giống như:
// - Bản thiết kế học sinh: Có tên, lớp, điểm số
// - Có thể: Thêm học sinh mới, tìm học sinh, sửa điểm, xóa học sinh

// ============================================
// GIẢI THÍCH KHÁI NIỆM MODEL 📊
// ============================================
// MODEL là gì?
// - "Model" = Mô hình, bản thiết kế
// - Đại diện cho một đối tượng trong hệ thống (User, Course, Blog)
// - Định nghĩa:
//   + Dữ liệu (attributes/properties): name, email, password
//   + Hành vi (methods): create, find, update, delete
//
// Tại sao cần Model?
// - Tổ chức code gọn gàng
// - Tái sử dụng logic (không phải viết lại mỗi lần)
// - Dễ bảo trì và mở rộng
//
// Kiến trúc MVC:
// Model ↔ Controller ↔ View
//   ↓         ↓          ↓
// Dữ liệu  Logic xử lý  Giao diện

// ============================================
// GIẢI THÍCH KHÁI NIỆM CLASS (LỚP) 🏫
// ============================================
// CLASS là gì?
// - "Class" = Lớp, khuôn mẫu
// - Là bản thiết kế để tạo ra các object
// - Giống như: Khuôn bánh để làm bánh
//
// Class vs Object:
// - Class: Bản thiết kế (khuôn bánh)
// - Object: Sản phẩm từ bản thiết kế (cái bánh)
//
// Ví dụ:
// - Class User: Bản thiết kế người dùng
// - const user1 = new User({name: "An"}): Người dùng cụ thể
// - const user2 = new User({name: "Bình"}): Người dùng khác
//
// Class có:
// - constructor(): Hàm khởi tạo (tạo object mới)
// - Methods: Các hàm (hành vi)
// - Properties: Các thuộc tính (dữ liệu)

// ============================================
// GIẢI THÍCH STATIC METHOD 🔧
// ============================================
// STATIC METHOD là gì?
// - Method thuộc về CLASS, không thuộc về object cụ thể
// - Gọi trực tiếp từ class: User.findById()
// - KHÔNG CẦN tạo object: const user = new User()
//
// Static vs Instance Method:
// 1. Static Method:
//    - User.findById('123') → Tìm user có ID 123
//    - Làm việc với nhiều user hoặc database
//
// 2. Instance Method:
//    - user.comparePassword('123456') → So sánh mật khẩu của user này
//    - Làm việc với user cụ thể (object)
//
// Ví dụ thực tế:
// - Static: Math.max(5, 10) → 10 (gọi từ class Math)
// - Instance: "hello".toUpperCase() → "HELLO" (gọi từ string)

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const { getFirestore }: Destructuring import
// require('firebase-admin/firestore'): Mượn module Firestore
//
// getFirestore là gì?
// - Hàm để lấy instance của Firestore database
// - Giống như "mở cửa" kho dữ liệu
const { getFirestore } = require('firebase-admin/firestore');

// GIẢI THÍCH CÚ PHÁP:
// const bcrypt: Tạo hộp tên "bcrypt"
// require('bcryptjs'): Mượn thư viện bcryptjs
//
// Bcrypt là gì?
// - Thư viện MÃ HÓA mật khẩu
// - Giống như "máy mã hóa bí mật"
// - Chuyển mật khẩu "123456" thành "$2a$10$KIX..."
// - Tại sao mã hóa?
//   + Bảo vệ mật khẩu người dùng
//   + Nếu database bị hack, hacker không đọc được mật khẩu
const bcrypt = require('bcryptjs');

// ============================================
// BƯỚC 2: ĐỊNH NGHĨA CLASS USER 👤
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// class User { ... }: Định nghĩa class tên "User"
//   - class: Từ khóa định nghĩa class
//   - User: Tên class (viết hoa chữ cái đầu)
//   - { ... }: Thân class (chứa constructor và methods)
/**
 * User Model
 * Xử lý tất cả các thao tác liên quan đến người dùng trong Firestore
 */
class User {
    // ============================================
    // CONSTRUCTOR: HÀM KHỞI TẠO 🏗️
    // ============================================

    // GIẢI THÍCH CÚ PHÁP:
    // constructor(data): Hàm khởi tạo
    //   - constructor: Từ khóa đặc biệt (hàm tạo)
    //   - (data): Tham số - object chứa dữ liệu user
    //
    // Constructor làm gì?
    // - Chạy TỰ ĐỘNG khi tạo object mới: new User({...})
    // - Khởi tạo các thuộc tính cho object
    // - Giống như: "Điền thông tin vào phiếu đăng ký"
    //
    // Ví dụ:
    // const user = new User({ name: "An", email: "an@gmail.com" });
    // → Constructor chạy → user.name = "An", user.email = "an@gmail.com"
    constructor(data) {
        // GIẢI THÍCH CÚ PHÁP:
        // this.id: Thuộc tính "id" của object này
        //   - this: Từ khóa đại diện cho object hiện tại
        //   - .id: Thuộc tính "id"
        //   - = : Gán giá trị
        //   - data.id: Lấy id từ tham số data
        //   - || null: Nếu không có id → gán null
        //
        // || (OR operator) - Toán tử HOẶC:
        // - data.id || null: Nếu data.id CÓ giá trị → dùng data.id
        //                   Nếu data.id KHÔNG CÓ → dùng null
        this.id = data.id || null;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;

        // Vai trò mặc định là 'student' nếu không có
        this.role = data.role || 'student';

        // GIẢI THÍCH CÚ PHÁP:
        // this.avatarUrl = data.avatarUrl || data.profilePicture || null;
        //   - ||: Toán tử OR (hoặc)
        //   - Thứ tự ưu tiên:
        //     1. Nếu data.avatarUrl có → dùng nó
        //     2. Nếu không → thử data.profilePicture
        //     3. Nếu cũng không → dùng null
        this.avatarUrl = data.avatarUrl || data.profilePicture || null;
        this.phone = data.phone || null;

        // Gói subscription mặc định là 'free' (miễn phí)
        // 'pro' = Gói trả phí
        this.subscriptionTier = data.subscriptionTier || 'free';

        // GIẢI THÍCH CÚ PHÁP:
        // new Date(): Tạo object Date mới (ngày giờ hiện tại)
        // .toISOString(): Chuyển thành chuỗi chuẩn ISO 8601
        //   - Ví dụ: "2023-11-13T10:30:00.000Z"
        //   - ISO: International Organization for Standardization
        //   - Định dạng quốc tế, dễ so sánh và sắp xếp
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();

        // Mã reset mật khẩu (6 số ngẫu nhiên)
        this.resetPasswordCode = data.resetPasswordCode || null;
        // Thời gian hết hạn của mã reset
        this.resetPasswordExpires = data.resetPasswordExpires || null;
    }

    // ============================================
    // STATIC METHODS: HÀM THUỘC VỀ CLASS 🔧
    // ============================================

    /**
     * Lấy instance của Firestore
     */
    // GIẢI THÍCH CÚ PHÁP:
    // static getDB(): Static method không tham số
    //   - static: Từ khóa static
    //   - getDB: Tên method
    //   - (): Không có tham số
    //   - { ... }: Thân hàm
    //
    // Gọi: User.getDB() (không cần new User())
    static getDB() {
        // GIẢI THÍCH CÚ PHÁP:
        // return getFirestore(): Trả về database
        //   - return: Trả về giá trị
        //   - getFirestore(): Gọi hàm lấy Firestore
        return getFirestore();
    }

    /**
     * Tìm người dùng theo email
     * @param {string} email - Email người dùng
     * @returns {Promise<User|null>} - User object hoặc null
     */
    // GIẢI THÍCH CÚ PHÁP:
    // static async findByEmail(email): Static async method
    //   - static: Method của class, không cần tạo object
    //   - async: Hàm bất đồng bộ (có thể dùng await)
    //   - findByEmail: Tên method (tìm theo email)
    //   - (email): Tham số - email cần tìm
    //
    // Promise<User|null>:
    // - Promise: Lời hứa (giá trị trong tương lai)
    // - User|null: Trả về User HOẶC null
    //   - |: Ký hiệu "hoặc" trong TypeScript/JSDoc
    //   - User: Nếu tìm thấy
    //   - null: Nếu không tìm thấy
    static async findByEmail(email) {
        // GIẢI THÍCH TRY-CATCH:
        // try: Thử chạy code
        // catch: Bắt lỗi nếu có
        try {
            // GIẢI THÍCH CÚ PHÁP:
            // const db = this.getDB():
            //   - this: Trong static method, this = class (User)
            //   - this.getDB(): Gọi method getDB() của class
            const db = this.getDB();

            // GIẢI THÍCH CÚ PHÁP:
            // const usersRef = db.collection('users'):
            //   - db.collection(): Method lấy collection
            //   - 'users': Tên collection trong Firestore
            //   - usersRef: Reference (tham chiếu) đến collection
            //
            // Collection là gì?
            // - Collection: Tập hợp các document
            // - Giống như: Tủ hồ sơ chứa nhiều phong bì
            const usersRef = db.collection('users');

            // GIẢI THÍCH CÚ PHÁP:
            // const snapshot = await usersRef.where('email', '==', email).get():
            //   - usersRef.where(): Method lọc dữ liệu
            //     + 'email': Tên trường cần lọc
            //     + '==': Toán tử bằng
            //     + email: Giá trị cần tìm
            //   - .get(): Lấy kết quả
            //   - await: Đợi kết quả trả về
            //   - snapshot: "Ảnh chụp" kết quả tại thời điểm này
            //
            // Firestore Query:
            // - where('field', 'operator', 'value'): Điều kiện lọc
            // - Các operator: '==', '!=', '<', '>', '<=', '>='
            const snapshot = await usersRef.where('email', '==', email).get();

            // GIẢI THÍCH CÚ PHÁP:
            // if (snapshot.empty): Kiểm tra có kết quả không
            //   - snapshot.empty: Thuộc tính boolean
            //   - true: Không có kết quả
            //   - false: Có kết quả
            if (snapshot.empty) {
                // Không tìm thấy user → trả về null
                return null;
            }

            // GIẢI THÍCH CÚ PHÁP:
            // const doc = snapshot.docs[0]:
            //   - snapshot.docs: Mảng các document
            //   - [0]: Lấy phần tử đầu tiên
            //   - Tại sao [0]?
            //     + Email là duy nhất (unique)
            //     + Chỉ có 1 kết quả
            const doc = snapshot.docs[0];

            // GIẢI THÍCH CÚ PHÁP:
            // return new User({ id: doc.id, ...doc.data() }):
            //   - new User(): Tạo object User mới
            //   - { ... }: Object truyền vào constructor
            //   - id: doc.id: ID của document
            //   - ...doc.data(): Spread operator
            //     + doc.data(): Lấy toàn bộ dữ liệu của document
            //     + ...: "Rải" tất cả thuộc tính ra
            //
            // Ví dụ:
            // doc.id = "abc123"
            // doc.data() = { name: "An", email: "an@gmail.com" }
            // → { id: "abc123", name: "An", email: "an@gmail.com" }
            return new User({ id: doc.id, ...doc.data() });

        } catch (error) {
            // GIẢI THÍCH CÚ PHÁP:
            // throw new Error(`...${error.message}`):
            //   - throw: Ném lỗi
            //   - new Error(): Tạo object lỗi mới
            //   - Template string với ${}: Nhúng biến
            //   - error.message: Thông điệp lỗi gốc
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    /**
     * Tìm người dùng theo ID
     * @param {string} id - User ID
     * @returns {Promise<User|null>} - User object hoặc null
     */
    static async findById(id) {
        try {
            const db = this.getDB();

            // GIẢI THÍCH CÚ PHÁP:
            // const doc = await db.collection('users').doc(id).get():
            //   - .doc(id): Lấy document có ID này
            //   - .get(): Lấy dữ liệu
            //   - await: Đợi kết quả
            //
            // Khác với findByEmail:
            // - findByEmail: .where().get() → Tìm kiếm
            // - findById: .doc(id).get() → Truy cập trực tiếp (nhanh hơn)
            const doc = await db.collection('users').doc(id).get();

            // GIẢI THÍCH CÚ PHÁP:
            // if (!doc.exists): Kiểm tra document có tồn tại không
            //   - doc.exists: Thuộc tính boolean
            //   - !: Phủ định
            //   - true: Document tồn tại
            //   - false: Document không tồn tại
            if (!doc.exists) {
                return null;
            }

            return new User({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả người dùng
     * @param {Object} filters - Bộ lọc (role, limit, etc.)
     * @returns {Promise<Array<User>>} - Mảng User objects
     */
    // GIẢI THÍCH CÚ PHÁP:
    // static async findAll(filters = {}):
    //   - filters = {}: Tham số mặc định
    //   - Nếu không truyền filters → filters = {}
    //   - Ví dụ: findAll() → filters = {}
    //           findAll({ role: 'teacher' }) → filters = { role: 'teacher' }
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();

            // GIẢI THÍCH CÚ PHÁP:
            // let query = db.collection('users'):
            //   - let: Biến có thể thay đổi (khác với const)
            //   - query: Truy vấn (có thể thêm điều kiện sau)
            let query = db.collection('users');

            // Áp dụng filter theo role nếu có
            // GIẢI THÍCH CÚ PHÁP:
            // if (filters.role): Kiểm tra có filter role không
            //   - filters.role: Lấy thuộc tính "role" từ object filters
            //   - Nếu có → vào if
            if (filters.role) {
                // GIẢI THÍCH CÚ PHÁP:
                // query = query.where('role', '==', filters.role):
                //   - query.where(): Thêm điều kiện lọc
                //   - query = : Gán lại query (cập nhật query)
                //   - Tại sao gán lại?
                //     + Firestore query immutable (không thay đổi)
                //     + .where() trả về query MỚI
                query = query.where('role', '==', filters.role);
            }

            // Áp dụng limit nếu có
            // GIẢI THÍCH CÚ PHÁP:
            // if (filters.limit): Kiểm tra có limit không
            //   - limit: Giới hạn số lượng kết quả
            if (filters.limit) {
                // GIẢI THÍCH CÚ PHÁP:
                // query = query.limit(filters.limit):
                //   - .limit(n): Giới hạn n kết quả
                //   - Ví dụ: limit(10) → Chỉ lấy 10 user đầu tiên
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();

            // GIẢI THÍCH CÚ PHÁP:
            // return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() })):
            //   - snapshot.docs: Mảng các document
            //   - .map(): Method biến đổi mảng
            //   - doc => ...: Arrow function cho mỗi doc
            //   - new User(): Tạo object User từ mỗi doc
            //
            // .map() là gì?
            // - map: "Ánh xạ" (biến đổi từng phần tử)
            // - Nhận: Mảng A
            // - Trả về: Mảng B (cùng độ dài, mỗi phần tử đã biến đổi)
            //
            // Ví dụ:
            // [1, 2, 3].map(x => x * 2) → [2, 4, 6]
            // [doc1, doc2].map(doc => new User(doc)) → [user1, user2]
            return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error finding all users: ${error.message}`);
        }
    }

    /**
     * Tạo người dùng mới (Create in CRUD)
     * @param {Object} userData - Dữ liệu người dùng
     * @returns {Promise<User>} - User object đã tạo
     */
    // GIẢI THÍCH CRUD:
    // CRUD là gì?
    // - C: Create (Tạo mới)
    // - R: Read (Đọc/Lấy dữ liệu)
    // - U: Update (Cập nhật)
    // - D: Delete (Xóa)
    //
    // 4 thao tác cơ bản với dữ liệu
    static async create(userData) {
        try {
            const db = this.getDB();

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await this.findByEmail(userData.email);

            // GIẢI THÍCH CÚ PHÁP:
            // if (existingUser): Kiểm tra user đã tồn tại
            //   - Nếu existingUser = object → true → vào if
            //   - Nếu existingUser = null → false → không vào if
            if (existingUser) {
                // Ném lỗi: Email đã được sử dụng
                throw new Error('Email already in use');
            }

            // Hash password (mã hóa mật khẩu)
            // GIẢI THÍCH CÚ PHÁP:
            // const hashedPassword = await bcrypt.hash(userData.password, 10):
            //   - bcrypt.hash(): Hàm mã hóa
            //   - Tham số 1: Mật khẩu cần mã hóa
            //   - Tham số 2: Salt rounds (độ phức tạp)
            //     + 10: Độ phức tạp trung bình (khuyên dùng)
            //     + Càng cao → càng an toàn → càng chậm
            //
            // Hash là gì?
            // - Hash: Mã hóa một chiều (không thể giải mã ngược lại)
            // - "123456" → "$2a$10$KIX..."
            // - Để kiểm tra: So sánh hash, không giải mã
            //
            // Tại sao hash?
            // - Bảo vệ mật khẩu người dùng
            // - Nếu database bị hack, hacker không đọc được mật khẩu thật
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Check if email is .edu to grant Pro tier automatically
            // GIẢI THÍCH CÚ PHÁP:
            // const subscriptionTier = this.isEduEmail(userData.email) ? 'pro' : 'free':
            //   - this.isEduEmail(): Gọi static method khác
            //   - ? : : Toán tử ternary (điều kiện ngắn gọn)
            //   - điều_kiện ? giá_trị_nếu_true : giá_trị_nếu_false
            //
            // Ternary operator:
            // - if (condition) { return 'pro' } else { return 'free' }
            // - Viết gọn: condition ? 'pro' : 'free'
            const subscriptionTier = this.isEduEmail(userData.email) ? 'pro' : 'free';

            // Tạo object User mới
            // GIẢI THÍCH CÚ PHÁP:
            // const newUser = new User({ ...userData, ... }):
            //   - new User(): Tạo instance mới
            //   - { ...userData, ... }: Spread và override
            //   - ...userData: Rải tất cả thuộc tính từ userData
            //   - password: hashedPassword: Ghi đè password (dùng hash thay vì plain)
            const newUser = new User({
                ...userData,
                password: hashedPassword,
                subscriptionTier: subscriptionTier,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Thêm vào Firestore
            // GIẢI THÍCH CÚ PHÁP:
            // const docRef = await db.collection('users').add({ ... }):
            //   - .add(): Thêm document mới
            //   - { ... }: Object dữ liệu
            //   - docRef: DocumentReference (tham chiếu đến document vừa tạo)
            //   - docRef.id: ID tự động sinh bởi Firestore
            const docRef = await db.collection('users').add({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                avatarUrl: newUser.avatarUrl,
                phone: newUser.phone,
                subscriptionTier: newUser.subscriptionTier,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            });

            // Gán ID cho newUser
            newUser.id = docRef.id;

            // Trả về user đã tạo
            return newUser;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    /**
     * Cập nhật thông tin người dùng (Update in CRUD)
     * @param {string} id - User ID
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Promise<User>} - User object đã cập nhật
     */
    static async update(id, updateData) {
        try {
            const db = this.getDB();

            // GIẢI THÍCH CÚ PHÁP:
            // const userRef = db.collection('users').doc(id):
            //   - .doc(id): Tham chiếu đến document có ID này
            //   - userRef: DocumentReference (chưa lấy dữ liệu)
            const userRef = db.collection('users').doc(id);
            const doc = await userRef.get();

            if (!doc.exists) {
                throw new Error('User not found');
            }

            // Nếu cập nhật password, hash nó
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            // Cập nhật thời gian
            updateData.updatedAt = new Date().toISOString();

            // GIẢI THÍCH CÚ PHÁP:
            // await userRef.update(updateData):
            //   - .update(): Method cập nhật document
            //   - updateData: Object chứa các trường cần cập nhật
            //   - Chỉ cập nhật các trường có trong updateData
            //   - Các trường khác giữ nguyên
            await userRef.update(updateData);

            // Lấy lại user đã cập nhật
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    /**
     * Xóa người dùng (Delete in CRUD)
     * @param {string} id - User ID
     * @returns {Promise<boolean>} - true nếu xóa thành công
     */
    static async delete(id) {
        try {
            const db = this.getDB();

            // GIẢI THÍCH CÚ PHÁP:
            // await db.collection('users').doc(id).delete():
            //   - .delete(): Method xóa document
            //   - Xóa vĩnh viễn, không thể phục hồi
            await db.collection('users').doc(id).delete();

            return true;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // ============================================
    // INSTANCE METHODS: HÀM THUỘC VỀ OBJECT 🎯
    // ============================================

    /**
     * So sánh password
     * @param {string} password - Password cần so sánh
     * @returns {Promise<boolean>} - true nếu password đúng
     */
    // GIẢI THÍCH CÚ PHÁP:
    // async comparePassword(password): Instance method (KHÔNG CÓ static)
    //   - Gọi từ object cụ thể: user.comparePassword('123456')
    //   - this: Đại diện cho object user này
    //   - this.password: Mật khẩu đã hash của user này
    async comparePassword(password) {
        // GIẢI THÍCH CÚ PHÁP:
        // return await bcrypt.compare(password, this.password):
        //   - bcrypt.compare(): So sánh password
        //   - Tham số 1: Mật khẩu plain (người dùng nhập)
        //   - Tham số 2: Mật khẩu hash (trong database)
        //   - Trả về: true nếu khớp, false nếu không khớp
        //
        // Cách hoạt động:
        // - Không giải mã hash
        // - Hash password plain rồi so sánh với hash trong database
        return await bcrypt.compare(password, this.password);
    }

    /**
     * Lưu mã reset password
     * @param {string} code - Mã reset
     * @param {Date} expiresAt - Thời gian hết hạn
     */
    async saveResetCode(code, expiresAt) {
        try {
            // GIẢI THÍCH CÚ PHÁP:
            // const db = User.getDB():
            //   - User.getDB(): Gọi static method từ class
            //   - Trong instance method, dùng: Class.staticMethod()
            const db = User.getDB();

            await db.collection('users').doc(this.id).update({
                resetPasswordCode: code,
                resetPasswordExpires: expiresAt.toISOString()
            });

            // Cập nhật object hiện tại
            this.resetPasswordCode = code;
            this.resetPasswordExpires = expiresAt.toISOString();
        } catch (error) {
            throw new Error(`Error saving reset code: ${error.message}`);
        }
    }

    /**
     * Xóa mã reset password (clear reset code)
     */
    async clearResetCode() {
        try {
            const db = User.getDB();

            await db.collection('users').doc(this.id).update({
                resetPasswordCode: null,
                resetPasswordExpires: null
            });

            this.resetPasswordCode = null;
            this.resetPasswordExpires = null;
        } catch (error) {
            throw new Error(`Error clearing reset code: ${error.message}`);
        }
    }

    /**
     * Check if email is .edu domain
     * @param {string} email - Email to check
     * @returns {boolean} - true if email ends with .edu
     */
    static isEduEmail(email) {
        // GIẢI THÍCH CÚ PHÁP:
        // return email.toLowerCase().endsWith('.edu'):
        //   - email.toLowerCase(): Chuyển email thành chữ thường
        //   - .endsWith('.edu'): Kiểm tra có kết thúc bằng '.edu' không
        //
        // .toLowerCase() là gì?
        // - Chuyển tất cả chữ cái thành chữ thường
        // - "HELLO@GMAIL.COM" → "hello@gmail.com"
        //
        // .endsWith(suffix) là gì?
        // - Kiểm tra chuỗi có kết thúc bằng suffix không
        // - "test@mit.edu".endsWith('.edu') → true
        // - "test@gmail.com".endsWith('.edu') → false
        return email.toLowerCase().endsWith('.edu');
    }

    /**
     * Check if email is educational (.edu or .ac domain)
     * @param {string} email - Email to check
     * @returns {boolean} - true if email is educational domain
     */
    static isEducationalEmail(email) {
        const lowerEmail = email.toLowerCase();

        // GIẢI THÍCH CÚ PHÁP:
        // return ... || ... || ... || ...:
        //   - ||: Toán tử OR (hoặc)
        //   - Nếu MỘT điều kiện true → trả về true
        //   - Nếu TẤT CẢ false → trả về false
        //
        // .includes(substring):
        //   - Kiểm tra chuỗi có chứa substring không
        //   - "test@greenwich.ac.uk".includes('.ac.') → true
        return lowerEmail.endsWith('.edu') || lowerEmail.endsWith('.ac.uk') ||
               lowerEmail.endsWith('.edu.vn') || lowerEmail.includes('.ac.');
    }

    /**
     * Verify user as student by checking email and updating to Pro tier
     * @param {string} userId - User ID
     * @param {string} email - Email to verify
     * @returns {Promise<User>} - Updated user with Pro tier
     */
    static async verifyAsStudent(userId, email) {
        try {
            // Find user by ID
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Check if email matches user's email
            // GIẢI THÍCH CÚ PHÁP:
            // if (user.email !== email):
            //   - !==: Toán tử không bằng (strict inequality)
            //   - Nếu email KHÔNG KHỚP → vào if → ném lỗi
            if (user.email !== email) {
                throw new Error('Email does not match user account');
            }

            // Check if email is educational
            if (!this.isEducationalEmail(email)) {
                throw new Error('Email must be from an educational institution (.edu, .ac, etc.)');
            }

            // Update user to Pro tier
            return await this.upgradeToProTier(userId);
        } catch (error) {
            throw new Error(`Error verifying student: ${error.message}`);
        }
    }

    /**
     * Check if user has Pro tier
     * @returns {boolean} - true if user is Pro
     */
    isPro() {
        // GIẢI THÍCH CÚ PHÁP:
        // return this.subscriptionTier === 'pro':
        //   - ===: Toán tử bằng (strict equality)
        //   - Trả về true nếu subscriptionTier = 'pro'
        //   - Trả về false nếu khác
        return this.subscriptionTier === 'pro';
    }

    /**
     * Upgrade user to Pro tier
     * @param {string} id - User ID
     * @returns {Promise<User>} - Updated user
     */
    static async upgradeToProTier(id) {
        try {
            return await this.update(id, { subscriptionTier: 'pro' });
        } catch (error) {
            throw new Error(`Error upgrading to Pro tier: ${error.message}`);
        }
    }

    /**
     * Downgrade user to Free tier
     * @param {string} id - User ID
     * @returns {Promise<User>} - Updated user
     */
    static async downgradeToFreeTier(id) {
        try {
            return await this.update(id, { subscriptionTier: 'free' });
        } catch (error) {
            throw new Error(`Error downgrading to Free tier: ${error.message}`);
        }
    }

    /**
     * Chuyển đổi thành object đơn giản (loại bỏ password)
     * @returns {Object} - User object không có password
     */
    toJSON() {
        // GIẢI THÍCH CÚ PHÁP:
        // const obj = { ...this }:
        //   - { ...this }: Spread object this (copy tất cả thuộc tính)
        //   - obj: Object mới (bản sao)
        const obj = { ...this };

        // GIẢI THÍCH CÚ PHÁP:
        // delete obj.password:
        //   - delete: Từ khóa xóa thuộc tính
        //   - obj.password: Thuộc tính cần xóa
        //
        // Tại sao xóa?
        // - Khi trả về user cho frontend
        // - Không nên gửi password (nguy hiểm)
        // - Xóa các thông tin nhạy cảm
        delete obj.password;
        delete obj.resetPasswordCode;
        delete obj.resetPasswordExpires;

        return obj;
    }

    /**
     * Batch get users by IDs (fixes N+1 query problem)
     * @param {Array<string>} userIds - Array of user IDs
     * @returns {Promise<Array<Object>>} - Array of sanitized user objects
     */
    // GIẢI THÍCH N+1 PROBLEM:
    // N+1 Query Problem là gì?
    // - Có N user, muốn lấy thông tin tất cả
    // - Cách SAI: Gọi findById() N lần (N query)
    // - Cách ĐÚNG: Gọi 1 lần lấy tất cả (1 query)
    //
    // Ví dụ:
    // - SAI: for (id of [1,2,3]) { await findById(id) } → 3 query
    // - ĐÚNG: findByIds([1,2,3]) → 1 query
    static async findByIds(userIds) {
        try {
            if (!userIds || userIds.length === 0) return [];

            const db = this.getDB();

            // GIẢI THÍCH CÚ PHÁP:
            // const uniqueIds = [...new Set(userIds)]:
            //   - new Set(userIds): Tạo Set từ mảng (loại bỏ trùng lặp)
            //   - [...]: Spread Set thành mảng
            //
            // Set là gì?
            // - Set: Tập hợp (không chứa phần tử trùng lặp)
            // - [1, 2, 2, 3] → Set {1, 2, 3} → [1, 2, 3]
            const uniqueIds = [...new Set(userIds)]; // Remove duplicates

            // Firestore 'in' query limit is 10
            // GIẢI THÍCH:
            // Firestore giới hạn: Mỗi query 'in' chỉ tối đa 10 giá trị
            // Nếu có >10 IDs → Chia thành nhiều chunk (mảng con)
            const chunkSize = 10;
            const chunks = [];

            // GIẢI THÍCH CÚ PHÁP:
            // for (let i = 0; i < uniqueIds.length; i += chunkSize):
            //   - let i = 0: Biến đếm bắt đầu từ 0
            //   - i < uniqueIds.length: Điều kiện lặp
            //   - i += chunkSize: Tăng i thêm chunkSize mỗi vòng
            //
            // Ví dụ:
            // uniqueIds.length = 25, chunkSize = 10
            // Vòng 1: i = 0
            // Vòng 2: i = 10
            // Vòng 3: i = 20
            // Vòng 4: i = 30 (dừng vì 30 >= 25)
            for (let i = 0; i < uniqueIds.length; i += chunkSize) {
                // GIẢI THÍCH CÚ PHÁP:
                // uniqueIds.slice(i, i + chunkSize):
                //   - .slice(start, end): Cắt mảng từ start đến end
                //   - i: Vị trí bắt đầu
                //   - i + chunkSize: Vị trí kết thúc
                //
                // Ví dụ:
                // [1,2,3,4,5,6,7,8,9,10,11].slice(0, 10) → [1,2,3,4,5,6,7,8,9,10]
                // [1,2,3,4,5,6,7,8,9,10,11].slice(10, 20) → [11]
                chunks.push(uniqueIds.slice(i, i + chunkSize));
            }

            // Fetch all chunks in parallel
            // GIẢI THÍCH CÚ PHÁP:
            // const promises = chunks.map(chunk => ...):
            //   - .map(): Biến đổi mỗi chunk thành promise
            //   - promise: Lời hứa (query chưa xong)
            const promises = chunks.map(chunk =>
                db.collection('users')
                    // GIẢI THÍCH CÚ PHÁP:
                    // .where(FieldPath.documentId(), 'in', chunk):
                    //   - FieldPath.documentId(): Trường ID của document
                    //   - 'in': Toán tử "trong" (SQL: WHERE id IN (...))
                    //   - chunk: Mảng ID cần tìm
                    .where(require('firebase-admin').firestore.FieldPath.documentId(), 'in', chunk)
                    .get()
            );

            // GIẢI THÍCH CÚ PHÁP:
            // const snapshots = await Promise.all(promises):
            //   - Promise.all(promises): Chờ TẤT CẢ promise hoàn thành
            //   - Chạy song song (parallel), không chờ từng cái
            //
            // Ví dụ:
            // Promise 1: 2 giây
            // Promise 2: 3 giây
            // Promise 3: 1 giây
            // - Tuần tự: 2 + 3 + 1 = 6 giây
            // - Song song: max(2, 3, 1) = 3 giây
            const snapshots = await Promise.all(promises);

            // Flatten results and sanitize
            // GIẢI THÍCH CÚ PHÁP:
            // const users = snapshots.flatMap(...):
            //   - .flatMap(): Map và làm phẳng mảng
            //   - "Làm phẳng": [[1,2], [3,4]] → [1,2,3,4]
            //
            // Ví dụ:
            // snapshots = [snapshot1, snapshot2]
            // snapshot1.docs = [doc1, doc2]
            // snapshot2.docs = [doc3]
            // flatMap → [user1, user2, user3] (mảng phẳng)
            const users = snapshots.flatMap(snapshot =>
                snapshot.docs.map(doc => {
                    const user = new User({ id: doc.id, ...doc.data() });
                    return user.toJSON(); // Automatically removes sensitive fields
                })
            );

            return users;
        } catch (error) {
            throw new Error(`Error finding users by IDs: ${error.message}`);
        }
    }

    /**
     * Sanitize user data (remove password and sensitive fields)
     * Static method for sanitizing plain objects
     * @param {Object} userData - User data object
     * @returns {Object} - Sanitized user data
     */
    static sanitize(userData) {
        if (!userData) return null;

        // GIẢI THÍCH CÚ PHÁP:
        // const { password, resetPasswordCode, resetPasswordExpires, ...sanitized } = userData:
        //   - Destructuring với rest operator (...)
        //   - password, resetPasswordCode, resetPasswordExpires: Bỏ đi (không dùng)
        //   - ...sanitized: Phần còn lại (rest)
        //
        // Ví dụ:
        // userData = { name: "An", email: "an@gmail.com", password: "123" }
        // { password, ...sanitized } → password = "123", sanitized = { name: "An", email: "an@gmail.com" }
        const { password, resetPasswordCode, resetPasswordExpires, ...sanitized } = userData;
        return sanitized;
    }

    /**
     * Get public profile (sanitized user data)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Sanitized user object
     */
    static async getPublicProfile(userId) {
        try {
            const user = await this.findById(userId);
            if (!user) return null;
            return user.toJSON();
        } catch (error) {
            throw new Error(`Error getting public profile: ${error.message}`);
        }
    }

    /**
     * Check if user is admin
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} - true if user is admin
     */
    static async isAdmin(userId) {
        try {
            const user = await this.findById(userId);
            // GIẢI THÍCH CÚ PHÁP:
            // return user && user.role === 'admin':
            //   - &&: Toán tử AND (và)
            //   - user: Kiểm tra user có tồn tại không
            //   - user.role === 'admin': Kiểm tra role có phải admin không
            //   - Cả hai phải true → trả về true
            return user && user.role === 'admin';
        } catch (error) {
            throw new Error(`Error checking admin status: ${error.message}`);
        }
    }

    /**
     * Check if user is teacher
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} - true if user is teacher or admin
     */
    static async isTeacher(userId) {
        try {
            const user = await this.findById(userId);

            // GIẢI THÍCH CÚ PHÁP:
            // return user && (user.role === 'teacher' || user.role === 'admin'):
            //   - &&: AND
            //   - ||: OR
            //   - (): Nhóm điều kiện
            //   - Kiểm tra: user tồn tại VÀ (role = teacher HOẶC role = admin)
            return user && (user.role === 'teacher' || user.role === 'admin');
        } catch (error) {
            throw new Error(`Error checking teacher status: ${error.message}`);
        }
    }
}

// ============================================
// XUẤT MODULE 📤
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// module.exports = User:
//   - module.exports: Xuất code ra ngoài
//   - = User: Xuất class User
//
// Sau khi export, file khác có thể dùng:
// const User = require('./models/User');
// const user = await User.findByEmail('test@gmail.com');
module.exports = User;

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là USER MODEL (mô hình người dùng):
//
// 1. Định nghĩa Class User:
//    - Constructor: Khởi tạo object user
//    - Properties: id, name, email, password, role, subscriptionTier, v.v.
//
// 2. Static Methods (Hàm của class):
//    - getDB(): Lấy Firestore database
//    - findByEmail(email): Tìm user theo email
//    - findById(id): Tìm user theo ID
//    - findAll(filters): Lấy tất cả user
//    - create(userData): Tạo user mới (CRUD - Create)
//    - update(id, updateData): Cập nhật user (CRUD - Update)
//    - delete(id): Xóa user (CRUD - Delete)
//    - findByIds(userIds): Lấy nhiều user cùng lúc (batch)
//    - isEduEmail(email): Kiểm tra email .edu
//    - isEducationalEmail(email): Kiểm tra email giáo dục
//    - verifyAsStudent(userId, email): Xác minh sinh viên
//    - upgradeToProTier(id): Nâng cấp lên Pro
//    - downgradeToFreeTier(id): Hạ xuống Free
//    - sanitize(userData): Loại bỏ thông tin nhạy cảm
//    - getPublicProfile(userId): Lấy thông tin công khai
//    - isAdmin(userId): Kiểm tra admin
//    - isTeacher(userId): Kiểm tra teacher
//
// 3. Instance Methods (Hàm của object):
//    - comparePassword(password): So sánh mật khẩu
//    - saveResetCode(code, expiresAt): Lưu mã reset
//    - clearResetCode(): Xóa mã reset
//    - isPro(): Kiểm tra gói Pro
//    - toJSON(): Chuyển thành JSON (loại bỏ password)
//
// 4. Các khái niệm quan trọng:
//    - Class: Bản thiết kế object
//    - Constructor: Hàm khởi tạo
//    - Static method: Hàm của class (User.findById())
//    - Instance method: Hàm của object (user.comparePassword())
//    - CRUD: Create, Read, Update, Delete
//    - Hash: Mã hóa mật khẩu một chiều
//    - N+1 Problem: Vấn đề query nhiều lần
//    - Batch query: Query hàng loạt (findByIds)
//    - Sanitize: Loại bỏ dữ liệu nhạy cảm
//
// CÁCH SỬ DỤNG:
// const User = require('./models/User');
//
// // Static method (gọi từ class)
// const user = await User.findByEmail('test@gmail.com');
// const newUser = await User.create({ name: 'An', email: 'an@gmail.com', password: '123456' });
//
// // Instance method (gọi từ object)
// const isPasswordCorrect = await user.comparePassword('123456');
// const userJSON = user.toJSON(); // { id, name, email, role, ... } (không có password)
//
// VÍ DỤ THỰC TẾ:
// 1. User đăng ký:
//    - authController gọi User.create({ name, email, password })
//    - User.create() hash password, lưu vào Firestore
//    - Trả về user object
//
// 2. User đăng nhập:
//    - authController gọi User.findByEmail(email)
//    - Gọi user.comparePassword(password)
//    - Nếu đúng → Tạo JWT token
//
// 3. Lấy thông tin user:
//    - Controller gọi User.findById(userId)
//    - Gọi user.toJSON() để loại bỏ password
//    - Trả về cho frontend
//
// KEYWORD MỚI:
// - Model: Mô hình dữ liệu
// - Class: Lớp, bản thiết kế
// - Constructor: Hàm khởi tạo
// - Static method: Hàm của class
// - Instance method: Hàm của object
// - this: Đại diện cho object hiện tại
// - CRUD: Create, Read, Update, Delete
// - Hash: Mã hóa mật khẩu
// - Bcrypt: Thư viện mã hóa
// - Ternary operator (? :): Điều kiện ngắn gọn
// - Rest operator (...): Lấy phần còn lại
// - Set: Tập hợp không trùng lặp
// - Promise.all(): Chờ tất cả promise
// - flatMap(): Map và làm phẳng mảng
// - N+1 Problem: Vấn đề query nhiều lần
// - Sanitize: Làm sạch dữ liệu nhạy cảm
