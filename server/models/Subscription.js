const { getFirestore } = require('firebase-admin/firestore');

/**
 * Subscription Model
 * Handles all subscription plan operations in Firestore
 */
class Subscription {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name;
        this.description = data.description || '';

        this.monthlyPrice = data.monthlyPrice || data.monthly_price || 0;
        this.monthly_price = data.monthly_price || data.monthlyPrice || 0;

        this.annualPrice = data.annualPrice || data.annual_price || 0;
        this.annual_price = data.annual_price || data.annualPrice || 0;

        this.features = data.features || [];
        this.maxCourses = data.maxCourses || data.max_courses || null;
        this.max_courses = data.max_courses || data.maxCourses || null;

        this.isPopular = data.isPopular || data.is_popular || false;
        this.is_popular = data.is_popular || data.isPopular || false;

        this.order = data.order || 0;
        this.active = data.active !== undefined ? data.active : true;

        this.createdAt = data.createdAt || data.created_at || new Date().toISOString();
        this.created_at = data.created_at || data.createdAt || new Date().toISOString();

        this.updatedAt = data.updatedAt || data.updated_at || new Date().toISOString();
        this.updated_at = data.updated_at || data.updatedAt || new Date().toISOString();
    }

    /**
     * Get Firestore instance
     */
    static getDB() {
        return getFirestore();
    }

    /**
     * Find subscription plan by ID
     * @param {string} id - Subscription plan ID
     * @returns {Promise<Subscription|null>} - Subscription object or null
     */
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('subscriptions').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new Subscription({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding subscription by ID: ${error.message}`);
        }
    }

    /**
     * Get all subscription plans
     * @param {Object} filters - Filter options (active, limit)
     * @returns {Promise<Array<Subscription>>} - Array of Subscription objects
     */
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('subscriptions');

            // Filter by active status
            if (filters.active !== undefined) {
                query = query.where('active', '==', filters.active);
            }

            // Sort by order (for display ordering) then by monthly price
            query = query.orderBy('order', 'asc').orderBy('monthly_price', 'asc');

            // Limit
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => new Subscription({ id: doc.id, ...doc.data() }));
        } catch (error) {
            // If orderBy fails (no index), fall back to simpler query
            try {
                const db = this.getDB();
                let query = db.collection('subscriptions');

                if (filters.active !== undefined) {
                    query = query.where('active', '==', filters.active);
                }

                if (filters.limit) {
                    query = query.limit(filters.limit);
                }

                const snapshot = await query.get();
                const subscriptions = snapshot.docs.map(doc => new Subscription({ id: doc.id, ...doc.data() }));

                // Sort in memory
                subscriptions.sort((a, b) => {
                    if (a.order !== b.order) {
                        return a.order - b.order;
                    }
                    return (a.monthlyPrice || 0) - (b.monthlyPrice || 0);
                });

                return subscriptions;
            } catch (fallbackError) {
                throw new Error(`Error finding all subscriptions: ${fallbackError.message}`);
            }
        }
    }

    /**
     * Create a new subscription plan
     * @param {Object} subscriptionData - Subscription plan data
     * @returns {Promise<Subscription>} - Created Subscription object
     */
    static async create(subscriptionData) {
        try {
            const db = this.getDB();

            const newSubscription = new Subscription({
                ...subscriptionData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            const docRef = await db.collection('subscriptions').add({
                name: newSubscription.name,
                description: newSubscription.description,
                monthly_price: newSubscription.monthly_price,
                monthlyPrice: newSubscription.monthlyPrice,
                annual_price: newSubscription.annual_price,
                annualPrice: newSubscription.annualPrice,
                features: newSubscription.features,
                max_courses: newSubscription.max_courses,
                maxCourses: newSubscription.maxCourses,
                is_popular: newSubscription.is_popular,
                isPopular: newSubscription.isPopular,
                order: newSubscription.order,
                active: newSubscription.active,
                created_at: newSubscription.created_at,
                createdAt: newSubscription.createdAt,
                updated_at: newSubscription.updated_at,
                updatedAt: newSubscription.updatedAt
            });

            newSubscription.id = docRef.id;
            return newSubscription;
        } catch (error) {
            throw new Error(`Error creating subscription: ${error.message}`);
        }
    }

    /**
     * Update subscription plan
     * @param {string} id - Subscription plan ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Subscription>} - Updated Subscription object
     */
    static async update(id, updateData) {
        try {
            const db = this.getDB();
            const subscriptionRef = db.collection('subscriptions').doc(id);
            const doc = await subscriptionRef.get();

            if (!doc.exists) {
                throw new Error('Subscription plan not found');
            }

            updateData.updated_at = new Date().toISOString();
            updateData.updatedAt = new Date().toISOString();

            await subscriptionRef.update(updateData);

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating subscription: ${error.message}`);
        }
    }

    /**
     * Delete subscription plan
     * @param {string} id - Subscription plan ID
     * @returns {Promise<boolean>} - true if successful
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('subscriptions').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting subscription: ${error.message}`);
        }
    }

    /**
     * Get popular subscription plans
     * @returns {Promise<Array<Subscription>>} - Array of popular Subscription objects
     */
    static async getPopular() {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('subscriptions')
                .where('active', '==', true)
                .where('is_popular', '==', true)
                .get();

            return snapshot.docs.map(doc => new Subscription({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error getting popular subscriptions: ${error.message}`);
        }
    }

    /**
     * Convert to JSON
     * @returns {Object} - Subscription object
     */
    toJSON() {
        return { ...this };
    }
}

module.exports = Subscription;
