const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/emergency_contact_system';

const alertSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: Date,
    contactsNotified: [String]
});

const Alert = mongoose.model('Alert', alertSchema);

async function checkAlerts() {
    try {
        await mongoose.connect(MONGO_URI);
        const alerts = await Alert.find({}).sort({ timestamp: -1 }).limit(10);
        console.log('Last 10 alerts in DB:');
        console.log(JSON.stringify(alerts, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAlerts();
