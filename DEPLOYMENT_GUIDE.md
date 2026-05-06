# Deployment Guide - Real Estate Management Portal

## Overview
This guide covers deploying the full-stack application:
- **Frontend**: React app deployed to Vercel
- **Backend**: Node.js API deployed to Render (free tier available)
- **Database**: PostgreSQL on Neon (already configured)

---

## Part 1: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Configure Frontend for Vercel

Update `frontend/vite.config.js` to add proper build output:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

### Step 3: Update Backend API URL

Create `frontend/.env.production` for production:
```
VITE_API_URL=https://your-backend-domain.com/api
```

Update `frontend/src/api.js` to use environment variable:
```javascript
const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
```

### Step 4: Deploy to Vercel

```bash
cd frontend
vercel --prod
```

**During the setup:**
- Choose "React" as framework
- Set root directory to `frontend`
- Build command: `npm run build`
- Output directory: `dist`

### Alternative: Deploy via GitHub

1. Push changes to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "New Project"
5. Select your repository
6. Configure:
   - **Framework**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Add Environment Variables (optional for development)
8. Deploy!

---

## Part 2: Deploy Backend to Render (Recommended for Free Tier)

### Step 1: Prepare Backend for Deployment

Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: real-estate-api
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node src/server.js
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

### Step 2: Update Backend for Production

Modify `backend/src/server.js` - change port listening:
```javascript
const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {  // Use 0.0.0.0 for production
  console.log(`Real Estate API running on http://localhost:${port}`);
});
```

### Step 3: Create .gitignore for backend
Make sure `backend/.env` is in `.gitignore` (should already be there).

### Step 4: Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up/Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `real-estate-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Root Directory**: `backend`
6. Add Environment Variables:
   - **DATABASE_URL**: (copy from your Neon dashboard)
   - **NODE_ENV**: `production`
7. Deploy!

You'll get a URL like: `https://real-estate-api.onrender.com`

---

## Part 3: Alternative Backend Deployment Options

### Option A: Vercel Serverless Functions

Create `api/properties.js`:
```javascript
import { pool } from '../backend/src/db.js';

export default async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM properties');
  res.status(200).json(rows);
};
```

**Pros**: Everything in one place  
**Cons**: Complex for this project, connection pooling can be tricky

### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repo
3. Select backend directory
4. Add PostgreSQL plugin
5. Railway auto-detects Node.js and deploys

### Option C: Heroku (requires paid plan now)

```bash
heroku create your-app-name
git push heroku main
```

---

## Part 4: Configure CORS for Production

Update `backend/src/server.js` CORS configuration:

```javascript
import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:8085",
  "https://your-vercel-frontend.vercel.app",  // Your Vercel URL
  "https://your-custom-domain.com"  // If you have custom domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

---

## Part 5: Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-domain.com/api
```

### Backend (on Render/Railway)
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
NODE_ENV=production
PORT=3001
```

---

## Part 6: Update Frontend API Configuration

In `frontend/src/api.js`:
```javascript
const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

---

## Part 7: Verify Deployment

### Test Frontend
```bash
# After Vercel deployment
curl https://your-vercel-frontend.vercel.app
```

### Test Backend Health Check
```bash
curl https://your-backend-domain.com/api/health
# Should return: { "ok": true }
```

### Test Full Integration
1. Open frontend URL in browser
2. Try "Browse Properties" tab
3. Check browser DevTools → Network tab
4. Verify requests go to your backend domain

---

## Part 8: Custom Domain (Optional)

### Vercel
1. Project settings → Domains
2. Add custom domain
3. Update DNS records (Vercel provides instructions)

### Render
1. Environment → Custom Domains
2. Add domain and configure DNS

---

## Part 9: Troubleshooting

### CORS Error
```
Access to XMLHttpRequest blocked by CORS
```
**Solution**: Update CORS origins in backend, redeploy

### Database Connection Error
```
Error: connect ENOTFOUND
```
**Solution**: 
- Verify DATABASE_URL env var is set correctly
- Check Neon firewall allows connection from backend IP
- Test connection locally first

### Frontend 404 after refresh
**Solution**: Add Vercel rewrites in `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Backend timeout on first request
**Solution**: Normal on free tier, Render spins down after 15 min of inactivity

---

## Summary

| Component | Platform | Free Tier | URL Format |
|-----------|----------|-----------|-----------|
| Frontend | Vercel | ✅ Yes | `https://project.vercel.app` |
| Backend | Render | ✅ Yes | `https://project.onrender.com` |
| Database | Neon | ✅ Yes | Serverless PostgreSQL |

---

## Quick Start Commands

```bash
# Frontend deployment
cd frontend
vercel --prod

# Backend deployment (after pushing to GitHub)
# Go to render.com and connect GitHub repo

# Local testing before deployment
cd backend && npm run dev &
cd frontend && npm run dev &
```

---

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Render  
3. ✅ Test end-to-end
4. ✅ Set up custom domain (optional)
5. ✅ Configure monitoring and logs

