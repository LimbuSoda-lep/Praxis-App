const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Check if API key is configured
if (!process.env.PERPLEXITY_API_KEY) {
    console.error('⚠️  WARNING: PERPLEXITY_API_KEY not set in .env file!');
    console.error('   AI Coach will not work without it.');
} else {
    console.log('✓ Perplexity AI configured');
}

// All routes require authentication
router.use(authenticateToken);

// Test endpoint to verify API is working
router.get('/test', async (req, res) => {
    try {
        if (!process.env.PERPLEXITY_API_KEY) {
            return res.status(503).json({
                status: 'error',
                message: 'PERPLEXITY_API_KEY not configured'
            });
        }

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [{ role: 'user', content: 'Say "Hello from Perplexity!"' }]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${response.status} - ${error}`);
        }

        const data = await response.json();

        res.json({
            status: 'success',
            message: 'Perplexity API is working!',
            response: data.choices[0].message.content
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// AI Coach endpoint
router.post('/coach', async (req, res) => {
    try {
        if (!process.env.PERPLEXITY_API_KEY) {
            return res.status(503).json({
                error: 'AI service not available. PERPLEXITY_API_KEY not configured.'
            });
        }

        const { goals, availableTime } = req.body;

        if (!goals || !availableTime) {
            return res.status(400).json({ error: 'Goals and available time are required' });
        }

        console.log('🤖 AI Coach request from user:', req.user.userId);

        const habits = await db.allAsync(
            'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at',
            [req.user.userId]
        );

        // Fetch habit statistics
        const habitStats = await Promise.all(
            habits.map(async (habit) => {
                const completions = await db.allAsync(
                    `SELECT completion_date FROM habit_completions 
                     WHERE habit_id = ? ORDER BY completion_date DESC LIMIT 30`,
                    [habit.id]
                );

                let streak = 0;
                const today = new Date().toISOString().split('T')[0];
                let checkDate = new Date();

                for (let i = 0; i < 30; i++) {
                    const dateStr = checkDate.toISOString().split('T')[0];
                    const completed = completions.some(c => c.completion_date === dateStr);
                    if (completed) {
                        streak++;
                    } else if (dateStr !== today) {
                        break;
                    }
                    checkDate.setDate(checkDate.getDate() - 1);
                }

                return {
                    name: habit.name,
                    category: habit.category,
                    weeklyTarget: habit.weekly_target,
                    currentStreak: streak,
                    recentCompletions: completions.length
                };
            })
        );

        // Fetch Pomodoro history
        const pomodoroHistory = await db.allAsync(
            `SELECT h.name as habit_name, COUNT(*) as session_count, SUM(ps.duration) as total_minutes
             FROM pomodoro_sessions ps
             LEFT JOIN habits h ON ps.habit_id = h.id
             WHERE ps.user_id = ? AND ps.completed_at >= datetime('now', '-7 days') AND ps.session_type = 'work'
             GROUP BY ps.habit_id ORDER BY session_count DESC`,
            [req.user.userId]
        );

        // Build MIKA prompt with comprehensive personality rules
        const prompt = `You are MIKA, an AI productivity coach for Praxis.

CORE IDENTITY:
You evaluate objective progress and deliver controlled feedback to help users reach long-term goals through daily practice.
- You do NOT motivate emotionally
- You enforce clarity, realism, and consistency
- You only react to facts, never feelings

USER DATA:
Habits:
${habitStats.map(h => `- ${h.name} (${h.category}): Target ${h.weeklyTarget}/7 days, Current streak: ${h.currentStreak} days, Recent completions: ${h.recentCompletions}/30 days`).join('\n') || 'No habits yet'}

Recent Pomodoros (7 days):
${pomodoroHistory.map(p => `- ${p.habit_name || 'Custom'}: ${p.session_count} sessions, ${p.total_minutes} minutes`).join('\n') || 'None'}

USER REQUEST:
Goals: ${goals}
Time available: ${availableTime}

MIKA'S RULES:

1. CONSISTENCY IS PRIMARY SIGNAL
   - Calculate: consistency = completed / planned
   - Bands: EXCELLENT (≥80%), ACCEPTABLE (60-79%), RISK (40-59%), CRITICAL (<40%)
   - Never praise outcomes if consistency is poor

2. TONE SELECTION (DETERMINISTIC):
   - ≥80%: STRICT_POSITIVE ("You stayed consistent. Maintain it.")
   - 60-79%: NEUTRAL ("Progress exists. Improve consistency.")
   - 40-59%: CORRECTIVE ("This pace will not reach your goal.")
   - <40%: WARNING ("Consistency is critically low. Adjust.")

3. FORBIDDEN LANGUAGE:
   - No "You failed" / "You are lazy" / "You should feel bad"
   - No "Amazing job" / "Don't give up" / emotional encouragement
   - No emojis, no excitement
   - No asking how user feels

4. ALLOWED TRAITS:
   - Short, direct, observational
   - Action-oriented
   - Truth statements, not encouragement

5. GOAL ADJUSTMENT:
   - Suggest, never enforce
   - Say: "Adjusting the plan increases success probability"
   - Never: "You must change this"

6. SAFETY:
   - If goal unrealistic: intervene immediately
   - Protect long-term sustainability over short-term success

TASK:
Provide:
1. 3 recommended habits (prioritize low-streak existing ones for consistency)
2. Pomodoro schedule (25-min sessions) realistic for available time
3. MIKA-style message (2 sentences max, objective, no emotion)

Calculate each habit's consistency as: (recentCompletions / 30) * 100
Use this to determine tone and content.

Respond ONLY with valid JSON:
{
  "recommendedHabits": [{"habit": "name", "why": "objective reason based on consistency data", "isNew": false}],
  "pomodoroSchedule": [{"habit": "name", "sessions": 2, "estimatedMinutes": 50}],
  "motivation": "MIKA-style objective statement (no emotion, no emojis, truth only)"
}`;

        console.log('📡 Calling Perplexity AI...');

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const aiText = data.choices[0].message.content;

        console.log('✓ Received AI response');
        console.log('📝 Response preview:', aiText.substring(0, 100) + '...');

        // Parse JSON
        let aiSuggestions;
        try {
            const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/) || aiText.match(/```\n([\s\S]*?)\n```/) || aiText.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiText;
            aiSuggestions = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Parse error, using fallback');
            aiSuggestions = {
                recommendedHabits: habitStats.slice(0, 3).map(h => ({
                    habit: h.name,
                    why: `Continue your ${h.currentStreak}-day streak`,
                    isNew: false
                })),
                pomodoroSchedule: habitStats.slice(0, 2).map(h => ({
                    habit: h.name,
                    sessions: 2,
                    estimatedMinutes: 50
                })),
                motivation: "Consistency determines outcomes. Execute the plan."
            };
        }

        res.json({
            message: 'AI coach suggestions generated',
            suggestions: aiSuggestions,
            context: {
                totalHabits: habits.length,
                activeStreaks: habitStats.filter(h => h.currentStreak > 0).length
            }
        });
    } catch (error) {
        console.error('❌ AI Coach error:', error.message);
        res.status(500).json({
            error: 'Failed to generate AI suggestions',
            details: error.message
        });
    }
});

module.exports = router;
