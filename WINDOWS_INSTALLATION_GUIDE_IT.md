# Guida di Installazione - Parental Control (Windows)

## Panoramica

Questa guida spiega come installare e configurare il client Windows di Parental Control, che consente di monitorare e controllare i dispositivi dei figli.

## Requisiti di Sistema

- **Sistema Operativo**: Windows 10 o Windows 11
- **Node.js**: Versione 14 o superiore (installato localmente)
- **Connessione Internet**: Richiesta per la comunicazione con il backend
- **Diritti di Amministratore**: Necessari per l'installazione del servizio di sistema

## Modalità di Installazione

L'installer consente due modalità di installazione:

### 1. Installazione per Utente Corrente (Scelta Consigliata per Primo Uso)

- Il servizio viene installato solo per l'utente corrente
- Il file di configurazione viene salvato in: `C:\Users\{NomeUtente}\.therealparentalcontrol`
- Non richiede privilegi di amministratore (ma l'installer li richiede comunque per l'installazione del servizio)

### 2. Installazione Sistema-Wide (Tutti gli Utenti)

- Il servizio viene installato per **tutti gli utenti** del computer
- Il file di configurazione viene salvato in: `C:\ProgramData\TheRealParentalControl`
- Richiede privilegi di amministratore
- Consigliata per ambienti multi-utente o parental control a livello di sistema

## Procedura di Installazione

### Step 1: Scaricare l'Installer

Scarica il file `Parental Control Child Setup 1.0.0.exe` dalla directory `dist/` del progetto.

### Step 2: Eseguire l'Installer

1. Fare doppio clic su `Parental Control Child Setup 1.0.0.exe`
2. Verrà visualizzata una richiesta **UAC (User Account Control)** - fare clic su **"Sì"** per concedere i privilegi necessari
3. L'installer aprirà una finestra di configurazione

### Step 3: Configurare l'Installazione

Nella finestra di installazione:

1. **Scegliere la modalità di installazione**:
   - Installazione standard (per utente corrente)
   - Installazione per tutti gli utenti (richiede admin)

2. **Selezionare il percorso di installazione** (opzionale):
   - Percorso predefinito: `C:\Program Files\Parental Control Child`
   - È possibile modificare il percorso secondo le proprie esigenze

3. **Fare clic su "Installa"**

### Step 4: Completamento Automatico

Durante l'installazione, l'installer eseguirà automaticamente:

- ✅ Copia dei file dell'applicazione
- ✅ Creazione della cartella di configurazione
- ✅ **Installazione del servizio Windows** (in background, automatico)
- ✅ Configurazione delle autorizzazioni di accesso

**Non è necessario eseguire ulteriori comandi manuali.**

### Step 5: Primo Avvio

1. Dopo l'installazione, il servizio Windows verrà avviato automaticamente
2. Nel menu Start cercare e aprire **"Parental Control Child"**
3. La prima volta che si apre l'applicazione, verrà richiesto di:
   - **Registrare un nuovo account** (primo accesso), oppure
   - **Effettuare il login** (se già registrato su un altro dispositivo)

## Registrazione e Configurazione Iniziale

### Per Primo Accesso (Registrazione)

1. Aprire l'applicazione "Parental Control Child"
2. Nella schermata di login, fare clic su **"Registra nuovo account"**
3. Fornire:
   - **URL Backend**: L'indirizzo del server Parental Control (es. `http://192.168.1.100:5000`)
   - **Nome dell'account**: Nome univoco per questo dispositivo
   - **Password**: Una password sicura per l'accesso
4. Fare clic su **"Registra"**
5. Dopo la registrazione, si verrà automaticamente loggati

### Procedura di Accoppiamento (Pairing)

Dopo la registrazione, è necessario collegare il dispositivo a un account genitore:

1. Nella schermata principale, fare clic su **"Genera QR Code"**
2. Un QR code verrà visualizzato sullo schermo
3. Aprire l'app genitore su un altro dispositivo (Android, iOS, etc.)
4. Scansionare il QR code dall'app genitore
5. Il dispositivo verrà automaticamente accoppiato e pronto per il monitoraggio

## Funzionalità Disponibili nel Client Windows

### Monitoraggio e Controllo da Windows

Una volta configurato, dal client Windows è possibile controllare:

#### 📊 Dashboard
- **Stato del Dispositivo**: Connessione e sync con il backend
- **Attività in Tempo Reale**: Visualizzazione dell'attività del dispositivo (se sincronizzate)
- **Stato del Servizio**: Se il servizio di background è attivo

#### 🔒 Configurazione del Monitoraggio

**Monitoraggio Browser Chrome:**
- Tracciamento siti web visitati
- Storico di navigazione
- Blocco di siti specifici (gestito via backend)

**Tracciamento Tempo Schermo:**
- Monitoraggio tempo totale di utilizzo
- Tempo per applicazione
- Notifiche quando il tempo limite è superato

**Gestione Restrizioni:**
- Abilitazione/Disabilitazione del dispositivo
- Applicazione di restrizioni di tempo
- Blocco di contenuti indesiderati

### Note Importanti

⚠️ **Servizio Windows**
- Il servizio di background viene eseguito automaticamente all'avvio del computer
- È necessario per la sincronizzazione dei dati anche quando l'app è chiusa
- Non disabilitare il servizio "Parental Control Child Service" da Gestione Attività

⚠️ **Percorso Configurazione**
- I file di configurazione vengono salvati automaticamente nel percorso appropriato
- Non modificare manualmente questi file
- Nel dashboard dell'applicazione, il percorso del file di configurazione è visibile

⚠️ **Connessione Backend**
- L'indirizzo del backend deve essere raggiungibile dalla rete del computer
- Verificare la connessione internet prima di avviare l'applicazione
- Se la connessione fallisce, verrà visualizzato un messaggio di errore nel dashboard

## Risoluzione dei Problemi

### Il Servizio Non Si Avvia

1. Aprire **Services.msc** (Servizi Windows)
2. Cercare "Parental Control Child Service"
3. Se non è presente, reinstallare l'applicazione
4. Se è presente ma non si avvia:
   - Fare clic destro → Proprietà
   - Verificare che l'account di accesso sia corretto
   - Controllare i log di Windows (Visualizzatore Eventi)

### Errore di Autorizzazioni Insufficienti

Se si vede un errore: **"Autorizzazioni insufficienti per salvare la configurazione"**

1. Fare clic destro su **Parental Control Child Setup 1.0.0.exe**
2. Selezionare **"Esegui come amministratore"**
3. Reinstallare l'applicazione

### Il Client Non Si Connette al Backend

1. Verificare l'URL del backend nella schermata di configurazione
2. Assicurarsi che il backend sia raggiungibile: `ping {indirizzo_backend}`
3. Verificare la connessione internet del computer
4. Se il problema persiste, contattare l'amministratore di sistema

### Il File di Configurazione Non Viene Trovato

- Verificare il percorso visualizzato nel dashboard
- Assicurarsi di avere permessi di lettura/scrittura su quella cartella
- Se necessario, concedere manualmente i permessi:
  - Fare clic destro sulla cartella → Proprietà → Sicurezza
  - Modificare le autorizzazioni per l'utente corrente

## Disinstallazione

### Procedura di Disinstallazione

1. Aprire **Pannello di Controllo** → **Programmi** → **Programmi e Funzionalità**
2. Cercare **"Parental Control Child"**
3. Fare clic su **"Disinstalla"**
4. Confermare la richiesta di amministratore
5. Durante la disinstallazione, il servizio Windows verrà automaticamente rimosso

### Pulizia Manuale (Facoltativo)

Dopo la disinstallazione, è possibile rimuovere manualmente i file di configurazione:

- **Per Utente Corrente**: Eliminare `C:\Users\{NomeUtente}\.therealparentalcontrol`
- **Sistema-Wide**: Eliminare `C:\ProgramData\TheRealParentalControl` (richiede admin)

## Supporto Tecnico

Per problemi o domande:

1. Verificare i log del servizio in **Visualizzatore Eventi** → **Registri di Windows** → **Sistema**
2. Controllare il percorso del file di configurazione (visibile nel dashboard)
3. Consultare la documentazione del backend nel file [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Versione**: 1.0.0  
**Data**: Giugno 2026  
**Sistema**: Windows 10/11
