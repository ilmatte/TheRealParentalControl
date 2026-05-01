# Web Dashboard for Parent Control

The parent can also control the child's PC from a **web browser** without installing the iOS app.

## Features

- ✅ Responsive web interface (Desktop/Tablet)
- ✅ Real-time device status
- ✅ Configure restrictions from browser
- ✅ View activity logs
- ✅ No native app required
- ✅ Works on any device with browser

## Architecture

```
┌─────────────────────────┐
│  Web Browser (Parent)   │
│  - Chrome, Firefox, Edge│
│  - Responsive design    │
│  - Real-time updates    │
└────────────┬────────────┘
             │ HTTPS
             ↓
┌─────────────────────────────────────┐
│  Railway Backend                    │
│  - REST API                         │
│  - WebSocket for real-time          │
│  - Database (MongoDB)               │
└─────────────────────────────────────┘
             ▲
             │ WebSocket updates
             │ Device status
             │ Activity logs
             │
┌────────────┴────────────┐
│   PC Windows (Figlio)   │
│   - Electron app        │
│   - Reports activity    │
│   - Applies restrictions│
└─────────────────────────┘
```

## Setup Web Dashboard

### 1. Create React Web App

```bash
# Create web dashboard (alternative to mobile app)
cd parent-app

# Already set up with Expo, but can also create React version
mkdir -p ../parent-web
cd ../parent-web

npx create-react-app .

npm install \
  axios \
  react-router-dom \
  socket.io-client \
  date-fns \
  recharts
```

### 2. Create Web App Structure

```
parent-web/src/
├── components/
│   ├── Dashboard.jsx
│   ├── DeviceList.jsx
│   ├── DeviceDetail.jsx
│   ├── RestrictionConfig.jsx
│   ├── ActivityLog.jsx
│   └── Login.jsx
├── services/
│   └── api.js
├── App.jsx
└── index.css
```

### 3. Key Components

#### Login Component
```javascript
// parent-web/src/components/Login.jsx
- Email/password form
- Auth token storage
- Redirect to dashboard
```

#### Device List Component
```javascript
// parent-web/src/components/DeviceList.jsx
- List all paired devices
- QR code scanning (desktop camera)
- Device name, OS, status
- Last connected timestamp
```

#### Device Detail Component
```javascript
// parent-web/src/components/DeviceDetail.jsx
- Real-time device status
- List of users on PC
- Activity monitoring
- Restriction controls
```

#### Restriction Config Component
```javascript
// parent-web/src/components/RestrictionConfig.jsx
- Block/allow websites
- Daily time limits
- Schedule setup (per day)
- Screen lock control
```

#### Activity Log Component
```javascript
// parent-web/src/components/ActivityLog.jsx
- Real-time activity stream
- Website visits
- App launches
- Duration tracking
- Filter by user/date
```

### 4. Deploy Web Dashboard

#### Option A: Static Hosting (Vercel/Netlify)

```bash
# Build React app
npm run build

# Deploy to Vercel
npm install -g vercel
vercel

# Or deploy to Netlify
# Drag-drop build folder on Netlify.com
```

Deploy on **Vercel** (recommended):
```bash
vercel --project-name=the-real-parental-control-web
```

#### Option B: Same Railway Instance

Deploy backend + frontend on same Railway:

```bash
# Create separate service on Railway for frontend
# Point to built React app (npm run build)
```

### 5. Configure API Endpoint

Update web dashboard to use Railway backend:

```javascript
// parent-web/src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  'https://therealparentalcontrol-prod.up.railway.app';

export const loginParent = (email, password) => {
  return axios.post(`${API_BASE_URL}/api/auth/login`, {
    email,
    password
  });
};

export const getDevices = (token) => {
  return axios.get(`${API_BASE_URL}/api/pairing/devices`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

### 6. Environment Variables

```bash
# .env.local
REACT_APP_API_URL=https://therealparentalcontrol-prod.up.railway.app
REACT_APP_ENV=production
```

## URL Structure

```
https://parent-web.vercel.app/
├── /login                    - Login page
├── /dashboard               - Device list
├── /device/:deviceId        - Device detail
├── /device/:deviceId/restrictions - Configure limits
├── /device/:deviceId/activity - View activity logs
└── /settings                - User settings
```

## Comparison: iOS App vs Web

| Feature | iOS App | Web Dashboard |
|---------|---------|---------------|
| **Device Support** | iPhone only | Any browser |
| **Notifications** | Push notifications | In-app only |
| **Offline** | Can cache state | Limited |
| **Installation** | App Store | No install |
| **Permissions** | Camera for QR | None required |
| **Real-time** | WebSocket | WebSocket |
| **Platform** | iOS only | Windows/Mac/Linux |

## Mobile Web

The web dashboard is also responsive for mobile browsers:

```javascript
// parent-web/src/App.jsx
import { useMediaQuery } from '@react-hooks/media-query';

const isMobile = useMediaQuery('(max-width: 768px)');

export default function App() {
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {/* Adaptive layout */}
    </div>
  );
}
```

## Deployment Checklist

- [ ] React app created
- [ ] API integration tested locally
- [ ] Environment variables configured
- [ ] Build production version
- [ ] Deploy to Vercel/Netlify
- [ ] Test login from web
- [ ] Test device pairing
- [ ] Test QR code scanning (if camera available)
- [ ] Test restriction controls
- [ ] Monitor performance

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Recommended |
| Firefox 88+ | ✅ Full | + |
| Safari 14+ | ✅ Full | Mobile OK |
| Edge 90+ | ✅ Full | - |
| IE 11 | ❌ Not supported | Too old |

## Advanced Features

### Real-time Notifications

```javascript
// Use Socket.io for real-time updates
import io from 'socket.io-client';

const socket = io('https://therealparentalcontrol-prod.up.railway.app', {
  auth: { token }
});

socket.on('device-activity', (data) => {
  console.log('New activity:', data);
  // Update UI in real-time
});
```

### QR Code Scanning from Web

For browsers with camera access:

```bash
npm install jsqr jszip
```

Can add desktop QR code scanner!

### PWA (Progressive Web App)

Make web app installable:

```javascript
// public/manifest.json
{
  "name": "The Real Parental Control",
  "short_name": "Parental Control",
  "icons": [...],
  "start_url": "/",
  "display": "standalone"
}
```

User can "Install" app on home screen!

## Next Steps

1. Keep mobile iOS app as primary
2. Add web dashboard as secondary option
3. Both connect to same Railway backend
4. Users choose: App or Web

This gives maximum flexibility!
