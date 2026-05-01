# Railway Deployment Guide

The Real Parental Control backend is configured to deploy on **Railway**, a modern PaaS platform offering **$5 free monthly credits** and excellent Node.js/MongoDB support.

## Why Railway?

- ✅ **Free tier**: $5/month free credits (enough for small apps)
- ✅ **No credit card required initially** (but required for production)
- ✅ **Native MongoDB support** (with MongoDB Atlas integration)
- ✅ **Perfect for Socket.io** (long-lived connections supported)
- ✅ **Easy deployment** from GitHub
- ✅ **Environment variables** management
- ✅ **Zero configuration** - just connect Git repo

## Step 1: Prepare Repository

```bash
# Ensure your backend code is in a Git repository
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Deploy on Railway

### Option A: Connect GitHub Repository (Recommended)

1. Visit [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Authorize Railway with GitHub
4. Select **TheRealParentalControl** repository
5. Railway auto-detects Node.js backend
6. Click **"Deploy"**

### Option B: Deploy using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize Railway project
railway init

# Deploy
railway up
```

## Step 3: Configure Environment Variables

In Railway Dashboard:

1. Open your deployed project
2. Go to **Variables** tab
3. Add these variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/parental_control
JWT_SECRET=your-very-secure-secret-key
JWT_EXPIRE=7d
CLIENT_URLS=https://your-domain.com,https://app.your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

## Step 4: Configure MongoDB Atlas (Free Tier)

### 4.1 Create MongoDB Atlas Account

1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"**
3. Create account with email
4. Create new cluster (choose **Free tier M0**)
5. Wait for cluster to be created (~5 minutes)

### 4.2 Get Connection String

1. Click **"Connect"** on your cluster
2. Select **"Drivers"** → **Node.js**
3. Copy connection string
4. Replace `<username>`, `<password>`, `<clustername>` with your values
5. Example: `mongodb+srv://user:pass@cluster.mongodb.net/parental_control`

### 4.3 Add IP Whitelist

1. Go to **Network Access** in MongoDB Atlas
2. Click **"Add IP Address"**
3. Select **"Allow access from anywhere"** (or add Railway IP)

## Step 5: Deploy Custom Domain (Optional)

### Using Railway Domain (Default)

Your app will get a domain like:
```
https://therealparentalcontrol-prod.up.railway.app
```

### Using Custom Domain

1. In Railway dashboard, go to **Settings**
2. Add **Custom Domain**
3. Update DNS records with provided CNAME
4. SSL certificate auto-generates

## Step 6: Environment-Specific Configuration

Create `.env.production` for Railway:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parental_control
JWT_SECRET=your-production-secret-key
CORS_ORIGIN=https://your-app-domain.com
DEBUG=false
```

## Step 7: Configure Socket.io for Production

Update `backend/src/server.js`:

```javascript
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 1e6,
});
```

## Step 8: Add Railway.json (Optional)

Create `railway.json` for custom build configuration:

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 5
  }
}
```

## Monitoring & Logs

### View Logs

```bash
# Using Railway CLI
railway logs

# Or in Dashboard: Logs tab
```

### Monitor Performance

Railway dashboard shows:
- CPU/Memory usage
- Network I/O
- HTTP request metrics
- Error rates

## Auto-Deployment

Railway automatically redeploys when you push to GitHub:

```bash
git commit -m "update backend"
git push origin main
# Railway auto-deploys within 30 seconds
```

## Troubleshooting

### Build Fails

```bash
# View build logs in Railway dashboard
# Check Node version compatibility
node --version  # Should be 16+
```

### MongoDB Connection Issues

```bash
# Test connection locally first
npm install mongodb
node -e "const mongo = require('mongodb'); ..."

# Check MongoDB Atlas firewall settings
# Ensure IP whitelist is configured
```

### WebSocket Not Working

Ensure Socket.io transports include polling:

```javascript
transports: ['websocket', 'polling']
```

## Scaling Considerations

### Free Tier Limitations

- **Memory**: 512 MB / container
- **CPU**: Shared
- **Bandwidth**: Depends on usage
- **$5/month credits** per project

### Upgrade to Paid

When free credits run out, Railway offers:
- Pay-as-you-go pricing
- Starting ~$5/month for small apps
- Scale automatically

## Cost Optimization

1. **Use Railway's free tier first** - $5/month credits
2. **Monitor resource usage** - Dashboard shows breakdown
3. **Optimize database queries** - Add indexes in MongoDB
4. **Use caching** - Reduce database calls
5. **Compress responses** - Enable gzip in Express

## Environment-Specific URLs

Update your client app to use Railway domain:

**For Production:**
```env
REACT_APP_SERVER_URL=https://therealparentalcontrol-prod.up.railway.app
```

**For Development:**
```env
REACT_APP_SERVER_URL=http://localhost:5000
```

## Example Deployment Checklist

- [ ] Git repository is public/private (based on preference)
- [ ] Code pushed to main branch
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string updated
- [ ] Environment variables configured in Railway
- [ ] Domain configured (custom or Railway default)
- [ ] Tested login and device pairing
- [ ] Logs reviewed for errors
- [ ] Monitored first 24 hours

## Next Steps

1. Deploy backend on Railway ← **Start here**
2. Update client apps with Railway domain
3. Test pairing flow end-to-end
4. Monitor performance and costs

---

**Estimated Setup Time**: 15-20 minutes
**Monthly Cost**: Free (with $5 credits)
**Recommended for**: Production small-medium apps
