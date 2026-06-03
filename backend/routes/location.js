const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const Family = require('../models/Family');
const { authenticateToken } = require('../middleware/auth');

// Update user location
router.post('/update', authenticateToken, async (req, res) => {
    try {
        const { latitude, longitude, isSOS } = req.body;
        
        const location = await Location.findOneAndUpdate(
            { userId: req.user.id },
            { 
                latitude, 
                longitude, 
                isSOS: isSOS || false,
                isSharing: true,          // always broadcast to family
                timestamp: new Date(),
                username: req.user.username 
            },
            { upsert: true, new: true }
        );
        
        res.json(location);
    } catch (err) {
        res.status(500).json({ message: 'Error updating location' });
    }
});

// Get family locations
router.get('/family', authenticateToken, async (req, res) => {
    try {
        const family = await Family.findOne({ members: req.user.id });
        if (!family) return res.status(404).json({ message: 'No family found' });
        
        const locations = await Location.find({ 
            userId: { $in: family.members },
            isSharing: true 
        });
        
        res.json(locations);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching family locations' });
    }
});

// Toggle location sharing
router.post('/toggle', authenticateToken, async (req, res) => {
    try {
        const { isSharing } = req.body;
        await Location.findOneAndUpdate(
            { userId: req.user.id },
            { isSharing },
            { upsert: true }
        );
        res.json({ message: `Location sharing ${isSharing ? 'enabled' : 'disabled'}` });
    } catch (err) {
        res.status(500).json({ message: 'Error toggling location' });
    }
});

module.exports = router;
