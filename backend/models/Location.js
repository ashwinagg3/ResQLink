const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    username: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    isSharing: { type: Boolean, default: true },
    isSOS: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
