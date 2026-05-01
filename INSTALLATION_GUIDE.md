# Guida Installazione - The Real Parental Control

## Panoramica

Questa soluzione consente di installare **server e client locali su Windows** per applicare restrizioni a molteplici utenti. L'app genitore funziona su **iPhone** per il controllo remoto.

## Architettura

```
iPhone (Genitore)
    ↓ WebSocket/HTTP (WiFi)
    ↓
PC Windows (Locale)
    ├─ Backend Node.js (server locale)
    └─ Electron Client (monitoraggio)
       ├─ Utente1 (figlio)
       ├─ Utente2 (figlio)
       └─ Utente3 (altri utenti)
```

---

## 1. Installazione su PC Windows

### 1.1 Prerequisites
- Windows 10/11
- Node.js 16+ con npm
- PowerShell (per gestione utenti)

### 1.2 Installazione del Backend Locale

```bash
cd backend
npm install

# Configurare variabili ambiente
# Creare file .env
PORT=3001
NODE_ENV=local
DB_TYPE=local
SERVER_URL=http://localhost:3001
```

### 1.3 Avviare il Server Locale

**Opzione 1: Modalità Development**
```bash
cd backend
npm start
```

**Opzione 2: Come Servizio Windows (auto-start)**
```bash
# Installare win-service (opzionale)
npm install -g nssm

# Configurare come servizio
nssm install TheRealParentalControl "node src/server.js"
nssm start TheRealParentalControl
```

### 1.4 Installazione Client Windows (Electron)

```bash
cd client-windows
npm install
npm start
```

---

## 2. Installazione App Genitore su iPhone

### 2.1 Build via Expo Application Services (EAS)

**Prerequisiti:**
- Account Expo (expo.dev)
- Expo CLI: `npm install -g expo-cli`

**Build per iPhone:**

```bash
cd parent-app

# Login a Expo
expo login

# Configurare project ID in eas.json (se non presente)
eas init

# Build per iOS (produce .ipa per TestFlight)
npm run build:ios
```

### 2.2 Distribuzione su App Store

Dopo la build:
1. Login a [App Store Connect](https://appstoreconnect.apple.com)
2. Creare nuova app
3. Upload build tramite Xcode o Transporter
4. Sottomettere per review

### 2.3 Alternativa: Build Locale con Xcode

```bash
cd parent-app

# Generare progetto Xcode
npx expo prebuild --platform ios --clean

# Aprire in Xcode
open ios/ParentalControl.xcworkspace

# Build e run da Xcode
```

---

## 3. Configurazione Utenti Windows Multipli

### 3.1 Rilevare Utenti Windows

Quando il **Electron Client** si avvia, legge automaticamente tutti gli utenti Windows locali:

```powershell
Get-LocalUser | ConvertTo-Json
```

**Esempio output:**
```json
[
  {
    "Name": "padre",
    "FullName": "Padre",
    "Enabled": true,
    "SID": "S-1-5-21-..."
  },
  {
    "Name": "figlio1",
    "FullName": "Giovanni",
    "Enabled": true,
    "SID": "S-1-5-21-..."
  }
]
```

### 3.2 Mappare Restrizioni a Utenti Specifici

Dall'**iPhone app** (genitore):
1. Accedere al dashboard
2. Selezionare il PC Windows
3. Scegliere un utente specifico (es: "figlio1")
4. Applicare le restrizioni:
   - Bloccare siti web
   - Impostare orari di utilizzo
   - Limitare app
   - Lock screen

**API Endpoint:**
```
POST /api/restrictions
{
  "device_id": "PC-WINDOWS-ID",
  "windows_username": "figlio1",
  "child_id": "USER-MONGODB-ID",
  "blocked_websites": ["youtube.com", "tiktok.com"],
  "daily_time_limit": 120,
  "usage_schedule": {
    "monday": { "start": "08:00", "end": "22:00" },
    ...
  }
}
```

---

## 4. Connessione Remota (iPhone → PC)

### 4.1 Stessa Rete WiFi

Se iPhone e PC sono sulla **stessa rete WiFi**:

```
1. iPhone scopre automaticamente il server
2. IP locale: 192.168.x.x:3001
3. WebSocket stabiliice automatica
```

### 4.2 Connessione da Rete Remota

Se vuoi controllare da **rete esterna**:

1. **Configurare port forwarding sul router:**
   - Porta: 3001 → 192.168.x.x:3001
   - Protocol: TCP

2. **Oppure usare VPN/Tunnel:**
   ```bash
   # Usare Ngrok
   ngrok http 3001
   # Otterrai URL: https://xxxx-xx-xxx-x.ngrok.io
   ```

3. **Configurare server URL nell'app:**
   - Impostazioni → Server customizzato
   - Inserire: `https://xxxx-xx-xxx-x.ngrok.io`

---

## 5. Struttura Modelli Database

### Device (PC Windows)

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,        // Genitore
  device_id: "MAC-ADDRESS",
  device_name: "DESKTOP-JOHN",
  os: "windows",
  os_version: "11",
  windows_users: [          // ← NUOVO: Utenti Windows
    {
      username: "figlio1",
      display_name: "Giovanni",
      sid: "S-1-5-21-...",
      is_child: true
    },
    {
      username: "padre",
      display_name: "Padre",
      sid: "S-1-5-21-...",
      is_child: false
    }
  ],
  last_sync: Date,
  is_active: true
}
```

### Restriction (Limiti per Utente Windows)

```javascript
{
  _id: ObjectId,
  device_id: ObjectId,
  child_id: ObjectId,
  parent_id: ObjectId,
  windows_username: "figlio1",  // ← NUOVO: Utente Windows specifico
  blocked_websites: ["youtube.com"],
  daily_time_limit: 120,
  usage_schedule: { ... },
  is_active: true
}
```

---

## 6. Routes API Aggiornate

### Registrare Device con Utenti Windows

```bash
POST /api/devices/register
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "device_id": "MAC-ADDRESS",
  "device_name": "DESKTOP-JOHN",
  "os": "windows",
  "os_version": "11",
  "windows_users": [
    {
      "username": "figlio1",
      "display_name": "Giovanni",
      "sid": "S-1-5-21-...",
      "is_child": true
    }
  ]
}
```

### Ottenere Restrizioni per Utente Specifico

```bash
GET /api/restrictions/device/:device_id/user/:windows_username
Authorization: Bearer TOKEN

Response:
[
  {
    "_id": ObjectId,
    "device_id": "...",
    "windows_username": "figlio1",
    "blocked_websites": ["youtube.com"],
    ...
  }
]
```

### Ottenere Tutte le Restrizioni del Device

```bash
GET /api/restrictions/device/:device_id/all
Authorization: Bearer TOKEN

Response:
[
  { windows_username: "figlio1", ... },
  { windows_username: "figlio2", ... }
]
```

---

## 7. Flowchart Installazione

```
┌─────────────────────────────────────┐
│ 1. Installare Backend su Windows    │
│   npm install && npm start          │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ 2. Rilevare Utenti Windows          │
│   Electron Client legge lista       │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ 3. Installare App su iPhone         │
│   Build iOS via EAS/Xcode          │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ 4. Login e Connessione iPhone→PC    │
│   WebSocket over WiFi/VPN          │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ 5. Configurare Restrizioni per      │
│    Utente Windows specifico         │
└─────────────────────────────────────┘
```

---

## 8. Troubleshooting

### Problema: iPhone non vede il PC

**Soluzione:**
```bash
# Verificare che backend stia rispondendo
curl http://localhost:3001/health

# Controllare firewall Windows
# Consentire porta 3001 per Node.js
```

### Problema: Restrizioni non applicate

**Verificare:**
1. `windows_username` corrisponde all'utente Windows
2. Device registrato con liste `windows_users`
3. Restriction attiva (`is_active: true`)

### Problema: Build iOS fallisce

```bash
# Clear cache
npm run build:ios -- --clean

# Verbose output
npm run build:ios -- --verbose
```

---

## 9. Prossimi Step (Opzionali)

- [ ] Database locale SQLite per installazioni self-hosted
- [ ] Windows service auto-start
- [ ] Interfaccia desktop per configurazione locale
- [ ] Backup/Restore configurazioni
- [ ] Analytics locale

---

## License
Licensed under MIT License
