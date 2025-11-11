const { getFirestore } = require('firebase-admin/firestore');
const { getDocOrThrow, ValidationError } = require('../utils/firebaseHelpers');

class Challenge {
    static getDB() {
        return getFirestore();
    }

    /**
     * Create a new challenge (C in CRUD)
     */
    static async create(challengeData) {
        this.validate(challengeData);

        const db = this.getDB();
        const challengeRef = db.collection('challenges').doc();
        const challenge = {
            ...challengeData,
            created_by: challengeData.created_by,
            created_at: new Date().toISOString(),
            status: 'active',
            participants_count: 0
        };

        await challengeRef.set(challenge);

        return {
            id: challengeRef.id,
            ...challenge
        };
    }

    /**
     * Find challenge by ID (R in CRUD)
     */
    static async findById(challengeId) {
        return await getDocOrThrow('challenges', challengeId, 'Challenge not found');
    }

    /**
     * Get all active challenges with participant counts, query nâng cao (filter + map + async)
     */
    static async getAllActive() {
        const db = this.getDB();

        const challengesSnapshot = await db.collection('challenges')
            .where('status', '==', 'active')
            .get();

        const challenges = await Promise.all(challengesSnapshot.docs.map(async (doc) => {
            const challengeData = doc.data();

            // Get participants count
            const participantsCount = await this.getParticipantsCount(doc.id);

            return {
                id: doc.id,
                ...challengeData,
                participants_count: participantsCount
            };
        }));

        return challenges;
    }

    /**
     * Get challenge by ID with participant count (no more duplicate , checkpoint)
     */
    static async getWithDetails(challengeId) {
        const db = this.getDB();

        const challengeData = await this.findById(challengeId);

        // Get participants count
        const participantsCount = await this.getParticipantsCount(challengeId);

        return {
            ...challengeData,
            participants_count: participantsCount
        };
    }

    /**
     * Get participants count for a challenge
     */
    static async getParticipantsCount(challengeId) {
        const db = this.getDB();
        const participantsQuery = db.collection('challenge_participants')
            .where('challenge_id', '==', challengeId);
        const participantsSnapshot = await participantsQuery.get();
        return participantsSnapshot.size;
    }

    /**
     * Add participant to challenge
     */
    static async addParticipant(challengeId, userId) {
        const db = this.getDB();

        // Check if user is already a participant
        const existingParticipant = await db.collection('challenge_participants')
            .where('challenge_id', '==', challengeId)
            .where('user_id', '==', userId)
            .get();

        if (!existingParticipant.empty) {
            throw new ValidationError('User is already participating in this challenge');
        }

        // Add participant
        const participantData = {
            challenge_id: challengeId,
            user_id: userId,
            joined_at: new Date().toISOString(),
            progress: 0
        };

        const newParticipantRef = await db.collection('challenge_participants').add(participantData);

        return {
            id: newParticipantRef.id,
            ...participantData
        };
    }

    /**
     * Update challenge (Update in CRUD)
     */
    static async update(challengeId, updateData) {
        const db = this.getDB();

        // Verify challenge exists
        await this.findById(challengeId);

        // Remove fields that shouldn't be updated via this endpoint
        delete updateData.created_at;
        delete updateData.created_by;
        delete updateData.participants_count;

        await db.collection('challenges').doc(challengeId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return await this.findById(challengeId);
    }

    /**
     * Delete challenge (Delete in CRUD, checkpoint)
     */
    static async delete(challengeId) {
        const db = this.getDB();

        // Verify challenge exists
        await this.findById(challengeId);

        // Delete participants first
        const participantsQuery = db.collection('challenge_participants')
            .where('challenge_id', '==', challengeId);
        const participantsSnapshot = await participantsQuery.get();

        const batch = db.batch();
        participantsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete the challenge itself
        const challengeRef = db.collection('challenges').doc(challengeId);
        batch.delete(challengeRef);

        await batch.commit();
    }

    /**
     * Validate challenge data
     */
    static validate(data) {
        if (!data.title || data.title.length < 3) {
            throw new ValidationError('Challenge title must be at least 3 characters');
        }

        if (!data.description) {
            throw new ValidationError('Description is required');
        }

        if (!data.created_by) {
            throw new ValidationError('Creator ID is required');
        }
    }
}

module.exports = Challenge;
