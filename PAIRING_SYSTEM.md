# Sistema di Pairing senza Apertura Porte

## Come Funziona

Questo sistema permette al PC di un figlio di connettersi a un server cloud senza esporre porte locali. Solo il genitore che ha il QR code può controllare quel PC.

## Architettura

```
┌──────────────────┐                   ┌──────────────────┐
│   iPhone Parent  │                   │  Cloud Server    │
│  (App Genitore)  │◄─── Internet ────►│  (Railway.app)   │
│   - Login        │                   │  - Database      │
│   - Dashboard    │                   │  - Pairing API   │
│   - QR Scanner   │                   │  - WebSocket     │
└──────────────────┘                   └──────────────────┘
        ▲                                      ▲
        │ 1. Scan QR code                      │
        │ 2. Send pairing token                │ 4. Confirm pairing
        │                                      │ 5. Add device
        └──────────────────────────────────────┘
                          
┌──────────────────────────────────────────────────────┐
│  PC Windows (Figlio)                                 │
│  ┌─────────────────────────────────────────────────┐│
│  │ Electron Client                                  ││
│  │ - Genera QR code (device_id + token)            ││
│  │ - Mostra QR code nello schermo                  ││
│  │ - Si connette al server cloud                   ││
│  └─────────────────────────────────────────────────┘│
│                      ▲                                │
│                      │ 3. Poll server:              │
│                      │    "Sono stato paired?"      │
│                      │                              │
│    Nessuna porta     │    Quando YES:               │
│    aperta! Solo      │    Riceve restrizioni        │
│    connessione out   │    da server cloud           │
│                      └──────────────────────────────┤
└──────────────────────────────────────────────────────┘
```

## Flow di Pairing Dettagliato

### 1. IL PC si Avvia (Senza Login)

```javascript
// client-windows/src/main.js
PairingManager.generatePairingCode()
  ↓
{
  qr_code_image: (PNG base64),
  qr_code_data: "device_id:pairing_token"
}
  ↓
Mostra QR code grande sullo schermo
```

**QR Code contiene:**
```
device_id:pairing_token
51234567-abcd-efgh:a1b2c3d4e5f6...
```

### 2. Il Genitore Scansiona il QR Code

```javascript
// parent-app/src/screens/PairingScreen
BarCodeScanner.scan("device_id:pairing_token")
  ↓
API: POST /api/pairing/confirm
Body: {
  device_id: "51234567-abcd-efgh",
  pairing_token: "a1b2c3d4e5f6...",
  device_name: "Samsung Device"
}
Headers: Authorization: Bearer PARENT_TOKEN
  ↓
Server aggiorna: pairing.status = "paired"
pairing.parent_id = PARENT_ID
  ↓
Risposta: "Device paired successfully"
```

### 3. Il Server Cloud Confema il Pairing

```javascript
// backend/src/routes/pairing.js
router.post('/confirm', authParentOnly, async (req, res) => {
  // 1. Valida il pairing_token
  const pairing = await Pairing.findOne({
    device_id,
    pairing_token,
    status: 'pending'
  });
  
  // 2. Aggiorna status
  pairing.parent_id = req.user.id;
  pairing.status = 'paired';
  pairing.paired_at = new Date();
  
  // 3. Crea Device association
  await Device.findOneAndUpdate({ device_id }, { user_id: parentId });
  
  // Database now knows:
  // ✓ device_id appartiene a questo genitore
  // ✓ Nessun altro genitore può vedere questo device
});
```

### 4. Il PC Riconosce il Pairing

```javascript
// client-windows/src/pairing-manager.js
PairingManager.waitForPairingConfirmation()
  ↓
Polling: GET /api/pairing/qr/{device_id}
  ↓
Response: 404 (significa: device è stato paired!)
  ↓
PairingManager si stop di cercare
PC si connette al server come dispositivo paired
```

## Sicurezza del Sistema

### Principio: "Only Parent Sees Child's Device"

**Protezione 1: Pairing Token**
- Token casuale è inviato tramite QR code
- Valido una sola volta
- Expira dopo 10 minuti se non usato

**Protezione 2: Device Ownership**
- Ogni device ha un `parent_id` nel database
- Solo quel genitore può:
  - Vedere il device
  - Modificare restrizioni
  - Accedere ai dati di activity

**Protezione 3: API Authorization**
```javascript
// Tutti gli endpoint device richiedono:
const authDeviceOwner = async (req, res, next) => {
  const pairing = await Pairing.findOne({
    device_id: req.params.device_id,
    parent_id: req.user.id,  // ← Solo questo parent!
    status: 'paired'
  });
  
  if (!pairing) {
    return res.status(403).json({ error: 'Not authorized' });
  }
};
```

**Protezione 4: No Port Forwarding Needed**
- PC si connette **OUTBOUND** al server
- Non c'è listener locale
- Non c'è esplosione di porte
- Non c'è firewall issue

## API Endpoints

### 1. Generate Pairing Token (PC)
```bash
POST /api/pairing/generate
Content-Type: application/json

{
  "device_id": "51234567-abcd-efgh",
  "device_name": "PC-GAMING",
  "device_os": "windows"
}

Response:
{
  "pairing_token": "a1b2c3d4e5f6...",
  "qr_code_data": "device_id:pairing_token"
}
```

### 2. Confirm Pairing (iPhone)
```bash
POST /api/pairing/confirm
Authorization: Bearer PARENT_TOKEN
Content-Type: application/json

{
  "device_id": "51234567-abcd-efgh",
  "pairing_token": "a1b2c3d4e5f6...",
  "device_name": "PC-GAMING"
}

Response:
{
  "message": "Device paired successfully",
  "device_id": "51234567-abcd-efgh",
  "device_name": "PC-GAMING"
}
```

### 3. List Paired Devices (iPhone)
```bash
GET /api/pairing/devices
Authorization: Bearer PARENT_TOKEN

Response: [
  {
    "_id": ObjectId,
    "device_id": "51234567-abcd-efgh",
    "device_name": "PC-GAMING",
    "device_os": "windows",
    "parent_id": ObjectId,
    "status": "paired",
    "paired_at": "2026-05-01T10:30:00Z",
    "last_connected": "2026-05-01T14:45:00Z"
  }
]
```

### 4. Verify Ownership (Authorization)
```bash
GET /api/pairing/verify/:device_id
Authorization: Bearer PARENT_TOKEN

Response:
{
  "verified": true,
  "device_id": "51234567-abcd-efgh",
  "device_name": "PC-GAMING"
}
```

### 5. Unpair Device (iPhone)
```bash
POST /api/pairing/unpair/:device_id
Authorization: Bearer PARENT_TOKEN

Response:
{
  "message": "Device unpaired successfully"
}
```

## Database Schema

### Pairing Collection
```javascript
{
  _id: ObjectId,
  device_id: "51234567-abcd-efgh",        // Unique per device
  parent_id: ObjectId,                     // Genitore che possiede
  pairing_token: "a1b2c3d4e5f6...",       // Usa una volta
  qr_code_data: "device_id:pairing_token", // Per QR code
  status: "paired",                        // pending | paired | unpaired
  device_name: "PC-GAMING",
  device_os: "windows",
  paired_at: "2026-05-01T10:30:00Z",
  last_connected: "2026-05-01T14:45:00Z",
  createdAt: "2026-05-01T10:00:00Z"
}
```

## Vantaggi di Questo Approccio

✅ **Nessuna Apertura Porte**
- PC si connette outbound al server
- Router non ha bisogno config
- Funziona anche dietro NAT

✅ **Sicurezza per Default**
- Solo chi ha il QR code può aggiungere device
- Device associato solo a un genitore
- Pairing token usa una volta

✅ **Scalabilità**
- Device su cloud, non local
- 100+ devices possono connettersi
- Server gestisce tutte le comunicazioni

✅ **Niente Configurazione**
- User non deve:
  - Aprire porte
  - Configurare firewall
  - Configurare DNS
  - Installare software extra

## Scenari di Sicurezza

### Scenario 1: Hacker Scansiona il QR Code
```
Problem: Hacker cerca di rubare il device
Solution:
- Pairing token è casuale (256 bit)
- Token scade in 10 minuti
- PC cancella QR code non appena paired
- Hacker avrebbe bisogno di ENTRAMBI:
  1. QR code + token
  2. Account genitore valido (2FA)
```

### Scenario 2: Man-in-the-Middle Attack
```
Problem: Attacker intercetta la comunicazione
Solution:
- Tutte le connessioni usano HTTPS
- Database MongoDB è protetto
- JWT token usa secret key
- Communication è certificata SSL/TLS
```

### Scenario 3: Dispositivo Perso
```
Problem: Un genitore perde il phone
Solution:
- Solo quello che ha i device paired può vederli
- Se phone perso -> effettua login da nuovo phone
- Account ancora ha i device paired
- Può unpairing da quest'account nuovo
```

## Limitazioni & Future Improvements

⚠️ **Attuali**
- Pairing token salvo nel QR code (non hash)
- Device list visibile solo se autenticati
- No encryption end-to-end per device<->server

🔄 **Future**
- [ ] Device TLS certificates
- [ ] End-to-end encryption
- [ ] Pairing expiry notifications
- [ ] Multi-device pairing (1 genitore, N devices)
- [ ] Offline mode support
- [ ] Device sharing (multiple parents)

---

**Architecture**: Zero-config, Cloud-native, Secure
**Port Requirements**: None (outbound only)
**Deployment**: Railway (free $5/month)
