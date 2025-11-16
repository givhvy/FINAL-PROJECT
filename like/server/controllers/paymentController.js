// ============================================================================
// paymentController.js - Quản lý THANH TOÁN (Stripe integration + Payment CRUD)
// ============================================================================
// FLOW: User checkout → POST /api/payments/create-checkout-session → stripe.checkout.sessions.create()
//       → User thanh toán trên Stripe → POST /api/payments/verify → Order.create() + Payment.create()
//       → Nếu là subscription → User.upgradeToProTier()
//
// 8 functions: 2 Stripe functions (createCheckoutSession, verifyPaymentAndCreateOrder)
// + 6 CRUD functions (create, getAll, getById, update, delete)

// 'npm install stripe' và đã thêm STRIPE_SECRET_KEY vào .env ,
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');

// --- Stripe Integration Logic ---
exports.createCheckoutSession = async (req, res) => {
    try {
        // Lấy thông tin cần thiết từ Frontend
        const { courseId, courseName, price, successUrl, cancelUrl, userId } = req.body;

        // Kiểm tra .env của khóa Stripe
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({
                message: 'Stripe Secret Key is missing from .env configuration.',
                error: 'Configuration Error'
            });
        }

        // 1. Tạo phiên Stripe Checkout
        const session = await stripe.checkout.sessions.create({ // GỌI STRIPE API ⭐
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: courseName,
                            description: `Access to the ${courseName} masterclass.`,
                        },
                        // Stripe cần số tiền tính bằng cents
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // Truyền dữ liệu bổ sung để xử lý logic sau khi thanh toán thành công
            client_reference_id: userId,
            metadata: {
                course_id: courseId,
                user_id: userId
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        // 2. Trả về URL của phiên Stripe cho Frontend
        res.status(200).json({ sessionId: session.id, url: session.url });

    } catch (err) {
        console.error("Stripe Checkout Error:", err);
        res.status(500).json({ error: err.message, message: 'Failed to create payment session.' });
    }
};

// Verify payment and create order
exports.verifyPaymentAndCreateOrder = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ success: false, error: 'Session ID is required' });
        }

        // Retrieve the Stripe session (để vào cart nếu chưa xong)
        const session = await stripe.checkout.sessions.retrieve(sessionId); // GỌI STRIPE API ⭐

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        // Check if payment was successful
        if (session.payment_status !== 'paid') {
            return res.status(400).json({ success: false, error: 'Payment not completed' });
        }

        const userId = session.client_reference_id || session.metadata.user_id;
        const courseId = session.metadata.course_id;

        // Check if order already exists for this session using Order model
        const allOrders = await Order.findAll({}); // GỌI MODEL ⭐
        const existingOrder = allOrders.find(order => order.paymentId === sessionId);

        if (existingOrder) {
            // Order already created
            return res.status(200).json({
                success: true,
                message: 'Order already exists',
                data: existingOrder.toJSON()
            });
        }

        // Get course details using Course model
        let courseName = 'Subscription Plan';
        if (courseId) {
            const course = await Course.findById(courseId); // GỌI MODEL ⭐
            if (course) {
                courseName = course.title;
            }
        }

        // Create order using Order model
        const orderData = {
            userId: userId,
            courseId: courseId,
            courseName: courseName,
            price: session.amount_total / 100, // Convert from cents
            status: 'completed',
            paymentMethod: 'stripe',
            paymentId: sessionId
        };

        const newOrder = await Order.create(orderData); // GỌI MODEL ⭐

        // Create payment record using Payment model
        const paymentData = {
            orderId: newOrder.id,
            userId: userId,
            amount: session.amount_total / 100,
            currency: 'USD',
            paymentMethod: 'stripe',
            paymentStatus: 'completed',
            transactionId: session.payment_intent,
            paymentGatewayResponse: session
        };

        await Payment.create(paymentData); // GỌI MODEL ⭐

        // Check if this is a subscription purchase (no specific courseId or subscription plan)
        // If it's a subscription, upgrade user to Pro tier
        if (!courseId || courseName.toLowerCase().includes('pro') || courseName.toLowerCase().includes('subscription')) {
            await User.upgradeToProTier(userId); // GỌI MODEL ⭐
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder.toJSON()
        });

    } catch (err) {
        console.error("Payment Verification Error:", err);
        res.status(500).json({ success: false, error: err.message, message: 'Failed to verify payment and create order' });
    }
};


// --- CRUD Operations ---

exports.createPayment = async (req, res) => {
    try {
        const paymentData = {
            ...req.body,
            // Support both camelCase and snake_case
            orderId: req.body.orderId || req.body.order_id,
            userId: req.body.userId || req.body.user_id,
            paymentMethod: req.body.paymentMethod || req.body.payment_method,
            paymentStatus: req.body.paymentStatus || req.body.payment_status,
            transactionId: req.body.transactionId || req.body.transaction_id
        };

        const newPayment = await Payment.create(paymentData); // GỌI MODEL ⭐

        res.status(201).json({ // trả về kết quả
            success: true,
            data: newPayment.toJSON()
        });
    } catch (err) { // bắt bugs
        console.error("Create Payment Error:", err);
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const filters = {};

        // Support query filters
        if (req.query.userId || req.query.user_id) {
            filters.userId = req.query.userId || req.query.user_id;
        }
        if (req.query.orderId || req.query.order_id) {
            filters.orderId = req.query.orderId || req.query.order_id;
        }
        if (req.query.paymentStatus || req.query.payment_status) {
            filters.paymentStatus = req.query.paymentStatus || req.query.payment_status;
        }
        if (req.query.limit) {
            filters.limit = parseInt(req.query.limit);
        }

        const payments = await Payment.findAll(filters); // GỌI MODEL ⭐

        // Populate order data // gộp chung các data liên quan
        const populatedPayments = await Promise.all(payments.map(async (payment) => {
            const paymentData = payment.toJSON();
            let orderData = null;

            if (paymentData.orderId) {
                const order = await Order.findById(paymentData.orderId); // GỌI MODEL ⭐
                if (order) {
                    orderData = order.toJSON();
                }
            }

            return {
                ...paymentData,
                order: orderData,
            };
        }));

        res.status(200).json({
            success: true,
            data: populatedPayments
        });
    } catch (err) {
        console.error("Get Payments Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const paymentId = req.params.id;
        const payment = await Payment.findById(paymentId); // GỌI MODEL ⭐

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        const paymentData = payment.toJSON();
        let orderData = null;

        if (paymentData.orderId) {
            const order = await Order.findById(paymentData.orderId); // GỌI MODEL ⭐
            if (order) {
                orderData = order.toJSON();
            }
        }

        res.status(200).json({
            success: true,
            data: {
                ...paymentData,
                order: orderData,
            }
        });
    } catch (err) {
        console.error("Get Payment By ID Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const paymentId = req.params.id;
        const updatedPayment = await Payment.update(paymentId, req.body); // GỌI MODEL ⭐

        res.status(200).json({
            success: true,
            data: updatedPayment.toJSON()
        });
    } catch (err) {
        console.error("Update Payment Error:", err);
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, error: err.message });
        } else {
            res.status(400).json({ success: false, error: err.message });
        }
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const paymentId = req.params.id;

        // Check if payment exists
        const payment = await Payment.findById(paymentId); // GỌI MODEL ⭐
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        await Payment.delete(paymentId); // GỌI MODEL ⭐

        res.status(200).json({
            success: true,
            message: 'Payment deleted successfully'
        });
    } catch (err) {
        console.error("Delete Payment Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============================================================================
// TÓM TẮT: Stripe payment integration + CRUD payments
// KEY: stripe.checkout.sessions.create/retrieve, User.upgradeToProTier(),
// Math.round(price * 100) to convert dollars → cents, Promise.all populate
// ============================================================================
