import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useLocalAuth } from '@/hooks/local-auth-context';
import { useLocalData } from '@/hooks/local-data-context';
import { getAllUsers, getAllKids, getAllPayments, getMediaUploads } from '@/lib/database';

export default function ViewDataScreen() {
  const { user } = useLocalAuth();
  const [allData, setAllData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [users, kids, payments, media] = await Promise.all([
        getAllUsers(),
        getAllKids(),
        getAllPayments(),
        getMediaUploads()
      ]);

      setAllData({
        users,
        kids,
        payments,
        media,
        currentUser: user
      });

      console.log('=== ALL APP DATA ===');
      console.log('Users:', JSON.stringify(users, null, 2));
      console.log('Kids:', JSON.stringify(kids, null, 2));
      console.log('Payments:', JSON.stringify(payments, null, 2));
      console.log('Media:', JSON.stringify(media, null, 2));
      console.log('Current User:', JSON.stringify(user, null, 2));
      console.log('===================');

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const DataSection = ({ title, data }: { title: string; data: any }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title} ({Array.isArray(data) ? data.length : 'N/A'})</Text>
      <ScrollView style={styles.dataContainer} nestedScrollEnabled>
        <Text style={styles.dataText}>{JSON.stringify(data, null, 2)}</Text>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'View All Data' }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.refreshButton} onPress={loadAllData}>
          <Text style={styles.refreshButtonText}>
            {loading ? 'Loading...' : 'Refresh Data'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <DataSection title="Current User" data={allData.currentUser} />
        <DataSection title="All Users" data={allData.users} />
        <DataSection title="All Kids" data={allData.kids} />
        <DataSection title="All Payments" data={allData.payments} />
        <DataSection title="All Media" data={allData.media} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  dataContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 8,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
});