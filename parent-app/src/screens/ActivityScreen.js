import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import ApiService from '../services/api';

function ActivityScreen({ route }) {
  const deviceId = route.params?.deviceId || null;
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadActivity();
  }, [selectedType]);

  const loadActivity = async () => {
    setIsLoading(true);
    try {
      if (deviceId) {
        const response = await ApiService.getChildActivity(deviceId, {
          limit: 100,
        });
        setActivities(response.data);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (selectedType === 'all') return true;
    return activity.activity_type === selectedType;
  });

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemType}>
          {item.activity_type === 'website_visit'
            ? '🌐 Website'
            : item.activity_type === 'app_open'
            ? '📱 App'
            : '⏱️ Screen Time'}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      {item.details.url && (
        <Text style={styles.itemText}>URL: {item.details.url}</Text>
      )}
      {item.details.title && (
        <Text style={styles.itemText}>Title: {item.details.title}</Text>
      )}
      {item.details.app_name && (
        <Text style={styles.itemText}>App: {item.details.app_name}</Text>
      )}
      {item.details.duration && (
        <Text style={styles.itemText}>
          Duration: {Math.round(item.details.duration / 60)} minutes
        </Text>
      )}
      {item.details.blocked && (
        <View style={styles.blockedBadge}>
          <Text style={styles.blockedText}>BLOCKED</Text>
        </View>
      )}
    </View>
  );

  const filterButtons = [
    { label: 'All', value: 'all' },
    { label: 'Websites', value: 'website_visit' },
    { label: 'Apps', value: 'app_open' },
    { label: 'Screen Time', value: 'screen_time' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterButtons.map((button) => (
            <TouchableOpacity
              key={button.value}
              style={[
                styles.filterButton,
                selectedType === button.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(button.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedType === button.value &&
                    styles.filterButtonTextActive,
                ]}
              >
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredActivities.length > 0 ? (
        <FlatList
          data={filteredActivities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item._id}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No activity recorded</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 12,
  },
  activityItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  blockedBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  blockedText: {
    color: '#d32f2f',
    fontSize: 11,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ActivityScreen;
