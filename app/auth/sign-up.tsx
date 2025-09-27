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
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, User, Phone } from "lucide-react-native";
import { useSupabaseAuth } from "@/hooks/supabase-auth-context";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function SignUpScreen() {
  const { signUp } = useSupabaseAuth();
  
  // Debug Supabase configuration
  console.log('🔍 Supabase configured in sign-up:', isSupabaseConfigured());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    // Check Supabase configuration first
    if (!isSupabaseConfigured()) {
      Alert.alert(
        "Configuration Error", 
        "Supabase is not properly configured. Please check your environment variables and restart the app."
      );
      return;
    }

    if (!email || !password || !confirmPassword || !name || !phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length !== 6) {
      Alert.alert("Error", "Password must be exactly 6 digits");
      return;
    }

    if (!/^\d{6}$/.test(password)) {
      Alert.alert("Error", "Password must contain only numbers (6 digits)");
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Attempting sign up with:', { email, name, phone });
      console.log('🔍 Supabase configured:', isSupabaseConfigured());
      
      await signUp(email, password, name, phone);
      Alert.alert("Success", "Account created successfully! Please check your email to verify your account.");
      router.replace('/');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack?.substring(0, 200)
      });
      
      let errorMessage = "Failed to create account";
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert("Sign Up Error", errorMessage);
    } finally {
      setIsLoading(false);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ISCD today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User color="#666" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail color="#666" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone color="#666" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Password (6 digits)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
                editable={!isLoading}
              />
            </View>
            <Text style={styles.passwordHint}>
              Password must be exactly 6 digits (numbers only)
            </Text>

            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password (6 digits)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/sign-in')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
  signUpButton: {
    backgroundColor: '#1B5E20',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signUpButtonText: {
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
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: -10,
    marginLeft: 4,
  },
});