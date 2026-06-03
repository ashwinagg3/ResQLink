const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Contact = require('../models/Contact');
const { authenticateToken } = require('../middleware/auth');

// Get all conversations for the current user (Protected)
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        
        // Get unique conversation partners
        const messages = await Message.aggregate([
            { $match: { $or: [{ sender: username }, { receiver: username }] } },
            { $sort: { timestamp: -1 } },
            { $group: {
                _id: { $cond: [{ $eq: ['$sender', username] }, '$receiver', '$sender'] },
                lastMessage: { $first: '$content' },
                lastTimestamp: { $first: '$timestamp' },
                unreadCount: { 
                    $sum: { $cond: [{ $and: [{ $eq: ['$receiver', username] }, { $eq: ['$read', false] }] }, 1, 0] }
                }
            }},
            { $sort: { lastTimestamp: -1 } }
        ]);

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations', error: error.message });
    }
});

// Get messages between current user and another user (Protected)
router.get('/:contactUsername', authenticateToken, async (req, res) => {
    try {
        const username = req.user.username;
        const contactUsername = req.params.contactUsername.toLowerCase();

        const messages = await Message.find({
            $or: [
                { sender: username, receiver: contactUsername },
                { sender: contactUsername, receiver: username }
            ]
        }).sort({ timestamp: 1 }).limit(100);

        // Mark messages as read
        await Message.updateMany(
            { sender: contactUsername, receiver: username, read: false },
            { $set: { read: true } }
        );

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
});

// Send a message (Protected)
router.post('/', [
    authenticateToken,
    body('receiver').trim().notEmpty().withMessage('Receiver is required'),
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { receiver, content } = req.body;
        const newMessage = new Message({
            sender: req.user.username,
            receiver: receiver.toLowerCase(),
            content
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
});

// Get unread message count (Protected)
router.get('/unread/count', authenticateToken, async (req, res) => {
    try {
        const count = await Message.countDocuments({ 
            receiver: req.user.username, 
            read: false 
        });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unread count', error: error.message });
    }
});

module.exports = router;
