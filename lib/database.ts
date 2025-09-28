import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Database instance
let db: SQLite.SQLiteDatabase;

// Initialize database
export const initDatabase = async () => {
  try {
    console.log('🔧 Initializing SQLite database...');
    
    if (Platform.OS === 'web') {
      // For web, we'll use AsyncStorage as a fallback
      console.log('📱 Using AsyncStorage for web platform');
      return;
    }
    
    db = await SQLite.openDatabaseAsync('app.db');
    
    // Create tables
    await createTables();
    
    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// Create all necessary tables
const createTables = async () => {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'parent',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Kids table
    `CREATE TABLE IF NOT EXISTS kids (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      team TEXT,
      position TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users (id)
    )`,
    
    // Communications table
    `CREATE TABLE IF NOT EXISTS communications (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'message',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (recipient_id) REFERENCES users (id)
    )`,
    
    // Media uploads table
    `CREATE TABLE IF NOT EXISTS media_uploads (
      id TEXT PRIMARY KEY,
      uploader_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      file_type TEXT NOT NULL,
      category TEXT DEFAULT 'pic_of_week',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploader_id) REFERENCES users (id)
    )`,
    
    // Payments table
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      due_date TEXT,
      paid_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES users (id)
    )`
  ];

  for (const table of tables) {
    if (Platform.OS !== 'web') {
      await db.execAsync(table);
    }
  }
  
  // Create default admin user if it doesn't exist
  await createDefaultAdmin();
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await getUserByEmail('admin@example.com');
    if (!adminExists) {
      await createUser({
        email: 'admin@example.com',
        password: '123456',
        name: 'Admin User',
        phone: '+1234567890',
        role: 'admin'
      });
      console.log('✅ Default admin user created');
    }
  } catch (error) {
    console.log('ℹ️ Admin user already exists or error creating:', error);
  }
};

// Generate UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Hash password (simple hash for demo - in production use proper hashing)
const hashPassword = (password: string): string => {
  // Simple hash - in production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

// User operations
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'parent' | 'admin';
  createdAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'parent' | 'admin';
}

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const id = generateId();
  const hashedPassword = hashPassword(userData.password);
  const now = new Date().toISOString();
  
  if (Platform.OS === 'web') {
    // Web fallback using AsyncStorage
    const users = await getStoredUsers();
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser: User & { password: string } = {
      id,
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      phone: userData.phone,
      role: userData.role || 'parent',
      createdAt: now
    };
    
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  
  await db.runAsync(
    'INSERT INTO users (id, email, password, name, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userData.email, hashedPassword, userData.name, userData.phone || null, userData.role || 'parent', now, now]
  );
  
  return {
    id,
    email: userData.email,
    name: userData.name,
    phone: userData.phone,
    role: userData.role || 'parent',
    createdAt: now
  };
};

export const getUserByEmail = async (email: string): Promise<(User & { password: string }) | null> => {
  if (Platform.OS === 'web') {
    const users = await getStoredUsers();
    return users.find(u => u.email === email) || null;
  }
  
  const result = await db.getFirstAsync(
    'SELECT * FROM users WHERE email = ?',
    [email]
  ) as any;
  
  if (!result) return null;
  
  return {
    id: result.id,
    email: result.email,
    password: result.password,
    name: result.name,
    phone: result.phone,
    role: result.role,
    createdAt: result.created_at
  };
};

export const getUserById = async (id: string): Promise<User | null> => {
  if (Platform.OS === 'web') {
    const users = await getStoredUsers();
    const user = users.find(u => u.id === id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  const result = await db.getFirstAsync(
    'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
    [id]
  ) as any;
  
  if (!result) return null;
  
  return {
    id: result.id,
    email: result.email,
    name: result.name,
    phone: result.phone,
    role: result.role,
    createdAt: result.created_at
  };
};

export const updateUser = async (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> => {
  const now = new Date().toISOString();
  
  if (Platform.OS === 'web') {
    const users = await getStoredUsers();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('User not found');
    
    users[userIndex] = { ...users[userIndex], ...updates };
    await AsyncStorage.setItem('users', JSON.stringify(users));
    return;
  }
  
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), now, id];
  
  await db.runAsync(
    `UPDATE users SET ${fields}, updated_at = ? WHERE id = ?`,
    values
  );
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Helper function for web storage
const getStoredUsers = async (): Promise<(User & { password: string })[]> => {
  try {
    const stored = await AsyncStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Kids operations
export interface Kid {
  id: string;
  parentId: string;
  name: string;
  age?: number;
  team?: string;
  position?: string;
  createdAt: string;
}

export const createKid = async (kidData: Omit<Kid, 'id' | 'createdAt'>): Promise<Kid> => {
  const id = generateId();
  const now = new Date().toISOString();
  
  if (Platform.OS === 'web') {
    const kids = await getStoredKids();
    const newKid: Kid = {
      id,
      ...kidData,
      createdAt: now
    };
    kids.push(newKid);
    await AsyncStorage.setItem('kids', JSON.stringify(kids));
    return newKid;
  }
  
  await db.runAsync(
    'INSERT INTO kids (id, parent_id, name, age, team, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, kidData.parentId, kidData.name, kidData.age || null, kidData.team || null, kidData.position || null, now, now]
  );
  
  return {
    id,
    ...kidData,
    createdAt: now
  };
};

export const getKidsByParentId = async (parentId: string): Promise<Kid[]> => {
  if (Platform.OS === 'web') {
    const kids = await getStoredKids();
    return kids.filter(k => k.parentId === parentId);
  }
  
  const results = await db.getAllAsync(
    'SELECT * FROM kids WHERE parent_id = ? ORDER BY created_at DESC',
    [parentId]
  ) as any[];
  
  return results.map(result => ({
    id: result.id,
    parentId: result.parent_id,
    name: result.name,
    age: result.age,
    team: result.team,
    position: result.position,
    createdAt: result.created_at
  }));
};

export const getAllKids = async (): Promise<Kid[]> => {
  if (Platform.OS === 'web') {
    return await getStoredKids();
  }
  
  const results = await db.getAllAsync(
    'SELECT * FROM kids ORDER BY created_at DESC'
  ) as any[];
  
  return results.map(result => ({
    id: result.id,
    parentId: result.parent_id,
    name: result.name,
    age: result.age,
    team: result.team,
    position: result.position,
    createdAt: result.created_at
  }));
};

const getStoredKids = async (): Promise<Kid[]> => {
  try {
    const stored = await AsyncStorage.getItem('kids');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Communications operations
export interface Communication {
  id: string;
  senderId: string;
  recipientId?: string;
  message: string;
  type: 'message' | 'announcement';
  isRead: boolean;
  createdAt: string;
  senderName?: string;
  recipientName?: string;
}

export const createCommunication = async (commData: Omit<Communication, 'id' | 'createdAt' | 'senderName' | 'recipientName'>): Promise<Communication> => {
  const id = generateId();
  const now = new Date().toISOString();
  
  if (Platform.OS === 'web') {
    const communications = await getStoredCommunications();
    const newComm: Communication = {
      id,
      ...commData,
      createdAt: now
    };
    communications.push(newComm);
    await AsyncStorage.setItem('communications', JSON.stringify(communications));
    return newComm;
  }
  
  await db.runAsync(
    'INSERT INTO communications (id, sender_id, recipient_id, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, commData.senderId, commData.recipientId || null, commData.message, commData.type, commData.isRead ? 1 : 0, now]
  );
  
  return {
    id,
    ...commData,
    createdAt: now
  };
};

export const getCommunicationsForUser = async (userId: string): Promise<Communication[]> => {
  if (Platform.OS === 'web') {
    const communications = await getStoredCommunications();
    return communications.filter(c => 
      c.senderId === userId || c.recipientId === userId || !c.recipientId
    );
  }
  
  const results = await db.getAllAsync(
    'SELECT * FROM communications WHERE sender_id = ? OR recipient_id = ? OR recipient_id IS NULL ORDER BY created_at DESC',
    [userId, userId]
  ) as any[];
  
  return results.map(result => ({
    id: result.id,
    senderId: result.sender_id,
    recipientId: result.recipient_id,
    message: result.message,
    type: result.type,
    isRead: result.is_read === 1,
    createdAt: result.created_at
  }));
};

const getStoredCommunications = async (): Promise<Communication[]> => {
  try {
    const stored = await AsyncStorage.getItem('communications');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Payments operations
export interface Payment {
  id: string;
  parentId: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
}

export const createPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
  const id = generateId();
  const now = new Date().toISOString();
  
  if (Platform.OS === 'web') {
    const payments = await getStoredPayments();
    const newPayment: Payment = {
      id,
      ...paymentData,
      createdAt: now
    };
    payments.push(newPayment);
    await AsyncStorage.setItem('payments', JSON.stringify(payments));
    return newPayment;
  }
  
  await db.runAsync(
    'INSERT INTO payments (id, parent_id, amount, description, status, due_date, paid_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, paymentData.parentId, paymentData.amount, paymentData.description, paymentData.status, paymentData.dueDate || null, paymentData.paidDate || null, now]
  );
  
  return {
    id,
    ...paymentData,
    createdAt: now
  };
};

export const getPaymentsByParentId = async (parentId: string): Promise<Payment[]> => {
  if (Platform.OS === 'web') {
    const payments = await getStoredPayments();
    return payments.filter(p => p.parentId === parentId);
  }
  
  const results = await db.getAllAsync(
    'SELECT * FROM payments WHERE parent_id = ? ORDER BY created_at DESC',
    [parentId]
  ) as any[];
  
  return results.map(result => ({
    id: result.id,
    parentId: result.parent_id,
    amount: result.amount,
    description: result.description,
    status: result.status,
    dueDate: result.due_date,
    paidDate: result.paid_date,
    createdAt: result.created_at
  }));
};

export const getAllPayments = async (): Promise<Payment[]> => {
  if (Platform.OS === 'web') {
    return await getStoredPayments();
  }
  
  const results = await db.getAllAsync(
    'SELECT * FROM payments ORDER BY created_at DESC'
  ) as any[];
  
  return results.map(result => ({
    id: result.id,
    parentId: result.parent_id,
    amount: result.amount,
    description: result.description,
    status: result.status,
    dueDate: result.due_date,
    paidDate: result.paid_date,
    createdAt: result.created_at
  }));
};

export const updatePaymentStatus = async (paymentId: string, status: Payment['status'], paidDate?: string): Promise<void> => {
  if (Platform.OS === 'web') {
    const payments = await getStoredPayments();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) throw new Error('Payment not found');
    
    payments[paymentIndex] = { 
      ...payments[paymentIndex], 
      status, 
      paidDate: paidDate || payments[paymentIndex].paidDate 
    };
    await AsyncStorage.setItem('payments', JSON.stringify(payments));
    return;
  }
  
  await db.runAsync(
    'UPDATE payments SET status = ?, paid_date = ? WHERE id = ?',
    [status, paidDate || null, paymentId]
  );
};

const getStoredPayments = async (): Promise<Payment[]> => {
  try {
    const stored = await AsyncStorage.getItem('payments');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Media uploads operations
export interface MediaUpload {
  id: string;
  uploaderId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  category: 'pic_of_week' | 'general';
  isActive: boolean;
  createdAt: string;
}

export const createMediaUpload = async (mediaData: Omit<MediaUpload, 'id' | 'createdAt'>): Promise<MediaUpload> => {
  const id = generateId();
  const now = new Date().toISOString();
  
  if (Platform.OS === 'web') {
    const media = await getStoredMedia();
    const newMedia: MediaUpload = {
      id,
      ...mediaData,
      createdAt: now
    };
    media.push(newMedia);
    await AsyncStorage.setItem('media', JSON.stringify(media));
    return newMedia;
  }
  
  await db.runAsync(
    'INSERT INTO media_uploads (id, uploader_id, title, description, file_url, file_type, category, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, mediaData.uploaderId, mediaData.title, mediaData.description || null, mediaData.fileUrl, mediaData.fileType, mediaData.category, mediaData.isActive ? 1 : 0, now]
  );
  
  return {
    id,
    ...mediaData,
    createdAt: now
  };
};

export const getMediaUploads = async (category?: string): Promise<MediaUpload[]> => {
  if (Platform.OS === 'web') {
    const media = await getStoredMedia();
    return category ? media.filter(m => m.category === category && m.isActive) : media.filter(m => m.isActive);
  }
  
  let query = 'SELECT * FROM media_uploads WHERE is_active = 1';
  const params: any[] = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const results = await db.getAllAsync(query, params) as any[];
  
  return results.map(result => ({
    id: result.id,
    uploaderId: result.uploader_id,
    title: result.title,
    description: result.description,
    fileUrl: result.file_url,
    fileType: result.file_type,
    category: result.category,
    isActive: result.is_active === 1,
    createdAt: result.created_at
  }));
};

const getStoredMedia = async (): Promise<MediaUpload[]> => {
  try {
    const stored = await AsyncStorage.getItem('media');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};