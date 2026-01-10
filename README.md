# Praxis - Habit Tracker with Pomodoro Timer & AI Coach

A comprehensive web application for building consistent daily habits with integrated Pomodoro timer and AI-powered productivity coaching.

## Features

✅ **Habit Tracking**
- Create habits with categories (study, health, work, custom)
- Set weekly targets
- Track daily completions
- View streaks and completion rates

⏱ **Pomodoro Timer**
- 25-minute work sessions
- 5-minute short breaks
- 15-minute long breaks after 4 sessions
- Link sessions to specific habits
- Track completed Pomodoros

🤖 **AI Coach** (Powered by Google Gemini)
- Personalized daily habit recommendations
- Smart Pomodoro scheduling based on your goals
- Analyzes your habit history and streaks
- Motivational coaching

🎨 **Beautiful Design**
- Clean, minimal aesthetic
- Dark theme support
- Fully responsive (mobile-friendly)
- Smooth animations and transitions

🔐 **User Authentication**
- Secure JWT-based authentication
- Password hashing with bcrypt
- Per-user data isolation

## Tech Stack

- **Frontend**: HTML, CSS (Vanilla), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **AI**: Google Gemini API
- **Authentication**: JWT, bcrypt

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your configuration:
   ```env
   PORT=3000
   JWT_SECRET=your_secure_random_string_here
   GEMINI_API_KEY=your_gemini_api_key_here
   DB_PATH=./database/praxis.db
   ```

   **Important**: 
   - Replace `your_secure_random_string_here` with a strong random string
   - Add your Google Gemini API key

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   
   Navigate to: `http://localhost:3000`

## Project Structure

```
Praxis/
├── server.js                 # Express server & main entry point
├── package.json             # Dependencies
├── .env                     # Environment variables (create this)
├── .env.example            # Environment template
├── database/
│   ├── db.js               # Database connection & schema
│   └── praxis.db          # SQLite database (auto-created)
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── routes/
│   ├── auth.routes.js     # Authentication endpoints
│   ├── habits.routes.js   # Habit CRUD & stats
│   ├── pomodoro.routes.js # Pomodoro session tracking
│   └── ai.routes.js       # AI coach integration
└── public/                # Frontend files
    ├── index.html         # Landing page
    ├── signup.html        # User registration
    ├── login.html         # User login
    ├── dashboard.html     # Main app dashboard
    ├── habits.html        # Habit management
    ├── ai-coach.html      # AI coach interface
    ├── css/
    │   ├── main.css       # Design system & themes
    │   └── components.css # Component styles
    └── js/
        ├── auth.js        # Auth utilities
        ├── theme.js       # Dark/light theme
        └── utils.js       # Helper functions
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login

### Habits (Protected)
- `GET /api/habits` - Get all user habits
- `GET /api/habits/today` - Get today's habits with completion status
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Toggle habit completion for today
- `GET /api/habits/:id/stats` - Get habit statistics

### Pomodoro (Protected)
- `POST /api/pomodoro` - Save completed Pomodoro session
- `GET /api/pomodoro/today` - Get today's sessions
- `GET /api/pomodoro/history` - Get session history
- `GET /api/pomodoro/stats` - Get overall statistics

### AI Coach (Protected)
- `POST /api/ai/coach` - Get personalized AI recommendations

## Usage Guide

### 1. Create an Account
- Navigate to the landing page
- Click "Get Started" or "Sign Up"
- Enter your email and password
- You'll be automatically logged in

### 2. Create Your First Habit
- Go to "Habits" page
- Click "+ Add Habit"
- Fill in:
  - Habit name (e.g., "Morning Meditation")
  - Category (study, health, work, or custom)
  - Weekly target (default: 7 days)
  - Color (for visual organization)
- Click "Save Habit"

### 3. Track Daily Progress
- On the Dashboard, you'll see today's habits
- Click any habit card to mark it as complete
- Watch your progress bar update in real-time

### 4. Use Pomodoro Timer
- Select a habit from the dropdown (or choose "Custom task")
- Click "Start" to begin a 25-minute session
- Work until the timer completes
- The app will automatically suggest a break
- After 4 work sessions, you'll get a long break

### 5. Get AI Coaching
- Navigate to "AI Coach" page
- Describe your goals for today
- Specify your available time
- Click "Get AI Recommendations"
- Review personalized habit priorities and Pomodoro schedule

### 6. Toggle Dark Theme
- Click the theme toggle button in the navigation bar
- Your preference is saved automatically

## Database Schema

### users
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- password_hash (TEXT)
- display_name (TEXT)
- created_at (DATETIME)

### habits
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- name (TEXT)
- category (TEXT)
- weekly_target (INTEGER)
- color (TEXT)
- created_at (DATETIME)

### habit_completions
- id (INTEGER PRIMARY KEY)
- habit_id (INTEGER)
- completion_date (DATE)
- notes (TEXT)
- created_at (DATETIME)

### pomodoro_sessions
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- habit_id (INTEGER, nullable)
- task_name (TEXT, nullable)
- duration (INTEGER)
- session_type (TEXT)
- completed_at (DATETIME)

## Development

### Run in Development Mode
```bash
npm run dev
```

This uses Node's `--watch` flag to auto-restart on file changes.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `DB_PATH` | Path to SQLite database | No (default: ./database/praxis.db) |

## Security Notes

- Never commit your `.env` file
- Use a strong, random `JWT_SECRET`
- Keep your `GEMINI_API_KEY` secure
- The database file (`praxis.db`) is gitignored by default

## Troubleshooting

**Issue**: "Module not found" errors
- **Solution**: Run `npm install` to install all dependencies

**Issue**: AI Coach not working
- **Solution**: Verify your `GEMINI_API_KEY` is correctly set in `.env`

**Issue**: Database errors on startup
- **Solution**: Delete `database/praxis.db` and restart the server (it will rebuild)

**Issue**: Authentication not persisting
- **Solution**: Check browser console for localStorage errors; try clearing browser data

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Credits

Built with ❤️ for consistency and daily practice.

---

**Remember**: Consistency beats motivation. Show up every day. 🎯
