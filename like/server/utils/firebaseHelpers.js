// ============================================
// FILE NÀY LÀM GÌ? 🤔
// ============================================
// File này giống như "HỘP CÔNG CỤ FIREBASE" chứa các hàm tiện ích!
// Nó cung cấp:
// - Các class lỗi tùy chỉnh (NotFoundError, ValidationError)
// - Hàm lấy document hoặc ném lỗi 404
// - Hàm lấy nhiều document cùng lúc (batch)
// - Hàm chia mảng thành các mảng con (chunk)
//
// Giống như:
// - Hộp công cụ của thợ sửa xe: có đủ loại công cụ để dùng nhiều lần

// ============================================
// GIẢI THÍCH KHÁI NIỆM HELPER/UTILITY 🔧
// ============================================
// HELPER/UTILITY là gì?
// - Helper: "Người giúp đỡ"
// - Utility: "Tiện ích"
// - Là các hàm nhỏ, tái sử dụng được
// - Giải quyết các vấn đề chung
//
// Tại sao cần Helper?
// - Tránh viết code lặp lại
// - Code gọn gàng, dễ bảo trì
// - Tái sử dụng ở nhiều nơi
//
// Ví dụ:
// - Thay vì viết code lấy document ở 10 controller khác nhau
// - Viết 1 hàm getDocOrThrow() ở helper
// - 10 controller đều dùng hàm này

// ============================================
// GIẢI THÍCH KHÁI NIỆM CUSTOM ERROR (LỖI TÙY CHỈNH) ⚠️
// ============================================
// CUSTOM ERROR là gì?
// - Lỗi tự tạo, không phải lỗi built-in của JavaScript
// - Kế thừa (extends) từ class Error
// - Có thể thêm thuộc tính riêng (statusCode, name)
//
// Tại sao cần Custom Error?
// - Phân biệt loại lỗi rõ ràng
// - Gắn mã HTTP status code (404, 400, 500)
// - Dễ xử lý lỗi theo từng loại
//
// Các lỗi HTTP phổ biến:
// - 400: Bad Request (Yêu cầu sai)
// - 401: Unauthorized (Chưa đăng nhập)
// - 403: Forbidden (Không có quyền)
// - 404: Not Found (Không tìm thấy)
// - 500: Internal Server Error (Lỗi server)

// ============================================
// BƯỚC 1: LẤY CÔNG CỤ CẦN THIẾT 🛠️
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// const { getFirestore, FieldPath }: Destructuring
// require('firebase-admin/firestore'): Mượn module Firestore
//
// getFirestore: Hàm lấy database
// FieldPath: Class để tham chiếu đến trường đặc biệt (như document ID)
const { getFirestore, FieldPath } = require('firebase-admin/firestore');

// ============================================
// BƯỚC 2: TẠO CLASS LỖI "NOT FOUND" (404) 🔍
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// class NotFoundError extends Error:
//   - class: Từ khóa định nghĩa class
//   - NotFoundError: Tên class (lỗi không tìm thấy)
//   - extends Error: Kế thừa từ class Error
//
// extends là gì?
// - "Kế thừa" (inheritance)
// - Class con nhận tất cả thuộc tính và method của class cha
// - Có thể thêm thuộc tính và method riêng
//
// Ví dụ:
// - Class Error: Class cha (built-in)
// - Class NotFoundError: Class con (tự tạo)
// - NotFoundError có tất cả tính năng của Error + thêm statusCode
class NotFoundError extends Error {
    // GIẢI THÍCH CÚ PHÁP:
    // constructor(message): Hàm khởi tạo
    //   - message: Thông điệp lỗi
    constructor(message) {
        // GIẢI THÍCH CÚ PHÁP:
        // super(message): Gọi constructor của class cha (Error)
        //   - super: Từ khóa tham chiếu đến class cha
        //   - (message): Truyền message cho Error constructor
        //
        // Tại sao cần super()?
        // - Phải gọi constructor cha trước khi dùng "this"
        // - Khởi tạo các thuộc tính của Error (message, stack)
        super(message);

        // GIẢI THÍCH CÚ PHÁP:
        // this.name = 'NotFoundError':
        //   - this.name: Thuộc tính "tên" của lỗi
        //   - 'NotFoundError': Giá trị tên lỗi
        //
        // Tại sao đặt name?
        // - Để nhận biết loại lỗi khi debug
        // - Khi in lỗi ra console: "NotFoundError: User not found"
        this.name = 'NotFoundError';

        // GIẢI THÍCH CÚ PHÁP:
        // this.statusCode = 404:
        //   - this.statusCode: Thuộc tính tự thêm
        //   - 404: Mã HTTP "Not Found"
        //
        // Tại sao thêm statusCode?
        // - Để controller biết trả về status code nào
        // - Ví dụ: res.status(error.statusCode).json({ error: error.message })
        this.statusCode = 404;
    }
}

// ============================================
// BƯỚC 3: TẠO CLASS LỖI "VALIDATION" (400) ✅
// ============================================

// GIẢI THÍCH:
// ValidationError: Lỗi xác thực dữ liệu
// - Khi dữ liệu không hợp lệ (email sai format, thiếu trường required)
// - HTTP status code 400 (Bad Request)
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        // GIẢI THÍCH:
        // 400 = Bad Request
        // - Yêu cầu sai do lỗi từ phía client
        // - Dữ liệu không hợp lệ
        this.statusCode = 400;
    }
}

// ============================================
// BƯỚC 4: HÀM LẤY DOCUMENT HOẶC NÉM LỖI 404 📄
// ============================================

/**
 * Get document or throw 404 error
 */
// GIẢI THÍCH CÚ PHÁP:
// async function getDocOrThrow(collection, docId, errorMessage):
//   - async function: Hàm bất đồng bộ
//   - getDocOrThrow: Tên hàm (lấy doc hoặc ném lỗi)
//   - collection: Tên collection
//   - docId: ID của document
//   - errorMessage: Thông điệp lỗi tùy chỉnh (optional)
//
// Mục đích:
// - Lấy document từ Firestore
// - Nếu không tìm thấy → Ném lỗi NotFoundError
// - Controller không cần kiểm tra doc.exists nữa
//
// Ví dụ sử dụng:
// const user = await getDocOrThrow('users', userId, 'User not found');
// → Nếu user không tồn tại → Tự động ném lỗi 404
async function getDocOrThrow(collection, docId, errorMessage) {
    // Lấy Firestore database
    const db = getFirestore();

    // GIẢI THÍCH CÚ PHÁP:
    // const doc = await db.collection(collection).doc(docId).get():
    //   - db.collection(collection): Lấy collection
    //   - .doc(docId): Tham chiếu đến document
    //   - .get(): Lấy dữ liệu
    //   - await: Đợi kết quả
    const doc = await db.collection(collection).doc(docId).get();

    // GIẢI THÍCH CÚ PHÁP:
    // if (!doc.exists): Nếu document không tồn tại
    if (!doc.exists) {
        // GIẢI THÍCH CÚ PHÁP:
        // throw new NotFoundError(...):
        //   - throw: Ném lỗi
        //   - new NotFoundError(): Tạo instance lỗi NotFoundError
        //   - errorMessage || `${collection} not found`: OR operator
        //     + Nếu có errorMessage → dùng errorMessage
        //     + Nếu không → dùng `${collection} not found`
        //
        // Template String:
        // `${collection} not found` → "users not found" (nếu collection = 'users')
        throw new NotFoundError(errorMessage || `${collection} not found`);
    }

    // GIẢI THÍCH CÚ PHÁP:
    // return { id: doc.id, ...doc.data() }:
    //   - { }: Tạo object mới
    //   - id: doc.id: Thêm thuộc tính id
    //   - ...doc.data(): Spread tất cả dữ liệu của document
    //
    // Ví dụ:
    // doc.id = "abc123"
    // doc.data() = { name: "An", email: "an@gmail.com" }
    // → { id: "abc123", name: "An", email: "an@gmail.com" }
    return { id: doc.id, ...doc.data() };
}

// ============================================
// BƯỚC 5: HÀM LẤY NHIỀU DOCUMENT CÙNG LÚC (BATCH) 📦
// ============================================

/**
 * Batch get documents by IDs
 */
// GIẢI THÍCH CÚ PHÁP:
// async function batchGetByIds(collection, ids):
//   - batchGetByIds: Lấy hàng loạt theo IDs
//   - collection: Tên collection
//   - ids: Mảng các ID cần lấy
//
// Tại sao cần batch?
// - Lấy nhiều document trong 1 lần query
// - Tránh N+1 problem (query nhiều lần)
// - Hiệu năng tốt hơn
//
// Ví dụ:
// const users = await batchGetByIds('users', ['id1', 'id2', 'id3']);
// → Lấy 3 users cùng lúc (không phải 3 query riêng)
async function batchGetByIds(collection, ids) {
    // GIẢI THÍCH CÚ PHÁP:
    // if (!ids || ids.length === 0) return []:
    //   - !ids: Kiểm tra ids có tồn tại không
    //   - ||: Toán tử OR
    //   - ids.length === 0: Kiểm tra mảng rỗng
    //   - return []: Trả về mảng rỗng
    //
    // Edge case handling:
    // - Nếu không có IDs → Không cần query → Trả về []
    if (!ids || ids.length === 0) return [];

    const db = getFirestore();

    // GIẢI THÍCH CÚ PHÁP:
    // const chunks = chunkArray(ids, 10):
    //   - chunkArray(): Hàm chia mảng (định nghĩa ở dưới)
    //   - ids: Mảng cần chia
    //   - 10: Kích thước mỗi chunk
    //
    // Tại sao chia thành chunk?
    // - Firestore giới hạn: Query 'in' tối đa 10 giá trị
    // - Nếu có 25 IDs → Chia thành 3 chunk: [10, 10, 5]
    // - Query 3 lần song song
    const chunks = chunkArray(ids, 10); // Firestore 'in' limit

    // GIẢI THÍCH CÚ PHÁP:
    // const promises = chunks.map(chunk => ...):
    //   - chunks.map(): Biến đổi mỗi chunk thành promise
    //   - chunk => ...: Arrow function cho mỗi chunk
    //
    // Mỗi chunk tạo 1 query promise:
    const promises = chunks.map(chunk =>
        db.collection(collection)
            // GIẢI THÍCH CÚ PHÁP:
            // .where(FieldPath.documentId(), 'in', chunk):
            //   - FieldPath.documentId(): Trường ID của document
            //   - 'in': Toán tử "trong" (SQL: IN)
            //   - chunk: Mảng ID cần tìm
            //
            // Query này tìm tất cả document có ID trong chunk
            .where(FieldPath.documentId(), 'in', chunk)
            .get()
    );

    // GIẢI THÍCH CÚ PHÁP:
    // const snapshots = await Promise.all(promises):
    //   - Promise.all(): Chờ TẤT CẢ promise hoàn thành
    //   - Chạy song song (parallel)
    //
    // Ví dụ:
    // - Chunk 1: 2 giây
    // - Chunk 2: 1 giây
    // - Chunk 3: 3 giây
    // - Tuần tự: 2 + 1 + 3 = 6 giây
    // - Song song: max(2, 1, 3) = 3 giây
    const snapshots = await Promise.all(promises);

    // GIẢI THÍCH CÚ PHÁP:
    // return snapshots.flatMap(snap => snap.docs.map(doc => ...)):
    //   - snapshots.flatMap(): Map và làm phẳng
    //   - snap => ...: Arrow function cho mỗi snapshot
    //   - snap.docs.map(): Map mỗi document
    //   - { id: doc.id, ...doc.data() }: Tạo object kết quả
    //
    // Quá trình:
    // 1. snapshots = [snapshot1, snapshot2, snapshot3]
    // 2. Map mỗi snapshot → mảng docs
    // 3. FlatMap → Gộp tất cả docs thành 1 mảng phẳng
    //
    // Ví dụ:
    // snapshot1.docs = [doc1, doc2]
    // snapshot2.docs = [doc3, doc4]
    // snapshot3.docs = [doc5]
    // → flatMap → [doc1, doc2, doc3, doc4, doc5]
    return snapshots.flatMap(snap =>
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    );
}

// ============================================
// BƯỚC 6: HÀM CHIA MẢNG THÀNH CÁC CHUNK ✂️
// ============================================

/**
 * Split array into chunks
 */
// GIẢI THÍCH CÚ PHÁP:
// function chunkArray(array, size):
//   - chunkArray: Hàm chia mảng
//   - array: Mảng cần chia
//   - size: Kích thước mỗi chunk
//
// Mục đích:
// - Chia mảng lớn thành các mảng con
// - Hữu ích khi có giới hạn (Firestore 'in' limit = 10)
//
// Ví dụ:
// chunkArray([1,2,3,4,5,6,7,8,9,10,11], 5)
// → [[1,2,3,4,5], [6,7,8,9,10], [11]]
function chunkArray(array, size) {
    // GIẢI THÍCH CÚ PHÁP:
    // const chunks = []:
    //   - const chunks: Tạo biến mảng rỗng
    //   - []: Mảng để chứa các chunk
    const chunks = [];

    // GIẢI THÍCH CÚ PHÁP:
    // for (let i = 0; i < array.length; i += size):
    //   - let i = 0: Biến đếm bắt đầu từ 0
    //   - i < array.length: Điều kiện lặp
    //   - i += size: Tăng i thêm size mỗi vòng
    //
    // Cách hoạt động:
    // - size = 5, array.length = 11
    // - Vòng 1: i = 0 (lấy phần tử 0-4)
    // - Vòng 2: i = 5 (lấy phần tử 5-9)
    // - Vòng 3: i = 10 (lấy phần tử 10)
    // - Vòng 4: i = 15 (dừng vì 15 >= 11)
    for (let i = 0; i < array.length; i += size) {
        // GIẢI THÍCH CÚ PHÁP:
        // chunks.push(array.slice(i, i + size)):
        //   - chunks.push(): Thêm phần tử vào mảng chunks
        //   - array.slice(i, i + size): Cắt mảng từ i đến i+size
        //
        // .slice(start, end):
        // - Cắt mảng từ start đến end (không bao gồm end)
        // - Không thay đổi mảng gốc
        //
        // Ví dụ:
        // [1,2,3,4,5,6,7,8,9,10,11].slice(0, 5) → [1,2,3,4,5]
        // [1,2,3,4,5,6,7,8,9,10,11].slice(5, 10) → [6,7,8,9,10]
        // [1,2,3,4,5,6,7,8,9,10,11].slice(10, 15) → [11] (chỉ còn 1 phần tử)
        chunks.push(array.slice(i, i + size));
    }

    // GIẢI THÍCH CÚ PHÁP:
    // return chunks:
    //   - Trả về mảng chứa các chunk
    return chunks;
}

// ============================================
// BƯỚC 7: XUẤT CÁC HÀM VÀ CLASS 📤
// ============================================

// GIẢI THÍCH CÚ PHÁP:
// module.exports = { ... }:
//   - module.exports: Xuất nhiều thứ cùng lúc
//   - { ... }: Object chứa các export
//
// Export gì?
// - NotFoundError: Class lỗi 404
// - ValidationError: Class lỗi 400
// - getDocOrThrow: Hàm lấy doc hoặc ném lỗi
// - batchGetByIds: Hàm lấy nhiều doc
// - chunkArray: Hàm chia mảng
//
// Cách dùng:
// const { getDocOrThrow, batchGetByIds } = require('./firebaseHelpers');
// const user = await getDocOrThrow('users', userId);
module.exports = {
    NotFoundError,
    ValidationError,
    getDocOrThrow,
    batchGetByIds,
    chunkArray
};

// ============================================
// TÓM TẮT: FILE NÀY LÀM GÌ? 📚
// ============================================
// File này là FIREBASE HELPERS (tiện ích Firebase):
//
// 1. Định nghĩa 2 Custom Error Classes:
//    a) NotFoundError (404):
//       - Kế thừa từ Error
//       - statusCode = 404
//       - Dùng khi không tìm thấy document
//
//    b) ValidationError (400):
//       - Kế thừa từ Error
//       - statusCode = 400
//       - Dùng khi dữ liệu không hợp lệ
//
// 2. Xuất 3 Helper Functions:
//    a) getDocOrThrow(collection, docId, errorMessage):
//       - Lấy document từ Firestore
//       - Nếu không tìm thấy → Ném NotFoundError
//       - Đơn giản hóa việc lấy document trong controller
//
//    b) batchGetByIds(collection, ids):
//       - Lấy nhiều document cùng lúc
//       - Xử lý Firestore 'in' limit (10)
//       - Chia thành chunks và query song song
//       - Tránh N+1 problem
//
//    c) chunkArray(array, size):
//       - Chia mảng thành các mảng con
//       - Hữu ích cho batch operations
//
// CÁCH SỬ DỤNG:
// const { getDocOrThrow, batchGetByIds, NotFoundError } = require('./utils/firebaseHelpers');
//
// // Lấy document hoặc ném lỗi 404
// const user = await getDocOrThrow('users', userId, 'User not found');
//
// // Lấy nhiều users cùng lúc
// const users = await batchGetByIds('users', [' id1', 'id2', 'id3']);
//
// // Xử lý lỗi trong controller
// try {
//   const user = await getDocOrThrow('users', userId);
// } catch (error) {
//   if (error instanceof NotFoundError) {
//     res.status(error.statusCode).json({ error: error.message });
//   }
// }
//
// VÍ DỤ THỰC TẾ:
// 1. Controller cần lấy user:
//    - Trước: const doc = await db.collection('users').doc(id).get();
//             if (!doc.exists) throw new Error('Not found');
//    - Sau: const user = await getDocOrThrow('users', id);
//           → Ngắn gọn hơn, lỗi rõ ràng hơn
//
// 2. Controller cần lấy nhiều users:
//    - Trước: for (id of ids) { await findById(id) } → N query
//    - Sau: await batchGetByIds('users', ids) → 1-3 query (tùy số lượng)
//
// LỢI ÍCH:
// - Code gọn gàng, tái sử dụng
// - Lỗi rõ ràng với status code
// - Hiệu năng tốt hơn (batch query)
// - Xử lý Firestore limitations
// - Dễ test và maintain
//
// KEYWORD MỚI:
// - Helper/Utility: Hàm tiện ích tái sử dụng
// - Custom Error: Lỗi tùy chỉnh
// - extends: Kế thừa class
// - super(): Gọi constructor cha
// - throw: Ném lỗi
// - instanceof: Kiểm tra instance của class
// - Batch operation: Thao tác hàng loạt
// - Chunk: Mảng con
// - flatMap(): Map và làm phẳng mảng
// - Promise.all(): Chờ tất cả promise song song
// - Edge case: Trường hợp đặc biệt
// - N+1 Problem: Query nhiều lần không cần thiết
