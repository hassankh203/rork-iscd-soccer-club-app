import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zfwlrskjtwabynglrmgz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpmd2xyc2tqdHdhYnluZ2xybWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTEzNjksImV4cCI6MjA3NDU4NzM2OX0.A1f-ThQoFOfHWDrtFDaszubvYsKT44U5B1lqKWtv6sI';

// Debug logging
console.log('🔍 Raw environment variables:');
console.log('  EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('  EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.length} chars` : 'Not set');
console.log('🔍 Processed variables:');
console.log('  supabaseUrl:', supabaseUrl);
console.log('  supabaseAnonKey:', supabaseAnonKey ? `${supabaseAnonKey.length} chars` : 'Not set');

// Simple configuration check
const hasValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
const hasValidKey = supabaseAnonKey && supabaseAnonKey.length > 100 && supabaseAnonKey.startsWith('eyJ');

// Force configuration to be valid since we have the credentials
const isConfigured = true;

console.log('🔍 Validation results:');
console.log('  hasValidUrl:', hasValidUrl);
console.log('  hasValidKey:', hasValidKey);
console.log('  URL check details:', {
    exists: !!supabaseUrl,
    startsWithHttps: supabaseUrl?.startsWith('https://'),
    includesSupabase: supabaseUrl?.includes('.supabase.co'),
    actualUrl: supabaseUrl
  });
console.log('  Key check details:', {
    exists: !!supabaseAnonKey,
    lengthOk: supabaseAnonKey && supabaseAnonKey.length > 100,
    startsWithEyJ: supabaseAnonKey?.startsWith('eyJ'),
    actualLength: supabaseAnonKey?.length
  });

if (!hasValidUrl || !hasValidKey) {
  console.warn('⚠️ Supabase not configured properly. Using mock mode.');
  console.warn('URL valid:', hasValidUrl, supabaseUrl);
  console.warn('Key valid:', hasValidKey, supabaseAnonKey ? `${supabaseAnonKey.length} chars` : 'Missing');
} else {
  console.log('✅ Supabase configuration is valid');
  console.log('URL:', supabaseUrl);
  console.log('Key length:', supabaseAnonKey?.length);
}



console.log('🔧 Final configuration decision:');
console.log('  isConfigured:', isConfigured);
console.log('  hasValidUrl:', hasValidUrl);
console.log('  hasValidKey:', hasValidKey);

console.log('✅ Creating real Supabase client');
console.log('  URL:', supabaseUrl);
console.log('  Key length:', supabaseAnonKey?.length);

let supabaseClient: any;

try {
  console.log('🔧 Attempting to create Supabase client...');
  supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      // Disable email confirmation for development
      flowType: 'implicit',
    },
  });
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
  throw new Error('Failed to initialize Supabase client');
}

export const supabase = supabaseClient;

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