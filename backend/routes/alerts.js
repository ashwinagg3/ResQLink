const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const { authenticateToken } = require('../middleware/auth');
const { sendEmergencySMS } = require('../services/notilifyService');

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

        const User = require('../models/User');
        const Contact = require('../models/Contact');

        // Fetch User Information
        const user = await User.findOne({ username: req.user.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch User Emergency Contacts
        const contacts = await Contact.find({ username: req.user.username });

        // If contactsNotified is not provided, populate it from fetched contacts
        let notified = contactsNotified;
        if (!notified || notified.length === 0) {
            notified = contacts.map(c => c.name);
        }

        // Create Alert Record
        const newAlert = new Alert({
            username: req.user.username,
            message,
            contactsNotified: notified,
            location: location || { lat: null, lng: null, address: 'Location unavailable' }
        });

        console.log('Attempting to save alert record:', newAlert);
        await newAlert.save();
        console.log('Alert record saved successfully');

        // Resolve coordinates: Use user's most recent location available in the system
        let lat = null;
        let lng = null;
        if (location && location.lat !== undefined && location.lng !== undefined && location.lat !== null && location.lng !== null && location.lat !== 'unknown' && location.lng !== 'unknown') {
            lat = location.lat;
            lng = location.lng;
        } else {
            const LocationModel = require('../models/Location');
            const storedLoc = await LocationModel.findOne({ userId: req.user.id });
            if (storedLoc) {
                lat = storedLoc.latitude;
                lng = storedLoc.longitude;
            }
        }

        // Generate SOS Message
        const locationLink = (lat !== null && lng !== null)
            ? `https://maps.google.com/?q=${lat},${lng}`
            : 'Location unavailable';

        const formatTimestamp = (date) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            let hours = d.getHours();
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const formattedHours = String(hours).padStart(2, '0');
            return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
        };

        const medicalConditions = user.medicalConditions || 'None';

        const formattedMessage = `${user.fullName} needs immediate help | Phone: ${user.phone} | Map: ${locationLink} `;

        // Send SMS To All Contacts and Log Results
        try {
            if (contacts && contacts.length > 0) {
                await sendEmergencySMS(contacts, formattedMessage);
            } else {
                console.log('No contacts registered for this user. Skipping SMS dispatch.');
            }
        } catch (smsError) {
            console.error('SMS sending failed, but alert was successfully created:', smsError.message);
        }

        // Return Success Response
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
