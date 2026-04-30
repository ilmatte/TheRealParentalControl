import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import ApiService from '../services/api';

function ChildDetailScreen({ route, navigation }) {
  const { deviceId } = route.params;
  const [device, setDevice] = useState(null);
  const [restrictions, setRestrictions] = useState(null);
  const [screenTime, setScreenTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChildDetails();
  }, []);

  const loadChildDetails = async () => {
    setIsLoading(true);
    try {
      const deviceResponse = await ApiService.getDeviceDetails(deviceId);
      setDevice(deviceResponse.data);

      const restrictionResponse = await ApiService.getChildRestrictions(
        deviceResponse.data.user_id
      );
      setRestrictions(restrictionResponse.data);

      const screenTimeResponse = await ApiService.getScreenTimeSummary(
        deviceResponse.data.user_id
      );
      setScreenTime(screenTimeResponse.data);
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Failed to load device details</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{device.device_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>OS:</Text>
          <Text style={styles.value}>
            {device.os} {device.os_version}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <View
            style={[
              styles.statusBadge,
              device.is_active
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            <Text style={styles.statusText}>
              {device.is_active ? 'Active' : 'Offline'}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Sync:</Text>
          <Text style={styles.value}>
            {new Date(device.last_sync).toLocaleString()}
          </Text>
        </View>
      </View>

      {screenTime && screenTime.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Screen Time History</Text>
          {screenTime.slice(0, 7).map((day, index) => (
            <View key={index} style={styles.infoRow}>
              <Text style={styles.label}>{day._id}:</Text>
              <Text style={styles.value}>
                {Math.round(day.totalTime / 60)} minutes
              </Text>
            </View>
          ))}
        </View>
      )}

      {restrictions && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Restrictions</Text>
          <View style={styles.restrictionItem}>
            <Text style={styles.restrictionLabel}>
              ✓ Daily Limit: {restrictions.daily_time_limit} min
            </Text>
          </View>
          <View style={styles.restrictionItem}>
            <Text style={styles.restrictionLabel}>
              ✓ Blocked Sites: {restrictions.blocked_websites.length}
            </Text>
          </View>
          <View style={styles.restrictionItem}>
            <Text style={styles.restrictionLabel}>
              ✓ Safe Search: {restrictions.safe_search_enabled ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('Restrictions', { deviceId })
          }
        >
          <Text style={styles.actionButtonText}>Edit Restrictions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() =>
            navigation.navigate('Activity', { deviceId })
          }
        >
          <Text style={styles.secondaryButtonText}>View Full History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusInactive: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  restrictionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  restrictionLabel: {
    fontSize: 14,
    color: '#333',
  },
  actionContainer: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChildDetailScreen;
