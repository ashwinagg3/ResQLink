const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const alertRoutes = require('./routes/alerts');
const messageRoutes = require('./routes/messages');
const familyRoutes = require('./routes/family');
const locationRoutes = require('./routes/location');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow inline scripts for frontend
}));

// Rate Limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased to accommodate polling
    message: { message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Slightly relaxed for development/testing
    message: { message: 'Too many login attempts, please try again later.' }
});

app.use(generalLimiter);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/location', locationRoutes);

// Catch-all: serve index.html for SPA-style navigation
app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } else {
        res.status(404).json({ message: 'API node not found' });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/emergency_contact_system';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        // Seed Admin User
        const User = require('./models/User');
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const adminUser = new User({
                username: 'admin',
                password: 'adminpassword', // Will be hashed by pre-save
                fullName: 'System Administrator',
                phone: '000-000-0000',
                bloodGroup: 'ROOT',
                address: 'RESLINK SECURE NODE',
                medicalConditions: 'NONE'
            });
            await adminUser.save();
            console.log('Admin account initialized: admin / adminpassword');
        }

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
