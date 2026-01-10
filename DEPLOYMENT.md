# Deploying Praxis to the Cloud 🚀

This guide will help you deploy your Praxis app so **anyone on the internet** can access it.

## 📋 Quick Comparison of Free Hosting Options

| Platform | Pros | Cons | Best For |
|----------|------|------|----------|
| **Render** ⭐ | Easy, auto-deploy from GitHub, persistent storage | Sleeps after 15 min inactivity (free tier) | Recommended |
| **Railway** | Fast, simple, good free tier | Limited free hours/month | Quick deploy |
| **Replit** | Instant, no setup | Always-on requires paid plan | Testing |
| **Glitch** | Very easy, remix projects | Limited resources | Small demos |

---

## ⭐ RECOMMENDED: Deploy to Render (Step-by-Step)

Render is the best free option for your prototype. Here's how:

### Step 1: Prepare Your App

1. **Create a `start` script** (already done in `package.json`):
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```

2. **Make sure your app uses `PORT` from environment**:
   ✅ Already configured in `server.js`

### Step 2: Push Code to GitHub

1. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Name it `praxis-app`
   - Make it **Public** (so you can use free tier)

2. **Push your code**:
   ```powershell
   cd e:\Praxis
   git init
   git add .
   git commit -m "Initial commit - Praxis habit tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/praxis-app.git
   git push -u origin main
   ```

   ⚠️ **Important**: Make sure `.gitignore` is working (don't commit `.env` file!)

### Step 3: Deploy on Render

1. **Go to Render**: https://render.com/
2. **Sign up** (use your GitHub account)
3. **Click "New +"** → **"Web Service"**
4. **Connect your GitHub repo** (`praxis-app`)
5. **Configure**:
   - Name: `praxis-app`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**

6. **Add Environment Variables**:
   Click "Advanced" → Add these:
   ```
   PORT=3000
   NODE_ENV=production
   JWT_SECRET=your_jwt_secret_here
   PERPLEXITY_API_KEY=your_perplexity_key_here
   DB_PATH=./database/praxis.db
   ```

7. **Click "Create Web Service"**

8. **Wait 5-10 minutes** for deployment

9. **Your app will be live at**:
   ```
   https://praxis-app-YOUR_NAME.onrender.com
   ```

---

## 🎯 Alternative: Deploy to Railway

Railway is faster but has limited free hours.

### Quick Deploy

1. Go to https://railway.app/
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your `praxis-app` repo
5. Railway auto-detects Node.js
6. **Add environment variables** (same as above)
7. Click **"Deploy"**

Your app will be live at: `https://praxis-app.up.railway.app`

---

## 🔧 Alternative: Deploy to Replit (Easiest)

Perfect for quick testing.

1. Go to https://replit.com/
2. Click **"Create Repl"**
3. Choose **"Import from GitHub"**
4. Paste your repo URL
5. Click **"Import from GitHub"**
6. **Add Secrets** (environment variables):
   - Click the lock icon 🔒
   - Add: `JWT_SECRET`, `PERPLEXITY_API_KEY`
7. Click **"Run"**

Your app will be at: `https://praxis-app.YOUR_USERNAME.repl.co`

⚠️ Free Replit apps sleep when inactive.

---

## ⚠️ Important Post-Deployment Notes

### 1. Database Persistence

SQLite files may be **deleted** on some free platforms when the app restarts. Solutions:

**Option A: Use Render** (has persistent storage on free tier)

**Option B: Upgrade to PostgreSQL** (recommended for production):
- Most platforms offer free PostgreSQL databases
- You'd need to migrate from SQLite to PostgreSQL

**Option C: Accept data loss** (fine for prototype demos)

### 2. Environment Variables

**NEVER** commit your `.env` file to GitHub!
Always set environment variables in the hosting platform's dashboard.

### 3. CORS Issues

If you get CORS errors, the `cors()` middleware in `server.js` should handle it.
✅ Already configured.

### 4. Free Tier Limitations

Most free tiers:
- **Sleep after inactivity** (15-30 min)
- First request after sleep takes 30-60 seconds to wake up
- Limited monthly hours (Railway: 500 hours/month)

---

## 📱 Sharing Your Prototype

Once deployed, you can share:
```
https://your-app-name.onrender.com
```

**Anyone** can:
- ✅ Create an account
- ✅ Track habits
- ✅ Use Pomodoro timer
- ✅ Get AI coaching from MIKA
- ✅ Access from any device (phone, tablet, desktop)

---

## 🔄 Updating Your Deployed App

After making changes:

```powershell
git add .
git commit -m "Update description"
git push
```

Render/Railway will **auto-deploy** the new version!

---

## 🆘 Troubleshooting

**App won't start:**
- Check logs in the hosting platform
- Verify all environment variables are set
- Make sure `package.json` has correct `start` script

**Database errors:**
- Check if `database` folder exists
- Verify `DB_PATH` environment variable
- Consider using PostgreSQL for production

**API errors:**
- Verify `PERPLEXITY_API_KEY` is set correctly
- Check Perplexity API quota/limits

**Port errors:**
- Don't hardcode `PORT=3000`
- Use: `process.env.PORT || 3000`
- ✅ Already configured in your `server.js`

---

## 💰 Cost Estimate

**For Prototype/Demo:**
- **Render Free**: $0/month (perfect for prototype)
- **Railway Free**: $0/month (500 hours free)
- **Replit Free**: $0/month (sleeps when inactive)

**For Production (later):**
- **Render Starter**: $7/month (no sleep, better resources)
- **Railway Pro**: $5/month (more hours, better performance)
- **PostgreSQL**: Usually free tier available on most platforms

---

## 🎯 Recommended Path

1. ✅ Use **Render** (free tier)
2. ✅ Accept database resets for prototype
3. ✅ Auto-deploy from GitHub
4. ✅ Share public URL with testers
5. ⏭️ Upgrade later if you want persistence

**Deployment time: ~15 minutes total**

---

## Next Steps

1. Create GitHub account (if you don't have one)
2. Push your code to GitHub
3. Sign up for Render
4. Follow Step 3 above
5. Share your live URL! 🎉

Need help with any step? Let me know!
