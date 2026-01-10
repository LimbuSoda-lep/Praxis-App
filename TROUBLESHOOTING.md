# Mobile Access & AI Troubleshooting Guide

## 📱 How to Access from Mobile

### Step 1: Restart the Server
Stop the current server (Ctrl+C) and restart:
```powershell
npm start
```

### Step 2: Look for Network URL
When the server starts, you'll now see:
```
🚀 Praxis server running!
📍 Local:   http://localhost:3000
📍 Network: http://192.168.X.X:3000    ← Use this IP!
📊 API:     http://localhost:3000/api

💡 To access from mobile:
   1. Connect phone to same WiFi
   2. Open: http://192.168.X.X:3000
```

### Step 3: On Your Phone
1. **Make sure** your phone is on the **same WiFi network** as your laptop
2. Open your phone's browser (Chrome, Safari, etc.)
3. Type the Network URL (e.g., `http://192.168.1.5:3000`)
4. The app should load!

### Troubleshooting Mobile Access

**If it doesn't work:**

1. **Check Windows Firewall**:
   ```powershell
   # Allow Node.js through firewall (run as Administrator)
   netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
   ```

2. **Verify same WiFi**: Both devices must be on the exact same WiFi network

3. **Try different port**: Change `PORT=3001` in `.env` and restart

---

## 🤖 AI Coach Troubleshooting

### Check Server Logs

When you restart the server, look for:
- ✅ `✓ Gemini AI initialized` = API key is working
- ❌ `⚠️ WARNING: GEMINI_API_KEY not set` = Check your .env file

### Common AI Issues:

#### 1. "GEMINI_API_KEY not set"
**Solution**: Check your `.env` file exists and has the key:
```powershell
cat .env
```
You should see:
```
GEMINI_API_KEY=AIzaSyCFjEugDB9t4OPgJqX2dIQA3eKMo-JnAI8
```

#### 2. "Invalid API Key" Error
**Solution**: 
- Your API key might be expired or invalid
- Get a new one from: https://aistudio.google.com/app/apikey
- Update `.env` file
- Restart server

#### 3. "API quota exceeded"
**Solution**:
- Free tier has limits (60 requests/minute)
- Wait a minute and try again
- Or upgrade your Gemini API plan

#### 4. AI Returns Generic Response
**Solution**:
- This is the fallback when parsing fails
- Check server console for "Error parsing AI response"
- Usually not a problem, just means the AI didn't format JSON perfectly

### Test AI Manually

After server starts, open browser console (F12) and run:
```javascript
fetch('http://localhost:3000/api/ai/coach', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'  // Get from localStorage
  },
  body: JSON.stringify({
    goals: 'Test my AI coach',
    availableTime: '2 hours'
  })
}).then(r => r.json()).then(console.log)
```

---

## Quick Fixes Checklist

### For Mobile Access:
- [ ] Server restarted with new code
- [ ] Both devices on same WiFi
- [ ] Using Network IP (not localhost)
- [ ] Firewall rule added (if needed)

### For AI Coach:
- [ ] `.env` file has GEMINI_API_KEY
- [ ] Server shows "✓ Gemini AI initialized"
- [ ] Not hitting rate limits
- [ ] Check browser console for error details
- [ ] Check server terminal for detailed logs

---

## Testing Sequence

1. **Stop server**: Press Ctrl+C in PowerShell

2. **Verify .env**:
   ```powershell
   cat .env
   ```

3. **Restart server**:
   ```powershell
   npm start
   ```

4. **Check logs** for:
   - ✓ Gemini AI initialized
   - Network IP address

5. **Test on laptop** first:
   - Go to AI Coach page
   - Submit a test request
   - Watch server terminal for logs:
     - 🤖 AI Coach request from user
     - 📡 Calling Gemini API...
     - ✓ Received AI response

6. **Test on mobile**:
   - Open Network URL on phone
   - Log in
   - Try the same AI request

---

## Still Not Working?

Share the error from:
1. **Browser console** (F12 → Console tab)
2. **Server terminal** (the PowerShell window)

This will help debug the specific issue!
