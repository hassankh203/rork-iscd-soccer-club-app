import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Database, Users, Trash2, Plus, ArrowLeft } from "lucide-react-native";
import { addTestData, testUsersData } from "@/scripts/add-test-data";
import { clearAllData } from "@/lib/database";

export default function AddTestDataScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleAddTestData = async () => {
    Alert.alert(
      'Add Test Data',
      'This will add 20 test users with kids and payments to the database. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Data',
          onPress: async () => {
            setIsLoading(true);
            try {
              await addTestData();
              Alert.alert(
                'Success!',
                '20 test users with kids and payments have been added to the database.',
                [
                  {
                    text: 'View Credentials',
                    onPress: () => setShowCredentials(true)
                  },
                  { text: 'OK' }
                ]
              );
            } catch (error) {
              console.error('Error adding test data:', error);
              Alert.alert(
                'Error',
                `Failed to add test data: ${error}`,
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete ALL users, kids, payments, and communications from the database. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearAllData();
              Alert.alert(
                'Data Cleared',
                'All data has been cleared. Default admin and sample users have been recreated.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert(
                'Error',
                `Failed to clear data: ${error}`,
                [{ text: 'OK' }]
              );
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#1B5E20" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Data Management</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Management</Text>
          <Text style={styles.sectionDescription}>
            Manage test data for the Islamic Soccer Club app
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton, isLoading && styles.disabledButton]}
            onPress={handleAddTestData}
            disabled={isLoading || isClearing}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Plus color="#fff" size={24} />
            )}
            <Text style={styles.actionButtonText}>
              {isLoading ? 'Adding...' : 'Add Test Data'}
            </Text>
            <Text style={styles.actionButtonSubtext}>20 users + kids + payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton, isClearing && styles.disabledButton]}
            onPress={handleClearData}
            disabled={isLoading || isClearing}
          >
            {isClearing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Trash2 color="#fff" size={24} />
            )}
            <Text style={styles.actionButtonText}>
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Text>
            <Text style={styles.actionButtonSubtext}>Reset database</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => setShowCredentials(!showCredentials)}
          >
            <Users color="#1B5E20" size={24} />
            <Text style={[styles.actionButtonText, styles.viewButtonText]}>
              {showCredentials ? 'Hide' : 'View'} Credentials
            </Text>
            <Text style={[styles.actionButtonSubtext, styles.viewButtonSubtext]}>All account details</Text>
          </TouchableOpacity>
        </View>

        {showCredentials && (
          <>
            <View style={styles.credentialsSection}>
              <Text style={styles.sectionTitle}>👨‍💼 Admin Credentials</Text>
              <View style={styles.credentialCard}>
                <Text style={styles.credentialText}>Email: admin@example.com</Text>
                <Text style={styles.credentialText}>Password: 123456</Text>
                <Text style={styles.credentialText}>Role: Admin</Text>
              </View>
            </View>

            <View style={styles.credentialsSection}>
              <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Parent Account Credentials</Text>
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
          </>
        )}

        <View style={styles.infoSection}>
          <Database color="#1B5E20" size={24} style={styles.infoIcon} />
          <Text style={styles.infoTitle}>What gets created:</Text>
          <Text style={styles.infoText}>• 20 parent accounts with unique emails</Text>
          <Text style={styles.infoText}>• 35+ kids with different ages, teams, and positions</Text>
          <Text style={styles.infoText}>• Random payments for each parent (1-3 per parent)</Text>
          <Text style={styles.infoText}>• Various payment statuses (pending, paid, overdue)</Text>
        </View>

        <View style={styles.storageInfo}>
          <Text style={styles.infoTitle}>💾 Data Storage Location:</Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },

  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  addButton: {
    backgroundColor: '#1B5E20',
  },
  clearButton: {
    backgroundColor: '#DC2626',
  },
  viewButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1B5E20',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  viewButtonText: {
    color: '#1B5E20',
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  viewButtonSubtext: {
    color: '#666',
  },
  credentialsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1B5E20',
  },
  infoIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  storageInfo: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF9800',
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