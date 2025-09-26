// server/controllers/orderController.js

const { getFirestore } = require('firebase-admin/firestore');

exports.createOrder = async (req, res) => {
    try {
        const db = getFirestore();
        const orderData = { ...req.body, createdAt: new Date().toISOString() };
        const newOrderRef = await db.collection('orders').add(orderData);
        res.status(201).json({ id: newOrderRef.id, ...orderData });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const db = getFirestore();
        const ordersSnapshot = await db.collection('orders').get();

        const orders = await Promise.all(ordersSnapshot.docs.map(async (orderDoc) => {
            const orderData = orderDoc.data();
            let userData = null;
            let courseData = null;

            if (orderData.user_id) {
                const userSnap = await db.collection('users').doc(orderData.user_id).get();
                if (userSnap.exists) {
                    userData = { id: userSnap.id, ...userSnap.data() };
                    delete userData.password;
                }
            }

            if (orderData.course_id) {
                const courseSnap = await db.collection('courses').doc(orderData.course_id).get();
                if (courseSnap.exists()) {
                    courseData = { id: courseSnap.id, ...courseSnap.data() };
                }
            }
          
            return {
                id: orderDoc.id,
                ...orderData,
                user: userData,
                course: courseData,
            };
        }));
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const db = getFirestore();
        const orderRef = db.collection('orders').doc(req.params.id);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists()) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const orderData = orderSnap.data();
        let userData = null;
        let courseData = null;

        if (orderData.user_id) {
            const userSnap = await db.collection('users').doc(orderData.user_id).get();
            if (userSnap.exists()) {
                userData = { id: userSnap.id, ...userSnap.data() };
                delete userData.password;
            }
        }
        
        if (orderData.course_id) {
            const courseSnap = await db.collection('courses').doc(orderData.course_id).get();
            if (courseSnap.exists()) {
                courseData = { id: courseSnap.id, ...courseSnap.data() };
            }
        }

        res.status(200).json({
            id: orderSnap.id,
            ...orderData,
            user: userData,
            course: courseData,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('orders').doc(req.params.id);
        await docRef.update(req.body);
        res.status(200).json({ id: req.params.id, ...req.body });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const db = getFirestore();
        const docRef = db.collection('orders').doc(req.params.id);
        await docRef.delete();
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};