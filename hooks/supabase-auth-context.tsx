import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length !== 6) {
    return { isValid: false, message: 'Password must be exactly 6 digits' };
  }
  if (!/^\d{6}$/.test(password)) {
    return { isValid: false, message: 'Password must contain only numbers (6 digits)' };
  }
  return { isValid: true };
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Convert Supabase user to our User type
const mapSupabaseUserToUser = (supabaseUser: SupabaseUser, userMetadata?: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: userMetadata?.name || supabaseUser.user_metadata?.name || '',
    phone: userMetadata?.phone || supabaseUser.user_metadata?.phone || '',
    role: userMetadata?.role || supabaseUser.user_metadata?.role || 'parent',
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  };
};

export const [SupabaseAuthProvider, useSupabaseAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    console.log('Initializing Supabase auth...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      } else {
        console.log('Initial session:', session?.user?.email || 'No session');
        setSession(session);
        if (session?.user) {
          setUser(mapSupabaseUserToUser(session.user));
        }
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        
        if (session?.user) {
          // Fetch additional user data from profiles table if it exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser(mapSupabaseUserToUser(session.user, profile));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      // Demo mode - allow specific demo accounts
      if (email.toLowerCase() === 'admin@iscd.org' && password === '123456') {
        const demoAdmin: User = {
          id: 'demo-admin-id',
          email: 'admin@iscd.org',
          name: 'Demo Admin',
          phone: '+1234567890',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        setUser(demoAdmin);
        setSession({ user: demoAdmin } as any);
        console.log('Demo admin login successful');
        return;
      } else if (email.toLowerCase() === 'parent@example.com' && password === '654321') {
        const demoParent: User = {
          id: 'demo-parent-id',
          email: 'parent@example.com',
          name: 'Demo Parent',
          phone: '+1234567890',
          role: 'parent',
          createdAt: new Date().toISOString()
        };
        setUser(demoParent);
        setSession({ user: demoParent } as any);
        console.log('Demo parent login successful');
        return;
      } else {
        throw new Error('Demo mode: Use admin@iscd.org/123456 or parent@example.com/654321');
      }
    }
    
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message!);
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        throw new Error(error.message);
      }

      console.log('Sign in successful for:', email);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, phone: string) => {
    console.log('Attempting sign up for:', email);
    
    // Input validation
    if (!email || !password || !name || !phone) {
      throw new Error('All fields are required');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message!);
    }
    
    if (!validatePhone(phone)) {
      throw new Error('Please enter a valid phone number');
    }
    
    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            phone: phone.replace(/[\s\-\(\)]/g, ''),
            role: 'parent',
          },
        },
      });

      if (error) {
        console.error('Supabase sign up error:', error);
        throw new Error(error.message);
      }

      // Create profile record if user was created
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email.toLowerCase(),
            name: name.trim(),
            phone: phone.replace(/[\s\-\(\)]/g, ''),
            role: 'parent',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't throw here as the user was created successfully
        }
      }

      console.log('Sign up successful for:', email);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('Signing out user');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw new Error(error.message);
      }
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user || !session) {
      throw new Error('No user logged in');
    }
    
    console.log('Updating profile for user:', user.id);
    
    // Validate updates
    if (updates.email && !validateEmail(updates.email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (updates.phone && !validatePhone(updates.phone)) {
      throw new Error('Please enter a valid phone number');
    }
    
    if (updates.name && updates.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: updates.name || user.name,
          phone: updates.phone || user.phone,
          role: updates.role || user.role,
        },
      });

      if (authError) {
        console.error('Error updating auth user:', authError);
        throw new Error(authError.message);
      }

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: updates.name || user.name,
          phone: updates.phone || user.phone,
          role: updates.role || user.role,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw new Error(profileError.message);
      }

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }, [user, session]);
  
  const changePassword = useCallback(async (newPassword: string) => {
    if (!user || !session) {
      throw new Error('No user logged in');
    }
    
    console.log('Changing password for user:', user.id);
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message!);
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password change error:', error);
        throw new Error(error.message);
      }
      
      console.log('Password changed successfully');
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }, [user, session]);
  
  const resetPassword = useCallback(async (email: string) => {
    console.log('Password reset requested for:', email);
    
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password', // Configure this URL in your Supabase dashboard
      });

      if (error) {
        console.error('Password reset error:', error);
        throw new Error(error.message);
      }
      
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }, []);

  return useMemo(() => ({
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    resetPassword
  }), [user, session, isLoading, signIn, signUp, signOut, updateProfile, changePassword, resetPassword]);
});