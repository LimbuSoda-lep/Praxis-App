# Praxis Setup Guide for Windows

## Step 1: Install Node.js

1. Download Node.js from: https://nodejs.org/
   - Choose the **LTS version** (recommended)
   - Download the Windows Installer (.msi)

2. Run the installer
   - Click "Next" through the installation wizard
   - Accept the license agreement
   - Leave default settings
   - Make sure "Add to PATH" is checked
   - Click "Install"

3. Restart your terminal/PowerShell after installation

4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers like `v20.x.x` and `10.x.x`

## Step 2: Get Google Gemini API Key

1. Go to: https://ai.google.dev/
2. Click "Get API Key" or "Get Started"
3. Sign in with your Google account
4. Create a new API key
5. Copy the API key (you'll need it in Step 4)

## Step 3: Install Project Dependencies

Open PowerShell in the Praxis folder and run:

```powershell
npm install
```

This will install all required packages from package.json.

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```powershell
   cp .env.example .env
   ```

2. Open `.env` file in a text editor (Notepad, VS Code, etc.)

3. Update the following values:

   ```env
   PORT=3000
   JWT_SECRET=change_this_to_a_long_random_string
   GEMINI_API_KEY=paste_your_gemini_api_key_here
   DB_PATH=./database/praxis.db
   ```

   **For JWT_SECRET**, you can generate a random string:
   ```powershell
   # In PowerShell:
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```

## Step 5: Start the Application

```powershell
npm start
```

You should see:
```
✓ Connected to SQLite database
✓ Users table ready
✓ Habits table ready
✓ Habit completions table ready
✓ Pomodoro sessions table ready
✓ Database initialized

🚀 Praxis server running!
📍 Server: http://localhost:3000
📊 API: http://localhost:3000/api
```

## Step 6: Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

## Quick Test Checklist

1. ✅ Landing page loads
2. ✅ Click "Get Started" → Sign up page
3. ✅ Create account with email/password
4. ✅ Auto-redirected to dashboard
5. ✅ Click "+ Add Habit" → Create first habit
6. ✅ Click habit to mark complete
7. ✅ Start Pomodoro timer
8. ✅ Go to AI Coach → Get recommendations
9. ✅ Toggle dark theme in header

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Restart your terminal after installing Node.js
- Reinstall Node.js and check "Add to PATH"

### "Cannot find module 'express'"
- Dependencies not installed
- Run: `npm install`

### "Error: GEMINI_API_KEY not set"
- Missing or incorrect API key in `.env`
- Make sure `.env` file exists and has your API key

### "Port 3000 already in use"
- Another app is using port 3000
- Change `PORT=3001` in `.env`
- Or kill the process using port 3000

### Database errors
- Delete `database/praxis.db` file
- Restart the server (it will recreate the database)

## Development Tips

- **Auto-restart on changes**: Use `npm run dev`
- **View database**: Use DB Browser for SQLite or similar tools
- **Check API responses**: Use browser DevTools Network tab
- **Test dark theme**: Works across all pages automatically

## Next Steps

After setup:
1. Create 2-3 habits in different categories
2. Complete some habits to build streaks
3. Run a few Pomodoro sessions
4. Try the AI Coach with your real goals
5. Explore the statistics in the Habits page

---

Need help? Check the main README.md for more details!
