const { getFirestore } = require('firebase-admin/firestore');

/**
 * Payment Model
 * Xử lý tất cả các thao tác liên quan đến thanh toán trong Firestore
 */
class Payment {
    constructor(data) {
        this.id = data.id || null;
        this.orderId = data.orderId;
        this.userId = data.userId;
        this.amount = data.amount || 0;
        this.currency = data.currency || 'VND';
        this.paymentMethod = data.paymentMethod || ''; // stripe, paypal, vnpay, momo, etc.
        this.paymentStatus = data.paymentStatus || 'pending'; // pending, completed, failed, refunded
        this.transactionId = data.transactionId || null; // ID từ payment gateway
        this.paymentGatewayResponse = data.paymentGatewayResponse || null; // Response từ gateway
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

 // 
    static getDB() {
        return getFirestore();
    }

// Tìm payment theo ID
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('payments').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new Payment({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding payment by ID: ${error.message}`);
        }
    }

    // Tìm payment theo Order ID
    static async findByOrderId(orderId) {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('payments')
                .where('orderId', '==', orderId)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return new Payment({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding payment by order ID: ${error.message}`);
        }
    }

    // Tìm payment theo Transaction ID
    static async findByTransactionId(transactionId) {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('payments')
                .where('transactionId', '==', transactionId)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return new Payment({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding payment by transaction ID: ${error.message}`);
        }
    }

 // Lấy tất cả payment ---- Function1 
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('payments');

            // Áp dụng bộ lọc theo userId
            if (filters.userId) {
                query = query.where('userId', '==', filters.userId);
            }

            // Áp dụng bộ lọc theo orderId
            if (filters.orderId) {
                query = query.where('orderId', '==', filters.orderId);
            }

            // Áp dụng bộ lọc theo paymentStatus
            if (filters.paymentStatus) {
                query = query.where('paymentStatus', '==', filters.paymentStatus);
            }

            // Áp dụng bộ lọc theo paymentMethod
            if (filters.paymentMethod) {
                query = query.where('paymentMethod', '==', filters.paymentMethod);
            }

            // Sắp xếp theo ngày tạo
            query = query.orderBy('createdAt', 'desc');

            // Limit
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => new Payment({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error finding all payments: ${error.message}`);
        }
    }

    // Lấy tất cả payment của một người dùng
    static async findByUserId(userId) {
        try {
            return await this.findAll({ userId });
        } catch (error) {
            throw new Error(`Error finding payments by user ID: ${error.message}`);
        }
    }

    // Tạo payment mới
    static async create(paymentData) {
        try {
            const db = this.getDB();

            const newPayment = new Payment({
                ...paymentData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const docRef = await db.collection('payments').add({
                orderId: newPayment.orderId,
                userId: newPayment.userId,
                amount: newPayment.amount,
                currency: newPayment.currency,
                paymentMethod: newPayment.paymentMethod,
                paymentStatus: newPayment.paymentStatus,
                transactionId: newPayment.transactionId,
                paymentGatewayResponse: newPayment.paymentGatewayResponse,
                createdAt: newPayment.createdAt,
                updatedAt: newPayment.updatedAt
            });

            newPayment.id = docRef.id;
            return newPayment;
        } catch (error) {
            throw new Error(`Error creating payment: ${error.message}`);
        }
    }

   // Cập nhật payment  (Update in CRUD)
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const paymentRef = db.collection('payments').doc(id);
            const doc = await paymentRef.get();

            if (!doc.exists) {
                throw new Error('Payment not found');
            }

            updateData.updatedAt = new Date().toISOString();
            await paymentRef.update(updateData);

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating payment: ${error.message}`);
        }
    }

    // Xóa payment (Delete in CRUD)
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('payments').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting payment: ${error.message}`);
        }
    }

    // Cập nhật trạng thái payment (Update in CRUD 2)
    static async updateStatus(id, paymentStatus) {
        try {
            const db = this.getDB();
            const paymentRef = db.collection('payments').doc(id);
            const doc = await paymentRef.get();

            if (!doc.exists) {
                throw new Error('Payment not found');
            }

            await paymentRef.update({
                paymentStatus: paymentStatus,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating payment status: ${error.message}`);
        }
    }

   // Hoàn Thành Payment
    static async complete(id, transactionId, gatewayResponse = null) {
        try {
            const db = this.getDB();
            const paymentRef = db.collection('payments').doc(id);
            const doc = await paymentRef.get();

            if (!doc.exists) {
                throw new Error('Payment not found');
            }

            await paymentRef.update({
                paymentStatus: 'completed',
                transactionId: transactionId,
                paymentGatewayResponse: gatewayResponse,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error completing payment: ${error.message}`);
        }
    }

    // Đánh dấu payment thất bại
    static async fail(id, gatewayResponse = null) {
        try {
            const db = this.getDB();
            const paymentRef = db.collection('payments').doc(id);
            const doc = await paymentRef.get();

            if (!doc.exists) {
                throw new Error('Payment not found');
            }

            await paymentRef.update({
                paymentStatus: 'failed',
                paymentGatewayResponse: gatewayResponse,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error failing payment: ${error.message}`);
        }
    }

    // Hoàn tiền payment (Update in CRUD 3)
    static async refund(id) {
        try {
            return await this.updateStatus(id, 'refunded');
        } catch (error) {
            throw new Error(`Error refunding payment: ${error.message}`);
        }
    }

    // Lấy tổng số tiền đã thanh toán
    static async getTotalAmount(filters = {}) {
        try {
            const payments = await this.findAll({
                ...filters,
                paymentStatus: 'completed'
            });

            return payments.reduce((total, payment) => total + payment.amount, 0);
        } catch (error) {
            throw new Error(`Error getting total amount: ${error.message}`);
        }
    }

    // Chuyển đổi thành object đơn giản
    toJSON() {
        return { ...this };
    }
}

module.exports = Payment;
