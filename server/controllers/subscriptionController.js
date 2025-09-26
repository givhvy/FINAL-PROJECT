// controllers/subscriptionController.js
const { getFirestore } = require('firebase-admin/firestore');

// Lấy tất cả các gói subscription từ Firestore
exports.getSubscriptionPlans = async (req, res) => {
    try {
        const db = getFirestore();
        const plansSnapshot = await db.collection('subscriptions').orderBy('monthlyPrice').get();
        const plans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(plans);
    } catch (error) {
        console.error("Get Subscription Plans Error:", error);
        res.status(500).json({ error: 'Failed to retrieve subscription plans.' });
    }
};

// Tạo một gói subscription mới
exports.createSubscriptionPlan = async (req, res) => {
    try {
        const db = getFirestore();
        const planData = req.body;
        // Validate data before saving (optional but recommended)
        if (!planData.name || !planData.monthlyPrice || !planData.annualPrice || !planData.features) {
            return res.status(400).json({ error: 'Missing required fields for subscription plan.' });
        }
        const newPlanRef = await db.collection('subscriptions').add(planData);
        res.status(201).json({ id: newPlanRef.id, ...planData });
    } catch (error) {
        console.error("Create Subscription Plan Error:", error);
        res.status(400).json({ error: 'Failed to create subscription plan.' });
    }
};

// Cập nhật một gói subscription
exports.updateSubscriptionPlan = async (req, res) => {
    try {
        const db = getFirestore();
        const { id } = req.params;
        const planData = req.body;
        const planRef = db.collection('subscriptions').doc(id);

        const docSnap = await planRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Subscription plan not found' });
        }

        await planRef.update(planData);
        res.status(200).json({ id, ...planData });
    } catch (error) {
        console.error("Update Subscription Plan Error:", error);
        res.status(400).json({ error: 'Failed to update subscription plan.' });
    }
};

// Xóa một gói subscription
exports.deleteSubscriptionPlan = async (req, res) => {
    try {
        const db = getFirestore();
        const { id } = req.params;
        const docRef = db.collection('subscriptions').doc(id);
        
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Subscription plan not found' });
        }

        await docRef.delete();
        res.status(200).json({ message: 'Subscription plan deleted successfully.' });
    } catch (error) {
        console.error("Delete Subscription Plan Error:", error);
        res.status(500).json({ error: 'Failed to delete subscription plan.' });
    }
};

