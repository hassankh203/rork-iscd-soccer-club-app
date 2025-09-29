import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  clearAllUserData, 
  clearAllData, 
  completeReset, 
  resetToFreshState, 
  resetWithSampleData 
} from '@/lib/database';
import { useLocalData } from '@/hooks/local-data-context';
import { useLocalAuth } from '@/hooks/local-auth-context';
import { useRouter, Stack } from 'expo-router';
import { Trash2, RefreshCw, Users, AlertTriangle, Database, RotateCcw } from 'lucide-react-native';

type ResetOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => Promise<void>;
  confirmTitle: string;
  confirmMessage: string;
  successMessage: string;
  dangerous?: boolean;
};

export default function ClearDataPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingOption, setProcessingOption] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const router = useRouter();
  const { getUsers } = useLocalData();
  const { signOut } = useLocalAuth();

  const resetOptions: ResetOption[] = [
    {
      id: 'complete',
      title: 'Complete Reset',
      description: 'Remove ALL users including admin. Creates completely empty app.',
      icon: <Trash2 size={24} color="#dc3545" />,
      color: '#dc3545',
      action: completeReset,
      confirmTitle: 'Complete Reset',
      confirmMessage: 'This will remove ALL users including admin accounts. The app will be completely empty with no users at all. You will need to create new accounts from scratch.',
      successMessage: 'Complete reset successful. App is now empty with no users.',
      dangerous: true
    },
    {
      id: 'fresh',
      title: 'Reset to Fresh State',
      description: 'Clear all data but keep admin user only. Clean slate with admin access.',
      icon: <RotateCcw size={24} color="#fd7e14" />,
      color: '#fd7e14',
      action: resetToFreshState,
      confirmTitle: 'Reset to Fresh State',
      confirmMessage: 'This will clear all data and users except the admin account. You will have a clean app with only admin access.',
      successMessage: 'Reset to fresh state successful. Only admin user remains.'
    },
    {
      id: 'sample',
      title: 'Reset with Sample Data',
      description: 'Clear all data and populate with comprehensive sample users, kids, payments, and communications.',
      icon: <Database size={24} color="#198754" />,
      color: '#198754',
      action: resetWithSampleData,
      confirmTitle: 'Reset with Sample Data',
      confirmMessage: 'This will clear all existing data and create sample users, kids, payments, and communications for testing purposes.',
      successMessage: 'Reset with sample data successful. Sample users and data created.'
    },
    {
      id: 'users',
      title: 'Clear User Data Only',
      description: 'Remove all parent users and their data, but keep admin users.',
      icon: <Users size={24} color="#6f42c1" />,
      color: '#6f42c1',
      action: clearAllUserData,
      confirmTitle: 'Clear User Data',
      confirmMessage: 'This will remove all parent users and their associated kids, payments, and communications. Admin users will be preserved.',
      successMessage: 'User data cleared successfully. Admin users preserved.'
    },
    {
      id: 'legacy',
      title: 'Legacy Clear All (Keep Admin)',
      description: 'Original clear function - removes all data but recreates admin and sample users.',
      icon: <RefreshCw size={24} color="#0d6efd" />,
      color: '#0d6efd',
      action: clearAllData,
      confirmTitle: 'Legacy Clear All Data',
      confirmMessage: 'This will clear all data and recreate the default admin user with sample parent users.',
      successMessage: 'Data cleared successfully. Default users recreated.'
    }
  ];

  const checkUserCount = useCallback(async () => {
    try {
      console.log('🔄 Checking user count...');
      const users = await getUsers();
      setUserCount(users.length);
      console.log('📊 Current users count:', users.length);
    } catch (error) {
      console.error('❌ Error checking users:', error);
      setUserCount(0);
    }
  }, [getUsers]);

  const handleReset = async (option: ResetOption) => {
    Alert.alert(
      option.confirmTitle,
      option.confirmMessage + '\n\nThis action cannot be undone. Are you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              setProcessingOption(option.id);
              console.log(`🔄 Starting ${option.title}...`);
              
              await option.action();
              
              console.log(`✅ ${option.title} completed successfully`);
              
              // Sign out current user if it's a dangerous operation
              if (option.dangerous || option.id === 'fresh' || option.id === 'sample') {
                await signOut();
              }
              
              // Wait a moment then refresh count
              await new Promise(resolve => setTimeout(resolve, 500));
              await checkUserCount();
              
              Alert.alert(
                'Success',
                option.successMessage + (option.dangerous || option.id === 'fresh' || option.id === 'sample' ? ' You will now be redirected to the login screen.' : ''),
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (option.dangerous || option.id === 'fresh' || option.id === 'sample') {
                        router.replace('/');
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              console.error(`❌ Error during ${option.title}:`, error);
              Alert.alert(
                'Error',
                `Failed to ${option.title.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                [{ text: 'OK' }]
              );
            } finally {
              setIsProcessing(false);
              setProcessingOption(null);
            }
          },
        },
      ]
    );
  };

  React.useEffect(() => {
    checkUserCount();
  }, [checkUserCount]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Reset Options',
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTintColor: '#333',
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningContainer}>
          <AlertTriangle size={48} color="#ff6b6b" />
          <Text style={styles.warningTitle}>Database Reset Options</Text>
          <Text style={styles.warningText}>
            Choose the appropriate reset option for your needs. All operations are irreversible.
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Users size={24} color="#4ECDC4" />
          <Text style={styles.infoText}>
            Current Users: {userCount !== null ? userCount : 'Loading...'}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={checkUserCount}
            disabled={isProcessing}
          >
            <RefreshCw size={16} color="#4ECDC4" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {resetOptions.map((option) => (
          <TouchableOpacity 
            key={option.id}
            style={[
              styles.optionCard,
              { borderLeftColor: option.color },
              isProcessing && processingOption !== option.id && styles.optionCardDisabled
            ]}
            onPress={() => handleReset(option)}
            disabled={isProcessing}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionIcon}>
                {isProcessing && processingOption === option.id ? (
                  <RefreshCw size={24} color={option.color} style={styles.spinning} />
                ) : (
                  option.icon
                )}
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: option.color }]}>
                  {option.title}
                </Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
            </View>
            
            {isProcessing && processingOption === option.id && (
              <View style={styles.processingIndicator}>
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Important Notes:</Text>
          <Text style={styles.infoItem}>• All reset operations are permanent and cannot be undone</Text>
          <Text style={styles.infoItem}>• You will be signed out after dangerous reset operations</Text>
          <Text style={styles.infoItem}>• Sample data includes 5 parents, 8 kids, payments, and communications</Text>
          <Text style={styles.infoItem}>• Admin credentials: admin@example.com / 123456</Text>
          <Text style={styles.infoItem}>• Sample user passwords are all: 123456</Text>
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
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  warningContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff6b6b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginTop: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  processingIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  processingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  spinning: {
    // Add rotation animation if needed
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#1565c0',
    marginBottom: 6,
    lineHeight: 20,
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