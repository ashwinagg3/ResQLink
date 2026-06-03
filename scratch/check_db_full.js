const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/emergency_contact_system';

const userSchema = new mongoose.Schema({ username: String });
const alertSchema = new mongoose.Schema({ username: String, message: String, timestamp: Date });

const User = mongoose.model('User', userSchema);
const Alert = mongoose.model('Alert', alertSchema);

async function checkDB() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({});
        const alerts = await Alert.find({});
        console.log('Users:', users.map(u => u.username));
        console.log('Alert Count:', alerts.length);
        console.log('Last 5 Alerts:', JSON.stringify(alerts.slice(-5), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
