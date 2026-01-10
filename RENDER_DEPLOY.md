# 🚀 Render Deployment Guide - Praxis

## ✅ Step 1: Code is on GitHub ✓
Your code is now at: `https://github.com/LimbuSoda-lep/Praxis-App`

---

## 📝 Step 2: Deploy to Render

### 1. Go to Render
Open: **https://render.com/**

### 2. Sign Up / Log In
- Click **"Get Started"** or **"Sign In"**
- Choose **"Sign in with GitHub"** (easiest option)
- Authorize Render to access your GitHub

### 3. Create New Web Service
- Click **"New +"** button (top right)
- Select **"Web Service"**

### 4. Connect Your Repository
- You'll see a list of your GitHub repos
- Find and click **"Praxis-App"**
- Click **"Connect"**

### 5. Configure Your Service

Fill in these settings:

**Name**: `praxis-app` (or any name you want)

**Region**: Choose closest to you (e.g., Singapore, Frankfurt)

**Branch**: `main`

**Runtime**: **Node**

**Build Command**: `npm install`

**Start Command**: `npm start`

**Instance Type**: **Free**

### 6. Add Environment Variables

Click **"Advanced"** to expand, then scroll to **"Environment Variables"**

Click **"Add Environment Variable"** and add these **5 variables**:

| Key | Value |
|-----|-------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `cpFVpaXMp883UOOeRsbTO9aWCNpGZ6ps431KNH5_-39i_3ZaqkXvml56I78XQjZw` |
| `PERPLEXITY_API_KEY` | `YOUR_PERPLEXITY_KEY` |
| `DB_PATH` | `./database/praxis.db` |

⚠️ **Replace `YOUR_PERPLEXITY_KEY`** with your actual Perplexity API key!

### 7. Create Web Service

Click the big **"Create Web Service"** button at the bottom

---

## ⏳ Step 3: Wait for Deployment

Render will now:
1. Clone your code from GitHub
2. Install dependencies (`npm install`)
3. Start your server (`npm start`)

**This takes 5-10 minutes.**

You'll see logs scrolling. Wait for:
```
✓ Perplexity AI configured
🚀 Praxis server running!
==> Your service is live!
```

---

## 🌍 Step 4: Your App is Live!

Once deployment succeeds, Render gives you a **public URL**:

```
https://praxis-app-XXXX.onrender.com
```

**Anyone in the world can now access your app!**

---

## 📱 Test Your Live App

1. Open the Render URL in your browser
2. Create a test account
3. Add a habit
4. Try the AI Coach
5. Share the URL with friends!

---

## 🔄 Future Updates

When you make changes to your code:

1. **Commit changes**:
   ```powershell
   git add .
   git commit -m "Update description"
   git push
   ```

2. **Render auto-deploys** the new version (takes ~5 min)

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Sleeps after 15 min** of inactivity
- First request after sleep takes **30-60 seconds** to wake up
- **Database resets** when app restarts (SQLite is temporary on free tier)

### To Prevent Sleep:
- Upgrade to Render's paid plan ($7/month)
- Or use a service like **UptimeRobot** to ping your app every 5 minutes

### Database Persistence:
For permanent data storage, you'll need to:
- Upgrade to Render paid tier (has persistent disk)
- Or switch to PostgreSQL (Render offers free PostgreSQL)

---

## 🆘 Troubleshooting

**Build fails:**
- Check logs in Render dashboard
- Verify `package.json` has all dependencies

**App crashes on start:**
- Check if environment variables are set correctly
- Look for errors in Render logs

**AI Coach not working:**
- Verify `PERPLEXITY_API_KEY` is set in environment variables
- Check Perplexity API usage/limits

**"Service Unavailable":**
- Free tier is sleeping - just refresh the page after 30 seconds

---

## ✅ Success Checklist

- [ ] Render account created
- [ ] Praxis-App repository connected
- [ ] All 5 environment variables added
- [ ] Deployment successful (green checkmark)
- [ ] App accessible via public URL
- [ ] Can create account and login
- [ ] AI Coach working

---

## 🎯 Next: Share Your Prototype!

Your app is now live at:
```
https://your-app-name.onrender.com
```

Share this URL with:
- Friends to test
- Potential users
- Investors/collaborators

They can access it from **any device, anywhere!**

---

**Need help? Check Render's logs or ask me!**
