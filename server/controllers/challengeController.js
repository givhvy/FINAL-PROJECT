const Challenge = require('../models/Challenge');

// Create a new challenge (Admin only)
exports.createChallenge = async (req, res) => {
    try {
        const challengeData = {
            ...req.body,
            created_by: req.body.created_by || req.user?.id
        };

        const challenge = await Challenge.create(challengeData);
        res.status(201).json(challenge);
    } catch (err) {
        console.error('Create Challenge Error:', err);
        if (err.message.includes('required') || err.message.includes('must be')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to create challenge.' });
    }
};

// Get all active challenges
exports.getActiveChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.getAllActive();
        res.status(200).json(challenges);
    } catch (err) {
        console.error('Get Active Challenges Error:', err);
        res.status(500).json({ error: 'Failed to fetch active challenges.' });
    }
};

// Get single challenge by ID
exports.getChallengeById = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const challenge = await Challenge.getWithDetails(challengeId);
        res.status(200).json(challenge);
    } catch (err) {
        console.error('Get Challenge By ID Error:', err);
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to fetch challenge.' });
    }
};

// Update a challenge (Admin only)
exports.updateChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const updatedChallenge = await Challenge.update(challengeId, req.body);
        res.status(200).json(updatedChallenge);
    } catch (err) {
        console.error('Update Challenge Error:', err);
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to update challenge.' });
    }
};

// Delete a challenge (Admin only)
exports.deleteChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        await Challenge.delete(challengeId);
        res.status(200).json({ message: 'Challenge deleted successfully.' });
    } catch (err) {
        console.error('Delete Challenge Error:', err);
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to delete challenge.' });
    }
};

// Join a challenge
exports.joinChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        const participant = await Challenge.addParticipant(challengeId, user_id);
        res.status(201).json(participant);
    } catch (err) {
        console.error('Join Challenge Error:', err);
        if (err.message.includes('already participating')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to join challenge.' });
    }
};

module.exports = exports;
