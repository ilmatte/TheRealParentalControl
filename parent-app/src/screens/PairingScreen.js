import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';

const PairingScreen = ({ navigation, route, token, serverUrl, userId }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
    loadPairedDevices();
  }, []);

  const loadPairedDevices = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/pairing/devices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPairedDevices(response.data);
    } catch (error) {
      console.error('Failed to load paired devices:', error);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setIsScanning(false);

    try {
      // Parse QR code data format: device_id:pairing_token
      const [device_id, pairing_token] = data.split(':');

      if (!device_id || !pairing_token) {
        Alert.alert('Invalid QR Code', 'The QR code format is not recognized');
        return;
      }

      // Get device details from server
      const deviceResponse = await axios.get(
        `${serverUrl}/api/pairing/qr/${device_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { device_name, device_os } = deviceResponse.data;

      // Ask for confirmation
      Alert.alert(
        'Add Device?',
        `Do you want to add device "${device_name}" (${device_os})?`,
        [
          { text: 'Cancel', onPress: () => setScanned(false) },
          {
            text: 'Add',
            onPress: () => confirmPairing(device_id, pairing_token, device_name),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to verify device'
      );
      setScanned(false);
    }
  };

  const confirmPairing = async (device_id, pairing_token, device_name) => {
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/pairing/confirm`,
        {
          device_id,
          pairing_token,
          device_name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', `Device "${device_name}" paired successfully!`);
      setScanned(false);
      loadPairedDevices(); // Refresh list

      // Navigate to dashboard
      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 1000);
    } catch (error) {
      Alert.alert(
        'Pairing Failed',
        error.response?.data?.error || 'Failed to pair device'
      );
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpair = async (device_id, device_name) => {
    Alert.alert(
      'Unpair Device?',
      `Are you sure you want to unpair "${device_name}"?`,
      [
        { text: 'Cancel' },
        {
          text: 'Unpair',
          onPress: async () => {
            try {
              await axios.post(
                `${serverUrl}/api/pairing/unpair/${device_id}`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              Alert.alert('Success', 'Device unpaired');
              loadPairedDevices();
            } catch (error) {
              Alert.alert('Error', 'Failed to unpair device');
            }
          },
        },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Camera permission is required to scan QR codes
        </Text>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.scannerOverlay}>
          <Text style={styles.scannerText}>Point at the device QR code</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsScanning(false);
              setScanned(false);
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Device Pairing</Text>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          setIsScanning(true);
          setScanned(false);
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Scan QR Code</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Paired Devices</Text>

      {pairedDevices.length === 0 ? (
        <Text style={styles.emptyText}>
          No devices paired yet. Scan a QR code to add a device.
        </Text>
      ) : (
        pairedDevices.map((device) => (
          <View key={device._id} style={styles.deviceCard}>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.device_name}</Text>
              <Text style={styles.deviceDetail}>
                {device.device_os} • Last seen:{' '}
                {device.last_connected
                  ? new Date(device.last_connected).toLocaleDateString()
                  : 'Never'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.unpairButton}
              onPress={() =>
                handleUnpair(device.device_id, device.device_name)
              }
            >
              <Text style={styles.unpairButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>How to pair a device:</Text>
        <Text style={styles.infoText}>
          1. On the child's PC, launch the control app{'\n'}
          2. A QR code will appear{'\n'}
          3. Tap "Scan QR Code" above and point at it{'\n'}
          4. Confirm the pairing on this screen
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginVertical: 20,
  },
  deviceCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceDetail: {
    fontSize: 12,
    color: '#666',
  },
  unpairButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  unpairButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 16,
    marginTop: 30,
    marginBottom: 40,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  scannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});

export default PairingScreen;
