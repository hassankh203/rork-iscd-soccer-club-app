import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
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
    let isMounted = true;
    
    const initializeAuth = async () => {
      console.log('Initializing Supabase auth...');
      
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session:', session?.user?.email || 'No session');
          setSession(session);
          if (session?.user) {
            setUser(mapSupabaseUserToUser(session.user));
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        
        if (session?.user) {
          try {
            // Fetch additional user data from profiles table if it exists
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (isMounted) {
              setUser(mapSupabaseUserToUser(session.user, profile));
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            if (isMounted) {
              setUser(mapSupabaseUserToUser(session.user));
            }
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    
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
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        
        // Handle specific error types
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'object') {
          // Handle common Supabase error patterns
          if (error.error_description) {
            errorMessage = error.error_description;
          } else if (error.msg) {
            errorMessage = error.msg;
          } else {
            errorMessage = JSON.stringify(error);
          }
        } else {
          errorMessage = 'Unknown error occurred during sign in';
        }
        
        // Provide user-friendly error messages for common issues
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (errorMessage.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a moment and try again.';
        } else if (errorMessage.includes('Supabase not configured')) {
          errorMessage = 'Authentication service is not properly configured. Please contact support.';
        }
        
        throw new Error(errorMessage);
      }

      console.log('Sign in successful for:', email);
    } catch (error: any) {
      console.error('Sign in error:', error);
      // Ensure we always throw a proper Error object
      if (error instanceof Error) {
        throw error;
      } else {
        const errorMessage = typeof error === 'string' ? error : 
                           error?.message || 
                           (typeof error === 'object' ? JSON.stringify(error) : 'Unknown error occurred');
        throw new Error(errorMessage);
      }
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
        
        // Handle specific error types
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'object') {
          // Handle common Supabase error patterns
          if (error.error_description) {
            errorMessage = error.error_description;
          } else if (error.msg) {
            errorMessage = error.msg;
          } else {
            errorMessage = JSON.stringify(error);
          }
        } else {
          errorMessage = 'Unknown error occurred during sign up';
        }
        
        // Provide user-friendly error messages for common issues
        if (errorMessage.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (errorMessage.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (errorMessage.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('Supabase not configured')) {
          errorMessage = 'Authentication service is not properly configured. Please contact support.';
        }
        
        throw new Error(errorMessage);
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
          console.warn('Profile creation failed but user was created successfully. This may be due to missing database tables.');
          // Don't throw here as the user was created successfully
        }
      }

      console.log('Sign up successful for:', email);
    } catch (error: any) {
      console.error('Sign up error:', error);
      // Ensure we always throw a proper Error object
      if (error instanceof Error) {
        throw error;
      } else {
        const errorMessage = typeof error === 'string' ? error : 
                           error?.message || 
                           (typeof error === 'object' ? JSON.stringify(error) : 'Unknown error occurred');
        throw new Error(errorMessage);
      }
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