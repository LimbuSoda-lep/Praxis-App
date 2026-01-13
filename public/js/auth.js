// API Base URL
const API_BASE = window.location.origin + '/api';

// Get auth token
function getToken() {
    return localStorage.getItem('praxis_token');
}

// Set auth token
function setToken(token) {
    localStorage.setItem('praxis_token', token);
}

// Remove auth token
function removeToken() {
    localStorage.removeItem('praxis_token');
}

// Get user data
function getUser() {
    const userStr = localStorage.getItem('praxis_user');
    return userStr ? JSON.parse(userStr) : null;
}

// Set user data
function setUser(user) {
    localStorage.setItem('praxis_user', JSON.stringify(user));
}

// Remove user data
function removeUser() {
    localStorage.removeItem('praxis_user');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Logout
function logout() {
    removeToken();
    removeUser();
    window.location.href = '/login.html';
}

// Protect pages (redirect to login if not authenticated)
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Redirect if  already authenticated
function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = '/dashboard.html';
    }
}

// API call wrapper
async function apiCall(endpoint, options = {}) {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
    };

    console.log(`🌐 API Call: ${options.method || 'GET'} ${endpoint}`);

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            console.error(`❌ API Error:`, {
                status: response.status,
                endpoint: endpoint,
                error: data.error || data.message,
                data: data
            });

            // Handle authentication errors
            if (response.status === 401 || response.status === 403) {
                console.warn('🔒 Authentication failed - redirecting to login');
                removeToken();
                removeUser();
                window.location.href = '/login.html';
            }
            throw new Error(data.error || 'Request failed');
        }

        console.log('✅ API Success:', endpoint);
        return data;
    } catch (error) {
        console.error('💥 API Error:', error);
        throw error;
    }
}

// Export for use in other files
window.auth = {
    getToken,
    setToken,
    removeToken,
    getUser,
    setUser,
    removeUser,
    isAuthenticated,
    logout,
    requireAuth,
    redirectIfAuthenticated,
};

window.api = { apiCall };
