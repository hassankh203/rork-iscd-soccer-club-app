import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging
console.log('🔍 Supabase URL:', supabaseUrl ? `Set (${supabaseUrl.substring(0, 30)}...)` : 'Not set');
console.log('🔍 Supabase Anon Key:', supabaseAnonKey ? `Set (${supabaseAnonKey.length} chars)` : 'Not set');
console.log('🔍 Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValid: supabaseUrl?.startsWith('https://'),
  keyValid: supabaseAnonKey && supabaseAnonKey.length > 100
});

// Simple configuration check
const hasValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
const hasValidKey = supabaseAnonKey && supabaseAnonKey.length > 100 && supabaseAnonKey.startsWith('eyJ');

if (!hasValidUrl || !hasValidKey) {
  console.warn('⚠️ Supabase not configured properly. Using mock mode.');
  console.warn('URL valid:', hasValidUrl, supabaseUrl);
  console.warn('Key valid:', hasValidKey, supabaseAnonKey ? `${supabaseAnonKey.length} chars` : 'Missing');
} else {
  console.log('✅ Supabase configuration is valid');
  console.log('URL:', supabaseUrl);
  console.log('Key length:', supabaseAnonKey?.length);
}

// Create a mock client for development when Supabase is not configured
const createMockClient = () => {
  const mockAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Supabase not configured. Please check your environment variables.' } 
    }),
    signUp: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Supabase not configured. Please check your environment variables.' } 
    }),
    signOut: () => Promise.resolve({ error: null }),
    updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
    resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null })
  };
  
  const mockFrom = () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: null })
    })
  });
  
  return {
    auth: mockAuth,
    from: mockFrom
  };
};

// Export either real Supabase client or mock client
const isConfigured = hasValidUrl && hasValidKey;

console.log('🔧 Final Supabase configured:', isConfigured);
console.log('🔧 URL check:', hasValidUrl);
console.log('🔧 Key check:', hasValidKey);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : createMockClient() as any;

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const urlValid = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
  const keyValid = supabaseAnonKey && supabaseAnonKey.length > 100 && supabaseAnonKey.startsWith('eyJ');
  const configured = !!(urlValid && keyValid);
  console.log('✅ isSupabaseConfigured check:', {
    configured,
    urlValid,
    keyValid,
    url: supabaseUrl?.substring(0, 30) + '...',
    keyLength: supabaseAnonKey?.length
  });
  return configured;
};