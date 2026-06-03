require("dotenv").config();
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
const testSmsRoutes = require('./routes/testSms');

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
app.use('/api/test-sms', testSmsRoutes);

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

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/emergency_contact_system';

async function seedAdmin() {
    try {
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
    } catch (err) {
        console.error('Error seeding admin user:', err);
    }
}

async function connectDB() {
    try {
        console.log(`Connecting to database at ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        console.log('Connected to local MongoDB');
        await seedAdmin();
    } catch (err) {
        if (process.env.MONGODB_URI || process.env.NODE_ENV === 'production') {
            console.error('Production MongoDB connection failed. Exiting to prevent data loss:', err);
            process.exit(1);
        }
        console.warn('Local MongoDB not available. Launching In-Memory Fallback Database...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            console.log(`In-Memory MongoDB started at: ${memoryUri}`);
            
            await mongoose.connect(memoryUri);
            console.log('Connected to In-Memory MongoDB');
            await seedAdmin();
        } catch (memErr) {
            console.error('Failed to start In-Memory MongoDB:', memErr);
        }
    }
}

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
