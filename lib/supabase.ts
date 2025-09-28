import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zfwlrskjtwabynglrmgz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpmd2xyc2tqdHdhYnluZ2xybWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTEzNjksImV4cCI6MjA3NDU4NzM2OX0.A1f-ThQoFOfHWDrtFDaszubvYsKT44U5B1lqKWtv6sI';

console.log('🔧 Initializing Supabase client...');
console.log('  URL:', supabaseUrl);
console.log('  Key length:', supabaseAnonKey?.length);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('✅ Supabase client created successfully');

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const urlValid = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
  const keyValid = supabaseAnonKey && supabaseAnonKey.length > 100 && supabaseAnonKey.startsWith('eyJ');
  return !!(urlValid && keyValid);
};