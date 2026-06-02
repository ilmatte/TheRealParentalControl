# Deployment Guide - Render.com (FREE)

## Quick Start

Deploy the backend to **Render.com** (free tier) in **10 minutes**.

### Why Render?
- ✅ Free tier: 750 hours/month (3 instances continuously)
- ✅ PostgreSQL database included FREE
- ✅ Auto-deploy from GitHub
- ✅ HTTPS included
- ✅ No credit card required initially
- ✅ Much simpler than Railway

## Step 1: Prepare Backend (2 min)

Ensure `backend/package.json` has start script:

```json
"scripts": {
  "start": "node src/server.js"
}
```

## Step 2: Create Render Account (3 min)

1. Go to **https://render.com**
2. Click "Get Started"
3. Sign up with GitHub (or email)
4. Authorize Render with your GitHub account

## Step 3: Deploy Backend (5 min)

1. Click **New** → **Web Service**
2. Select **Connect a repository** → Choose `TheRealParentalControl`
3. Set these values:
   - **Name**: `parental-control-api`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Click **Create Web Service**

Render automatically deploys! Wait ~2 minutes...

**Your backend URL**: `https://parental-control-api-xxxx.onrender.com`

## Step 4: Configure Database

### Option A: MongoDB Atlas (Recommended - Still Free)

```bash
# 1. Go to https://mongodb.com/cloud/atlas
# 2. Create free M0 cluster
# 3. Get connection string:
#    mongodb+srv://user:pass@cluster.mongodb.net/parental_control

# 4. In Render dashboard:
#    Go to your Web Service
#    → Environment
#    → Add this variable:
#    
#    Key: MONGODB_URI
#    Value: mongodb+srv://user:pass@cluster.mongodb.net/parental_control
```

### Option B: PostgreSQL on Render (Also Free)

```bash
# In Render dashboard:
# 1. New → PostgreSQL
# 2. Select Free plan
# 3. Name: parental-control-db
# 4. PostgreSQL connection string auto-added to your Web Service as DATABASE_URL
```

> Nota: il backend attuale del progetto usa MongoDB tramite la variabile `MONGO_URI`. Se scegli PostgreSQL su Render, Render fornirà `DATABASE_URL`, ma questo repository richiede comunque MongoDB a meno che non modifichi il codice per usare PostgreSQL.

## Step 5: Set Environment Variables in Render

In Render dashboard → Your Web Service → Environment:

```
NODE_ENV = production
PORT = (auto-set by Render)
MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/parental_control
JWT_SECRET = your-super-secret-key-at-least-32-chars
JWT_EXPIRE = 7d
CLIENT_URLS = https://your-domain.com
CORS_ORIGIN = https://your-domain.com
```

Save changes. Render auto-redeploys!

### Cosa significano questi valori
- `MONGO_URI`: stringa di connessione a MongoDB. Questo è il valore usato dal backend del progetto per connettersi al database.
- `CLIENT_URLS`: lista separata da virgole di origini autorizzate per le connessioni Socket.io dal client mobile e dal client Windows. Esempio: `https://myapp.example.com,https://another-origin.example.com`.
- `CORS_ORIGIN`: origine autorizzata per le richieste HTTP CORS verso il backend. In questo progetto, Express usa la configurazione CORS generica, ma è buona pratica mantenere questo valore uguale a `CLIENT_URLS` per mettere in chiaro quali domini sono autorizzati.

Se usi PostgreSQL su Render:
- Render crea automaticamente `DATABASE_URL`.
- Nel progetto corrente il backend non lo utilizza direttamente.
- Per usare PostgreSQL dovresti aggiornare il codice backend per leggere `DATABASE_URL` e usare un driver/ORM PostgreSQL.

## Step 6: Build iOS App

```bash
cd parent-app

# Install EAS CLI
npm install -g eas-cli
eas login

# Build for iOS
npm run build:ios

# Update this file first:
# parent-app/src/services/api.js
# Change: REACT_APP_SERVER_URL to your Render URL
```

In `parent-app/src/services/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 
  'https://parental-control-api-xxxx.onrender.com';
```

Build command:
```bash
eas build --platform ios
```

## Step 7: Install PC Client

```bash
cd client-windows
npm install

# Create .env file
REACT_APP_SERVER_URL=https://parental-control-api-xxxx.onrender.com

npm start
```

## Step 8: Pair Your First Device

1. Open iPhone app
2. Login with parent account
3. Tap "Pair Device"
4. Scan QR code from PC
5. Confirm pairing

✅ **Done!** You can now control the PC from iPhone.

## Verify Deployment

### Test Backend

```bash
curl https://parental-control-api-xxxx.onrender.com/health

# Should respond:
# {"status":"OK","timestamp":"2026-05-01T..."}
```

### View Logs

In Render dashboard:
- Click your Web Service
- Go to "Logs" tab
- View real-time logs

### Check Database

For MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Select your cluster
3. View connection metrics

## Auto-Deploy from GitHub

Every time you push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render automatically redeploys within 30 seconds! 🚀

## Custom Domain (Optional)

In Render dashboard → Your Web Service:

1. Click "Custom Domain"
2. Add your domain (e.g., `api.myapp.com`)
3. Update DNS records as shown
4. HTTPS certificate auto-generates

## Free Tier Limits & When to Upgrade

### Free Tier
- **Compute**: 750 hours/month (≈1 instance 24/7 or 3 instances 8h/day)
- **Memory**: 0.5 GB RAM
- **Database**: 100 MB (PostgreSQL)
- **Cost**: $0/month

### When to Upgrade
- Heavy traffic (>100 req/sec)
- Need persistent storage
- Need private services
- Production with guaranteed uptime

Upgrade to **Starter** ($7/month) for 34 GB RAM + PostgreSQL database.

## Troubleshooting

### Backend Not Starting

```bash
# Check Render logs for errors
# Common issues:
# 1. Missing environment variables
# 2. Node version mismatch (ensure 16+)
# 3. Database connection string wrong

# Fix: Add/correct variables in Render Environment tab
```

### Can't Connect from PC/iPhone

```bash
# 1. Verify backend is running (check Logs)
# 2. Check CORS_ORIGIN is set correctly
# 3. Verify database connection works
# 4. Check firewall isn't blocking
```

### Database Too Slow

```bash
# Free PostgreSQL/MongoDB is slower
# Upgrade to paid tier for better performance
```

## Cost Breakdown

| Service | Provider | Cost |
|---------|----------|------|
| Backend | Render | FREE (750h/mo) |
| Database | MongoDB Atlas | FREE (M0) |
| iOS Build | Expo | FREE |
| **Total** | | **$0/month** 🎉 |

## Migration from Railway

If you previously used Railway:

1. Deploy this version to Render (following steps above)
2. Update client apps with new Render URL
3. Re-pair all devices (1-time)
4. Done! All restrictions sync to new backend

## Next Steps

✅ Backend running on Render
✅ Database configured  
✅ iOS app built
✅ PC client running
✅ First device paired

Now:
1. **Configure restrictions** in iPhone dashboard
2. **Monitor activity** in real-time
3. **Add more devices** if needed
4. **Invite other parents** (if shared family)

## Support

- Render docs: https://render.com/docs
- MongoDB help: https://docs.mongodb.com
- Issues? Check Render logs first

---

**Setup Time**: ~15 minutes
**Monthly Cost**: FREE
**Scalability**: Can upgrade to paid tier anytime
**No Credit Card**: Required for signup
