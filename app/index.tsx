import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, LogIn, UserPlus, Shield, BookOpen } from "lucide-react-native";

import { useSupabaseAuth } from "@/hooks/supabase-auth-context";
import { useHadith } from "@/hooks/hadith-context";
import { hadiths } from "@/constants/hadiths";

export default function HomeScreen() {
  const { user, isLoading } = useSupabaseAuth();
  const { getHadithOfTheDay } = useHadith();
  const [hadithModalVisible, setHadithModalVisible] = useState(false);
  const [currentHadith, setCurrentHadith] = useState<typeof hadiths[0] | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(parent)/dashboard');
      }
    }
  }, [user]);

  const openFieldDirections = () => {
    const address = "49 Salem Church Road, Newark, DE 19713";
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {
      console.log("Unable to open maps");
    });
  };

  const showHadithOfTheDay = async () => {
    try {
      const hadith = await getHadithOfTheDay();
      setCurrentHadith(hadith);
      setHadithModalVisible(true);
    } catch (error) {
      console.error('Error getting hadith of the day:', error);
      // Fallback to random selection if there's an error
      const randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];
      setCurrentHadith(randomHadith);
      setHadithModalVisible(true);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1B5E20', '#2E7D32', '#43A047']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800' }}
              style={styles.logo}
            />
            <Text style={styles.title}>ISCD</Text>
            <Text style={styles.subtitle}>Islamic Soccer Club of Delaware</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/auth/sign-in')}
            >
              <LogIn color="#fff" size={24} />
              <Text style={styles.primaryButtonText}>Parent Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/sign-up')}
            >
              <UserPlus color="#1B5E20" size={24} />
              <Text style={styles.secondaryButtonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.adminButton]}
              onPress={() => router.push('/auth/sign-in')}
            >
              <Shield color="#D4AF37" size={24} />
              <Text style={[styles.secondaryButtonText, styles.adminButtonText]}>
                Admin Portal
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={openFieldDirections}
            >
              <MapPin color="#fff" size={32} />
              <Text style={styles.actionTitle}>Field Directions</Text>
              <Text style={styles.actionSubtitle}>49 Salem Church Rd</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={showHadithOfTheDay}
            >
              <BookOpen color="#fff" size={32} />
              <Text style={styles.actionTitle}>Hadith of the Day</Text>
              <Text style={styles.actionSubtitle}>Daily Inspiration</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Building Character Through Sport</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={hadithModalVisible}
        onRequestClose={() => setHadithModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setHadithModalVisible(false)}
        >
          <View style={styles.hadithModal}>
            <Text style={styles.hadithTitle}>Hadith of the Day</Text>
            {currentHadith && (
              <>
                <Text style={styles.hadithText}>&quot;{currentHadith.text}&quot;</Text>
                <Text style={styles.hadithNarrator}>- {currentHadith.narrator}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHadithModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#E8F5E9',
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#1B5E20',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 12,
  },
  secondaryButtonText: {
    color: '#1B5E20',
    fontSize: 18,
    fontWeight: '600',
  },
  adminButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  adminButtonText: {
    color: '#D4AF37',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: '#E8F5E9',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  footerText: {
    color: '#E8F5E9',
    fontSize: 14,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hadithModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    alignItems: 'center',
  },
  hadithTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 20,
  },
  hadithText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  hadithNarrator: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});