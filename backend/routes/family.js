const express = require('express');
const router = express.Router();
const Family = require('../models/Family');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Create a family
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const family = new Family({
            name,
            inviteCode,
            head: req.user.userId,
            members: [req.user.userId]
        });
        
        await family.save();
        res.status(201).json(family);
    } catch (err) {
        res.status(500).json({ message: 'Error creating family' });
    }
});

// Join a family
router.post('/join', authenticateToken, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const family = await Family.findOne({ inviteCode });
        
        if (!family) return res.status(404).json({ message: 'Invalid invite code' });
        
        if (family.members.includes(req.user.userId)) {
            return res.status(400).json({ message: 'Already a member' });
        }
        
        family.members.push(req.user.userId);
        await family.save();
        res.json(family);
    } catch (err) {
        res.status(500).json({ message: 'Error joining family' });
    }
});

// Get family members and their data
router.get('/members', authenticateToken, async (req, res) => {
    try {
        const family = await Family.findOne({ members: req.user.userId })
            .populate('members', 'username fullName phone bloodGroup');
        
        if (!family) return res.status(404).json({ message: 'No family found' });
        
        res.json({
            id: family._id,
            name: family.name,
            inviteCode: family.inviteCode,
            head: family.head,
            members: family.members
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching family members' });
    }
});

// Remove a member (Head only)
router.post('/remove-member', authenticateToken, async (req, res) => {
    try {
        const { userIdToRemove } = req.body;
        const family = await Family.findOne({ head: req.user.userId });
        
        if (!family) return res.status(403).json({ message: 'Only family head can remove members' });
        
        family.members = family.members.filter(id => id.toString() !== userIdToRemove);
        await family.save();
        res.json({ message: 'Member removed' });
    } catch (err) {
        res.status(500).json({ message: 'Error removing member' });
    }
});

// Leave family
router.post('/leave', authenticateToken, async (req, res) => {
    try {
        const family = await Family.findOne({ members: req.user.userId });
        if (!family) return res.status(404).json({ message: 'No family found' });
        
        if (family.head.toString() === req.user.userId) {
            return res.status(400).json({ message: 'Head cannot leave. Delete family instead.' });
        }
        
        family.members = family.members.filter(id => id.toString() !== req.user.userId);
        await family.save();
        res.json({ message: 'Left family' });
    } catch (err) {
        res.status(500).json({ message: 'Error leaving family' });
    }
});

module.exports = router;
