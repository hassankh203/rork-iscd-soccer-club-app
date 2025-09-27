import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function DebugSupabaseScreen() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const configured = isSupabaseConfigured();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Supabase Debug Info</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Variables</Text>
          <Text style={styles.label}>EXPO_PUBLIC_SUPABASE_URL:</Text>
          <Text style={styles.value}>{supabaseUrl || 'Not set'}</Text>
          
          <Text style={styles.label}>EXPO_PUBLIC_SUPABASE_ANON_KEY:</Text>
          <Text style={styles.value}>
            {supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}... (${supabaseAnonKey.length} chars)` : 'Not set'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration Status</Text>
          <Text style={[styles.status, configured ? styles.success : styles.error]}>
            {configured ? '✅ Configured' : '❌ Not Configured'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Validation Details</Text>
          <Text style={styles.detail}>
            URL Valid: {supabaseUrl?.startsWith('https://') && supabaseUrl.includes('.supabase.co') ? '✅' : '❌'}
          </Text>
          <Text style={styles.detail}>
            Key Valid: {supabaseAnonKey && supabaseAnonKey.length > 100 && supabaseAnonKey.startsWith('eyJ') ? '✅' : '❌'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    color: '#666',
  },
  value: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  detail: {
    fontSize: 14,
    marginVertical: 2,
  },
});