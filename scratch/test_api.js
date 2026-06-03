const axios = require('axios');

async function testAlert() {
    try {
        const login = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = login.data.token;
        console.log('Logged in, token received');

        const trigger = await axios.post('http://localhost:5000/api/alerts/trigger', 
            { message: 'TEST SOS FROM SCRIPT', location: { lat: 12.3, lng: 45.6 } },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Trigger Response:', trigger.data);

        const history = await axios.get('http://localhost:5000/api/alerts/history',
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('History Count:', history.data.length);
        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err.response ? err.response.data : err.message);
        process.exit(1);
    }
}

testAlert();
