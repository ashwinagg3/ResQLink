const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'resqlink_emergency_jwt_secret_2026';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { username, id }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
}

module.exports = { authenticateToken, JWT_SECRET };
