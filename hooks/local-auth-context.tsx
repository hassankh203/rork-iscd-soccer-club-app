import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initDatabase, 
  authenticateUser, 
  createUser as dbCreateUser, 
  getUserById,
  updateUser as dbUpdateUser,
  User as DbUser,
  CreateUserData 
} from '@/lib/database';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

// Input validation
const validateEmail = (email: string): boolean => {
  if (!email?.trim()) return false;
  if (email.length > 100) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length !== 6) {
    return { isValid: false, message: 'Password must be exactly 6 digits' };
  }
  if (!/^\d{6}$/.test(password)) {
    return { isValid: false, message: 'Password must contain only numbers (6 digits)' };
  }
  return { isValid: true };
};

const validatePhone = (phone: string): boolean => {
  if (!phone?.trim()) return false;
  if (phone.length > 20) return false;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(cleanPhone);
};

const validateName = (name: string): boolean => {
  if (!name?.trim()) return false;
  if (name.length > 50) return false;
  return name.trim().length >= 2;
};

// Convert database user to app user type
const mapDbUserToUser = (dbUser: DbUser): User => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    phone: dbUser.phone || undefined,
    role: dbUser.role,
    createdAt: dbUser.createdAt,
  };
};

export const [LocalAuthProvider, useLocalAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database and restore session
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      console.log('🔧 Initializing local authentication...');
      
      try {
        // Clear existing data for fresh start
        console.log('🧹 Clearing existing data for fresh start...');
        await AsyncStorage.multiRemove(['users', 'kids', 'payments', 'communications', 'media', 'currentUserId']);
        
        // Initialize database
        await initDatabase();
        
        // Try to restore session
        const storedUserId = await AsyncStorage.getItem('currentUserId');
        if (storedUserId && isMounted) {
          const dbUser = await getUserById(storedUserId);
          if (dbUser) {
            setUser(mapDbUserToUser(dbUser));
            console.log('✅ Session restored for:', dbUser.email);
          } else {
            // Clean up invalid session
            await AsyncStorage.removeItem('currentUserId');
          }
        }
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    const cleanEmail = email.trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message!);
    }
    
    try {
      const dbUser = await authenticateUser(cleanEmail, password);
      
      if (!dbUser) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      // Store session
      await AsyncStorage.setItem('currentUserId', dbUser.id);
      
      setUser(mapDbUserToUser(dbUser));
      console.log('✅ Sign in successful for:', cleanEmail);
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        const errorMessage = typeof error === 'string' ? error : 
                           error?.message || 'Unknown error occurred during sign in';
        throw new Error(errorMessage);
      }
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, phone: string) => {
    console.log('📝 Attempting sign up for:', email);
    
    // Input validation
    if (!email || !password || !name || !phone) {
      throw new Error('All fields are required');
    }
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!validateEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address');
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message!);
    }
    
    if (!validatePhone(cleanPhone)) {
      throw new Error('Please enter a valid phone number');
    }
    
    if (!validateName(cleanName)) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    try {
      const userData: CreateUserData = {
        email: cleanEmail,
        password,
        name: cleanName,
        phone: cleanPhone,
        role: 'parent',
      };
      
      const dbUser = await dbCreateUser(userData);
      
      // Store session
      await AsyncStorage.setItem('currentUserId', dbUser.id);
      
      setUser(mapDbUserToUser(dbUser));
      console.log('✅ Sign up successful for:', cleanEmail);
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = typeof error === 'string' ? error : 'Unknown error occurred during sign up';
      }
      
      // Provide user-friendly error messages
      if (errorMessage.includes('User already exists') || errorMessage.includes('UNIQUE constraint failed')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      }
      
      throw new Error(errorMessage);
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('🚪 Signing out user');
    try {
      await AsyncStorage.removeItem('currentUserId');
      setUser(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    console.log('📝 Updating profile for user:', user.id);
    
    // Validate updates
    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase();
      if (!validateEmail(cleanEmail)) {
        throw new Error('Please enter a valid email address');
      }
      updates.email = cleanEmail;
    }
    
    if (updates.phone) {
      const cleanPhone = updates.phone.replace(/[\s\-\(\)]/g, '');
      if (!validatePhone(cleanPhone)) {
        throw new Error('Please enter a valid phone number');
      }
      updates.phone = cleanPhone;
    }
    
    if (updates.name) {
      const cleanName = updates.name.trim();
      if (!validateName(cleanName)) {
        throw new Error('Name must be at least 2 characters long');
      }
      updates.name = cleanName;
    }
    
    try {
      await dbUpdateUser(user.id, updates);
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }, [user]);
  
  const changePassword = useCallback(async (newPassword: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    console.log('🔑 Changing password for user:', user.id);
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message!);
    }
    
    try {
      // For password change, we would need to add this functionality to the database
      // For now, we'll just log it
      console.log('⚠️ Password change not implemented yet');
      throw new Error('Password change functionality not implemented yet');
    } catch (error) {
      console.error('❌ Password change error:', error);
      throw error;
    }
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
  }), [user, isLoading, signIn, signUp, signOut, updateProfile, changePassword]);
});