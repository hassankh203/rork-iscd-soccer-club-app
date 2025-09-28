import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

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
          
          {!configured && (
            <View style={styles.setupInstructions}>
              <Text style={styles.instructionTitle}>Setup Instructions:</Text>
              <Text style={styles.instructionText}>1. Go to your Supabase dashboard</Text>
              <Text style={styles.instructionText}>2. Navigate to SQL Editor</Text>
              <Text style={styles.instructionText}>3. Run the SQL script from supabase-setup.sql</Text>
              <Text style={styles.instructionText}>4. Disable email confirmation in Auth settings</Text>
            </View>
          )}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Connection</Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={async () => {
              try {
                console.log('Testing Supabase connection...');
                const { data, error } = await supabase.auth.getSession();
                console.log('Session test result:', { data, error });
                
                if (error) {
                  Alert.alert('Connection Test', `Error: ${error.message}`);
                } else {
                  Alert.alert('Connection Test', 'Connection successful! ✅');
                }
              } catch (err) {
                console.error('Connection test failed:', err);
                Alert.alert('Connection Test', `Failed: ${err}`);
              }
            }}
          >
            <Text style={styles.testButtonText}>Test Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#2196F3', marginTop: 10 }]}
            onPress={async () => {
              try {
                console.log('Testing database tables...');
                const { data, error } = await supabase
                  .from('profiles')
                  .select('count')
                  .limit(1);
                
                if (error) {
                  Alert.alert('Database Test', `Tables not set up: ${error.message}\n\nPlease run the SQL setup script in your Supabase dashboard.`);
                } else {
                  Alert.alert('Database Test', 'Database tables are set up correctly! ✅');
                }
              } catch (err) {
                console.error('Database test failed:', err);
                Alert.alert('Database Test', `Failed: ${err}`);
              }
            }}
          >
            <Text style={styles.testButtonText}>Test Database Tables</Text>
          </TouchableOpacity>
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
  testButton: {
    backgroundColor: '#1B5E20',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  setupInstructions: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
});