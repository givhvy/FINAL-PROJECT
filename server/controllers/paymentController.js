// server/controllers/paymentController.js

const { getFirestore } = require('firebase-admin/firestore');

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
                if (orderSnap.exists()) {
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

        if (!paymentSnap.exists()) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const paymentData = paymentSnap.data();
        let orderData = null;

        if (paymentData.order_id) {
            const orderSnap = await db.collection('orders').doc(paymentData.order_id).get();
            if (orderSnap.exists()) {
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