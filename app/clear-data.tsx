import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAllUserData, clearAllData } from '@/lib/database';
import { useLocalData } from '@/hooks/local-data-context';
import { useRouter } from 'expo-router';
import { Trash2, RefreshCw, Users, AlertTriangle } from 'lucide-react-native';

export default function ClearDataPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const router = useRouter();
  const { getUsers } = useLocalData();

  const checkUserCount = async () => {
    try {
      console.log('🔄 Checking user count...');
      const users = await getUsers();
      setUserCount(users.length);
      console.log('📊 Current users count:', users.length);
      console.log('📊 Users data:', users);
    } catch (error) {
      console.error('❌ Error checking users:', error);
      setUserCount(0);
    }
  };

  const handleClearUserData = async () => {
    Alert.alert(
      'Clear User Data',
      'This will remove all parent users, kids, payments, and communications but keep admin users. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear User Data',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              console.log('🧹 Starting user data clear...');
              await clearAllUserData();
              console.log('✅ User data cleared, refreshing count...');
              // Wait a moment for data to be cleared
              await new Promise(resolve => setTimeout(resolve, 500));
              await checkUserCount();
              Alert.alert('Success', 'All user data has been cleared successfully!');
            } catch (error) {
              console.error('❌ Error clearing user data:', error);
              Alert.alert('Error', `Failed to clear user data: ${error}`);
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will remove ALL data including admin users and recreate default admin. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              console.log('🧹 Starting complete data clear...');
              await clearAllData();
              console.log('✅ All data cleared, refreshing count...');
              // Wait a moment for data to be cleared and recreated
              await new Promise(resolve => setTimeout(resolve, 1000));
              await checkUserCount();
              Alert.alert('Success', 'All data has been cleared and defaults recreated!');
            } catch (error) {
              console.error('❌ Error clearing all data:', error);
              Alert.alert('Error', `Failed to clear all data: ${error}`);
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  React.useEffect(() => {
    checkUserCount();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AlertTriangle size={32} color="#FF6B6B" />
          <Text style={styles.title}>Data Management</Text>
          <Text style={styles.subtitle}>Clear app data for debugging</Text>
        </View>

        <View style={styles.infoCard}>
          <Users size={24} color="#4ECDC4" />
          <Text style={styles.infoText}>
            Current Users: {userCount !== null ? userCount : 'Loading...'}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={checkUserCount}
            disabled={isClearing}
          >
            <RefreshCw size={16} color="#4ECDC4" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.clearUserButton]}
            onPress={handleClearUserData}
            disabled={isClearing}
          >
            <Trash2 size={20} color="#FFF" />
            <Text style={styles.buttonText}>
              {isClearing ? 'Clearing...' : 'Clear User Data Only'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.description}>
            Removes all parent users, kids, payments, and communications. Keeps admin users.
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.clearAllButton]}
            onPress={handleClearAllData}
            disabled={isClearing}
          >
            <Trash2 size={20} color="#FFF" />
            <Text style={styles.buttonText}>
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.description}>
            Removes ALL data and recreates default admin user (admin@example.com / 123456).
          </Text>
        </View>

        <View style={styles.credentialsCard}>
          <Text style={styles.credentialsTitle}>Default Admin Credentials</Text>
          <Text style={styles.credentialsText}>Email: admin@example.com</Text>
          <Text style={styles.credentialsText}>Password: 123456</Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
    marginLeft: 10,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F8F7',
    borderRadius: 6,
  },
  refreshText: {
    color: '#4ECDC4',
    marginLeft: 4,
    fontSize: 14,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  clearUserButton: {
    backgroundColor: '#FF9500',
  },
  clearAllButton: {
    backgroundColor: '#FF6B6B',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  credentialsCard: {
    backgroundColor: '#E8F8F7',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  credentialsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  credentialsText: {
    fontSize: 14,
    color: '#34495E',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  backButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '500',
  },
});