const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Xử lý tất cả các thao tác liên quan đến người dùng trong Firestore
 */
class User {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role || 'student';
        this.avatarUrl = data.avatarUrl || data.profilePicture || null;
        this.phone = data.phone || null;
        this.subscriptionTier = data.subscriptionTier || 'free'; // 'free' or 'pro'
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.resetPasswordCode = data.resetPasswordCode || null;
        this.resetPasswordExpires = data.resetPasswordExpires || null;
    }

    /**
     * Lấy instance của Firestore
     */
    static getDB() {
        return getFirestore();
    }

    /**
     * Tìm người dùng theo email
     * @param {string} email - Email người dùng
     * @returns {Promise<User|null>} - User object hoặc null
     */
    static async findByEmail(email) {
        try {
            const db = this.getDB();
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', email).get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return new User({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    /**
     * Tìm người dùng theo ID
     * @param {string} id - User ID
     * @returns {Promise<User|null>} - User object hoặc null
     */
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('users').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new User({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả người dùng
     * @param {Object} filters - Bộ lọc (role, limit, etc.)
     * @returns {Promise<Array<User>>} - Mảng User objects
     */
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('users');

            // Áp dụng filter theo role nếu có
            if (filters.role) {
                query = query.where('role', '==', filters.role);
            }

            // Áp dụng limit nếu có
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error finding all users: ${error.message}`);
        }
    }

    /**
     * Tạo người dùng mới
     * @param {Object} userData - Dữ liệu người dùng
     * @returns {Promise<User>} - User object đã tạo
     */
    static async create(userData) {
        try {
            const db = this.getDB();

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email already in use');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Check if email is .edu to grant Pro tier automatically
            const subscriptionTier = this.isEduEmail(userData.email) ? 'pro' : 'free';

            const newUser = new User({
                ...userData,
                password: hashedPassword,
                subscriptionTier: subscriptionTier,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const docRef = await db.collection('users').add({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                avatarUrl: newUser.avatarUrl,
                phone: newUser.phone,
                subscriptionTier: newUser.subscriptionTier,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            });

            newUser.id = docRef.id;
            return newUser;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    /**
     * Cập nhật thông tin người dùng
     * @param {string} id - User ID
     * @param {Object} updateData - Dữ liệu cần cập nhật
     * @returns {Promise<User>} - User object đã cập nhật
     */
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const userRef = db.collection('users').doc(id);
            const doc = await userRef.get();

            if (!doc.exists) {
                throw new Error('User not found');
            }

            // Nếu cập nhật password, hash nó
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            updateData.updatedAt = new Date().toISOString();

            await userRef.update(updateData);

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    /**
     * Xóa người dùng
     * @param {string} id - User ID
     * @returns {Promise<boolean>} - true nếu xóa thành công
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('users').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    /**
     * So sánh password
     * @param {string} password - Password cần so sánh
     * @returns {Promise<boolean>} - true nếu password đúng
     */
    async comparePassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    /**
     * Lưu mã reset password
     * @param {string} code - Mã reset
     * @param {Date} expiresAt - Thời gian hết hạn
     */
    async saveResetCode(code, expiresAt) {
        try {
            const db = User.getDB();
            await db.collection('users').doc(this.id).update({
                resetPasswordCode: code,
                resetPasswordExpires: expiresAt.toISOString()
            });
            this.resetPasswordCode = code;
            this.resetPasswordExpires = expiresAt.toISOString();
        } catch (error) {
            throw new Error(`Error saving reset code: ${error.message}`);
        }
    }

    /**
     * Xóa mã reset password
     */
    async clearResetCode() {
        try {
            const db = User.getDB();
            await db.collection('users').doc(this.id).update({
                resetPasswordCode: null,
                resetPasswordExpires: null
            });
            this.resetPasswordCode = null;
            this.resetPasswordExpires = null;
        } catch (error) {
            throw new Error(`Error clearing reset code: ${error.message}`);
        }
    }

    /**
     * Check if email is .edu domain
     * @param {string} email - Email to check
     * @returns {boolean} - true if email ends with .edu
     */
    static isEduEmail(email) {
        return email.toLowerCase().endsWith('.edu');
    }

    /**
     * Check if user has Pro tier
     * @returns {boolean} - true if user is Pro
     */
    isPro() {
        return this.subscriptionTier === 'pro';
    }

    /**
     * Upgrade user to Pro tier
     * @param {string} id - User ID
     * @returns {Promise<User>} - Updated user
     */
    static async upgradeToProTier(id) {
        try {
            return await this.update(id, { subscriptionTier: 'pro' });
        } catch (error) {
            throw new Error(`Error upgrading to Pro tier: ${error.message}`);
        }
    }

    /**
     * Downgrade user to Free tier
     * @param {string} id - User ID
     * @returns {Promise<User>} - Updated user
     */
    static async downgradeToFreeTier(id) {
        try {
            return await this.update(id, { subscriptionTier: 'free' });
        } catch (error) {
            throw new Error(`Error downgrading to Free tier: ${error.message}`);
        }
    }

    /**
     * Chuyển đổi thành object đơn giản (loại bỏ password)
     * @returns {Object} - User object không có password
     */
    toJSON() {
        const obj = { ...this };
        delete obj.password;
        delete obj.resetPasswordCode;
        delete obj.resetPasswordExpires;
        return obj;
    }
}

module.exports = User;
