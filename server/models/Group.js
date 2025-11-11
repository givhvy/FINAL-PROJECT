const { getFirestore } = require('firebase-admin/firestore');
const { getDocOrThrow, ValidationError } = require('../utils/firebaseHelpers');

class Group {
    static getDB() {
        return getFirestore();
    }

    /**
     * Create a new study group
     */
    static async create(groupData) {
        this.validate(groupData);

        const db = this.getDB();
        const groupRef = db.collection('study_groups').doc();
        const group = {
            name: groupData.name,
            description: groupData.description,
            subject: groupData.subject || 'General',
            teacher_id: groupData.teacher_id,
            created_at: new Date().toISOString(),
            member_count: 0,
            status: 'active'
        };

        await groupRef.set(group);

        return {
            id: groupRef.id,
            ...group
        };
    }

    /**
     * Find group by ID
     */
    static async findById(groupId) {
        return await getDocOrThrow('study_groups', groupId, 'Study group not found');
    }

    /**
     * Get all active study groups with teacher info and member count
     */
    static async getAllActive() {
        const db = this.getDB();
        const User = require('./User');

        const groupsSnapshot = await db.collection('study_groups')
            .where('status', '==', 'active')
            .get();

        const groups = await Promise.all(groupsSnapshot.docs.map(async (groupDoc) => {
            const groupData = groupDoc.data();

            // Get teacher information
            let teacherData = null;
            if (groupData.teacher_id) {
                try {
                    teacherData = await User.findById(groupData.teacher_id);
                } catch (err) {
                    // Teacher not found, skip
                }
            }

            // Get member count
            const memberCount = await this.getMemberCount(groupDoc.id);

            return {
                id: groupDoc.id,
                ...groupData,
                teacher: teacherData,
                member_count: memberCount
            };
        }));

        return groups;
    }

    /**
     * Get user's study groups (checkpoint)
     */
    static async findByUser(userId) {
        const db = this.getDB();
        const User = require('./User');

        // Get groups where user is a member
        const membersQuery = db.collection('group_members').where('user_id', '==', userId);
        const membersSnapshot = await membersQuery.get();

        const groupIds = membersSnapshot.docs.map(doc => doc.data().group_id);

        if (groupIds.length === 0) {
            return [];
        }

        // Get group details
        const groups = [];
        for (const groupId of groupIds) {
            try {
                const groupData = await this.findById(groupId);

                // Get teacher info
                let teacherData = null;
                if (groupData.teacher_id) {
                    try {
                        teacherData = await User.findById(groupData.teacher_id);
                    } catch (err) {
                        // Teacher not found, skip
                    }
                }

                groups.push({
                    id: groupId,
                    ...groupData,
                    teacher: teacherData
                });
            } catch (err) {
                // Group not found, skip
            }
        }

        return groups;
    }

    /**
     * Add user to group
     */
    static async addMember(groupId, userId) {
        const db = this.getDB();

        // Check if user is already a member
        const existingMember = await db.collection('group_members')
            .where('group_id', '==', groupId)
            .where('user_id', '==', userId)
            .get();

        if (!existingMember.empty) {
            throw new ValidationError('User is already a member of this group');
        }

        // Add user to group (create in crud)
        const memberData = {
            group_id: groupId,
            user_id: userId,
            joined_at: new Date().toISOString(),
            role: 'member'
        };

        const newMemberRef = await db.collection('group_members').add(memberData);

        return {
            id: newMemberRef.id,
            ...memberData
        };
    }

    /**
     * Get member count for a group
     */
    static async getMemberCount(groupId) {
        const db = this.getDB();
        const membersQuery = db.collection('group_members').where('group_id', '==', groupId);
        const membersSnapshot = await membersQuery.get();
        return membersSnapshot.size;
    }

    /**
     * Delete a study group and all related data
     */
    static async delete(groupId) {
        const db = this.getDB();

        // Check if group exists
        const groupRef = db.collection('study_groups').doc(groupId);
        const groupSnap = await groupRef.get();

        if (!groupSnap.exists) {
            throw new ValidationError('Study group not found');
        }

        // Delete group members first
        const membersQuery = db.collection('group_members').where('group_id', '==', groupId);
        const membersSnapshot = await membersQuery.get();

        const batch = db.batch();
        membersSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete group messages
        const messagesQuery = db.collection('group_messages').where('group_id', '==', groupId);
        const messagesSnapshot = await messagesQuery.get();
        messagesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete the group itself
        batch.delete(groupRef);

        await batch.commit();
    }

    /**
     * Update group information
     */
    static async update(groupId, updateData) {
        const db = this.getDB();

        // Remove fields that shouldn't be updated
        delete updateData.created_at;
        delete updateData.teacher_id;
        delete updateData.member_count;

        await db.collection('study_groups').doc(groupId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return await this.findById(groupId);
    }

    /**
     * Validate group data (kiểm tra input vào từ bên form)
     */
    static validate(data) {
        if (!data.name || data.name.length < 3) {
            throw new ValidationError('Group name must be at least 3 characters');
        }

        if (!data.description) {
            throw new ValidationError('Description is required');
        }

        if (!data.teacher_id) {
            throw new ValidationError('Teacher ID is required');
        }
    }
}

module.exports = Group;
