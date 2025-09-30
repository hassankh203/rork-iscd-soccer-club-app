import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Users, Database } from "lucide-react-native";
import { getAllUsers } from "@/lib/database";
import type { User } from "@/lib/database";

export default function ViewDataScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    try {
      console.log('📊 Loading all users from database...');
      const allUsers = await getAllUsers();
      console.log('✅ Loaded', allUsers.length, 'users');
      setUsers(allUsers);
    } catch (error) {
      console.error('❌ Error loading users:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B5E20" />
          <Text style={styles.loadingText}>Loading database...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#1B5E20" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Database</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <Database color="#1B5E20" size={32} />
          <Text style={styles.statsTitle}>Database Statistics</Text>
          <Text style={styles.statsText}>Total Users: {users.length}</Text>
          <Text style={styles.statsText}>
            Admins: {users.filter(u => u.role === 'admin').length}
          </Text>
          <Text style={styles.statsText}>
            Parents: {users.filter(u => u.role === 'parent').length}
          </Text>
          <Text style={styles.statsText}>
            Active: {users.filter(u => u.status === 'active').length}
          </Text>
          <Text style={styles.statsText}>
            Inactive: {users.filter(u => u.status === 'inactive').length}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users color="#1B5E20" size={24} />
            <Text style={styles.sectionTitle}>All Users</Text>
          </View>
          
          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No users found in database</Text>
              <Text style={styles.emptySubtext}>
                The database might not be initialized yet.
              </Text>
            </View>
          ) : (
            users.map((user, index) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>
                    {index + 1}. {user.name}
                  </Text>
                  <View style={[
                    styles.roleBadge,
                    user.role === 'admin' ? styles.adminBadge : styles.parentBadge
                  ]}>
                    <Text style={styles.roleBadgeText}>{user.role}</Text>
                  </View>
                </View>
                <Text style={styles.userDetail}>📧 {user.email}</Text>
                {user.phone && (
                  <Text style={styles.userDetail}>📱 {user.phone}</Text>
                )}
                <Text style={styles.userDetail}>
                  Status: {user.status === 'active' ? '✅ Active' : '❌ Inactive'}
                </Text>
                <Text style={styles.userDetail}>
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.credentialBox}>
                  <Text style={styles.credentialLabel}>Test Password:</Text>
                  <Text style={styles.credentialValue}>123456</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 How to use this data:</Text>
          <Text style={styles.infoText}>
            • All test accounts use password: 123456
          </Text>
          <Text style={styles.infoText}>
            • Copy any email above to sign in
          </Text>
          <Text style={styles.infoText}>
            • Admin accounts have full access
          </Text>
          <Text style={styles.infoText}>
            • Parent accounts can only see their own data
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  statsContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#1B5E20',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 12,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#DC2626',
  },
  parentBadge: {
    backgroundColor: '#1B5E20',
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  credentialBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  credentialLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  credentialValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C5282',
    fontFamily: 'monospace' as const,
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
});