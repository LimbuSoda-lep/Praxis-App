const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Save completed Pomodoro session
router.post('/', async (req, res) => {
    try {
        const { habitId, taskName, duration, sessionType } = req.body;

        const result = await db.runAsync(
            `INSERT INTO pomodoro_sessions (user_id, habit_id, task_name, duration, session_type) 
       VALUES (?, ?, ?, ?, ?)`,
            [req.user.userId, habitId || null, taskName || null, duration || 25, sessionType || 'work']
        );

        const session = await db.getAsync(
            'SELECT * FROM pomodoro_sessions WHERE id = ?',
            [result.lastID]
        );

        res.status(201).json({ message: 'Pomodoro session saved', session });
    } catch (error) {
        console.error('Error saving Pomodoro session:', error);
        res.status(500).json({ error: 'Failed to save Pomodoro session' });
    }
});

// Get today's Pomodoro sessions
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const sessions = await db.allAsync(
            `SELECT ps.*, h.name as habit_name
       FROM pomodoro_sessions ps
       LEFT JOIN habits h ON ps.habit_id = h.id
       WHERE ps.user_id = ? AND DATE(ps.completed_at) = ?
       ORDER BY ps.completed_at DESC`,
            [req.user.userId, today]
        );

        const workSessions = sessions.filter(s => s.session_type === 'work');
        const totalMinutes = workSessions.reduce((sum, s) => sum + s.duration, 0);

        res.json({
            sessions,
            summary: {
                total: sessions.length,
                workSessions: workSessions.length,
                totalMinutes,
                date: today
            }
        });
    } catch (error) {
        console.error('Error fetching today\'s Pomodoro sessions:', error);
        res.status(500).json({ error: 'Failed to fetch Pomodoro sessions' });
    }
});

// Get Pomodoro history
router.get('/history', async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const sessions = await db.allAsync(
            `SELECT ps.*, h.name as habit_name
       FROM pomodoro_sessions ps
       LEFT JOIN habits h ON ps.habit_id = h.id
       WHERE ps.user_id = ? 
       AND ps.completed_at >= datetime('now', '-' || ? || ' days')
       ORDER BY ps.completed_at DESC`,
            [req.user.userId, days]
        );

        // Group by date
        const sessionsByDate = sessions.reduce((acc, session) => {
            const date = session.completed_at.split(' ')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(session);
            return acc;
        }, {});

        res.json({ sessions, sessionsByDate });
    } catch (error) {
        console.error('Error fetching Pomodoro history:', error);
        res.status(500).json({ error: 'Failed to fetch Pomodoro history' });
    }
});

// Get Pomodoro statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await db.getAsync(
            `SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN session_type = 'work' THEN 1 ELSE 0 END) as work_sessions,
        SUM(CASE WHEN session_type = 'work' THEN duration ELSE 0 END) as total_minutes
       FROM pomodoro_sessions
       WHERE user_id = ?`,
            [req.user.userId]
        );

        // Sessions by habit
        const byHabit = await db.allAsync(
            `SELECT h.name, h.category, COUNT(*) as session_count, SUM(ps.duration) as total_minutes
       FROM pomodoro_sessions ps
       JOIN habits h ON ps.habit_id = h.id
       WHERE ps.user_id = ? AND ps.session_type = 'work'
       GROUP BY ps.habit_id
       ORDER BY session_count DESC`,
            [req.user.userId]
        );

        res.json({ stats, byHabit });
    } catch (error) {
        console.error('Error fetching Pomodoro stats:', error);
        res.status(500).json({ error: 'Failed to fetch Pomodoro statistics' });
    }
});

module.exports = router;
