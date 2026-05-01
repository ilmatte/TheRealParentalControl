const axios = require('axios');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

class PairingManager {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.deviceId = this.getOrCreateDeviceId();
    this.pairingToken = null;
    this.qrCodeData = null;
  }

  getOrCreateDeviceId() {
    // Store device ID persistently in system
    // For Electron, use userData directory
    const storedId = localStorage?.getItem('device_id');
    if (storedId) return storedId;

    const id = uuidv4();
    localStorage?.setItem('device_id', id);
    return id;
  }

  /**
   * Generate pairing QR code on the PC
   * Called when Electron app first starts
   */
  async generatePairingCode() {
    try {
      const response = await axios.post(
        `${this.serverUrl}/api/pairing/generate`,
        {
          device_id: this.deviceId,
          device_name: os.hostname(),
          device_os: 'windows',
        }
      );

      this.pairingToken = response.data.pairing_token;
      this.qrCodeData = response.data.qr_code_data;

      // Generate QR code as data URL for display
      const qrCodeImage = await QRCode.toDataURL(this.qrCodeData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return {
        qr_code_image: qrCodeImage,
        qr_code_data: this.qrCodeData,
        device_id: this.deviceId,
        device_name: os.hostname(),
      };
    } catch (error) {
      console.error('Failed to generate pairing code:', error);
      throw error;
    }
  }

  /**
   * Wait for pairing confirmation from parent app
   * Polls the server to check if device has been paired
   */
  async waitForPairingConfirmation(maxWaitTime = 600000) {
    // 10 minutes max wait time
    const startTime = Date.now();
    const pollInterval = 2000; // Check every 2 seconds

    return new Promise((resolve, reject) => {
      const pollForPairing = async () => {
        try {
          const response = await axios.get(
            `${this.serverUrl}/api/pairing/qr/${this.deviceId}`
          );

          // Device is still pending pairing, keep polling
          if (response.status === 200) {
            if (Date.now() - startTime > maxWaitTime) {
              reject(new Error('Pairing timeout'));
              return;
            }

            setTimeout(pollForPairing, pollInterval);
            return;
          }
        } catch (error) {
          // 404 means pairing confirmed, device is now paired
          if (error.response?.status === 404) {
            resolve({
              status: 'paired',
              deviceId: this.deviceId,
            });
            return;
          }

          // Other errors, retry
          if (Date.now() - startTime > maxWaitTime) {
            reject(new Error('Pairing failed: ' + error.message));
            return;
          }

          setTimeout(pollForPairing, pollInterval);
        }
      };

      pollForPairing();
    });
  }

  /**
   * Get pairing status
   */
  async getPairingStatus() {
    try {
      const response = await axios.get(
        `${this.serverUrl}/api/pairing/qr/${this.deviceId}`
      );
      return {
        status: 'pending',
        device_name: response.data.device_name,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          status: 'paired',
        };
      }
      throw error;
    }
  }

  /**
   * Store pairing token for reconnection
   */
  savePairingData() {
    localStorage?.setItem('pairing_token', this.pairingToken);
    localStorage?.setItem('qr_code_data', this.qrCodeData);
  }

  /**
   * Load saved pairing data
   */
  loadPairingData() {
    this.pairingToken = localStorage?.getItem('pairing_token');
    this.qrCodeData = localStorage?.getItem('qr_code_data');
    return this.pairingToken && this.qrCodeData;
  }

  /**
   * Clear pairing data on logout
   */
  clearPairingData() {
    localStorage?.removeItem('pairing_token');
    localStorage?.removeItem('qr_code_data');
    this.pairingToken = null;
    this.qrCodeData = null;
  }
}

module.exports = PairingManager;
