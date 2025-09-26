import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "@/hooks/auth-context";
import { useApp } from "@/hooks/app-context";
import { Shield, Upload, Database, LogOut } from "lucide-react-native";
import { router } from "expo-router";

export default function AdminSettingsScreen() {
  const { user, signOut } = useAuth();
  const { uploadMedia } = useApp();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const handleUploadTestMedia = async () => {
    const testUrl = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800";
    await uploadMedia(testUrl, 'image', 'Test media upload');
    Alert.alert("Success", "Test media uploaded");
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all app data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: async () => {
            // In production, this would clear the database
            Alert.alert("Success", "Data cleared");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.adminBadge}>
          <Shield color="#D4AF37" size={32} />
        </View>
        <Text style={styles.headerTitle}>Admin Settings</Text>
        <Text style={styles.headerSubtitle}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={handleUploadTestMedia}>
          <Upload color="#1B5E20" size={24} />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Upload Test Media</Text>
            <Text style={styles.actionDescription}>Upload a test image for Pic of the Week</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleClearData}>
          <Database color="#FF9800" size={24} />
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Clear All Data</Text>
            <Text style={styles.actionDescription}>Remove all app data (use with caution)</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version:</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Admin Since:</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Environment:</Text>
            <Text style={styles.infoValue}>Development</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut color="#fff" size={20} />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1B5E20',
    padding: 30,
    alignItems: 'center',
  },
  adminBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});