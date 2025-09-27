import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
  sessionToken?: string;
  lastLoginAt?: string;
}

// Secure storage helpers
const secureStorage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

// Password hashing utilities
const hashPassword = async (password: string, salt: string): Promise<string> => {
  const combined = password + salt;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
};

const generateSalt = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

const generateSessionToken = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

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

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      console.log('Loading user session...');
      const sessionToken = await secureStorage.getItem('sessionToken');
      const userData = await AsyncStorage.getItem('currentUser');
      
      if (sessionToken && userData) {
        // Safe JSON parsing with validation
        const trimmedData = userData.trim();
        if (!trimmedData.startsWith('{') && !trimmedData.startsWith('[')) {
          console.warn('Invalid user data format, clearing session');
          await secureStorage.deleteItem('sessionToken');
          await AsyncStorage.removeItem('currentUser');
          return;
        }
        
        const parsedUser = JSON.parse(trimmedData);
        // Verify session is still valid (you could add expiration logic here)
        console.log('User session found:', parsedUser.email);
        setUser(parsedUser);
      } else {
        console.log('No valid session found');
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
      // Clear potentially corrupted data
      await secureStorage.deleteItem('sessionToken');
      await AsyncStorage.removeItem('currentUser');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    try {
      const usersData = await AsyncStorage.getItem('users');
      let users: StoredUser[] = [];
      if (usersData) {
        try {
          const trimmedData = usersData.trim();
          if (trimmedData.startsWith('[') || trimmedData.startsWith('{')) {
            users = JSON.parse(trimmedData);
          }
        } catch (e) {
          console.error('Failed to parse users data:', e);
          users = [];
        }
      }
      
      // Handle admin login with default credentials
      if (email === 'admin@iscd.org' && password === '123456') {
        console.log('Admin login detected');
        const adminUser: User = {
          id: 'admin',
          email: 'admin@iscd.org',
          name: 'ISCD Admin',
          phone: '302-555-0100',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        
        const sessionToken = await generateSessionToken();
        await secureStorage.setItem('sessionToken', sessionToken);
        await AsyncStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        setUser(adminUser);
        console.log('Admin login successful');
        return;
      }
      
      // Handle demo parent login
      if (email === 'parent@example.com' && password === '654321') {
        console.log('Demo parent login detected');
        const demoParent: User = {
          id: 'demo-parent',
          email: 'parent@example.com',
          name: 'Demo Parent',
          phone: '302-555-0200',
          role: 'parent',
          createdAt: new Date().toISOString()
        };
        
        const sessionToken = await generateSessionToken();
        await secureStorage.setItem('sessionToken', sessionToken);
        await AsyncStorage.setItem('currentUser', JSON.stringify(demoParent));
        
        setUser(demoParent);
        console.log('Demo parent login successful');
        return;
      }
      
      // Find user by email
      const foundUser = users.find((u: StoredUser) => u.email.toLowerCase() === email.toLowerCase());
      if (!foundUser) {
        console.log('User not found:', email);
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const hashedPassword = await hashPassword(password, foundUser.salt);
      if (hashedPassword !== foundUser.passwordHash) {
        console.log('Invalid password for user:', email);
        throw new Error('Invalid email or password');
      }
      
      // Create session
      const sessionToken = await generateSessionToken();
      const userForSession: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        phone: foundUser.phone,
        role: foundUser.role,
        createdAt: foundUser.createdAt
      };
      
      // Update last login
      const updatedUser = {
        ...foundUser,
        lastLoginAt: new Date().toISOString(),
        sessionToken
      };
      
      const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      
      await secureStorage.setItem('sessionToken', sessionToken);
      await AsyncStorage.setItem('currentUser', JSON.stringify(userForSession));
      
      setUser(userForSession);
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
      const usersData = await AsyncStorage.getItem('users');
      let users: StoredUser[] = [];
      if (usersData) {
        try {
          const trimmedData = usersData.trim();
          if (trimmedData.startsWith('[') || trimmedData.startsWith('{')) {
            users = JSON.parse(trimmedData);
          }
        } catch (e) {
          console.error('Failed to parse users data:', e);
          users = [];
        }
      }
      
      // Check if email already exists
      if (users.find((u: StoredUser) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists');
      }
      
      // Generate salt and hash password
      const salt = await generateSalt();
      const passwordHash = await hashPassword(password, salt);
      const sessionToken = await generateSessionToken();
      
      const newStoredUser: StoredUser = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        name: name.trim(),
        phone: phone.replace(/[\s\-\(\)]/g, ''),
        role: 'parent',
        createdAt: new Date().toISOString(),
        passwordHash,
        salt,
        sessionToken,
        lastLoginAt: new Date().toISOString()
      };
      
      const newUser: User = {
        id: newStoredUser.id,
        email: newStoredUser.email,
        name: newStoredUser.name,
        phone: newStoredUser.phone,
        role: newStoredUser.role,
        createdAt: newStoredUser.createdAt
      };
      
      users.push(newStoredUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      await secureStorage.setItem('sessionToken', sessionToken);
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      
      setUser(newUser);
      console.log('Sign up successful for:', email);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('Signing out user');
    try {
      await secureStorage.deleteItem('sessionToken');
      await AsyncStorage.removeItem('currentUser');
      setUser(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear user state even if storage operations fail
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) {
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
      const usersData = await AsyncStorage.getItem('users');
      let users: StoredUser[] = [];
      if (usersData) {
        try {
          const trimmedData = usersData.trim();
          if (trimmedData.startsWith('[') || trimmedData.startsWith('{')) {
            users = JSON.parse(trimmedData);
          }
        } catch (e) {
          console.error('Failed to parse users data:', e);
          users = [];
        }
      }
      
      // Check if new email already exists (if email is being updated)
      if (updates.email && updates.email !== user.email) {
        const emailExists = users.find((u: StoredUser) => 
          u.email.toLowerCase() === updates.email!.toLowerCase() && u.id !== user.id
        );
        if (emailExists) {
          throw new Error('An account with this email already exists');
        }
      }
      
      const updatedUser = { 
        ...user, 
        ...updates,
        email: updates.email?.toLowerCase() || user.email,
        name: updates.name?.trim() || user.name,
        phone: updates.phone?.replace(/[\s\-\(\)]/g, '') || user.phone
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      const userIndex = users.findIndex((u: StoredUser) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser };
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
      
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }, [user]);
  
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    console.log('Changing password for user:', user.id);
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message!);
    }
    
    try {
      const usersData = await AsyncStorage.getItem('users');
      let users: StoredUser[] = [];
      if (usersData) {
        try {
          const trimmedData = usersData.trim();
          if (trimmedData.startsWith('[') || trimmedData.startsWith('{')) {
            users = JSON.parse(trimmedData);
          }
        } catch (e) {
          console.error('Failed to parse users data:', e);
          users = [];
        }
      }
      
      const foundUser = users.find((u: StoredUser) => u.id === user.id);
      if (!foundUser) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const currentHashedPassword = await hashPassword(currentPassword, foundUser.salt);
      if (currentHashedPassword !== foundUser.passwordHash) {
        throw new Error('Current password is incorrect');
      }
      
      // Generate new salt and hash new password
      const newSalt = await generateSalt();
      const newPasswordHash = await hashPassword(newPassword, newSalt);
      
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, passwordHash: newPasswordHash, salt: newSalt }
          : u
      );
      
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      console.log('Password changed successfully');
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }, [user]);
  
  const resetPassword = useCallback(async (email: string) => {
    console.log('Password reset requested for:', email);
    
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    try {
      const usersData = await AsyncStorage.getItem('users');
      let users: StoredUser[] = [];
      if (usersData) {
        try {
          const trimmedData = usersData.trim();
          if (trimmedData.startsWith('[') || trimmedData.startsWith('{')) {
            users = JSON.parse(trimmedData);
          }
        } catch (e) {
          console.error('Failed to parse users data:', e);
          users = [];
        }
      }
      
      const foundUser = users.find((u: StoredUser) => u.email.toLowerCase() === email.toLowerCase());
      if (!foundUser) {
        // Don't reveal if email exists for security
        console.log('Password reset email would be sent to:', email);
        return;
      }
      
      // In a real app, you would send an email with a reset token
      // For now, we'll just log that a reset would be sent
      console.log('Password reset email would be sent to:', email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    resetPassword
  }), [user, isLoading, signIn, signUp, signOut, updateProfile, changePassword, resetPassword]);
});