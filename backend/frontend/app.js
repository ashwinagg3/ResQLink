const API_URL = '/api';

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

// ──── Mobile Navigation Setup ────
function setupMobileNav() {
    const header = document.querySelector('header');
    const desktopNav = document.querySelector('header nav');
    const rightActions = document.querySelector('header .flex-1.flex.justify-end');
    
    if (!header || !desktopNav || !rightActions) return;

    // Create hamburger button
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'md:hidden p-2 text-slate-400 hover:text-primary transition-colors ml-2';
    mobileBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
    
    // Create mobile menu container
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col hidden items-center justify-center space-y-8 animate-in fade-in duration-300';
    mobileMenu.style.cssText = 'top: 0; left: 0; right: 0; bottom: 0;';
    
    // Clone links from desktop nav
    const linksHtml = Array.from(desktopNav.children).map(link => {
        const a = link.cloneNode(true);
        a.className = 'text-xl font-black uppercase tracking-widest text-on-surface hover:text-primary transition-colors block text-center';
        return a.outerHTML;
    }).join('');
    
    mobileMenu.innerHTML = `
        <button class="absolute top-6 right-8 p-2 text-slate-400 hover:text-primary transition-colors" id="closeMobileMenuBtn">
            <span class="material-symbols-outlined text-4xl">close</span>
        </button>
        <div class="text-3xl font-black tracking-tighter text-primary mb-6 cursor-pointer" onclick="window.location.href='dashboard.html'">ResQLink</div>
        <div class="flex flex-col gap-6 w-full px-12">
            ${linksHtml}
        </div>
    `;

    document.body.appendChild(mobileMenu);
    rightActions.appendChild(mobileBtn);

    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
    });

    mobileMenu.querySelector('#closeMobileMenuBtn').addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
    
    // Also close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// ──── Initialize on every page ────
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    resetSessionTimer();
    setupMobileNav();
});
