# Deployment Checklist

## Prerequisites
- [ ] GitHub account with code pushed
- [ ] Vercel account (free, signup at vercel.com)
- [ ] Render account (free, signup at render.com)
- [ ] Neon PostgreSQL DATABASE_URL

## Step 1: Deploy Frontend to Vercel (5 minutes)

### Option A: Via GitHub (Recommended)
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "New Project"
- [ ] Select your `Real-Estate-Management` repository
- [ ] Configure:
  - Framework: React
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add Environment Variables:
  - Key: `VITE_API_URL`
  - Value: (leave empty for now, update after backend deployment)
- [ ] Click "Deploy"
- [ ] Wait for deployment (2-3 min)
- [ ] Copy your frontend URL: `https://your-project.vercel.app`

### Option B: Via CLI
```bash
npm install -g vercel
cd frontend
vercel --prod
```

---

## Step 2: Deploy Backend to Render (5 minutes)

### Setup Render Account
- [ ] Go to [render.com](https://render.com)
- [ ] Sign in with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Connect to your `Real-Estate-Management` repository

### Configure Render Service
- [ ] Set Name: `real-estate-api`
- [ ] Set Environment: `Node`
- [ ] Set Region: (choose closest to you)
- [ ] Set Branch: `main`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `node src/server.js`
- [ ] Set Root Directory: `backend`

### Add Environment Variables
- [ ] Click "Environment"
- [ ] Add variable:
  - Key: `DATABASE_URL`
  - Value: (paste from your Neon dashboard)
- [ ] Add variable:
  - Key: `NODE_ENV`
  - Value: `production`
- [ ] Add variable:
  - Key: `PORT`
  - Value: `3001`

### Deploy
- [ ] Click "Deploy Web Service"
- [ ] Wait for deployment (2-3 min)
- [ ] Go to "Settings" tab → look for "Render URL"
- [ ] Copy your backend URL: `https://real-estate-api.onrender.com`

---

## Step 3: Link Frontend to Backend (2 minutes)

### Update Frontend Environment Variable
- [ ] Go back to Vercel project settings
- [ ] Navigate to "Settings" → "Environment Variables"
- [ ] Edit `VITE_API_URL`:
  - Old Value: `http://localhost:3001/api`
  - New Value: `https://your-backend.onrender.com/api`
- [ ] Save and redeploy:
  - Click on "Deployments" tab
  - Click the latest deployment
  - Click "Redeploy"

---

## Step 4: Test Deployment (3 minutes)

### Frontend Test
- [ ] Open `https://your-project.vercel.app` in browser
- [ ] Verify page loads without errors
- [ ] Check browser console (F12) for errors

### Backend Health Check
- [ ] Open `https://your-backend.onrender.com/api/health` in browser
- [ ] Should see: `{"ok":true}`

### End-to-End Test
- [ ] On frontend, go to "Browse Properties" tab
- [ ] Should see property list loading
- [ ] Open DevTools (F12) → Network tab
- [ ] Click on property filter
- [ ] Verify requests go to your backend domain

---

## Step 5: Optional - Custom Domain

### For Frontend (Vercel)
- [ ] Settings → Domains
- [ ] Add your custom domain
- [ ] Update DNS records (Vercel shows instructions)

### For Backend (Render)
- [ ] Settings → Custom Domains
- [ ] Add your custom domain
- [ ] Update DNS records

---

## Troubleshooting

### CORS Error
```
Access to XMLHttpRequest blocked by CORS
```
**Solution**: 
- [ ] Check `VITE_API_URL` is correct in Vercel env vars
- [ ] Redeploy frontend after changing env var
- [ ] Wait 5 minutes for changes to propagate

### "Failed to fetch" Error
- [ ] Check backend is running on Render (should show "Live" status)
- [ ] Check `VITE_API_URL` doesn't have trailing slash
- [ ] Check DATABASE_URL is correct in Render

### Database Connection Error
- [ ] Copy DATABASE_URL from Neon dashboard
- [ ] Make sure to include `?sslmode=require`
- [ ] In Render, use "Add Secret File" option if having issues

### Slow First Load
- [ ] Normal on Render free tier (backend spins down after 15 min)
- [ ] First request takes 30 seconds to wake up
- [ ] Upgrade to paid tier for instant response

---

## Final URLs to Save

```
Frontend: https://your-project.vercel.app
Backend: https://your-backend.onrender.com
API Endpoint: https://your-backend.onrender.com/api
Health Check: https://your-backend.onrender.com/api/health
```

---

## Success Indicators
- [ ] Frontend loads without errors
- [ ] Backend health check returns `{"ok":true}`
- [ ] Property list displays on "Browse Properties" tab
- [ ] API requests appear in DevTools Network tab
- [ ] No CORS errors in browser console
- [ ] Can filter properties and see data update

---

**Estimated Total Time: 20-30 minutes**

If you get stuck, check the DEPLOYMENT_GUIDE.md for detailed explanations.
