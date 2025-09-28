import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { addTestData, testUsersData } from '../scripts/add-test-data';

export default function AddTestDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataAdded, setIsDataAdded] = useState(false);

  const handleAddTestData = async () => {
    try {
      setIsLoading(true);
      await addTestData();
      setIsDataAdded(true);
      console.log('✅ Success! All test data has been added successfully!');
    } catch (error) {
      console.error('Error adding test data:', error);
      console.error('❌ Failed to add test data. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Add Test Data', headerShown: true }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Test Data Generator</Text>
          <Text style={styles.subtitle}>
            This will add 20 test parent accounts with their kids and sample payments
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleAddTestData}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Adding Test Data...' : 'Add Test Data'}
          </Text>
        </TouchableOpacity>

        {isDataAdded && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>✅ Test data added successfully!</Text>
          </View>
        )}

        <View style={styles.credentialsSection}>
          <Text style={styles.sectionTitle}>Admin Credentials</Text>
          <View style={styles.credentialCard}>
            <Text style={styles.credentialText}>Email: admin@example.com</Text>
            <Text style={styles.credentialText}>Password: 123456</Text>
            <Text style={styles.credentialText}>Role: Admin</Text>
          </View>
        </View>

        <View style={styles.credentialsSection}>
          <Text style={styles.sectionTitle}>Parent Account Credentials</Text>
          <Text style={styles.note}>All passwords are: 123456</Text>
          
          {testUsersData.map((user, index) => (
            <View key={user.email} style={styles.credentialCard}>
              <Text style={styles.userName}>{index + 1}. {user.name}</Text>
              <Text style={styles.credentialText}>📧 {user.email}</Text>
              <Text style={styles.credentialText}>📱 {user.phone}</Text>
              <Text style={styles.kidsTitle}>Kids:</Text>
              {user.kids.map((kid) => (
                <Text key={`${user.email}-${kid.name}`} style={styles.kidText}>
                  • {kid.name} ({kid.age} years, {kid.team} - {kid.position})
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What gets created:</Text>
          <Text style={styles.infoText}>• 20 parent accounts with unique emails</Text>
          <Text style={styles.infoText}>• 35+ kids with different ages, teams, and positions</Text>
          <Text style={styles.infoText}>• Random payments for each parent (1-3 per parent)</Text>
          <Text style={styles.infoText}>• Various payment statuses (pending, paid, overdue)</Text>
        </View>

        <View style={styles.storageInfo}>
          <Text style={styles.infoTitle}>Data Storage Location:</Text>
          <Text style={styles.infoText}>
            All data is stored locally using:
          </Text>
          <Text style={styles.infoText}>• Mobile: SQLite database (app.db)</Text>
          <Text style={styles.infoText}>• Web: AsyncStorage (browser local storage)</Text>
          <Text style={styles.infoText}>
            You can view the data through the admin panel after logging in as admin.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  successText: {
    color: '#155724',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  credentialsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  credentialCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  credentialText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  kidsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  kidText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
    marginBottom: 2,
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  storageInfo: {
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    lineHeight: 20,
  },
});