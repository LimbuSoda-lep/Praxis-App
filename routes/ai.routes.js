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

// AI Coach endpoint - YEARLY GOAL COACH
router.post('/coach', async (req, res) => {
    try {
        if (!process.env.PERPLEXITY_API_KEY) {
            return res.status(503).json({
                error: 'AI service not available. PERPLEXITY_API_KEY not configured.'
            });
        }

        const { ultimateGoal, timeframe } = req.body;

        if (!ultimateGoal || !timeframe) {
            return res.status(400).json({ error: 'Ultimate goal and timeframe are required' });
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

        // Build MIKA prompt with new personality: calm, cheering, brutally honest
        const prompt = `You are MIKA, a yearly goal achievement coach with a unique personality.

YOUR PERSONALITY:
- CALM & SUPPORTIVE: You speak with warmth and understanding, never panicked or harsh
- CHEERING: You celebrate ambition and highlight existing strengths  
- BRUTALLY HONEST: You call out unrealistic timelines and weak spots without sugar-coating

YOUR APPROACH:
- Use contractions (you're, that's, let's) - be conversational
- Mix honest reality checks with genuine encouragement
- Reference their actual habit data to prove your points
- End on an empowering, actionable note

USER'S ULTIMATE GOAL:
"${ultimateGoal}"

TIMEFRAME:
"${timeframe}"

CURRENT HABIT DATA:
${habitStats.map(h => `- ${h.name} (${h.category}): Target ${h.weeklyTarget}/7 days, Current streak: ${h.currentStreak} days, Completions this month: ${h.recentCompletions}/30`).join('\n') || 'No habits tracked yet'}

RECENT FOCUS SESSIONS (7 days):
${pomodoroHistory.map(p => `- ${p.habit_name || 'Custom'}: ${p.session_count} sessions, ${p.total_minutes} minutes`).join('\n') || 'No Pomodoro sessions yet'}

YOUR TASK:
Provide a strategic assessment in this format:

1. REALITY CHECK (2-3 sentences):
   - Acknowledge their goal with respect
   - Give honest assessment if timeline is realistic based on their current habits
   - Point out their biggest weakness (backed by data)

2. THE GOOD NEWS (1-2 sentences):
   - Highlight what they're already doing well (if anything)
   - Show belief in their potential

3. STRATEGIC MILESTONES:
   - Break goal into 3-4 quarterly/monthly milestones
   - Make them specific and measurable
   
4. BIGGEST OBSTACLE:
   - Identify the #1 thing that will likely make them fail
   - Be direct but constructive

5. ACTION PLAN (Immediate next steps):
   - 3 concrete actions they should start THIS WEEK
   - Be specific and actionable

6. CLOSING MOTIVATION:
   - End with honest but empowering statement
   - Reference their existing strengths

TONE EXAMPLES:
✅ "Alright, [goal] - that's ambitious, I respect it!"
✅ "Here's the real talk: your [habit] streak is [number]. That's your red flag."
✅ "You've got [timeframe] - that IS enough time, but only if..."
✅ "You're crushing it with [habit]. Now channel that same energy into..."
❌ Don't use: "You failed", "You're lazy", robotic corporate speak

Write your response as flowing conversational text with proper paragraphs. Be warm, be real, be honest.`;

        console.log('📡 Calling Perplexity AI...');

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    { role: 'system', content: 'You are MIKA, a brutally honest but supportive yearly goal coach.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Perplexity API Error:', response.status, errorText);
            throw new Error(`Perplexity API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        console.log('✅ AI response received');

        res.json({
            suggestions: aiResponse,
            habitData: habitStats,
            pomodoroData: pomodoroHistory
        });

    } catch (error) {
        console.error('Error in AI coach:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to get AI recommendations',
            details: error.message
        });
    }
});

module.exports = router;
