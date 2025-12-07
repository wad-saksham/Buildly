# Buildly Deployment Guide

## Prerequisites

- GitHub account
- MongoDB Atlas account (already set up)
- Google Gemini API key (already have)

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Your Code

1. Make sure all files are saved
2. Your `.env` file should NOT be committed (it's in .gitignore)

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Buildly project"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Add Environment Variables:
   - `MONGODB_URI`: mongodb+srv://wadsaksham_db_user:tw78EWNeupkG7U8u@buildly-cluster.rwodebt.mongodb.net/buildly?retryWrites=true&w=majority&appName=Buildly
   - `JWT_SECRET`: buildly-jwt-secret-key-2024
   - `SESSION_SECRET`: buildly-session-secret-key
   - `GEMINI_API_KEY`: AIzaSyB9fc_Tx47hIfFLOT5frHlGllrKzlojYtw
6. Click "Deploy"

Your app will be live at: `https://your-project-name.vercel.app`

---

## Option 2: Deploy to Render

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Render

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: buildly
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables (same as Vercel)
7. Click "Create Web Service"

Your app will be live at: `https://buildly.onrender.com`

---

## Option 3: Deploy to Railway

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy on Railway

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add Environment Variables (same as above)
6. Railway will auto-detect Node.js and deploy

Your app will be live at: `https://buildly.up.railway.app`

---

## Post-Deployment Checklist

✅ Test all features:

- User registration/login
- Project creation
- Task management
- AI Chatbot
- Construction Calculator
- Document upload
- Timeline

✅ Update CORS settings if needed (in server.js)

✅ Monitor MongoDB Atlas usage (free tier: 512MB)

✅ Keep your API keys secure (never commit .env file)

---

## Troubleshooting

### Issue: "Cannot connect to MongoDB"

- Check if MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allow all)
- Verify MONGODB_URI is correct in environment variables

### Issue: "AI Chatbot not working"

- Verify GEMINI_API_KEY is set correctly
- Check API quota limits

### Issue: "File uploads not working"

- Some platforms have read-only file systems
- Consider using cloud storage (AWS S3, Cloudinary) for production

---

## Recommended: Vercel

- ✅ Free tier
- ✅ Automatic HTTPS
- ✅ Fast deployment
- ✅ Easy GitHub integration
- ✅ Good for Node.js apps

## Need Help?

Contact: Saksham (GitHub: wad-saksham)
