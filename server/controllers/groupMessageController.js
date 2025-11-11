const GroupMessage = require('../models/GroupMessage');

// Get forum messages for a study group
exports.getGroupMessages = async (req, res) => {
    try {
        console.log('Getting messages for group:', req.params.groupId);
        const { groupId } = req.params;

        const messages = await GroupMessage.findByGroup(groupId);

        console.log('Returning messages:', messages.length);
        res.status(200).json(messages);
    } catch (err) {
        console.error('Get Group Messages Error:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ error: 'Failed to fetch group messages.' });
    }
};

// Post a message to study group forum
exports.postGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!req.body.user_id) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        if (!req.body.message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const messageWithUser = await GroupMessage.createWithUser({
            group_id: groupId,
            user_id: req.body.user_id,
            message: req.body.message,
            message_type: req.body.message_type
        });

        res.status(201).json(messageWithUser);
    } catch (err) {
        console.error('Post Group Message Error:', err);
        if (err.message.includes('required') || err.message.includes('cannot be empty')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to post message.' });
    }
};

// Delete a message (Admin/Teacher only)
exports.deleteGroupMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        await GroupMessage.delete(messageId);
        res.status(200).json({ message: 'Message deleted successfully.' });
    } catch (err) {
        console.error('Delete Group Message Error:', err);
        res.status(500).json({ error: 'Failed to delete message.' });
    }
};

module.exports = exports;
