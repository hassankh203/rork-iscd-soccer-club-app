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
      // Create default users for web
      await createDefaultAdmin();
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

// Clear all data (for debugging)
export const clearAllData = async () => {
  console.log('🧹 Clearing all data...');
  
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform: Clearing AsyncStorage...');
      await AsyncStorage.multiRemove(['users', 'kids', 'payments', 'communications', 'media', 'currentUserId']);
      console.log('✅ AsyncStorage cleared');
    } else {
      console.log('📱 Native platform: Clearing SQLite tables...');
      // Clear SQLite tables
      await db.execAsync('DELETE FROM communications');
      await db.execAsync('DELETE FROM payments');
      await db.execAsync('DELETE FROM kids');
      await db.execAsync('DELETE FROM users');
      await db.execAsync('DELETE FROM media_uploads');
      console.log('✅ SQLite tables cleared');
    }
    
    // Recreate default users
    console.log('👤 Recreating default admin...');
    await createDefaultAdmin();
    console.log('✅ All data cleared and defaults recreated');
  } catch (error) {
    console.error('❌ Error clearing all data:', error);
    throw error;
  }
};

// Complete reset - removes ALL users including admin
export const completeReset = async () => {
  console.log('🔥 Starting complete reset - removing ALL users...');
  
  try {
    // Clear current session first
    await AsyncStorage.removeItem('currentUserId');
    
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform: Complete reset of AsyncStorage...');
      await AsyncStorage.multiRemove(['users', 'kids', 'payments', 'communications', 'media', 'currentUserId']);
      console.log('✅ AsyncStorage completely cleared');
    } else {
      console.log('📱 Native platform: Complete reset of SQLite tables...');
      // Clear SQLite tables completely
      await db.execAsync('DELETE FROM communications');
      await db.execAsync('DELETE FROM payments');
      await db.execAsync('DELETE FROM kids');
      await db.execAsync('DELETE FROM users');
      await db.execAsync('DELETE FROM media_uploads');
      console.log('✅ SQLite tables completely cleared');
    }
    
    console.log('✅ Complete reset finished - NO users remain');
  } catch (error) {
    console.error('❌ Error during complete reset:', error);
    throw error;
  }
};

// Reset to fresh state with only admin
export const resetToFreshState = async () => {
  console.log('🔄 Resetting to fresh state with admin only...');
  
  try {
    // Clear current session first
    await AsyncStorage.removeItem('currentUserId');
    
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform: Resetting AsyncStorage to fresh state...');
      await AsyncStorage.multiRemove(['users', 'kids', 'payments', 'communications', 'media', 'currentUserId']);
      console.log('✅ AsyncStorage cleared');
    } else {
      console.log('📱 Native platform: Resetting SQLite to fresh state...');
      // Clear SQLite tables completely
      await db.execAsync('DELETE FROM communications');
      await db.execAsync('DELETE FROM payments');
      await db.execAsync('DELETE FROM kids');
      await db.execAsync('DELETE FROM users');
      await db.execAsync('DELETE FROM media_uploads');
      console.log('✅ SQLite tables cleared');
    }
    
    // Recreate only the admin user
    console.log('👤 Creating fresh admin user...');
    await createDefaultAdmin();
    console.log('✅ Reset to fresh state complete - only admin exists');
  } catch (error) {
    console.error('❌ Error during fresh state reset:', error);
    throw error;
  }
};

// Reset with sample data
export const resetWithSampleData = async () => {
  console.log('🔄 Resetting with sample data...');
  
  try {
    // Clear current session first
    await AsyncStorage.removeItem('currentUserId');
    
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform: Resetting AsyncStorage with sample data...');
      await AsyncStorage.multiRemove(['users', 'kids', 'payments', 'communications', 'media', 'currentUserId']);
      console.log('✅ AsyncStorage cleared');
    } else {
      console.log('📱 Native platform: Resetting SQLite with sample data...');
      // Clear SQLite tables completely
      await db.execAsync('DELETE FROM communications');
      await db.execAsync('DELETE FROM payments');
      await db.execAsync('DELETE FROM kids');
      await db.execAsync('DELETE FROM users');
      await db.execAsync('DELETE FROM media_uploads');
      console.log('✅ SQLite tables cleared');
    }
    
    // Create admin and sample users
    console.log('👤 Creating admin and sample users...');
    await createDefaultAdmin();
    await createSampleData();
    console.log('✅ Reset with sample data complete');
  } catch (error) {
    console.error('❌ Error during sample data reset:', error);
    throw error;
  }
};

// Create comprehensive sample data
const createSampleData = async () => {
  console.log('📝 Creating comprehensive sample data...');
  
  try {
    // Create sample parent users
    const sampleUsers = [
      {
        email: 'john.smith@example.com',
        password: '123456',
        name: 'John Smith',
        phone: '+1234567891',
        role: 'parent' as const
      },
      {
        email: 'sarah.johnson@example.com',
        password: '123456',
        name: 'Sarah Johnson',
        phone: '+1234567892',
        role: 'parent' as const
      },
      {
        email: 'mike.davis@example.com',
        password: '123456',
        name: 'Mike Davis',
        phone: '+1234567893',
        role: 'parent' as const
      },
      {
        email: 'lisa.wilson@example.com',
        password: '123456',
        name: 'Lisa Wilson',
        phone: '+1234567894',
        role: 'parent' as const
      },
      {
        email: 'david.brown@example.com',
        password: '123456',
        name: 'David Brown',
        phone: '+1234567895',
        role: 'parent' as const
      }
    ];
    
    const createdUsers: User[] = [];
    for (const userData of sampleUsers) {
      const user = await createUser(userData);
      createdUsers.push(user);
      console.log(`✅ Sample user created: ${userData.email}`);
    }
    
    // Create sample kids for each parent
    const sampleKids = [
      { parentIndex: 0, name: 'Emma Smith', age: 8, team: 'Lions', position: 'Forward' },
      { parentIndex: 0, name: 'Jake Smith', age: 10, team: 'Tigers', position: 'Midfielder' },
      { parentIndex: 1, name: 'Olivia Johnson', age: 9, team: 'Eagles', position: 'Defender' },
      { parentIndex: 2, name: 'Liam Davis', age: 7, team: 'Lions', position: 'Goalkeeper' },
      { parentIndex: 2, name: 'Sophia Davis', age: 11, team: 'Panthers', position: 'Forward' },
      { parentIndex: 3, name: 'Noah Wilson', age: 8, team: 'Tigers', position: 'Midfielder' },
      { parentIndex: 4, name: 'Ava Brown', age: 9, team: 'Eagles', position: 'Forward' },
      { parentIndex: 4, name: 'Mason Brown', age: 6, team: 'Cubs', position: 'Defender' }
    ];
    
    for (const kidData of sampleKids) {
      const parent = createdUsers[kidData.parentIndex];
      await createKid({
        parentId: parent.id,
        name: kidData.name,
        age: kidData.age,
        team: kidData.team,
        position: kidData.position
      });
      console.log(`✅ Sample kid created: ${kidData.name}`);
    }
    
    // Create sample payments
    const samplePayments = [
      { parentIndex: 0, amount: 150, description: 'Monthly Training Fee - March', status: 'paid' as const, dueDate: '2024-03-01', paidDate: '2024-02-28' },
      { parentIndex: 0, amount: 150, description: 'Monthly Training Fee - April', status: 'pending' as const, dueDate: '2024-04-01' },
      { parentIndex: 1, amount: 150, description: 'Monthly Training Fee - March', status: 'paid' as const, dueDate: '2024-03-01', paidDate: '2024-03-05' },
      { parentIndex: 1, amount: 150, description: 'Monthly Training Fee - April', status: 'overdue' as const, dueDate: '2024-04-01' },
      { parentIndex: 2, amount: 300, description: 'Tournament Registration Fee', status: 'paid' as const, dueDate: '2024-03-15', paidDate: '2024-03-10' },
      { parentIndex: 2, amount: 150, description: 'Monthly Training Fee - April', status: 'pending' as const, dueDate: '2024-04-01' },
      { parentIndex: 3, amount: 150, description: 'Monthly Training Fee - April', status: 'pending' as const, dueDate: '2024-04-01' },
      { parentIndex: 4, amount: 75, description: 'Equipment Fee', status: 'paid' as const, dueDate: '2024-03-20', paidDate: '2024-03-18' }
    ];
    
    for (const paymentData of samplePayments) {
      const parent = createdUsers[paymentData.parentIndex];
      await createPayment({
        parentId: parent.id,
        amount: paymentData.amount,
        description: paymentData.description,
        status: paymentData.status,
        dueDate: paymentData.dueDate,
        paidDate: paymentData.paidDate
      });
      console.log(`✅ Sample payment created: ${paymentData.description}`);
    }
    
    // Create sample communications
    const adminUser = await getUserByEmail('admin@example.com');
    if (adminUser) {
      const sampleCommunications = [
        { message: 'Welcome to the new season! Training starts next Monday.', type: 'announcement' as const },
        { message: 'Please remember to bring water bottles to all training sessions.', type: 'announcement' as const },
        { message: 'Tournament schedule has been updated. Check the website for details.', type: 'announcement' as const },
        { recipientIndex: 0, message: 'Great progress with Emma this week! Keep up the good work.', type: 'message' as const },
        { recipientIndex: 1, message: 'Olivia showed excellent teamwork during practice.', type: 'message' as const }
      ];
      
      for (const commData of sampleCommunications) {
        const recipientId = 'recipientIndex' in commData && typeof commData.recipientIndex === 'number' 
          ? createdUsers[commData.recipientIndex]?.id 
          : undefined;
          
        await createCommunication({
          senderId: adminUser.id,
          recipientId,
          message: commData.message,
          type: commData.type,
          isRead: false
        });
        console.log(`✅ Sample communication created: ${commData.message.substring(0, 30)}...`);
      }
    }
    
    console.log('✅ Sample data creation complete');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
};

// Clear all user data only (keep admin)
export const clearAllUserData = async () => {
  console.log('🧹 Clearing all user data (keeping admin)...');
  
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform: Clearing user data from AsyncStorage...');
      // Get current users
      const users = await getStoredUsers();
      console.log('📊 Current users before clear:', users.length);
      
      // Keep only admin users
      const adminUsers = users.filter(u => u.role === 'admin');
      console.log('👥 Admin users to keep:', adminUsers.length);
      
      // Clear all data and keep only admin users
      await AsyncStorage.multiRemove(['kids', 'payments', 'communications', 'media', 'currentUserId']);
      await AsyncStorage.setItem('users', JSON.stringify(adminUsers));
      console.log('✅ AsyncStorage user data cleared');
    } else {
      console.log('📱 Native platform: Clearing user data from SQLite...');
      // Clear SQLite tables but keep admin users
      await db.execAsync('DELETE FROM communications');
      await db.execAsync('DELETE FROM payments');
      await db.execAsync('DELETE FROM kids');
      await db.execAsync('DELETE FROM media_uploads');
      await db.execAsync('DELETE FROM users WHERE role != "admin"');
      // Clear current session
      await AsyncStorage.removeItem('currentUserId');
      console.log('✅ SQLite user data cleared');
    }
    
    console.log('✅ All user data cleared (admin users preserved)');
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    throw error;
  }
};

// Check if database has data
export const hasExistingData = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      const users = await getStoredUsers();
      return users.length > 0;
    } else {
      const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM users') as any;
      return result.count > 0;
    }
  } catch (error) {
    console.log('Error checking existing data:', error);
    return false;
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
      status TEXT DEFAULT 'active',
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

// Create default admin user and sample data
const createDefaultAdmin = async () => {
  try {
    console.log('🔧 Checking for default admin user...');
    const adminExists = await getUserByEmail('admin@example.com');
    if (!adminExists) {
      console.log('👤 Creating default admin user...');
      await createUser({
        email: 'admin@example.com',
        password: '123456',
        name: 'Admin User',
        phone: '+1234567890',
        role: 'admin'
      });
      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️ Default admin user already exists');
    }
    
    // Only create sample users if no data exists
    const hasData = await hasExistingData();
    if (!hasData || (Platform.OS === 'web' && (await getStoredUsers()).length <= 1)) {
      console.log('📝 Creating sample parent users...');
      // Create sample parent users for testing
      const sampleUsers = [
        {
          email: 'parent1@test.com',
          password: '123456',
          name: 'John Smith',
          phone: '+1234567891',
          role: 'parent' as const
        },
        {
          email: 'parent2@test.com',
          password: '123456',
          name: 'Sarah Johnson',
          phone: '+1234567892',
          role: 'parent' as const
        },
        {
          email: 'parent3@test.com',
          password: '123456',
          name: 'Mike Davis',
          phone: '+1234567893',
          role: 'parent' as const
        }
      ];
      
      for (const userData of sampleUsers) {
        const userExists = await getUserByEmail(userData.email);
        if (!userExists) {
          await createUser(userData);
          console.log(`✅ Sample user created: ${userData.email}`);
        }
      }
    } else {
      console.log('ℹ️ Sample users already exist, skipping creation');
    }
  } catch (error) {
    console.log('ℹ️ Error creating default users:', error);
  }
};

// Create empty database with no users at all
const createEmptyDatabase = async () => {
  console.log('🔧 Creating completely empty database...');
  // This function intentionally creates NO users at all
  console.log('✅ Empty database created - no users exist');
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
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'parent' | 'admin';
  status?: 'active' | 'inactive';
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
      status: userData.status || 'active',
      createdAt: now
    };
    
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  
  await db.runAsync(
    'INSERT INTO users (id, email, password, name, phone, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userData.email, hashedPassword, userData.name, userData.phone || null, userData.role || 'parent', userData.status || 'active', now, now]
  );
  
  return {
    id,
    email: userData.email,
    name: userData.name,
    phone: userData.phone,
    role: userData.role || 'parent',
    status: userData.status || 'active',
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
    status: result.status || 'active',
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
    'SELECT id, email, name, phone, role, status, created_at FROM users WHERE id = ?',
    [id]
  ) as any;
  
  if (!result) return null;
  
  return {
    id: result.id,
    email: result.email,
    name: result.name,
    phone: result.phone,
    role: result.role,
    status: result.status || 'active',
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
  console.log('🔐 Authenticating user:', email);
  console.log('🔑 Password provided:', password);
  
  const user = await getUserByEmail(email);
  if (!user) {
    console.log('❌ User not found:', email);
    console.log('💡 Tip: Make sure the user exists in the database');
    return null;
  }
  
  console.log('👤 User found:', user.email, 'Status:', user.status);
  console.log('🔑 Stored password hash:', user.password);
  
  // Check if user is active
  if (user.status === 'inactive') {
    console.log('❌ User is inactive:', email);
    throw new Error('Account is inactive. Please contact administrator.');
  }
  
  const hashedPassword = hashPassword(password);
  console.log('🔑 Computed password hash:', hashedPassword);
  console.log('🔑 Comparing passwords...');
  
  if (user.password !== hashedPassword) {
    console.log('❌ Password mismatch for:', email);
    console.log('❌ Expected:', user.password);
    console.log('❌ Got:', hashedPassword);
    return null;
  }
  
  console.log('✅ Authentication successful for:', email);
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
  
  console.log('📝 Creating kid with data:', JSON.stringify(kidData, null, 2));
  
  if (Platform.OS === 'web') {
    const kids = await getStoredKids();
    const newKid: Kid = {
      id,
      ...kidData,
      createdAt: now
    };
    kids.push(newKid);
    await AsyncStorage.setItem('kids', JSON.stringify(kids));
    console.log('✅ Kid created successfully (web):', newKid);
    return newKid;
  }
  
  try {
    const sqlParams = [
      id, 
      kidData.parentId, 
      kidData.name, 
      kidData.age !== undefined && kidData.age !== null ? kidData.age : null, 
      kidData.team !== undefined && kidData.team !== null && kidData.team !== '' ? kidData.team : null, 
      kidData.position !== undefined && kidData.position !== null && kidData.position !== '' ? kidData.position : null, 
      now, 
      now
    ];
    
    console.log('📊 SQL parameters:', sqlParams);
    
    await db.runAsync(
      'INSERT INTO kids (id, parent_id, name, age, team, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      sqlParams
    );
    
    console.log('✅ Kid created successfully (native)');
  } catch (error) {
    console.error('❌ Error creating kid in database:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
  
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

export const updateKid = async (kidId: string, updates: Partial<Omit<Kid, 'id' | 'parentId' | 'createdAt'>>): Promise<void> => {
  const now = new Date().toISOString();
  
  if (Platform.OS === 'web') {
    const kids = await getStoredKids();
    const kidIndex = kids.findIndex(k => k.id === kidId);
    if (kidIndex === -1) throw new Error('Kid not found');
    
    kids[kidIndex] = { ...kids[kidIndex], ...updates };
    await AsyncStorage.setItem('kids', JSON.stringify(kids));
    return;
  }
  
  const fields = Object.keys(updates).map(key => {
    const dbKey = key === 'parentId' ? 'parent_id' : key;
    return `${dbKey} = ?`;
  }).join(', ');
  const values = [...Object.values(updates), now, kidId];
  
  await db.runAsync(
    `UPDATE kids SET ${fields}, updated_at = ? WHERE id = ?`,
    values
  );
};

export const deleteKid = async (kidId: string): Promise<void> => {
  if (Platform.OS === 'web') {
    const kids = await getStoredKids();
    const filteredKids = kids.filter(k => k.id !== kidId);
    await AsyncStorage.setItem('kids', JSON.stringify(filteredKids));
    return;
  }
  
  await db.runAsync('DELETE FROM kids WHERE id = ?', [kidId]);
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

// User management operations for admin
export const getAllUsers = async (): Promise<User[]> => {
  console.log('📊 Getting all users...');
  
  if (Platform.OS === 'web') {
    console.log('🌐 Web platform: Getting users from AsyncStorage...');
    const users = await getStoredUsers();
    console.log('📊 Found', users.length, 'users in AsyncStorage');
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    console.log('📊 Returning users:', JSON.stringify(usersWithoutPassword, null, 2));
    return usersWithoutPassword;
  }
  
  console.log('📱 Native platform: Getting users from SQLite...');
  const results = await db.getAllAsync(
    'SELECT id, email, name, phone, role, status, created_at FROM users ORDER BY created_at DESC'
  ) as any[];
  
  console.log('📊 Found', results.length, 'users in SQLite');
  const users = results.map(result => ({
    id: result.id,
    email: result.email,
    name: result.name,
    phone: result.phone,
    role: result.role,
    status: result.status || 'active',
    createdAt: result.created_at
  }));
  
  console.log('📊 Returning users:', JSON.stringify(users, null, 2));
  return users;
};

export const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
  console.log('🔄 Updating user status:', userId, 'to', status);
  
  if (Platform.OS === 'web') {
    console.log('🌐 Web platform: Updating user status in AsyncStorage...');
    const users = await getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      console.error('❌ User not found:', userId);
      throw new Error('User not found');
    }
    
    console.log('📊 User found at index:', userIndex, 'Current status:', users[userIndex].status);
    users[userIndex] = { ...users[userIndex], status };
    await AsyncStorage.setItem('users', JSON.stringify(users));
    console.log('✅ User status updated in AsyncStorage');
    return;
  }
  
  console.log('📱 Native platform: Updating user status in SQLite...');
  await db.runAsync(
    'UPDATE users SET status = ?, updated_at = ? WHERE id = ?',
    [status, new Date().toISOString(), userId]
  );
  console.log('✅ User status updated in SQLite');
};

export const deleteUser = async (userId: string): Promise<void> => {
  console.log('🗑️ Deleting user:', userId);
  
  if (Platform.OS === 'web') {
    console.log('🌐 Web platform: Deleting user from AsyncStorage...');
    // Delete user and related data from AsyncStorage
    const users = await getStoredUsers();
    console.log('📊 Users before delete:', users.length);
    const filteredUsers = users.filter(u => u.id !== userId);
    console.log('📊 Users after delete:', filteredUsers.length);
    await AsyncStorage.setItem('users', JSON.stringify(filteredUsers));
    
    // Delete related kids
    const kids = await getStoredKids();
    const filteredKids = kids.filter(k => k.parentId !== userId);
    await AsyncStorage.setItem('kids', JSON.stringify(filteredKids));
    
    // Delete related payments
    const payments = await getStoredPayments();
    const filteredPayments = payments.filter(p => p.parentId !== userId);
    await AsyncStorage.setItem('payments', JSON.stringify(filteredPayments));
    
    // Delete related communications
    const communications = await getStoredCommunications();
    const filteredCommunications = communications.filter(c => c.senderId !== userId && c.recipientId !== userId);
    await AsyncStorage.setItem('communications', JSON.stringify(filteredCommunications));
    
    console.log('✅ User and related data deleted from AsyncStorage');
    return;
  }
  
  console.log('📱 Native platform: Deleting user from SQLite...');
  // Delete user and cascade delete related data
  await db.runAsync('DELETE FROM communications WHERE sender_id = ? OR recipient_id = ?', [userId, userId]);
  await db.runAsync('DELETE FROM payments WHERE parent_id = ?', [userId]);
  await db.runAsync('DELETE FROM kids WHERE parent_id = ?', [userId]);
  await db.runAsync('DELETE FROM users WHERE id = ?', [userId]);
  console.log('✅ User and related data deleted from SQLite');
};