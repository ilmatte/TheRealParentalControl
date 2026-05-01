# 🚀 Quick Deployment Commands

Copy & paste these commands in order to deploy everything.

## Prerequisite: GitHub Setup

```bash
# Make sure your code is in GitHub
git remote -v
# Should show your repo

# Push latest code
git add .
git commit -m "Add cloud backend with QR pairing"
git push origin main
```

## 1️⃣ Backend Deployment (Railway)

**Option A: Web Dashboard (Easiest)**

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize and select `TheRealParentalControl`
5. Wait for auto-deployment

**Option B: Railway CLI**

```bash
npm install -g @railway/cli
railway login
cd backend
railway up
```

## 2️⃣ Configure MongoDB & Environment Variables

In Railway Dashboard:

1. Click your project
2. Go to "Variables" tab
3. Add these:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/parental_control
JWT_SECRET=your-super-secret-key-here-12345678
JWT_EXPIRE=7d
CLIENT_URLS=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

## 3️⃣ Create MongoDB Atlas Database

```bash
# 1. Go to https://mongodb.com/cloud/atlas
# 2. Sign up (free)
# 3. Create cluster (Free M0 tier)
# 4. Wait ~5 minutes for cluster to be ready
# 5. Click "Connect" → "Drivers" → Node.js
# 6. Copy connection string
# 7. Replace <username>, <password>, <clustername>
# 8. Paste into Railway MONGODB_URI variable

# Connection string format:
# mongodb+srv://username:password@clustername.mongodb.net/parental_control
```

## 4️⃣ Build iOS App

```bash
# Install EAS CLI (one-time)
npm install -g eas-cli

# Login to Expo account (create if needed)
eas login

# Navigate to parent app
cd parent-app

# Build for iOS
npm run build:ios

# Follow prompts:
# - Choose iOS build type (archive for App Store)
# - Wait for build (~5 minutes)
# - EAS auto-uploads to TestFlight

# Or submit to App Store
npm run submit:ios
```

## 5️⃣ Install PC Client

```bash
# On child's PC (Windows 10/11)
cd client-windows

# Install dependencies
npm install

# Update .env for production
REACT_APP_SERVER_URL=https://therealparentalcontrol-prod.up.railway.app

# Start Electron app
npm start

# QR code appears automatically!
```

## 6️⃣ Pair Device from iPhone

```
1. Open Parental Control app on iPhone
2. Login with parent account
3. Tap "Settings" → "Pair New Device"
4. Tap "Scan QR Code"
5. Point camera at PC screen
6. Confirm pairing
✅ Device paired!
```

## 🔍 Verify Deployment

### Check Backend Running

```bash
# Test API health
curl https://therealparentalcontrol-prod.up.railway.app/health

# Should respond with:
# {"status":"OK","timestamp":"2026-05-01T10:00:00.000Z"}
```

### Check Database Connected

```bash
# Login to iPhone app
# If login succeeds, database is connected ✅
```

### Test QR Code Generation

```bash
# Start PC client
npm start

# Should display:
# ✓ Server running at http://localhost:3001
# ✓ QR code displayed on screen
```

## 📊 Monitoring

### View Railway Logs

```bash
railway logs
# or use Railway dashboard
```

### Database Usage

```
MongoDB Atlas Dashboard:
1. Go to https://cloud.mongodb.com
2. Select your cluster
3. View metrics:
   - Connections
   - Storage usage
   - Query performance
```

## 🆘 Troubleshooting

### Backend Not Starting

```bash
# Check logs
railway logs -f

# Common issues:
# - MONGODB_URI missing or wrong
# - PORT 5000 already in use
# - Node version < 16

# Fix: Add environment variables in Railway dashboard
```

### QR Code Scanning Fails

```bash
# On iPhone:
1. Check camera permissions in Settings
2. Ensure good lighting on QR code
3. Try from different angle
4. Restart Parental Control app

# On PC:
1. Ensure Electron started successfully
2. Make QR code larger (full screen)
3. Check console for errors: npm start (verbose)
```

### Device Not Paired

```bash
# Check server connection
curl https://therealparentalcontrol-prod.up.railway.app/health

# Check logs on PC
# Look for: "Pairing token generated"
# If not showing, server URL might be wrong

# Fix REACT_APP_SERVER_URL in client-windows
```

### Only See Some Restrictions

```bash
# Verify:
1. Windows username matches exactly (case-sensitive)
2. Restriction is marked as "is_active: true"
3. Device is still "paired" status
4. Check PC client is running
```

## 📝 Production Checklist

- [ ] Backend deployed to Railway
- [ ] MongoDB Atlas cluster created and configured
- [ ] Environment variables set in Railway
- [ ] iOS app built and available in TestFlight
- [ ] PC client installed and running
- [ ] First device paired successfully
- [ ] Can login from iPhone
- [ ] Device appears in dashboard
- [ ] Can create restrictions
- [ ] Restrictions appear on PC
- [ ] Real-time updates working
- [ ] Activity logs visible

## 🎯 Expected Results

After following all steps:

✅ iPhone app shows "Connected to server"
✅ PC shows QR code on startup
✅ Scanning QR pairs device
✅ Dashboard shows paired device
✅ Creating restrictions syncs to PC
✅ Website blocks apply instantly
✅ Time limits work
✅ Only you see your devices

## 📞 Support

If issues:

1. Check CHANGELOG.md for what changed
2. Read RAILWAY_DEPLOYMENT.md for Railway specifics
3. Read PAIRING_SYSTEM.md for pairing details
4. Check Railway logs: `railway logs -f`
5. Verify MongoDB connection string
6. Ensure Node.js 16+ installed
7. Check internet connectivity on all devices

## 🎉 Success!

Once deployed, you have:

- ✅ Remote PC control from iPhone
- ✅ Zero port forwarding needed
- ✅ QR code security
- ✅ Free hosting
- ✅ Real-time updates
- ✅ Multi-user support

**Enjoy your parental control system!** 🎊

---

**Deployment Time**: ~1 hour
**Maintenance**: Minimal
**Cost**: FREE (with Railway credits)
