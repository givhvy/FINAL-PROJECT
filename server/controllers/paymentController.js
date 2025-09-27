const {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc
} = require('firebase-admin/firestore');

// Đảm bảo bạn đã chạy 'npm install stripe' và đã thêm STRIPE_SECRET_KEY vào .env
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

// --- Stripe Integration Logic ---
exports.createCheckoutSession = async (req, res) => {
    try {
        // Lấy thông tin cần thiết từ Frontend
        const { courseId, courseName, price, successUrl, cancelUrl, userId } = req.body;
        
        // Kiểm tra khóa Stripe
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ 
                message: 'Stripe Secret Key is missing from .env configuration.',
                error: 'Configuration Error' 
            });
        }
        
        // 1. Tạo phiên Stripe Checkout
        const session = await stripe.checkout.sessions.create({
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


// --- CRUD Operations (Giữ nguyên) ---

exports.createPayment = async (req, res) => {
    try {
        const db = getFirestore();
        const paymentData = { ...req.body, createdAt: new Date().toISOString() };
        const newPaymentRef = await db.collection('payments').add(paymentData);
        res.status(201).json({ id: newPaymentRef.id, ...paymentData });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const db = getFirestore();
        const paymentsSnapshot = await db.collection('payments').get();

        const payments = await Promise.all(paymentsSnapshot.docs.map(async (paymentDoc) => {
            const paymentData = paymentDoc.data();
            let orderData = null;

            if (paymentData.order_id) {
                const orderSnap = await db.collection('orders').doc(paymentData.order_id).get();
                if (orderSnap.exists) {
                    orderData = { id: orderSnap.id, ...orderSnap.data() };
                }
            }
          
            return {
                id: paymentDoc.id,
                ...paymentData,
                order: orderData,
            };
        }));
        res.status(200).json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const db = getFirestore();
        const paymentRef = db.collection('payments').doc(req.params.id);
        const paymentSnap = await paymentRef.get();

        if (!paymentSnap.exists) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const paymentData = paymentSnap.data();
        let orderData = null;

        if (paymentData.order_id) {
            const orderSnap = await db.collection('orders').doc(paymentData.order_id).get();
            if (orderSnap.exists) {
                orderData = { id: orderSnap.id, ...orderSnap.data() };
            }
        }

        res.status(200).json({
            id: paymentSnap.id,
            ...paymentData,
            order: orderData,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('payments').doc(req.params.id);
        await docRef.update(req.body);
        res.status(200).json({ id: req.params.id, ...req.body });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('payments').doc(req.params.id);
        await docRef.delete();
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
