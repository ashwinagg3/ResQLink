async function testAlert() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error('Login failed: ' + JSON.stringify(loginData));
        console.log('Logged in, token received');

        const triggerRes = await fetch('http://localhost:5000/api/alerts/trigger', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: 'TEST SOS FROM SCRIPT', location: { lat: 12.3, lng: 45.6 } })
        });
        const triggerData = await triggerRes.json();
        console.log('Trigger Response:', triggerData);

        const historyRes = await fetch('http://localhost:5000/api/alerts/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const historyData = await historyRes.json();
        console.log('History Count:', historyData.length);
        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err.message);
        process.exit(1);
    }
}

testAlert();
