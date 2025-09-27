import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from './supabase-auth-context';

// Types for database entities
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'parent' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  sender_id: string;
  recipient_id?: string;
  message: string;
  type: 'message' | 'announcement';
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  recipient?: Profile;
}

export interface MediaUpload {
  id: string;
  uploader_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  category: 'pic_of_week' | 'general';
  is_active: boolean;
  created_at: string;
  uploader?: Profile;
}

export interface Kid {
  id: string;
  parent_id: string;
  name: string;
  age?: number;
  team?: string;
  position?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  parent_id: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'overdue';
  due_date?: string;
  paid_date?: string;
  created_at: string;
}

// Communications hooks
export const useCommunications = () => {
  const { user } = useSupabaseAuth();
  
  return useQuery({
    queryKey: ['communications', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('communications')
        .select(`
          *,
          sender:profiles!sender_id(*),
          recipient:profiles!recipient_id(*)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id},recipient_id.is.null`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Communication[];
    },
    enabled: !!user,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  
  return useMutation({
    mutationFn: async ({ recipientId, message, type = 'message' }: {
      recipientId?: string;
      message: string;
      type?: 'message' | 'announcement';
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('communications')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message,
          type,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('communications')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
  });
};

// Media uploads hooks
export const useMediaUploads = (category?: string) => {
  return useQuery({
    queryKey: ['media_uploads', category],
    queryFn: async () => {
      let query = supabase
        .from('media_uploads')
        .select(`
          *,
          uploader:profiles!uploader_id(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as MediaUpload[];
    },
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  
  return useMutation({
    mutationFn: async ({ title, description, fileUrl, fileType, category = 'pic_of_week' }: {
      title: string;
      description?: string;
      fileUrl: string;
      fileType: string;
      category?: 'pic_of_week' | 'general';
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('media_uploads')
        .insert({
          uploader_id: user.id,
          title,
          description,
          file_url: fileUrl,
          file_type: fileType,
          category,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_uploads'] });
    },
  });
};

// Kids hooks
export const useKids = () => {
  const { user } = useSupabaseAuth();
  
  return useQuery({
    queryKey: ['kids', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      let query = supabase
        .from('kids')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If user is parent, only show their kids
      if (user.role === 'parent') {
        query = query.eq('parent_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Kid[];
    },
    enabled: !!user,
  });
};

export const useAddKid = () => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();
  
  return useMutation({
    mutationFn: async (kidData: Omit<Kid, 'id' | 'parent_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('kids')
        .insert({
          ...kidData,
          parent_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
    },
  });
};

// Payments hooks
export const usePayments = () => {
  const { user } = useSupabaseAuth();
  
  return useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If user is parent, only show their payments
      if (user.role === 'parent') {
        query = query.eq('parent_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!user,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ paymentId, status, paidDate }: {
      paymentId: string;
      status: 'pending' | 'paid' | 'overdue';
      paidDate?: string;
    }) => {
      const { data, error } = await supabase
        .from('payments')
        .update({ 
          status,
          paid_date: paidDate 
        })
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

// Profiles hooks
export const useProfiles = () => {
  const { user } = useSupabaseAuth();
  
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!user && user.role === 'admin',
  });
};