import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalAuth } from "@/hooks/local-auth-context";
import { useApp } from "@/hooks/app-context";
import { Users, DollarSign, Calendar, TrendingUp, LogOut } from "lucide-react-native";
import { router } from "expo-router";

export default function AdminDashboard() {
  const { user, signOut } = useLocalAuth();
  const { kids, payments, trainingPolls, announcements } = useApp();

  const teamACount = kids.filter(k => k.team === 'A').length;
  const teamBCount = kids.filter(k => k.team === 'B').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const verifiedPayments = payments.filter(p => p.status === 'verified').length;
  
  const totalRevenue = payments
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

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
            <Text style={styles.statNumber}>{trainingPolls.length}</Text>
            <Text style={styles.statLabel}>Training Events</Text>
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
              <Text style={styles.teamName}>Team A (10+)</Text>
              <Text style={styles.teamCount}>{teamACount} players</Text>
            </View>
            <View style={styles.teamCard}>
              <Text style={styles.teamName}>Team B (Under 10)</Text>
              <Text style={styles.teamCount}>{teamBCount} players</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Overview</Text>
          <View style={styles.paymentStats}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Verified Payments:</Text>
              <Text style={styles.paymentValue}>{verifiedPayments}</Text>
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
            onPress={() => router.push('/communication')}
          >
            <Text style={styles.actionButtonText}>Send Announcement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/fees')}
          >
            <Text style={styles.actionButtonText}>Manage Fees</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {announcements.slice(-3).reverse().map(announcement => (
              <View key={announcement.id} style={styles.activityItem}>
                <Text style={styles.activityTitle}>Announcement: {announcement.title}</Text>
                <Text style={styles.activityDate}>
                  {new Date(announcement.createdAt).toLocaleDateString()}
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