const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const habitsRoutes = require('./routes/habits.routes');
const pomodoroRoutes = require('./routes/pomodoro.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for root and undefined routes (SPA-like behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Get local IP address
function getLocalIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        console.log('✓ Database initialized');

        app.listen(PORT, '0.0.0.0', () => {
            const localIP = getLocalIP();
            console.log('\n🚀 Praxis server running!');
            console.log(`📍 Local:   http://localhost:${PORT}`);
            console.log(`📍 Network: http://${localIP}:${PORT}`);
            console.log(`📊 API:     http://localhost:${PORT}/api`);
            console.log('\n💡 To access from mobile:');
            console.log(`   1. Connect phone to same WiFi`);
            console.log(`   2. Open: http://${localIP}:${PORT}`);
            console.log('\nPress Ctrl+C to stop\n');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
