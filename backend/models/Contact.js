const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true }
});

module.exports = mongoose.model('Contact', contactSchema);
