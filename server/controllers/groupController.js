const Group = require('../models/Group'); // xài  class Group nằm trong thư mục models/Group.js

// Create a new study group (Teachers only)
exports.createStudyGroup = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.name || !req.body.description) {
            return res.status(400).json({ error: 'Name and description are required.' });
        }

        if (!req.body.teacher_id) {
            return res.status(400).json({ error: 'Teacher ID is required.' });
        }

        const group = await Group.create({
            name: req.body.name,
            description: req.body.description,
            subject: req.body.subject,
            teacher_id: req.body.teacher_id
        });

        res.status(201).json(group);
    } catch (err) {
        console.error('Create Study Group Error:', err);
        if (err.message.includes('required') || err.message.includes('must be')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to create study group.', details: err.message });
    }
};

// Get all study groups
exports.getStudyGroups = async (req, res) => { // sử dụng routes
    try {
        const groups = await Group.getAllActive();
        res.status(200).json(groups);
    } catch (err) {
        console.error('Get Study Groups Error:', err);
        res.status(500).json({ error: 'Failed to fetch study groups.' });
    }
};

// Get single study group by ID
exports.getStudyGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);
        res.status(200).json(group);
    } catch (err) {
        console.error('Get Study Group By ID Error:', err);
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to fetch study group.' });
    }
};

// Join a study group
exports.joinStudyGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        const member = await Group.addMember(groupId, user_id);
        res.status(201).json(member);
    } catch (err) {
        console.error('Join Study Group Error:', err);
        if (err.message.includes('already a member')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to join study group.' });
    }
};

// Get user's study groups
exports.getUserStudyGroups = async (req, res) => {
    try {
        const { userId } = req.params;
        const groups = await Group.findByUser(userId);
        res.status(200).json(groups);
    } catch (err) {
        console.error('Get User Study Groups Error:', err);
        res.status(500).json({ error: 'Failed to fetch user study groups.' });
    }
};

// Update study group (Teachers only)
exports.updateStudyGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const updatedGroup = await Group.update(groupId, req.body);
        res.status(200).json(updatedGroup);
    } catch (err) {
        console.error('Update Study Group Error:', err);
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to update study group.' });
    }
};

// Delete a study group (Teachers only)
exports.deleteStudyGroup = async (req, res) => { // sử dụng routes
    try {
        const { groupId } = req.params;
        await Group.delete(groupId);
        res.status(200).json({ message: 'Study group deleted successfully.' });
    } catch (err) {
        console.error('Delete Study Group Error:', err);
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to delete study group.' });
    }
};

module.exports = exports;
