import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff, MapPin } from "lucide-react-native";
import { useLocalAuth } from "@/hooks/local-auth-context";

export default function SignInScreen() {
  const { signIn } = useLocalAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      console.log('Attempting sign in for:', email.trim());
      await signIn(email.trim(), password);
      console.log('Sign in successful, redirecting...');
      // Don't redirect to '/' as it will redirect based on user role
      // The useEffect in index.tsx will handle the redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      console.error('Sign in error:', errorMessage);
      setError(errorMessage);
      

      
      // Show alert for better user experience
      Alert.alert(
        'Sign In Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };



  const handleGetDirections = async () => {
    const locationUrl = 'https://maps.app.goo.gl/bS2xbmifNjdfYTBU7?g_st=aw';
    
    try {
      const supported = await Linking.canOpenURL(locationUrl);
      if (supported) {
        await Linking.openURL(locationUrl);
      } else {
        Alert.alert(
          'Unable to Open Maps',
          'Please install Google Maps or use a web browser to view the location.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error opening directions:', error);
      Alert.alert(
        'Error',
        'Unable to open directions. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail color="#666" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Password (6 digits)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                secureTextEntry={!showPassword}
                keyboardType="numeric"
                maxLength={6}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff color="#666" size={20} />
                ) : (
                  <Eye color="#666" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.disabledButton]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/sign-up')}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>🚀 Local Storage Mode</Text>
              <Text style={styles.demoSubtitle}>Using local SQLite database for authentication</Text>
              
              <View style={styles.demoAccount}>
                <Text style={styles.demoAccountTitle}>👨‍💼 Default Admin Account</Text>
                <Text style={styles.demoAccountText}>Email: admin@example.com</Text>
                <Text style={styles.demoAccountText}>Password: 123456</Text>
              </View>
              
              <View style={styles.demoAccount}>
                <Text style={styles.demoAccountTitle}>👨‍👩‍👧‍👦 Sample Parent Accounts</Text>
                <Text style={styles.demoAccountText}>Email: parent1@test.com</Text>
                <Text style={styles.demoAccountText}>Password: 123456</Text>
                <Text style={styles.demoAccountText}>Email: parent2@test.com</Text>
                <Text style={styles.demoAccountText}>Password: 123456</Text>
              </View>
              
              <Text style={styles.demoNote}>💡 You can also create new accounts using Sign Up</Text>
              
              <TouchableOpacity
                style={styles.testDataButton}
                onPress={() => router.push('/add-test-data')}
              >
                <Text style={styles.testDataButtonText}>🚀 Add Test Data & View All Credentials</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.directionsButton}
              onPress={handleGetDirections}
            >
              <MapPin color="#1B5E20" size={20} />
              <Text style={styles.directionsButtonText}>Get Directions to School</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  signInButton: {
    backgroundColor: '#1B5E20',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
  adminHint: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  eyeButton: {
    padding: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
  demoHint: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    borderColor: '#1B5E20',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  directionsButtonText: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5282',
    textAlign: 'center',
    marginBottom: 8,
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  demoAccount: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  demoAccountTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  demoAccountText: {
    fontSize: 12,
    color: '#4A5568',
    fontFamily: 'monospace' as const,
  },
  demoNote: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  supabaseSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  supabaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#15803D',
    textAlign: 'center',
    marginBottom: 8,
  },
  supabaseSubtitle: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resendButton: {
    backgroundColor: '#E8F5E8',
    borderColor: '#1B5E20',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  resendButtonText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
  testDataButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  testDataButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});