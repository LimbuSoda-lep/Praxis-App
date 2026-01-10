const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all habits for the authenticated user
router.get('/', async (req, res) => {
    try {
        const habits = await db.allAsync(
            'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.userId]
        );
        res.json({ habits });
    } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// Create a new habit
router.post('/', async (req, res) => {
    try {
        const { name, category, weeklyTarget, color } = req.body;

        if (!name || !category) {
            return res.status(400).json({ error: 'Name and category are required' });
        }

        const result = await db.runAsync(
            `INSERT INTO habits (user_id, name, category, weekly_target, color) 
       VALUES (?, ?, ?, ?, ?)`,
            [req.user.userId, name, category, weeklyTarget || 7, color || '#4A5D23']
        );

        const habit = await db.getAsync('SELECT * FROM habits WHERE id = ?', [result.lastID]);
        res.status(201).json({ message: 'Habit created', habit });
    } catch (error) {
        console.error('Error creating habit:', error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
});

// Update a habit
router.put('/:id', async (req, res) => {
    try {
        const { name, category, weeklyTarget, color } = req.body;
        const habitId = req.params.id;

        // Verify habit belongs to user
        const habit = await db.getAsync(
            'SELECT * FROM habits WHERE id = ? AND user_id = ?',
            [habitId, req.user.userId]
        );

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        await db.runAsync(
            `UPDATE habits SET name = ?, category = ?, weekly_target = ?, color = ? 
       WHERE id = ?`,
            [name || habit.name, category || habit.category, weeklyTarget || habit.weekly_target,
            color || habit.color, habitId]
        );

        const updatedHabit = await db.getAsync('SELECT * FROM habits WHERE id = ?', [habitId]);
        res.json({ message: 'Habit updated', habit: updatedHabit });
    } catch (error) {
        console.error('Error updating habit:', error);
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

// Delete a habit
router.delete('/:id', async (req, res) => {
    try {
        const habitId = req.params.id;

        const result = await db.runAsync(
            'DELETE FROM habits WHERE id = ? AND user_id = ?',
            [habitId, req.user.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        res.json({ message: 'Habit deleted' });
    } catch (error) {
        console.error('Error deleting habit:', error);
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

// Mark habit as complete for a specific date
router.post('/:id/complete', async (req, res) => {
    try {
        const habitId = req.params.id;
        const { date, notes } = req.body;
        const completionDate = date || new Date().toISOString().split('T')[0];

        // Verify habit belongs to user
        const habit = await db.getAsync(
            'SELECT * FROM habits WHERE id = ? AND user_id = ?',
            [habitId, req.user.userId]
        );

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        try {
            await db.runAsync(
                'INSERT INTO habit_completions (habit_id, completion_date, notes) VALUES (?, ?, ?)',
                [habitId, completionDate, notes || null]
            );
            res.json({ message: 'Habit marked as complete', date: completionDate });
        } catch (err) {
            // If already completed, toggle (delete)
            if (err.message.includes('UNIQUE constraint')) {
                await db.runAsync(
                    'DELETE FROM habit_completions WHERE habit_id = ? AND completion_date = ?',
                    [habitId, completionDate]
                );
                res.json({ message: 'Habit completion removed', date: completionDate });
            } else {
                throw err;
            }
        }
    } catch (error) {
        console.error('Error completing habit:', error);
        res.status(500).json({ error: 'Failed to complete habit' });
    }
});

// Get habit statistics (streaks, completion rate)
router.get('/:id/stats', async (req, res) => {
    try {
        const habitId = req.params.id;

        // Verify habit belongs to user
        const habit = await db.getAsync(
            'SELECT * FROM habits WHERE id = ? AND user_id = ?',
            [habitId, req.user.userId]
        );

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        // Get all completions
        const completions = await db.allAsync(
            'SELECT completion_date FROM habit_completions WHERE habit_id = ? ORDER BY completion_date DESC',
            [habitId]
        );

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date();

        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const completed = completions.some(c => c.completion_date === dateStr);

            if (completed) {
                currentStreak++;
            } else if (dateStr !== today) {
                break;
            }

            checkDate.setDate(checkDate.getDate() - 1);
        }

        // Calculate completion rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const recentCompletions = completions.filter(c => c.completion_date >= thirtyDaysAgoStr);
        const completionRate = Math.round((recentCompletions.length / 30) * 100);

        // Get total completions
        const totalCompletions = completions.length;

        res.json({
            habitId,
            habitName: habit.name,
            currentStreak,
            completionRate,
            totalCompletions,
            recentCompletions: completions.slice(0, 7) // Last 7 days
        });
    } catch (error) {
        console.error('Error fetching habit stats:', error);
        res.status(500).json({ error: 'Failed to fetch habit statistics' });
    }
});

// Get today's habits with completion status
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const habits = await db.allAsync(
            `SELECT h.*, 
              CASE WHEN hc.id IS NOT NULL THEN 1 ELSE 0 END as completed
       FROM habits h
       LEFT JOIN habit_completions hc ON h.id = hc.habit_id AND hc.completion_date = ?
       WHERE h.user_id = ?
       ORDER BY h.created_at`,
            [today, req.user.userId]
        );

        res.json({ habits, date: today });
    } catch (error) {
        console.error('Error fetching today\'s habits:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s habits' });
    }
});

module.exports = router;
