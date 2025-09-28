import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalAuth } from "@/hooks/local-auth-context";
import { useLocalData } from "@/hooks/local-data-context";
import { Users, DollarSign, Calendar, TrendingUp, LogOut } from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Kid, Payment } from "@/lib/database";

export default function AdminDashboard() {
  const { user, signOut } = useLocalAuth();
  const { getKids, getPayments } = useLocalData();
  const [kids, setKids] = useState<Kid[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [kidsData, paymentsData] = await Promise.all([
        getKids(),
        getPayments()
      ]);
      setKids(kidsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <LogOut color="#D4AF37" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
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
          <Text style={styles.sectionTitle}>Payment Overview</Text>
          <View style={styles.paymentStats}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Paid Payments:</Text>
              <Text style={styles.paymentValue}>{paidPayments}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Pending Verification:</Text>
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
    minWidth: '45%',
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