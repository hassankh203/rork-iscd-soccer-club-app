import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useLocalAuth } from "@/hooks/local-auth-context";
import { useApp } from "@/hooks/app-context";
import { useLocalData } from "@/hooks/local-data-context";
import { Users, Calendar, Bell, Camera, LogOut } from "lucide-react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";

export default function ParentDashboard() {
  const { user, signOut } = useLocalAuth();
  const { trainingPolls, announcements, media, unreadCounts } = useApp();
  const { getKids } = useLocalData();
  const [myKids, setMyKids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKids = async () => {
      try {
        setLoading(true);
        const kidsData = await getKids();
        setMyKids(kidsData);
      } catch (error) {
        console.error('Failed to load kids:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadKids();
    }
  }, [user, getKids]);
  const latestMedia = media[0];
  const recentPolls = trainingPolls.slice(-3);
  const recentAnnouncements = announcements.slice(-3);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
          <LogOut color="#666" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users color="#1B5E20" size={24} />
          <Text style={styles.statNumber}>{myKids.length}</Text>
          <Text style={styles.statLabel}>Kids Registered</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar color="#1B5E20" size={24} />
          <Text style={styles.statNumber}>{recentPolls.length}</Text>
          <Text style={styles.statLabel}>Training Events</Text>
        </View>
        <View style={styles.statCard}>
          <Bell color="#1B5E20" size={24} />
          <Text style={styles.statNumber}>
            {unreadCounts.messages + unreadCounts.announcements + unreadCounts.polls}
          </Text>
          <Text style={styles.statLabel}>Unread Items</Text>
        </View>
      </View>

      {latestMedia && (
        <TouchableOpacity style={styles.mediaCard}>
          <View style={styles.mediaHeader}>
            <Camera color="#1B5E20" size={20} />
            <Text style={styles.sectionTitle}>Pic of the Week</Text>
          </View>
          <Image source={{ uri: latestMedia.url }} style={styles.mediaImage} />
          {latestMedia.caption && (
            <Text style={styles.mediaCaption}>{latestMedia.caption}</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Announcements</Text>
        {recentAnnouncements.length > 0 ? (
          recentAnnouncements.map(announcement => (
            <TouchableOpacity
              key={announcement.id}
              style={styles.announcementCard}
              onPress={() => router.push('/communication')}
            >
              <View style={styles.announcementHeader}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                {!announcement.readBy.includes(user?.id || '') && (
                  <View style={styles.unreadDot} />
                )}
              </View>
              <Text style={styles.announcementContent} numberOfLines={2}>
                {announcement.content}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No announcements yet</Text>
        )}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/kids')}
        >
          <Text style={styles.actionButtonText}>Manage Kids</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/payments')}
        >
          <Text style={styles.actionButtonText}>Submit Payment</Text>
        </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
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
  mediaCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  mediaCaption: {
    padding: 16,
    paddingTop: 12,
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  announcementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1B5E20',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});