import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ApiService from '../services/api';

function RestrictionsScreen({ route, navigation }) {
  const { deviceId } = route.params || {};
  const [restrictions, setRestrictions] = useState(null);
  const [newBlockedWebsite, setNewBlockedWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRestrictions();
  }, []);

  const loadRestrictions = async () => {
    setIsLoading(true);
    try {
      if (deviceId) {
        // Load restrictions for specific device
        const response = await ApiService.getChildRestrictions(deviceId);
        setRestrictions(response.data);
      }
    } catch (error) {
      console.error('Error loading restrictions:', error);
      Alert.alert('Error', 'Failed to load restrictions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockWebsite = async () => {
    if (!newBlockedWebsite.trim()) {
      Alert.alert('Error', 'Please enter a website');
      return;
    }

    try {
      await ApiService.blockWebsite(restrictions._id, newBlockedWebsite);
      Alert.alert('Success', `${newBlockedWebsite} has been blocked`);
      setNewBlockedWebsite('');
      await loadRestrictions();
    } catch (error) {
      Alert.alert('Error', 'Failed to block website');
    }
  };

  const handleUnblockWebsite = async (website) => {
    try {
      await ApiService.unblockWebsite(restrictions._id, website);
      Alert.alert('Success', `${website} has been unblocked`);
      await loadRestrictions();
    } catch (error) {
      Alert.alert('Error', 'Failed to unblock website');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!restrictions) {
    return (
      <View style={styles.container}>
        <Text>No restrictions configured</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Block Website</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="e.g., facebook.com"
            value={newBlockedWebsite}
            onChangeText={setNewBlockedWebsite}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleBlockWebsite}
          >
            <Text style={styles.buttonText}>Block</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Blocked Websites ({restrictions.blocked_websites.length})
        </Text>
        {restrictions.blocked_websites.length > 0 ? (
          restrictions.blocked_websites.map((website, index) => (
            <View key={index} style={styles.websiteItem}>
              <Text style={styles.websiteText}>{website}</Text>
              <TouchableOpacity
                onPress={() => handleUnblockWebsite(website)}
              >
                <Text style={styles.unblockText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No websites blocked</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Time Limit</Text>
        <View style={styles.limitsContainer}>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Current Limit:</Text>
            <Text style={styles.limitValue}>
              {restrictions.daily_time_limit} minutes
            </Text>
          </View>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => Alert.alert('Edit Limit', 'Feature coming soon')}
          >
            <Text style={styles.smallButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            Alert.prompt(
              'Lock Screen',
              'Enter reason:',
              (reason) => {
                // Handle lock
                Alert.alert('Screen locked for ' + reason);
              }
            );
          }}
        >
          <Text style={styles.actionText}>🔒 Lock Device</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => Alert.alert('Screen Unlocked')}
        >
          <Text style={styles.actionText}>🔓 Unlock Device</Text>
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
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  inputGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  websiteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  websiteText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  unblockText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
  limitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitItem: {
    flex: 1,
  },
  limitLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  smallButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  smallButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 12,
  },
  actionCard: {
    backgroundColor: '#f0f8ff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default RestrictionsScreen;
