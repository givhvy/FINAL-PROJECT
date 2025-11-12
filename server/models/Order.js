const { getFirestore } = require('firebase-admin/firestore');

/**
 * Order Model
 * Xử lý tất cả các thao tác liên quan đến đơn hàng trong Firestore
 */
class Order {
    constructor(data) {
        this.id = data.id || null;
        // Handle both camelCase and snake_case field names from Firebase
        this.userId = data.userId || data.user_id;
        this.courseId = data.courseId || data.course_id;
        this.courseName = data.courseName || data.course_name || '';
        this.price = data.price || 0;
        this.status = data.status || 'pending'; // pending, completed, cancelled, refunded
        this.paymentMethod = data.paymentMethod || data.payment_method || '';
        this.paymentId = data.paymentId || data.payment_id || null;
        this.createdAt = data.createdAt || data.created_at || new Date().toISOString();
        this.updatedAt = data.updatedAt || data.updated_at || new Date().toISOString();
    }

    /**
     * Lấy instance của Firestore
     */
    static getDB() {
        return getFirestore();
    }

    /**
     * Tìm đơn hàng theo ID
     * @param {string} id - Order ID
     * @returns {Promise<Order|null>} - Order object hoặc null
     */
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('orders').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new Order({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding order by ID: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả đơn hàng
     * @param {Object} filters - Bộ lọc (userId, courseId, status, etc.)
     * @returns {Promise<Array<Order>>} - Mảng Order objects
     */
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('orders');

            console.log('[Order.findAll] Filters:', filters);

            // Áp dụng bộ lọc theo userId - Firebase uses snake_case user_id
            if (filters.userId) {
                console.log('[Order.findAll] Querying user_id ==', filters.userId);
                query = query.where('user_id', '==', filters.userId);
            }

            // Áp dụng bộ lọc theo courseId - Firebase uses snake_case course_id
            if (filters.courseId) {
                console.log('[Order.findAll] Querying course_id ==', filters.courseId);
                query = query.where('course_id', '==', filters.courseId);
            }

            // Áp dụng bộ lọc theo status
            if (filters.status) {
                console.log('[Order.findAll] Querying status ==', filters.status);
                query = query.where('status', '==', filters.status);
            }

            // KHÔNG dùng orderBy để tránh cần composite index
            // Sẽ sort trong memory sau khi fetch

            const snapshot = await query.get();
            console.log('[Order.findAll] Found', snapshot.docs.length, 'documents');
            let orders = snapshot.docs.map(doc => new Order({ id: doc.id, ...doc.data() }));
            console.log('[Order.findAll] Mapped to', orders.length, 'Order objects');

            // Sort by createdAt in memory to avoid composite index requirement
            orders.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA; // Descending order (newest first)
            });

            // Apply limit after sorting
            if (filters.limit) {
                orders = orders.slice(0, filters.limit);
            }

            return orders;
        } catch (error) {
            throw new Error(`Error finding all orders: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả đơn hàng của một người dùng
     * @param {string} userId - User ID
     * @returns {Promise<Array<Order>>} - Mảng Order objects
     */
    static async findByUserId(userId) {
        try {
            return await this.findAll({ userId });
        } catch (error) {
            throw new Error(`Error finding orders by user ID: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả đơn hàng của một khóa học
     * @param {string} courseId - Course ID
     * @returns {Promise<Array<Order>>} - Mảng Order objects
     */
    static async findByCourseId(courseId) {
        try {
            return await this.findAll({ courseId });
        } catch (error) {
            throw new Error(`Error finding orders by course ID: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả đơn hàng của một người dùng theo trạng thái
     * @param {string} userId - User ID
     * @param {string} status - Order status
     * @returns {Promise<Array<Order>>} - Mảng Order objects
     */
    static async findByUserIdAndStatus(userId, status) {
        try {
            return await this.findAll({ userId, status });
        } catch (error) {
            throw new Error(`Error finding orders by user ID and status: ${error.message}`);
        }
    }

    /**
     * Tạo đơn hàng mới (Create in CRUD)
     * @param {Object} orderData - Dữ liệu đơn hàng
     * @returns {Promise<Order>} - Order object đã tạo
     */
    static async create(orderData) {
        try {
            const db = this.getDB();

            const newOrder = new Order({
                ...orderData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const docRef = await db.collection('orders').add({
                userId: newOrder.userId,
                courseId: newOrder.courseId,
                courseName: newOrder.courseName,
                price: newOrder.price,
                status: newOrder.status,
                paymentMethod: newOrder.paymentMethod,
                paymentId: newOrder.paymentId,
                createdAt: newOrder.createdAt,
                updatedAt: newOrder.updatedAt
            });

            newOrder.id = docRef.id;
            return newOrder;
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`);
        }
    }

    /**
     * Cập nhật đơn hàng (Update in CRUD)
     * @param {string} id - Order ID
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Promise<Order>} - Order object đã cập nhật
     */
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const orderRef = db.collection('orders').doc(id);
            const doc = await orderRef.get();

            if (!doc.exists) {
                throw new Error('Order not found');
            }

            updateData.updatedAt = new Date().toISOString();
            await orderRef.update(updateData);

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating order: ${error.message}`);
        }
    }

    /**
     * Xóa đơn hàng (Delete in CRUD)
     * @param {string} id - Order ID
     * @returns {Promise<boolean>} - true nếu xóa thành công
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('orders').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting order: ${error.message}`);
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng (Update in CRUD 2)
     * @param {string} id - Order ID
     * @param {string} status - Trạng thái mới
     * @returns {Promise<Order>} - Order object đã cập nhật
     */
    static async updateStatus(id, status) {
        try {
            const db = this.getDB();
            const orderRef = db.collection('orders').doc(id);
            const doc = await orderRef.get();

            if (!doc.exists) {
                throw new Error('Order not found');
            }

            await orderRef.update({
                status: status,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating order status: ${error.message}`);
        }
    }

    /**
     * Hoàn thành đơn hàng 
     * @param {string} id - Order ID
     * @param {string} paymentId - Payment ID
     * @returns {Promise<Order>} - Order object đã cập nhật
     */
    static async complete(id, paymentId) {
        try {
            const db = this.getDB();
            const orderRef = db.collection('orders').doc(id);
            const doc = await orderRef.get();

            if (!doc.exists) {
                throw new Error('Order not found');
            }

            await orderRef.update({
                status: 'completed',
                paymentId: paymentId,
                updatedAt: new Date().toISOString()
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error completing order: ${error.message}`);
        }
    }

    /**
     * Hủy đơn hàng
     * @param {string} id - Order ID
     * @returns {Promise<Order>} - Order object đã cập nhật
     */
    static async cancel(id) {
        try {
            return await this.updateStatus(id, 'cancelled');
        } catch (error) {
            throw new Error(`Error cancelling order: ${error.message}`);
        }
    }

    /**
     * Hoàn tiền đơn hàng
     * @param {string} id - Order ID
     * @returns {Promise<Order>} - Order object đã cập nhật
     */
    static async refund(id) {
        try {
            return await this.updateStatus(id, 'refunded');
        } catch (error) {
            throw new Error(`Error refunding order: ${error.message}`);
        }
    }

    /**
     * Lấy tổng doanh thu
     * @param {Object} filters - Bộ lọc (userId, courseId, startDate, endDate)
     * @returns {Promise<number>} - Tổng doanh thu
     */
    static async getTotalRevenue(filters = {}) {
        try {
            const orders = await this.findAll({
                ...filters,
                status: 'completed'
            });

            return orders.reduce((total, order) => total + order.price, 0);
        } catch (error) {
            throw new Error(`Error getting total revenue: ${error.message}`);
        }
    }

    /**
     * Chuyển đổi thành object đơn giản
     * @returns {Object} - Order object
     */
    toJSON() {
        return { ...this };
    }
}

module.exports = Order;
