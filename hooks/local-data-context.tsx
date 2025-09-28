import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useMemo } from 'react';
import { useLocalAuth } from './local-auth-context';
import {
  createKid,
  getKidsByParentId,
  getAllKids,
  createCommunication,
  getCommunicationsForUser,
  createPayment,
  getPaymentsByParentId,
  getAllPayments,
  updatePaymentStatus,
  createMediaUpload,
  getMediaUploads,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  Kid as DbKid,
  Communication as DbCommunication,
  Payment as DbPayment,
  MediaUpload as DbMediaUpload,
  User as DbUser,
} from '@/lib/database';

// Local data hooks
export const [LocalDataProvider, useLocalData] = createContextHook(() => {
  const { user } = useLocalAuth();

  // Kids operations
  const addKid = useCallback(async (kidData: { name: string; age?: number; team?: string; position?: string }) => {
    if (!user) throw new Error('User not authenticated');
    
    const newKid = await createKid({
      parentId: user.id,
      name: kidData.name,
      age: kidData.age,
      team: kidData.team,
      position: kidData.position,
    });
    
    return newKid;
  }, [user]);

  const getKids = useCallback(async (): Promise<DbKid[]> => {
    if (!user) throw new Error('User not authenticated');
    
    if (user.role === 'admin') {
      return await getAllKids();
    } else {
      return await getKidsByParentId(user.id);
    }
  }, [user]);

  // Communications operations
  const sendMessage = useCallback(async (data: { 
    recipientId?: string; 
    message: string; 
    type?: 'message' | 'announcement' 
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const newMessage = await createCommunication({
      senderId: user.id,
      recipientId: data.recipientId,
      message: data.message,
      type: data.type || 'message',
      isRead: false,
    });
    
    return newMessage;
  }, [user]);

  const getMessages = useCallback(async (): Promise<DbCommunication[]> => {
    if (!user) throw new Error('User not authenticated');
    
    return await getCommunicationsForUser(user.id);
  }, [user]);

  // Payments operations
  const addPayment = useCallback(async (paymentData: {
    parentId: string;
    amount: number;
    description: string;
    status?: 'pending' | 'paid' | 'overdue';
    dueDate?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const newPayment = await createPayment({
      parentId: paymentData.parentId,
      amount: paymentData.amount,
      description: paymentData.description,
      status: paymentData.status || 'pending',
      dueDate: paymentData.dueDate,
    });
    
    return newPayment;
  }, [user]);

  const getPayments = useCallback(async (): Promise<DbPayment[]> => {
    if (!user) throw new Error('User not authenticated');
    
    if (user.role === 'admin') {
      return await getAllPayments();
    } else {
      return await getPaymentsByParentId(user.id);
    }
  }, [user]);

  const updatePayment = useCallback(async (paymentId: string, status: 'pending' | 'paid' | 'overdue', paidDate?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    await updatePaymentStatus(paymentId, status, paidDate);
  }, [user]);

  // Media operations
  const uploadMedia = useCallback(async (mediaData: {
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    category?: 'pic_of_week' | 'general';
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const newMedia = await createMediaUpload({
      uploaderId: user.id,
      title: mediaData.title,
      description: mediaData.description,
      fileUrl: mediaData.fileUrl,
      fileType: mediaData.fileType,
      category: mediaData.category || 'pic_of_week',
      isActive: true,
    });
    
    return newMedia;
  }, [user]);

  const getMedia = useCallback(async (category?: string): Promise<DbMediaUpload[]> => {
    return await getMediaUploads(category);
  }, []);

  // User management operations (admin only)
  const getUsers = useCallback(async (): Promise<DbUser[]> => {
    if (!user || user.role !== 'admin') throw new Error('Admin access required');
    return await getAllUsers();
  }, [user]);

  const updateUserStatusById = useCallback(async (userId: string, status: 'active' | 'inactive'): Promise<void> => {
    if (!user || user.role !== 'admin') throw new Error('Admin access required');
    await updateUserStatus(userId, status);
  }, [user]);

  const deleteUserById = useCallback(async (userId: string): Promise<void> => {
    if (!user || user.role !== 'admin') throw new Error('Admin access required');
    await deleteUser(userId);
  }, [user]);

  return useMemo(() => ({
    // Kids
    addKid,
    getKids,
    
    // Communications
    sendMessage,
    getMessages,
    
    // Payments
    addPayment,
    getPayments,
    updatePayment,
    
    // Media
    uploadMedia,
    getMedia,
    
    // User management (admin only)
    getUsers,
    updateUserStatusById,
    deleteUserById,
  }), [
    addKid,
    getKids,
    sendMessage,
    getMessages,
    addPayment,
    getPayments,
    updatePayment,
    uploadMedia,
    getMedia,
    getUsers,
    updateUserStatusById,
    deleteUserById,
  ]);
});