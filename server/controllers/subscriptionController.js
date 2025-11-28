// controllers/subscriptionController.js
const Subscription = require('../models/Subscription');

// Lấy tất cả các gói subscription từ Firestore
exports.getSubscriptionPlans = async (req, res) => {
    try {
        const filters = {};

        if (req.query.active !== undefined) {
            filters.active = req.query.active === 'true';
        }

        if (req.query.limit) {
            filters.limit = parseInt(req.query.limit);
        }

        const plans = await Subscription.findAll(filters);

        res.status(200).json(plans.map(p => p.toJSON())); // 200 ok cho try
    } catch (error) {
        console.error("Get Subscription Plans Error:", error);
        res.status(500).json({ success: false, error: 'Failed to retrieve subscription plans.' });
    }
};

// Tạo một gói subscription mới (Create in Controller)
exports.createSubscriptionPlan = async (req, res) => {
    try {
        const planData = {
            ...req.body,
            // Support both camelCase and snake_case
            monthlyPrice: req.body.monthlyPrice || req.body.monthly_price,
            monthly_price: req.body.monthly_price || req.body.monthlyPrice,
            annualPrice: req.body.annualPrice || req.body.annual_price,
            annual_price: req.body.annual_price || req.body.annualPrice,
            maxCourses: req.body.maxCourses || req.body.max_courses,
            max_courses: req.body.max_courses || req.body.maxCourses,
            isPopular: req.body.isPopular || req.body.is_popular,
            is_popular: req.body.is_popular || req.body.isPopular
        };

        // Validate data before saving
        if (!planData.name || (planData.monthlyPrice === undefined && planData.monthly_price === undefined) ||
            (planData.annualPrice === undefined && planData.annual_price === undefined) || !planData.features) {
            return res.status(400).json({ success: false, error: 'Missing required fields for subscription plan.' });
        }

        const newPlan = await Subscription.create(planData);

        res.status(201).json({
            success: true,
            data: newPlan.toJSON()
        });
    } catch (error) {
        console.error("Create Subscription Plan Error:", error);
        res.status(400).json({ success: false, error: 'Failed to create subscription plan.' });
    }
};

// Cập nhật một gói subscription (Update in Controller)
exports.updateSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedPlan = await Subscription.update(id, req.body);

        res.status(200).json({
            success: true,
            data: updatedPlan.toJSON()
        });
    } catch (error) {
        console.error("Update Subscription Plan Error:", error);
        if (error.message.includes('not found')) {
            res.status(404).json({ success: false, error: 'Subscription plan not found' });
        } else {
            res.status(400).json({ success: false, error: 'Failed to update subscription plan.' });
        }
    }
};

// Xóa một gói subscription (Delete in Controller)
exports.deleteSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if subscription exists by id its
        const subscription = await Subscription.findById(id);
        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription plan not found' });
        }

        await Subscription.delete(id);

        res.status(200).json({
            success: true,
            message: 'Subscription plan deleted successfully.' // try nếu đúng trong khu code try này thì ra deleted succesfully
        });
    } catch (error) {
        console.error("Delete Subscription Plan Error:", error);
        res.status(500).json({ success: false, error: 'Failed to delete subscription plan.' });
    }
};

