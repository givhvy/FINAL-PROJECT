// ============================================================================
// 📚 FILE NÀY LÀM GÌ? - subscriptionController.js
// ============================================================================
// File này là SUBSCRIPTION CONTROLLER - điều khiển GÓI ĐĂNG KÝ (pricing plans)
//
// Giống như quản lý BẢ NG GIÁ GÓI DỊCH VỤ, file này:
// ✅ Xem danh sách gói subscription (getSubscriptionPlans)
// ✅ Tạo gói mới (createSubscriptionPlan) - admin only
// ✅ Sửa gói (updateSubscriptionPlan) - admin only
// ✅ Xóa gói (deleteSubscriptionPlan) - admin only
//
// 🎯 VÍ DỤ THỰC TẾ - BẢNG GIÁ:
// ┌─────────────────────────────────────────────────────────┐
// │ CHỌN GÓI PHÙHỢP VỚI BẠN                               │
// ├──────────────┬──────────────┬──────────────────────────┤
// │ FREE         │ PRO          │ ENTERPRISE                │
// ├──────────────┼──────────────┼──────────────────────────┤
// │ 0đ/tháng     │ 199,000đ/th  │ 499,000đ/tháng           │
// │              │ 1,990,000đ/năm│ 4,990,000đ/năm          │
// ├──────────────┼──────────────┼──────────────────────────┤
// │ ✅ 3 khóa học│ ✅ ∞ khóa học│ ✅ ∞ khóa học            │
// │ ❌ Chứng chỉ │ ✅ Chứng chỉ │ ✅ Chứng chỉ             │
// │ ❌ Hỗ trợ    │ ✅ Email support│ ✅ 24/7 support       │
// │              │              │ ✅ Mentor riêng           │
// └──────────────┴──────────────┴──────────────────────────┘
//
// ============================================================================
// FLOW: FRONTEND → ROUTES → CONTROLLER → MODEL → DATABASE
// ============================================================================
//
// VÍ DỤ 1: USER XEM BẢNG GIÁ
// User vào trang pricing:
//   → GET /api/subscriptions?active=true
//    ↓
// Controller: getSubscriptionPlans() → Subscription.findAll()
//    ↓
// Model: Query Firestore WHERE active = true
//    ↓
// Response: [
//   { name: 'FREE', monthly_price: 0, max_courses: 3 },
//   { name: 'PRO', monthly_price: 199000, max_courses: null }
// ]
//
// VÍ DỤ 2: ADMIN TẠO GÓI MỚI
// Admin tạo gói "PREMIUM":
//   → POST /api/subscriptions
//   Body: {
//     name: 'PREMIUM',
//     monthly_price: 299000,
//     annual_price: 2990000,
//     max_courses: null,
//     features: ['Unlimited courses', 'Certificates', 'Priority support']
//   }
//    ↓
// Controller: createSubscriptionPlan() → Subscription.create()
//    ↓
// Database: Lưu vào collection "subscriptions"
//
// ============================================================================
// 📦 IMPORT MODULE
// ============================================================================

const Subscription = require('../models/Subscription');
// 📌 Import Subscription Model

// ============================================================================
// FUNCTION 1: LẤY DANH SÁCH GÓI SUBSCRIPTION (GET PLANS)
// ============================================================================
// Lấy tất cả các gói subscription từ Firestore
exports.getSubscriptionPlans = async (req, res) => {
// 📌 Lấy danh sách pricing plans
// - Có filters: active (chỉ lấy gói đang hoạt động), limit (số lượng)
// - PUBLIC function - ai cũng xem được bảng giá

    try {
        const filters = {};
        // 📌 Object để chứa filters

        if (req.query.active !== undefined) {
        // 📌 Filter theo trạng thái active
        // - URL: /api/subscriptions?active=true
        // - req.query.active = 'true' (string)

            filters.active = req.query.active === 'true';
            // 📌 Convert string → boolean
            // - '=== 'true'' = so sánh chặt chẽ với string 'true'
            // - 'true' === 'true' → true (boolean)
            // - 'false' === 'true' → false (boolean)
            // - Kết quả: filters.active = true hoặc false
            //
            // 🎯 TẠI SAO PHỨC TẠP VẬY?
            // - Query params luôn là STRING, không phải boolean
            // - Phải manually convert 'true'/'false' → true/false
        }

        if (req.query.limit) {
        // 📌 Giới hạn số lượng kết quả
            filters.limit = parseInt(req.query.limit);
            // 📌 Convert string → number
        }

        const plans = await Subscription.findAll(filters);
        // 📌 GỌI MODEL ĐỂ TÌM PLANS! ⭐
        // - Trả về array các Subscription objects

        res.status(200).json(plans.map(p => p.toJSON()));
        // 📌 Transform array of Subscription objects → plain objects
        // - .map(p => p.toJSON()) = với mỗi plan p, gọi p.toJSON()

    } catch (error) {
        console.error("Get Subscription Plans Error:", error);
        res.status(500).json({ success: false, error: 'Failed to retrieve subscription plans.' });
    }
};

// ============================================================================
// FUNCTION 2: TẠO GÓI SUBSCRIPTION MỚI (CREATE PLAN)
// ============================================================================
// Tạo một gói subscription mới (Create in Controller)
exports.createSubscriptionPlan = async (req, res) => {
// 📌 Tạo gói pricing mới - CHỈ ADMIN
//
// 🎯 VÍ DỤ THỰC TẾ:
// Admin muốn thêm gói "PREMIUM" mới:
// - Tên: PREMIUM
// - Giá tháng: 299,000đ
// - Giá năm: 2,990,000đ (giảm 17%)
// - Số khóa học: Không giới hạn
// - Features: ['∞ courses', 'Certificates', 'Priority support', '1-on-1 mentor']

    try {
        const planData = {
            ...req.body,
            // 📌 Spread tất cả fields

            // Support both camelCase and snake_case
            monthlyPrice: req.body.monthlyPrice || req.body.monthly_price,
            monthly_price: req.body.monthly_price || req.body.monthlyPrice,
            // 📌 Giá theo tháng
            // - Ví dụ: 199000 (199,000đ)

            annualPrice: req.body.annualPrice || req.body.annual_price,
            annual_price: req.body.annual_price || req.body.annualPrice,
            // 📌 Giá theo năm
            // - Thường rẻ hơn 12 tháng để khuyến khích đăng ký dài hạn
            // - Ví dụ: monthly = 199k → annual = 1,990k (thay vì 2,388k)

            maxCourses: req.body.maxCourses || req.body.max_courses,
            max_courses: req.body.max_courses || req.body.maxCourses,
            // 📌 Số khóa học tối đa
            // - FREE: 3
            // - PRO: null (unlimited)

            isPopular: req.body.isPopular || req.body.is_popular,
            is_popular: req.body.is_popular || req.body.isPopular
            // 📌 Đánh dấu gói "Phổ biến nhất" để highlight trong UI
            // - Thường là gói PRO
        };

        // Validate data before saving
        if (!planData.name ||
            (planData.monthlyPrice === undefined && planData.monthly_price === undefined) ||
            (planData.annualPrice === undefined && planData.annual_price === undefined) ||
            !planData.features) {
        // 📌 Validation phức tạp - kiểm tra tất cả fields bắt buộc:
        // - !planData.name = phải có tên gói
        // - monthlyPrice === undefined && monthly_price === undefined = phải có giá tháng (hoặc 1 trong 2 naming)
        // - annualPrice phải có
        // - !planData.features = phải có danh sách features

            return res.status(400).json({
                success: false,
                error: 'Missing required fields for subscription plan.'
            });
        }

        const newPlan = await Subscription.create(planData);
        // 📌 GỌI MODEL ĐỂ TẠO PLAN! ⭐
        // - Lưu vào Firestore collection "subscriptions"

        res.status(201).json({
            success: true,
            data: newPlan.toJSON()
        });

    } catch (error) {
        console.error("Create Subscription Plan Error:", error);
        res.status(400).json({ success: false, error: 'Failed to create subscription plan.' });
    }
};

// ============================================================================
// FUNCTION 3: CẬP NHẬT GÓI SUBSCRIPTION (UPDATE PLAN)
// ============================================================================
// Cập nhật một gói subscription (Update in Controller)
exports.updateSubscriptionPlan = async (req, res) => {
// 📌 Sửa gói subscription - CHỈ ADMIN
//
// 🎯 VÍ DỤ THỰC TẾ:
// Admin muốn tăng giá gói PRO:
// - Từ 199,000đ → 249,000đ
// - PUT /api/subscriptions/plan123
// - Body: { monthly_price: 249000 }

    try {
        const { id } = req.params;
        // 📌 Lấy ID của plan cần update

        const updatedPlan = await Subscription.update(id, req.body);
        // 📌 GỌI MODEL ĐỂ UPDATE! ⭐
        // - req.body chứa fields cần update

        res.status(200).json({
            success: true,
            data: updatedPlan.toJSON()
        });

    } catch (error) {
        console.error("Update Subscription Plan Error:", error);

        if (error.message.includes('not found')) {
        // 📌 Nếu không tìm thấy plan
            res.status(404).json({ success: false, error: 'Subscription plan not found' });

        } else {
            res.status(400).json({ success: false, error: 'Failed to update subscription plan.' });
        }
    }
};

// ============================================================================
// FUNCTION 4: XÓA GÓI SUBSCRIPTION (DELETE PLAN)
// ============================================================================
// Xóa một gói subscription (Delete in Controller)
exports.deleteSubscriptionPlan = async (req, res) => {
// 📌 Xóa gói subscription - CHỈ ADMIN
// - Thường KHÔNG xóa hẳn mà chỉ set active = false
//
// 🎯 VÍ DỤ THỰC TẾ:
// Admin muốn ngừng bán gói "BASIC":
// - DELETE /api/subscriptions/plan123
// - Plan biến mất khỏi bảng giá (nhưng users cũ vẫn dùng được)

    try {
        const { id } = req.params;

        // Check if subscription exists by id its
        const subscription = await Subscription.findById(id);
        // 📌 GỌI MODEL ĐỂ TÌM PLAN TRƯỚC KHI XÓA! ⭐
        // - Kiểm tra có tồn tại không

        if (!subscription) {
            return res.status(404).json({
                success: false,
                error: 'Subscription plan not found'
            });
        }

        await Subscription.delete(id);
        // 📌 GỌI MODEL ĐỂ XÓA! ⭐
        // - Xóa khỏi database

        res.status(200).json({
            success: true,
            message: 'Subscription plan deleted successfully.'
        });

    } catch (error) {
        console.error("Delete Subscription Plan Error:", error);
        res.status(500).json({ success: false, error: 'Failed to delete subscription plan.' });
    }
};

// ============================================================================
// 📚 TÓM TẮT FILE NÀY
// ============================================================================
// File subscriptionController.js chứa 4 functions xử lý PRICING PLANS:
//
// 1. getSubscriptionPlans (GET /api/subscriptions)
//    - Lấy danh sách gói subscription
//    - Filters: active (boolean), limit (number)
//    - String → boolean: active === 'true'
//    - Gọi Subscription.findAll()
//
// 2. createSubscriptionPlan (POST /api/subscriptions)
//    - Tạo gói mới
//    - Chỉ admin
//    - Dual naming support
//    - Validation phức tạp: name, monthlyPrice, annualPrice, features
//    - Gọi Subscription.create()
//
// 3. updateSubscriptionPlan (PUT /api/subscriptions/:id)
//    - Sửa gói
//    - Chỉ admin
//    - Gọi Subscription.update()
//
// 4. deleteSubscriptionPlan (DELETE /api/subscriptions/:id)
//    - Xóa gói
//    - Chỉ admin
//    - Kiểm tra tồn tại trước khi xóa
//    - Gọi Subscription.findById() và Subscription.delete()
//
// ============================================================================
// 🔑 KEY CONCEPTS
// ============================================================================
// - String → Boolean: req.query.active === 'true'
//   + Query params luôn là string
//   + Phải manually convert 'true'/'false' → true/false
//
// - Pricing strategy:
//   + monthlyPrice: Giá theo tháng
//   + annualPrice: Giá theo năm (thường rẻ hơn để khuyến khích)
//   + maxCourses: Giới hạn số khóa học (null = unlimited)
//   + isPopular: Highlight gói phổ biến nhất
//
// - Dual naming support: camelCase + snake_case
//
// ============================================================================
// 📊 REAL-WORLD ANALOGY
// ============================================================================
//
// 💰 Subscription Controller giống như QUẢN LÝ BẢNG GIÁ GÓI DỊCH VỤ:
//
// 1. getSubscriptionPlans = Khách hàng xem bảng giá
//    - Freemium model: FREE + PRO + ENTERPRISE
//    - Hiển thị features từng gói
//
// 2. createSubscriptionPlan = Sếp tạo gói mới
//    - "Chúng ta cần gói PREMIUM ở giữa PRO và ENTERPRISE"
//    - Admin tạo gói với giá & features tương ứng
//
// 3. updateSubscriptionPlan = Điều chỉnh giá
//    - "Tăng giá PRO lên 249k vì lạm phát"
//    - Admin update monthly_price
//
// 4. deleteSubscriptionPlan = Ngừng bán gói
//    - "Gói BASIC không ai mua, bỏ đi"
//    - Admin xóa hoặc set active = false
//
// PRICING STRATEGY:
// - FREE: Attract users (lead magnet)
// - PRO: Main revenue stream
// - ENTERPRISE: High-value customers
//
// ============================================================================
