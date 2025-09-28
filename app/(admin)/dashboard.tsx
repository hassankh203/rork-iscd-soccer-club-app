import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalAuth } from "@/hooks/local-auth-context";
import { useLocalData } from "@/hooks/local-data-context";
import { Users, DollarSign, Calendar, TrendingUp, LogOut, RefreshCw } from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Kid, Payment, User } from "@/lib/database";
import { useFocusEffect } from "@react-navigation/native";

export default function AdminDashboard() {
  const { user, signOut } = useLocalAuth();
  const { getKids, getPayments, getUsers } = useLocalData();
  const [kids, setKids] = useState<Kid[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('📱 Admin dashboard focused, refreshing data...');
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('📊 Loading dashboard data...');
      const [kidsData, paymentsData, usersData] = await Promise.all([
        getKids(),
        getPayments(),
        getUsers()
      ]);
      
      console.log('📊 Dashboard data loaded:');
      console.log('👶 Kids:', kidsData.length);
      console.log('💰 Payments:', paymentsData.length);
      console.log('👥 Users:', usersData.length);
      
      setKids(kidsData);
      setPayments(paymentsData);
      setUsers(usersData);
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const teamACount = kids.filter(k => k.team === 'Lions' || k.team === 'Tigers' || k.team === 'Eagles').length;
  const teamBCount = kids.filter(k => k.team === 'Cubs' || k.team === 'Panthers' || k.team === 'Hawks').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const paidPayments = payments.filter(p => p.status === 'paid').length;
  
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={handleRefresh} 
              style={styles.refreshButton}
              disabled={refreshing}
            >
              <RefreshCw color="#D4AF37" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
              <LogOut color="#D4AF37" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users color="#D4AF37" size={24} />
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={styles.statCard}>
            <Users color="#D4AF37" size={24} />
            <Text style={styles.statNumber}>{kids.length}</Text>
            <Text style={styles.statLabel}>Total Kids</Text>
          </View>
          
          <View style={styles.statCard}>
            <DollarSign color="#D4AF37" size={24} />
            <Text style={styles.statNumber}>${totalRevenue}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          
          <View style={styles.statCard}>
            <Calendar color="#D4AF37" size={24} />
            <Text style={styles.statNumber}>{paidPayments}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp color="#D4AF37" size={24} />
            <Text style={styles.statNumber}>{pendingPayments}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Distribution</Text>
          <View style={styles.teamStats}>
            <View style={styles.teamCard}>
              <Text style={styles.teamName}>Older Teams</Text>
              <Text style={styles.teamCount}>{teamACount} players</Text>
              <Text style={styles.teamSubtext}>Lions, Tigers, Eagles</Text>
            </View>
            <View style={styles.teamCard}>
              <Text style={styles.teamName}>Younger Teams</Text>
              <Text style={styles.teamCount}>{teamBCount} players</Text>
              <Text style={styles.teamSubtext}>Cubs, Panthers, Hawks</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.paymentStats}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total Users:</Text>
              <Text style={styles.paymentValue}>{users.length}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Active Users:</Text>
              <Text style={styles.paymentValue}>{users.filter(u => u.status === 'active').length}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total Kids:</Text>
              <Text style={styles.paymentValue}>{kids.length}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Paid Payments:</Text>
              <Text style={styles.paymentValue}>{paidPayments}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Pending Payments:</Text>
              <Text style={styles.paymentValue}>{pendingPayments}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total Revenue:</Text>
              <Text style={styles.paymentValue}>${totalRevenue}</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/communication')}
          >
            <Text style={styles.actionButtonText}>Send Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(admin)/users')}
          >
            <Text style={styles.actionButtonText}>Manage Users</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Registrations</Text>
          <View style={styles.activityList}>
            {kids.slice(-3).reverse().map(kid => (
              <View key={kid.id} style={styles.activityItem}>
                <Text style={styles.activityTitle}>New Player: {kid.name}</Text>
                <Text style={styles.activityDate}>
                  Team: {kid.team} • Age: {kid.age}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  teamStats: {
    flexDirection: 'row',
    gap: 12,
  },
  teamCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  teamCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  teamSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  paymentStats: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
});