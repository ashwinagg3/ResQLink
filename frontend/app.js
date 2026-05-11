const API_URL = 'http://localhost:5000/api';

// ──── Token Management ────
function getToken() {
    return localStorage.getItem('token');
}

function getUsername() {
    return localStorage.getItem('username');
}

function setSession(username, token, userId) {
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);
    if (userId) localStorage.setItem('userId', userId);
}

function clearSession() {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
}

// ──── Auth Protection ────
function checkAuth() {
    const token = getToken();
    const currentPage = window.location.pathname;
    const publicPages = ['/login.html', '/register.html', '/index.html', '/'];
    
    const isPublic = publicPages.some(p => currentPage.endsWith(p));
    
    if (!token && !isPublic) {
        window.location.href = 'login.html';
    }
}

// ──── Global Logout ────
function logout() {
    clearSession();
    window.location.href = 'login.html';
}

// ──── API Helper with JWT ────
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    // Attach JWT token if available
    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
        console.log('API Request Body:', options.body);
    }

    try {
        console.log(`API Call: ${method} ${API_URL}${endpoint}`);
        const response = await fetch(`${API_URL}${endpoint}`, options);
        console.log(`API Response: ${response.status} ${response.statusText}`);
        
        // Handle token expiry
        if (response.status === 401 || response.status === 403) {
            const result = await response.json();
            if (result.message && (result.message.includes('expired') || result.message.includes('Access denied'))) {
                clearSession();
                window.location.href = 'login.html';
                return { message: 'Session expired. Please login again.' };
            }
            return result;
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Network connection error', 'error');
        return { message: 'Network error' };
    }
}

// ──── Input Sanitization ────
function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ──── Toast Notification System ────
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.getElementById('globalNotification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'globalNotification';
    notification.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
        background: ${type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#0f172a'};
        color: white; padding: 16px 32px; border-radius: 20px;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
        font-weight: 800; font-size: 12px; text-transform: uppercase;
        letter-spacing: 0.15em; z-index: 10000;
        display: flex; align-items: center; gap: 12px;
        animation: slideUpNotif 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        font-family: 'Inter', sans-serif;
    `;

    const icon = type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'check_circle';
    const iconColor = type === 'error' ? '#fca5a5' : type === 'warning' ? '#fde68a' : '#86efac';
    notification.innerHTML = `<span class="material-symbols-outlined" style="color:${iconColor};font-size:20px">${icon}</span>${sanitizeHTML(message)}`;

    // Add animation styles if not present
    if (!document.getElementById('notifStyles')) {
        const style = document.createElement('style');
        style.id = 'notifStyles';
        style.textContent = `
            @keyframes slideUpNotif { from { transform: translateX(-50%) translateY(40px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
            @keyframes slideDownNotif { from { transform: translateX(-50%) translateY(0); opacity: 1; } to { transform: translateX(-50%) translateY(40px); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideDownNotif 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ──── Session Timeout (auto-logout after inactivity) ────
let sessionTimer;
function resetSessionTimer() {
    clearTimeout(sessionTimer);
    if (getToken()) {
        sessionTimer = setTimeout(() => {
            showNotification('Session timed out due to inactivity', 'warning');
            setTimeout(() => logout(), 2000);
        }, 30 * 60 * 1000); // 30 minutes
    }
}

// Track user activity
['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, resetSessionTimer, { passive: true });
});

// ──── Initialize on every page ────
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    resetSessionTimer();
});
