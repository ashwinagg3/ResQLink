const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { authenticateToken } = require('../middleware/auth');

// Get all contacts for a user (Protected)
router.get('/:username', authenticateToken, async (req, res) => {
    try {
        // Only allow user to fetch their own contacts
        if (req.user.username !== req.params.username.toLowerCase()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const contacts = await Contact.find({ username: req.params.username.toLowerCase() });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts', error: error.message });
    }
});

// Add a new contact (Protected)
router.post('/', [
    authenticateToken,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('relationship').trim().notEmpty().withMessage('Relationship is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, phone, relationship } = req.body;
        const newContact = new Contact({ 
            username: req.user.username, 
            name, 
            phone, 
            relationship 
        });
        await newContact.save();
        res.status(201).json(newContact);
    } catch (error) {
        res.status(500).json({ message: 'Error adding contact', error: error.message });
    }
});

// Delete a contact (Protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Verify ownership before deleting
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Contact not found' });
        if (contact.username !== req.user.username) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await Contact.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact', error: error.message });
    }
});

module.exports = router;
