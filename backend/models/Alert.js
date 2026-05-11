const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    contactsNotified: [String],
    location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
        address: { type: String, default: 'Location unavailable' }
    }
});

module.exports = mongoose.model('Alert', alertSchema);
