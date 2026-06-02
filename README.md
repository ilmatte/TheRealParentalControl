# The Real Parental Control 👨‍👩‍👧‍👦

Un'app di parental control remoto moderna, tipo Family Link, che consente ai genitori di limitare l'uso di Chrome e specifici siti web sui dispositivi Windows dei figli.

Supporta un backend cloud gratuito (Render.com) per il controllo remoto da iPhone senza port forwarding.

## 🎯 Caratteristiche Principali

### Per i Genitori (App Mobile React Native)
- ✅ **Monitoraggio in tempo reale** - Visualizza l'attività su tutti i dispositivi dei tuoi figli
- ✅ **Blocco siti web** - Blocca facilmente siti inappropriati
- ✅ **Limiti di tempo** - Imposta limiti di tempo giornalieri per lo schermo
- ✅ **Blocco schermo remoto** - Blocca il dispositivo del figlio da remoto quando necessario
- ✅ **Storico di navigazione** - Accedi ai log completi di siti visitati
- ✅ **Notifiche push** - Ricevi avvisi su attività sospette
- ✅ **Statistiche dettagliate** - Grafici e analisi del tempo sullo schermo

### Per i Figli (Client Windows Electron)
- 🖥️ **Monitoraggio Chrome** - Traccia tutti i siti visitati in Chrome
- 🌐 **Blocco siti automatico** - I siti bloccati vengono bloccati automaticamente
- ⏱️ **Tracciamento tempo schermo** - Monitora il tempo totale di utilizzo del computer
- 🔒 **Blocco schermo** - Lo schermo può essere bloccato dai genitori
- 📊 **Dashboard locale** - Visualizza le restrizioni attive e il tempo rimanente

## 🏗️ Architettura

```
TheRealParentalControl/
├── backend/              # Node.js + Express server
│   ├── src/
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, validation
│   │   ├── sockets/      # WebSocket handlers
│   │   └── config/       # Database config
│   └── package.json
│
├── client-windows/       # Electron app (per Windows)
│   ├── src/
│   │   ├── main.js       # Electron main process
│   │   ├── chrome-monitor.js   # Chrome monitoring
│   │   ├── screen-time-tracker.js  # Screen time tracking
│   │   ├── device-manager.js   # Server communication
│   │   ├── preload.js    # IPC security layer
│   │   ├── components/   # React components
│   │   └── App.js
│   └── package.json
│
├── parent-app/           # React Native app (iOS/Android)
│   ├── src/
│   │   ├── screens/      # App screens
│   │   ├── services/     # API service
│   │   ├── components/   # Reusable components
│   │   └── App.js
│   └── package.json
│
├── docker-compose.yml    # Docker compose config
├── package.json          # Monorepo root
└── README.md
```

## 📋 Prerequisiti

- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **Docker** & **Docker Compose** (opzionale, per database)
- **MongoDB** (locale o via Docker)
- **Git**

## 🚀 Installazione Veloce

### 1. Clone il repository
```bash
git clone https://github.com/yourusername/TheRealParentalControl.git
cd TheRealParentalControl
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura le variabili di ambiente

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Modifica .env con le tue configurazioni
```

### 4. Avvia il database (con Docker)
```bash
docker-compose up -d mongo
```

### 5. Avvia il backend
```bash
npm run dev --workspace=@ParentalControl/backend
```

Il server sarà disponibile su `http://localhost:5000`

> Per un deployment cloud gratuito su Render.com, usa `DEPLOYMENT.md`.

### 6. Avvia il client Electron (Windows)
```bash
npm run dev --workspace=@ParentalControl/client-windows
```

### Installazione del servizio Windows (opzionale)

Il client Windows può essere installato come servizio. Puoi scegliere se installarlo solo per l'utente corrente (default) oppure come servizio di sistema disponibile a tutti gli utenti (richiede privilegi amministrativi).

- Installazione per l'utente corrente:

```bash
cd client-windows
npm run service-install
```

- Installazione come servizio di sistema (tutti gli utenti, richiede admin):

```bash
cd client-windows
npm run install:system
```

- Disinstallazione (usa la stessa modalità usata in fase di install):

```bash
cd client-windows
npm run service-uninstall        # per l'utente corrente
npm run uninstall:system         # per il service di sistema (admin)
```

Nota: l'installazione come servizio di sistema esegue il servizio con l'account `LocalSystem` per garantirne l'esecuzione indipendente dagli account utente.

### 7. Avvia l'app mobile genitore (React Native)
```bash
npm run dev --workspace=@ParentalControl/parent-app
```

## 🔧 Configurazione

### Variabili di Ambiente Backend

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/parental_control
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CLIENT_URLS=http://localhost:3000,http://localhost:3001
```

### Variabili di Ambiente Client Windows

```env
REACT_APP_SERVER_URL=http://localhost:5000
```

> Per l'installazione cloud su Render, imposta invece `REACT_APP_SERVER_URL` sull'URL di backend Render.

## 📚 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registra nuovo utente
- `POST /api/auth/login` - Login utente
- `GET /api/auth/me` - Get current user

### Dispositivi
- `POST /api/devices/register` - Registra dispositivo
- `GET /api/devices/list` - Elenca dispositivi utente
- `PUT /api/devices/:device_id/sync` - Sincronizza dispositivo

### Restrizioni
- `GET /api/restrictions/child/:child_id` - Get restrizioni
- `POST /api/restrictions` - Crea restrizione
- `PUT /api/restrictions/:restriction_id` - Aggiorna restrizione
- `POST /api/restrictions/:restriction_id/block-website` - Blocca sito
- `POST /api/restrictions/:restriction_id/lock-screen` - Blocca schermo
- `POST /api/restrictions/:restriction_id/unlock-screen` - Sblocca schermo

### Attività
- `GET /api/activity/child/:child_id` - Get attività del figlio
- `GET /api/activity/child/:child_id/websites` - Get siti visitati
- `GET /api/activity/child/:child_id/screen-time` - Get tempo schermo

## 🔌 WebSocket Events

### Client → Server
- `register-device` - Registra dispositivo
- `join-parent-room` - Unisciti a parent monitoring room
- `activity-update` - Invia update attività
- `check-website` - Controlla se sito è bloccato

### Server → Client
- `activity-received` - Attività ricevuta dal figlio
- `website-blocked` - Ordine blocco sito
- `screen-lock` - Ordine blocco schermo
- `screen-unlock` - Ordine sblocco schermo

## 🗄️ Modelli Database

### User
```javascript
{
  email: String,
  password: String (hashed),
  username: String,
  role: 'parent' | 'child',
  family_id: ObjectId,
  preferences: { notifications, theme },
  createdAt, updatedAt
}
```

### Device
```javascript
{
  user_id: ObjectId,
  device_id: String (unique),
  device_name: String,
  os: 'windows' | 'macos' | 'linux',
  chrome_version: String,
  is_active: Boolean,
  last_sync: Date
}
```

### Restriction
```javascript
{
  child_id: ObjectId,
  parent_id: ObjectId,
  blocked_websites: [String],
  daily_time_limit: Number (minutes),
  usage_schedule: Object,
  screen_lock: { enabled, locked_at, reason },
  safe_search_enabled: Boolean
}
```

### Activity
```javascript
{
  child_id: ObjectId,
  activity_type: 'website_visit' | 'app_open' | 'screen_time',
  details: { url, title, app_name, duration },
  timestamp: Date,
  blocked: Boolean
}
```

## 🔐 Sicurezza

- ✅ **JWT Authentication** - Token-based authentication
- ✅ **Password Hashing** - bcryptjs per hash delle password
- ✅ **HTTPS/TLS** - Comunicazione crittografata (in produzione)
- ✅ **CORS** - Protezone contra accesso non autorizzato
- ✅ **Input Validation** - Validazione di tutti gli input
- ✅ **Rate Limiting** - Protezione contra brute-force
- ✅ **Secure Storage** - Token stored securely su dispositivi

## 📱 Supporto Piattaforme

### Backend
- ✅ Linux
- ✅ macOS
- ✅ Windows

### Client Bambino
- ✅ Windows 7+ (Electron)
- ⚠️ macOS (in development)
- ⚠️ Linux (in development)

### App Genitore
- ✅ iOS (React Native)
- ✅ Android (React Native)
- ✅ Web (con React - future)

## 🛠️ Development

### Installa dipendenze di development
```bash
npm install
```

### Lint del codice
```bash
npm run lint
```

### Format code
```bash
npm run format
```

### Test
```bash
npm test
```

## 📝 Log e Debug

### Backend
```bash
# Usa nodemon in development
npm run dev --workspace=@ParentalControl/backend

# Log file: backend/logs/
```

### Client Windows
```bash
# DevTools aperti automaticamente in development
# Console log disponibili nella finestra Electron
```

## 🐛 Troubleshooting

### Problema: "MongoDB connection refused"
```bash
# Soluzione:
docker-compose up -d mongo
# o installa MongoDB localmente
```

### Problema: "Port 5000 already in use"
```bash
# Soluzione: Cambia port in .env
PORT=5001
```

### Problema: Chrome non monitored
```bash
# Soluzione:
# 1. Assicurati che Chrome è installato
# 2. Riavvia l'app Windows
# 3. Controlla che device-manager sta comunicando col server
```

## 📊 Roadmap

- [ ] Support per macOS client
- [ ] Support per Linux client
- [ ] Web dashboard per desktop
- [ ] Integrazione con Google Family Link
- [ ] Machine learning per rilevare comportamenti sospetti
- [ ] Multi-language support
- [ ] Dark mode completo
- [ ] Pinterest, Instagram blocco contenuti
- [ ] Geolocation tracking
- [ ] SOS button per bambini

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit le tue changes (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 License

Distribuito sotto la MIT License - vedi [LICENSE](LICENSE) per dettagli.

## 📧 Support

Per supporto, email support@parentalcontrol.dev o apri un issue su GitHub.

## ⚠️ Disclaimer

Questa app è progettata per monitorare i dispositivi con il consenso dei bambini e in conformità alle leggi locali sulla privacy. I genitori sono responsabili dell'uso etico di questo strumento.

---

**Ultima modifica:** Aprile 30, 2024
**Versione:** 1.0.0-alpha
