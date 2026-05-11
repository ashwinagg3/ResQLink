const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Input validation middleware
const registerValidation = [
    body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-30 alphanumeric characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('bloodGroup').trim().notEmpty().withMessage('Blood group is required'),
    body('address').trim().notEmpty().withMessage('Address is required')
];

const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Register
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { username, password, fullName, phone, bloodGroup, address, medicalConditions } = req.body;
        
        // Safe case-insensitive check (no regex injection)
        const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const newUser = new User({ 
            username: username.toLowerCase(), 
            password, 
            fullName, 
            phone, 
            bloodGroup, 
            address, 
            medicalConditions: medicalConditions || 'None' 
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Login
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { username, password } = req.body;

        // --- Hardcoded Admin Bypass (Access Anytime) ---
        if (username.toLowerCase() === 'admin' && password === 'admin123') {
            const adminUser = await User.findOne({ username: 'admin' });
            const token = jwt.sign(
                { username: 'admin', id: adminUser ? adminUser._id : 'admin_id_universal' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.status(200).json({ 
                message: 'Admin Access Granted', 
                username: 'admin',
                userId: adminUser ? adminUser._id : 'admin_id_universal',
                token 
            });
        }
        
        console.log(`Login attempt for: ${username}`);
        const user = await User.findOne({ 
            username: username.toLowerCase()
        });

        if (!user) {
            console.log(`User not found: ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare hashed password
        const isMatch = await user.comparePassword(password);
        console.log(`Password match for ${username}: ${isMatch}`);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { username: user.username, id: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            username: user.username,
            userId: user._id,
            token 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Get Profile (Protected)
router.get('/profile/:username', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username.toLowerCase() })
            .select('-password'); // Never send password
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update Profile (Protected)
router.put('/profile/:username', authenticateToken, async (req, res) => {
    try {
        // Only allow user to update their own profile
        if (req.user.username !== req.params.username.toLowerCase()) {
            return res.status(403).json({ message: 'Unauthorized: Cannot modify another user\'s profile' });
        }

        // Prevent updating username or password through this route
        const { username, password, _id, ...safeUpdates } = req.body;
        
        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username.toLowerCase() },
            { $set: safeUpdates },
            { new: true }
        ).select('-password');
        
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

module.exports = router;
