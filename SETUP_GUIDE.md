# Setup Guide - The Real Parental Control

Una guida passo per passo per configurare il tuo ambiente di sviluppo.

## 📋 Prerequisiti

Assicurati di avere installato:
- [Node.js](https://nodejs.org/) >= 18.0.0
- [npm](https://www.npmjs.com/) >= 8.0.0
- [Git](https://git-scm.com/)
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop) (opzionale ma consigliato)

Verifica le versioni:
```bash
node --version  # v18.0.0 o superiore
npm --version   # 8.0.0 o superiore
git --version   # 2.0.0 o superiore
docker --version  # 20.0.0 o superiore (se installi Docker)
```

## 🗂️ Struttura del Progetto

Il progetto è un monorepo con tre workspace:

```
backend/          ← Server Node.js
client-windows/   ← App Electron per Windows
parent-app/       ← App React Native per genitori
```

## 🚀 Quick Start (5 minuti)

### Passo 1: Clone e Install
```bash
# Clone il repository
git clone <repo-url>
cd TheRealParentalControl

# Installa tutte le dipendenze
npm install
```

### Passo 2: Configura il Database

**Opzione A: Con Docker (Consigliato)**
```bash
docker-compose up -d mongo

# Verifica che MongoDB è running
docker ps
```

**Opzione B: Installazione locale**
```bash
# macOS (con Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Windows
# Scarica da: https://www.mongodb.com/try/download/community

# Linux (Ubuntu/Debian)
sudo apt-get install mongodb
```

### Passo 3: Configura le variabili di environment

**Backend**
```bash
cd backend
cp .env.example .env
# Modifica .env se necessario
```

Contenuto di `.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/parental_control
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
CLIENT_URLS=http://localhost:3000,http://localhost:3001,exp://localhost:8081
```

### Passo 4: Avvia il Backend

```bash
npm run dev --workspace=@ParentalControl/backend
```

Vedrai output:
```
Server running on port 5000
MongoDB connected successfully
```

Testa il server:
```bash
curl http://localhost:5000/health
# Response: {"status":"OK","timestamp":"..."}
```

### Passo 5: (Opzionale) Avvia il Client Windows

In un nuovo terminale:
```bash
npm run dev --workspace=@ParentalControl/client-windows
```

### Passo 6: (Opzionale) Avvia l'App Mobile Genitore

In un nuovo terminale:
```bash
npm run dev --workspace=@ParentalControl/parent-app
```

Apri uno di questi app con il tuo telefono:
- iOS: https://expo.dev/apps
- Android: Scarica Expo Go da Google Play

## 📝 Test dell'API

Usa Postman o cURL per testare gli endpoint.

### Registrazione
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "password123456",
    "username": "John Parent",
    "role": "parent"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "password123456"
  }'
```

Salva il token dalla risposta e usalo per altri endpoint:
```bash
# Sostituisci YOUR_TOKEN con il token ricevuto
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

## 🛠️ Development

### Comandi utili

```bash
# Sviluppo
npm run dev --workspace=@ParentalControl/backend

# Lint
npm run lint --workspace=@ParentalControl/backend

# Format
npm run format --workspace=@ParentalControl/backend

# Build
npm run build --workspace=@ParentalControl/backend

# Test
npm test --workspace=@ParentalControl/backend
```

### File Structure

```
backend/
├── src/
│   ├── server.js              # Entry point
│   ├── models/                # MongoDB schemas
│   │   ├── User.js
│   │   ├── Device.js
│   │   ├── Restriction.js
│   │   ├── Activity.js
│   │   └── Family.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── devices.js
│   │   ├── restrictions.js
│   │   └── activity.js
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── sockets/
│   │   └── handlers.js        # WebSocket handlers
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   └── services/              # Business logic
├── .env
├── .env.example
├── package.json
├── Dockerfile
└── .gitignore

client-windows/
├── src/
│   ├── main.js                # Electron main
│   ├── preload.js             # IPC preload
│   ├── App.js                 # React root
│   ├── App.css                # Styles
│   ├── chrome-monitor.js      # Chrome monitoring
│   ├── screen-time-tracker.js # Time tracking
│   ├── device-manager.js      # Server communication
│   └── components/
│       ├── Login.js
│       └── Dashboard.js
├── public/
│   └── index.html
└── package.json

parent-app/
├── src/
│   ├── App.js                 # React Native root
│   ├── services/
│   │   └── api.js             # API service
│   └── screens/
│       ├── LoginScreen.js
│       ├── DashboardScreen.js
│       ├── ChildDetailScreen.js
│       ├── RestrictionsScreen.js
│       ├── ActivityScreen.js
│       └── SettingsScreen.js
├── index.js
├── app.json
├── .babelrc
└── package.json
```

## 🔐 Security Notes

1. **JWT Secret**: Cambia `JWT_SECRET` in produzione con una stringa sicura
2. **HTTPS**: Usa HTTPS in produzione, non HTTP
3. **CORS**: Configura CORS per permettere solo i tuoi domini
4. **Rate Limiting**: Implementa rate limiting in produzione
5. **Input Validation**: Tutti gli input sono validati

## 🐛 Troubleshooting

### Problema: "MongoError: connect ECONNREFUSED"

**Soluzione:**
```bash
# Controlla se MongoDB è running
mongosh
# o per Docker:
docker ps | grep mongo
```

### Problema: "Port 5000 already in use"

**Soluzione:**
```bash
# Cambia PORT in .env
PORT=5001

# o uccidi il processo
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Problema: "npm ERR! ERESOLVE unable to resolve dependency tree"

**Soluzione:**
```bash
# Forza la risoluzione
npm install --legacy-peer-deps

# o aggiorna npm
npm install -g npm@latest
npm install
```

### Problema: Chrome non viene monitorato

**Soluzione:**
```bash
# 1. Assicurati che Chrome è installato
chrome --version

# 2. Riavvia l'app client
# 3. Controlla i log in console

# 4. In Windows, Chrome potrebbe essere in modalità Guest
# Disabilita Chrome Guest Mode in Windows Group Policy
```

## 📱 Mobile Development

### Expo Setup

```bash
# Installa Expo CLI globalmente
npm install -g expo-cli

# Login a Expo
expo login

# Avvia il server Expo
cd parent-app
expo start
```

### iOS (macOS)
```bash
# Installa Xcode (se non già installato)
# Apri Xcode > Preferences > Accounts e aggiungi il tuo account Apple

# Avvia il build iOS
expo build:ios
```

### Android
```bash
# Scarica e installa Android Studio
# https://developer.android.com/studio

# Configura Android SDK
# Allora avvia il build
expo build:android
```

## 🔄 Workflow di Sviluppo

### Per lavorare sul Backend
```bash
# 1. Terminal 1: Start MongoDB
docker-compose up mongo

# 2. Terminal 2: Start Backend
npm run dev --workspace=@ParentalControl/backend

# 3. Usa Postman/cURL per testare gli endpoint
```

### Per lavorare sul Client Windows
```bash
# 1. Assicurati che Backend è running (da sopra)

# 2. Terminal 3: Start Client
npm run dev --workspace=@ParentalControl/client-windows

# 3. L'app Electron si aprirà automaticamente
```

### Per lavorare su Parent App Mobile
```bash
# 1. Assicurati che Backend è running

# 2. Terminal 4: Start Parent App
npm run dev --workspace=@ParentalControl/parent-app

# 3. Scansiona il QR code con Expo Go o usa il simulatore
```

## 📚 Risorse Utili

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Native Docs](https://reactnative.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Socket.io Guide](https://socket.io/docs/)

## 🎓 Prossimi Passi

1. ✅ Completa Setup Locale
2. ⬜ Crea primo utente genitore
3. ⬜ Registra dispositivo bambino
4. ⬜ Testa flusso di autenticazione
5. ⬜ Configura restrizioni di prova
6. ⬜ Deploy a staging
7. ⬜ Testing completo
8. ⬜ Deployment in produzione

## 🤝 Getting Help

- 📖 Consulta [API.md](./API.md) per documentazione API
- 📖 Consulta [README.md](./README.md) per informazioni generali
- 🐛 Apri un Issue su GitHub
- 💬 Contatta il team di supporto

---

**Happy Coding! 🚀**
