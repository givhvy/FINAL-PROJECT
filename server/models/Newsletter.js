const { getFirestore } = require('firebase-admin/firestore');

/**
 * Newsletter Model
 * Handles all newsletter subscriber operations in Firestore
 */
class Newsletter {
    constructor(data) {
        this.id = data.id || null;
        this.email = data.email;
        this.active = data.active !== undefined ? data.active : true;

        this.subscribedAt = data.subscribedAt || data.subscribed_at || new Date().toISOString();
        this.subscribed_at = data.subscribed_at || data.subscribedAt || new Date().toISOString();

        this.unsubscribedAt = data.unsubscribedAt || data.unsubscribed_at || null;
        this.unsubscribed_at = data.unsubscribed_at || data.unsubscribedAt || null;
    }

    /**
     * Get Firestore instance
     */
    static getDB() {
        return getFirestore();
    }

    /**
     * Find subscriber by ID
     * @param {string} id - Subscriber ID
     * @returns {Promise<Newsletter|null>} - Newsletter object or null
     */
    static async findById(id) {
        try {
            const db = this.getDB();
            const doc = await db.collection('newsletter_subscribers').doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return new Newsletter({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding subscriber by ID: ${error.message}`);
        }
    }

    /**
     * Find subscriber by email
     * @param {string} email - Email address
     * @returns {Promise<Newsletter|null>} - Newsletter object or null
     */
    static async findByEmail(email) {
        try {
            const db = this.getDB();
            const snapshot = await db.collection('newsletter_subscribers')
                .where('email', '==', email)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return new Newsletter({ id: doc.id, ...doc.data() });
        } catch (error) {
            throw new Error(`Error finding subscriber by email: ${error.message}`);
        }
    }

    /**
     * Get all subscribers
     * @param {Object} filters - Filter options (active, limit)
     * @returns {Promise<Array<Newsletter>>} - Array of Newsletter objects
     */
    static async findAll(filters = {}) {
        try {
            const db = this.getDB();
            let query = db.collection('newsletter_subscribers');

            // Filter by active status
            if (filters.active !== undefined) {
                query = query.where('active', '==', filters.active);
            }

            // Sort by subscribed date
            query = query.orderBy('subscribed_at', 'desc');

            // Limit
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => new Newsletter({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw new Error(`Error finding all subscribers: ${error.message}`);
        }
    }

    /**
     * Subscribe to newsletter
     * @param {string} email - Email address
     * @returns {Promise<Newsletter>} - Newsletter object
     */
    static async subscribe(email) {
        try {
            const db = this.getDB();

            // Check if email already exists
            const existingSubscriber = await this.findByEmail(email);

            if (existingSubscriber) {
                // If exists but inactive, reactivate
                if (!existingSubscriber.active) {
                    const updatedSubscriber = await this.reactivate(existingSubscriber.id);
                    return updatedSubscriber;
                }
                // If already active, return existing
                return existingSubscriber;
            }

            // Create new subscriber
            const newSubscriber = new Newsletter({
                email,
                active: true,
                subscribedAt: new Date().toISOString(),
                subscribed_at: new Date().toISOString()
            });

            const docRef = await db.collection('newsletter_subscribers').add({
                email: newSubscriber.email,
                active: newSubscriber.active,
                subscribed_at: newSubscriber.subscribed_at
            });

            newSubscriber.id = docRef.id;
            return newSubscriber;
        } catch (error) {
            throw new Error(`Error subscribing to newsletter: ${error.message}`);
        }
    }

    /**
     * Unsubscribe from newsletter
     * @param {string} email - Email address
     * @returns {Promise<Newsletter|null>} - Updated Newsletter object or null
     */
    static async unsubscribe(email) {
        try {
            const db = this.getDB();
            const subscriber = await this.findByEmail(email);

            if (!subscriber) {
                return null;
            }

            const subscriberRef = db.collection('newsletter_subscribers').doc(subscriber.id);
            await subscriberRef.update({
                active: false,
                unsubscribed_at: new Date().toISOString()
            });

            return await this.findById(subscriber.id);
        } catch (error) {
            throw new Error(`Error unsubscribing from newsletter: ${error.message}`);
        }
    }

    /**
     * Reactivate subscription
     * @param {string} id - Subscriber ID
     * @returns {Promise<Newsletter>} - Updated Newsletter object
     */
    static async reactivate(id) {
        try {
            const db = this.getDB();
            const subscriberRef = db.collection('newsletter_subscribers').doc(id);
            const doc = await subscriberRef.get();

            if (!doc.exists) {
                throw new Error('Subscriber not found');
            }

            await subscriberRef.update({
                active: true,
                subscribed_at: new Date().toISOString(),
                unsubscribed_at: null
            });

            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error reactivating subscription: ${error.message}`);
        }
    }

    /**
     * Check if email is subscribed
     * @param {string} email - Email address
     * @returns {Promise<boolean>} - true if subscribed and active
     */
    static async isSubscribed(email) {
        try {
            const subscriber = await this.findByEmail(email);
            return subscriber && subscriber.active;
        } catch (error) {
            throw new Error(`Error checking subscription status: ${error.message}`);
        }
    }

    /**
     * Delete subscriber
     * @param {string} id - Subscriber ID
     * @returns {Promise<boolean>} - true if successful
     */
    static async delete(id) {
        try {
            const db = this.getDB();
            await db.collection('newsletter_subscribers').doc(id).delete();
            return true;
        } catch (error) {
            throw new Error(`Error deleting subscriber: ${error.message}`);
        }
    }

    /**
     * Get subscriber count
     * @param {boolean} activeOnly - Count only active subscribers
     * @returns {Promise<number>} - Total count
     */
    static async count(activeOnly = true) {
        try {
            const db = this.getDB();
            let query = db.collection('newsletter_subscribers');

            if (activeOnly) {
                query = query.where('active', '==', true);
            }

            const snapshot = await query.get();
            return snapshot.size;
        } catch (error) {
            throw new Error(`Error counting subscribers: ${error.message}`);
        }
    }

    /**
     * Convert to JSON
     * @returns {Object} - Newsletter object
     */
    toJSON() {
        return { ...this };
    }
}

module.exports = Newsletter;
