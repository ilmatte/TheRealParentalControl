import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import ApiService from '../services/api';

function DashboardScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [devices, setDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const devicesResponse = await ApiService.getDevices();
      setDevices(devicesResponse.data);
      // In a real app, fetch children list from family
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderDeviceCard = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() =>
        navigation.navigate('ChildDetail', { deviceId: item._id })
      }
    >
      <View style={styles.deviceHeader}>
        <Text style={styles.deviceName}>{item.device_name}</Text>
        <View
          style={[
            styles.statusBadge,
            item.is_active
              ? styles.statusActive
              : styles.statusInactive,
          ]}
        >
          <Text style={styles.statusText}>
            {item.is_active ? 'Active' : 'Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.deviceInfo}>
        <Text style={styles.infoLabel}>Device:</Text>
        <Text style={styles.infoValue}>{item.os}</Text>
      </View>

      <View style={styles.deviceInfo}>
        <Text style={styles.infoLabel}>Last Sync:</Text>
        <Text style={styles.infoValue}>
          {new Date(item.last_sync).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.deviceActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('Restrictions', { deviceId: item._id })
          }
        >
          <Text style={styles.actionText}>Restrict</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('Activity', { deviceId: item._id })
          }
        >
          <Text style={styles.actionText}>Activity</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Children's Devices</Text>
        <Text style={styles.headerSubtitle}>
          {devices.length} device{devices.length !== 1 ? 's' : ''} connected
        </Text>
      </View>

      {devices.length > 0 ? (
        <FlatList
          scrollEnabled={false}
          data={devices}
          renderItem={renderDeviceCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No devices connected yet
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Have your children install and login on their devices
          </Text>
        </View>
      )}

      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Restrictions')}
        >
          <Text style={styles.quickActionText}>Block Website</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Activity')}
        >
          <Text style={styles.quickActionText}>View All Activity</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  listContent: {
    padding: 12,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  deviceInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    width: 70,
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  deviceActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#ccc',
  },
  quickActionsContainer: {
    padding: 16,
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default DashboardScreen;
