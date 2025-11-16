// ============================================================================
// orderController.js - Quản lý ĐƠN HÀNG (enrollments/purchases)
// ============================================================================
// FLOW: User thanh toán → POST /api/orders → Order.create()
//       Admin xem orders → GET /api/orders → Order.findAll() + populate user+course
//
// 5 functions: create, getAll (có filters + populate), getById (+ populate),
// update, delete

const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');

exports.createOrder = async (req, res) => { // cho routes xài , create trong controller
    try {
        const orderData = {
            ...req.body,
            // Support both camelCase and snake_case
            userId: req.body.userId || req.body.user_id,
            courseId: req.body.courseId || req.body.course_id,
            courseName: req.body.courseName || req.body.course_name
        };

        const newOrder = await Order.create(orderData); // GỌI MODEL ⭐

        res.status(201).json(newOrder.toJSON());
    } catch (err) {
        console.error("Create Order Error:", err);
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const filters = {};

        // Support query filters
        if (req.query.userId || req.query.user_id) {
            filters.userId = req.query.userId || req.query.user_id;
        }
        if (req.query.courseId || req.query.course_id) {
            filters.courseId = req.query.courseId || req.query.course_id;
        }
        if (req.query.status) {
            filters.status = req.query.status;
        }
        if (req.query.limit) {
            filters.limit = parseInt(req.query.limit);
        }

        const orders = await Order.findAll(filters); // GỌI MODEL ⭐

        // Populate user and course data
        const populatedOrders = await Promise.all(orders.map(async (order) => {
            const orderData = order.toJSON();
            let userData = null;
            let courseData = null;

            if (orderData.userId) {
                const user = await User.findById(orderData.userId); // GỌI MODEL ⭐
                if (user) {
                    userData = user.toJSON();
                }
            }

            if (orderData.courseId) {
                const course = await Course.findById(orderData.courseId); // GỌI MODEL ⭐
                if (course) {
                    courseData = course.toJSON();
                }
            }

            return {
                ...orderData,
                user: userData,
                course: courseData,
            };
        }));

        res.status(200).json(populatedOrders);
    } catch (err) {
        console.error("Get Orders Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId); // GỌI MODEL ⭐

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const orderData = order.toJSON();
        let userData = null;
        let courseData = null;

        if (orderData.userId) {
            const user = await User.findById(orderData.userId); // GỌI MODEL ⭐
            if (user) {
                userData = user.toJSON();
            }
        }

        if (orderData.courseId) {
            const course = await Course.findById(orderData.courseId); // GỌI MODEL ⭐
            if (course) {
                courseData = course.toJSON();
            }
        }

        res.status(200).json({
            ...orderData,
            user: userData,
            course: courseData,
        });
    } catch (err) {
        console.error("Get Order By ID Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateOrder = async (req, res) => { // update trong controller
    try {
        const orderId = req.params.id;
        const updatedOrder = await Order.update(orderId, req.body); // GỌI MODEL ⭐

        res.status(200).json(updatedOrder.toJSON());
    } catch (err) { // bắt bugs
        console.error("Update Order Error:", err);
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, error: err.message });
        } else {
            res.status(400).json({ success: false, error: err.message });
        }
    }
};

exports.deleteOrder = async (req, res) => { // delete trong controller
    try {
        const orderId = req.params.id;

        // Check if order exists
        const order = await Order.findById(orderId); // GỌI MODEL ⭐
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        await Order.delete(orderId); // GỌI MODEL ⭐

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (err) { // bắt bugs
        console.error("Delete Order Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============================================================================
// TÓM TẮT: CRUD orders + populate user and course data
// KEY: Promise.all async map for populate, dual naming, filters
// ============================================================================
