// ============================================================================
// GroupMessage.js - Model TIN NHẮN NHÓM (group_messages collection)
// ============================================================================
// Đây là MODEL CLASS định nghĩa cấu trúc và các thao tác với group messages (forum/chat)
//
// 6 STATIC METHODS: create, createWithUser (auto populate user), findByGroup (+ populate),
// delete, deleteByGroup (batch), validate

const { getFirestore } = require('firebase-admin/firestore');
const { getDocOrThrow, ValidationError } = require('../utils/firebaseHelpers');

class GroupMessage {
    static getDB() {
        return getFirestore();
    }

    /**
     * Create a new group message (checkpoint, )
     */
    static async create(messageData) {
        this.validate(messageData);

        const db = this.getDB();
        const messageRef = db.collection('group_messages').doc();
        const message = {
            group_id: messageData.group_id,
            user_id: messageData.user_id,
            message: messageData.message,
            created_at: new Date().toISOString(),
            message_type: messageData.message_type || 'text'
        };

        await messageRef.set(message);

        return {
            id: messageRef.id,
            ...message
        };
    }

    /**
     * Get all messages for a group with user information
     */
    static async findByGroup(groupId) {
        const db = this.getDB();
        const User = require('./User');

        // Get all messages and filter in JavaScript to avoid index requirement
        const messagesSnapshot = await db.collection('group_messages').get();

        // Filter messages for this group
        const groupMessages = messagesSnapshot.docs.filter(doc => doc.data().group_id === groupId);

        const messages = await Promise.all(groupMessages.map(async (messageDoc) => {
            const messageData = messageDoc.data();

            // Get user information
            let userData = null;
            if (messageData.user_id) {
                try {
                    userData = await User.findById(messageData.user_id);
                } catch (err) {
                    // User not found, skip
                }
            }

            return {
                id: messageDoc.id,
                ...messageData,
                user: userData
            };
        }));

        // Sort messages by created_at in JavaScript instead of Firestore
        messages.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateA - dateB;
        });

        return messages;
    }

    /**
     * Create message with user info returned
     */
    static async createWithUser(messageData) {
        const db = this.getDB();
        const User = require('./User');

        const message = await this.create(messageData);

        // Get user info for response
        let userData = null;
        if (messageData.user_id) {
            try {
                userData = await User.findById(messageData.user_id);
            } catch (err) {
                // User not found, skip
            }
        }

        return {
            ...message,
            user: userData
        };
    }

    /**
     * Delete a message
     */
    static async delete(messageId) {
        const db = this.getDB();
        await db.collection('group_messages').doc(messageId).delete();
    }

    /**
     * Delete all messages for a group (used when deleting group)
     */
    static async deleteByGroup(groupId) {
        const db = this.getDB();
        const messagesQuery = db.collection('group_messages').where('group_id', '==', groupId);
        const messagesSnapshot = await messagesQuery.get();

        const batch = db.batch();
        messagesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    }

    /**
     * Validate message data
     */
    static validate(data) {
        if (!data.group_id) {
            throw new ValidationError('Group ID is required');
        }

        if (!data.user_id) {
            throw new ValidationError('User ID is required');
        }

        if (!data.message || data.message.trim().length === 0) {
            throw new ValidationError('Message cannot be empty');
        }
    }
}

module.exports = GroupMessage;

// ============================================================================
// TÓM TẮT: Model quản lý group messages với user population và sorting
// KEY: db.collection('group_messages'), findByGroup() filters in memory to avoid index,
// sort by created_at in JS, createWithUser() returns message + user data immediately
// ============================================================================
