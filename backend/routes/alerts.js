const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const { authenticateToken } = require('../middleware/auth');

// Get alert history for the current user (Protected)
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const alerts = await Alert.find({ username: req.user.username })
            .sort({ timestamp: -1 })
            .limit(50);
        console.log(`Fetched ${alerts.length} alerts for user: ${req.user.username}`);
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alerts', error: error.message });
    }
});

// Get alert history for a specific user (Protected)
router.get('/:username', authenticateToken, async (req, res) => {
    try {
        if (req.user.username !== req.params.username.toLowerCase()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const alerts = await Alert.find({ username: req.params.username.toLowerCase() })
            .sort({ timestamp: -1 })
            .limit(50);
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alerts', error: error.message });
    }
});

// Trigger a new SOS alert (Protected)
router.post('/trigger', [
    authenticateToken,
    body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { message, contactsNotified, location } = req.body;
        
        // If contactsNotified is not provided, fetch them from the Contact model
        let notified = contactsNotified;
        if (!notified || notified.length === 0) {
            const Contact = require('../models/Contact');
            const contacts = await Contact.find({ username: req.user.username });
            notified = contacts.map(c => c.name);
        }

        const newAlert = new Alert({ 
            username: req.user.username, 
            message, 
            contactsNotified: notified,
            location: location || { lat: null, lng: null, address: 'Location unavailable' }
        });
        console.log('Attempting to save alert:', newAlert);
        await newAlert.save();
        console.log('Alert saved successfully');
        res.status(201).json(newAlert);
    } catch (error) {
        res.status(500).json({ message: 'Error triggering alert', error: error.message });
    }
});

// Deactivate SOS (Protected)
router.post('/deactivate', authenticateToken, async (req, res) => {
    res.status(200).json({ message: 'Alert system deactivated' });
});

// Save a new SOS alert - Legacy/Direct (Protected)
router.post('/', [
    authenticateToken,
    body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
    // Redirect to trigger logic
    const { message, contactsNotified, location } = req.body;
    try {
        const newAlert = new Alert({ 
            username: req.user.username, 
            message, 
            contactsNotified: contactsNotified || [],
            location: location || { lat: null, lng: null, address: 'Location unavailable' }
        });
        await newAlert.save();
        res.status(201).json(newAlert);
    } catch (error) {
        res.status(500).json({ message: 'Error saving alert', error: error.message });
    }
});

module.exports = router;
