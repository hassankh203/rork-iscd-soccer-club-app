import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Kid, Payment, FeeStructure, TrainingPoll, Announcement, Message, Media } from '@/types';
import { useAuth } from './auth-context';

interface AppState {
  kids: Kid[];
  payments: Payment[];
  feeStructure: FeeStructure;
  trainingPolls: TrainingPoll[];
  announcements: Announcement[];
  messages: Message[];
  media: Media[];
  unreadCounts: {
    polls: number;
    announcements: number;
    messages: number;
  };
  // Kid management
  addKid: (name: string, yearOfBirth: number) => Promise<void>;
  updateKid: (kidId: string, updates: Partial<Kid>) => Promise<void>;
  deleteKid: (kidId: string) => Promise<void>;
  // Payment management
  submitPayment: (payment: Omit<Payment, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  verifyPayment: (paymentId: string) => Promise<void>;
  // Fee management (admin only)
  updateFeeStructure: (fees: FeeStructure) => Promise<void>;
  // Training polls
  createTrainingPoll: (poll: Omit<TrainingPoll, 'id' | 'createdAt' | 'responses'>) => Promise<void>;
  respondToPoll: (pollId: string, kidId: string, attending: boolean) => Promise<void>;
  // Announcements
  createAnnouncement: (title: string, content: string) => Promise<void>;
  markAnnouncementRead: (announcementId: string) => Promise<void>;
  // Messages
  sendMessage: (toUserId: string, content: string) => Promise<void>;
  markMessageRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  // Media
  uploadMedia: (url: string, type: 'image' | 'video', caption?: string) => Promise<void>;
  // Communication tab management
  markCommunicationTabOpened: (tabType: 'polls' | 'announcements' | 'messages') => Promise<void>;
  // Helpers
  getTeamRoster: (team: 'A' | 'B') => Kid[];
  refreshData: () => Promise<void>;
}

export const [AppProvider, useApp] = createContextHook<AppState>(() => {
  const { user } = useAuth();
  const [kids, setKids] = useState<Kid[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feeStructure, setFeeStructure] = useState<FeeStructure>({
    yearlyFirstKid: 500,
    yearlyAdditional: 400,
    monthlyFirstKid: 50,
    monthlyAdditional: 40
  });
  const [trainingPolls, setTrainingPolls] = useState<TrainingPoll[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  const initializeDemoData = useCallback(async () => {
    console.log('Initializing demo data...');
    
    // Create demo kids for the demo parent
    const demoKids: Kid[] = [
      {
        id: 'demo-kid-1',
        parentId: 'demo-parent',
        name: 'Ahmed Ali',
        yearOfBirth: 2015,
        team: 'B',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-kid-2',
        parentId: 'demo-parent',
        name: 'Sara Ali',
        yearOfBirth: 2012,
        team: 'A',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Create demo announcements
    const demoAnnouncements: Announcement[] = [
      {
        id: 'demo-announcement-1',
        title: 'Welcome to ISCD!',
        content: 'Welcome to the Islamic Soccer Club of Delaware mobile app! Here you can manage your children\'s registration, view team rosters, respond to training polls, and stay updated with club announcements.',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        readBy: []
      },
      {
        id: 'demo-announcement-2',
        title: 'Season Schedule Update',
        content: 'The new season schedule has been finalized. Training sessions will be held every Saturday at 10 AM for Team A and 11 AM for Team B. Please make sure to arrive 15 minutes early.',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        readBy: []
      }
    ];
    
    // Create demo training poll
    const demoPolls: TrainingPoll[] = [
      {
        id: 'demo-poll-1',
        title: 'Training Session - This Saturday',
        description: 'Please confirm if your child will attend the training session this Saturday at the usual time.',
        date: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
        createdAt: new Date().toISOString(),
        responses: []
      }
    ];
    
    // Create demo messages
    const demoMessages: Message[] = [
      {
        id: 'demo-message-1',
        fromUserId: 'admin',
        toUserId: 'demo-parent',
        content: 'Welcome to ISCD! Please let us know if you have any questions about your children\'s registration or upcoming training sessions.',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false
      }
    ];
    
    // Create demo media
    const demoMedia: Media[] = [
      {
        id: 'demo-media-1',
        url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
        type: 'image',
        caption: 'Team training session - Great teamwork!',
        uploadedAt: new Date().toISOString()
      }
    ];
    
    // Save demo data
    await Promise.all([
      AsyncStorage.setItem('kids', JSON.stringify(demoKids)),
      AsyncStorage.setItem('announcements', JSON.stringify(demoAnnouncements)),
      AsyncStorage.setItem('trainingPolls', JSON.stringify(demoPolls)),
      AsyncStorage.setItem('messages', JSON.stringify(demoMessages)),
      AsyncStorage.setItem('media', JSON.stringify(demoMedia))
    ]);
    
    console.log('Demo data initialized successfully');
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Loading app data for user:', user.id);
      
      // Initialize demo data for demo parent on first load
      if (user.id === 'demo-parent') {
        const existingKids = await AsyncStorage.getItem('kids');
        if (!existingKids) {
          await initializeDemoData();
        }
      }
      
      const [kidsData, paymentsData, feesData, pollsData, announcementsData, messagesData, mediaData] = await Promise.all([
        AsyncStorage.getItem('kids'),
        AsyncStorage.getItem('payments'),
        AsyncStorage.getItem('feeStructure'),
        AsyncStorage.getItem('trainingPolls'),
        AsyncStorage.getItem('announcements'),
        AsyncStorage.getItem('messages'),
        AsyncStorage.getItem('media')
      ]);

      // Parse and validate data with error handling
      try {
        if (kidsData) {
          const parsedKids = JSON.parse(kidsData);
          setKids(Array.isArray(parsedKids) ? parsedKids : []);
        }
      } catch (e) {
        console.error('Failed to parse kids data:', e);
        setKids([]);
      }
      
      try {
        if (paymentsData) {
          const parsedPayments = JSON.parse(paymentsData);
          setPayments(Array.isArray(parsedPayments) ? parsedPayments : []);
        }
      } catch (e) {
        console.error('Failed to parse payments data:', e);
        setPayments([]);
      }
      
      try {
        if (feesData) {
          const parsedFees = JSON.parse(feesData);
          if (parsedFees && typeof parsedFees === 'object') {
            setFeeStructure({
              yearlyFirstKid: parsedFees.yearlyFirstKid || 500,
              yearlyAdditional: parsedFees.yearlyAdditional || 400,
              monthlyFirstKid: parsedFees.monthlyFirstKid || 50,
              monthlyAdditional: parsedFees.monthlyAdditional || 40
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse fee structure:', e);
      }
      
      try {
        if (pollsData) {
          const parsedPolls = JSON.parse(pollsData);
          setTrainingPolls(Array.isArray(parsedPolls) ? parsedPolls : []);
        }
      } catch (e) {
        console.error('Failed to parse training polls:', e);
        setTrainingPolls([]);
      }
      
      try {
        if (announcementsData) {
          const parsedAnnouncements = JSON.parse(announcementsData);
          setAnnouncements(Array.isArray(parsedAnnouncements) ? parsedAnnouncements : []);
        }
      } catch (e) {
        console.error('Failed to parse announcements:', e);
        setAnnouncements([]);
      }
      
      try {
        if (messagesData) {
          const parsedMessages = JSON.parse(messagesData);
          setMessages(Array.isArray(parsedMessages) ? parsedMessages : []);
        }
      } catch (e) {
        console.error('Failed to parse messages:', e);
        setMessages([]);
      }
      
      try {
        if (mediaData) {
          const parsedMedia = JSON.parse(mediaData);
          setMedia(Array.isArray(parsedMedia) ? parsedMedia : []);
        }
      } catch (e) {
        console.error('Failed to parse media:', e);
        setMedia([]);
      }
      
      console.log('App data loaded successfully');
    } catch (error) {
      console.error('Failed to load app data:', error);
      // Initialize with default values on error
      setKids([]);
      setPayments([]);
      setTrainingPolls([]);
      setAnnouncements([]);
      setMessages([]);
      setMedia([]);
    }
  }, [user, initializeDemoData]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const calculateUnreadCounts = useCallback(() => {
    if (!user) return { polls: 0, announcements: 0, messages: 0 };
    
    const myKids = kids.filter(k => k.parentId === user.id);
    const myKidIds = myKids.map(k => k.id);
    
    const unreadPolls = trainingPolls.filter(poll => {
      const responses = poll.responses.filter(r => myKidIds.includes(r.kidId));
      return responses.length < myKids.length;
    }).length;
    
    const unreadAnnouncements = announcements.filter(a => !a.readBy.includes(user.id)).length;
    const unreadMessages = messages.filter(m => m.toUserId === user.id && !m.read).length;
    
    return {
      polls: unreadPolls,
      announcements: unreadAnnouncements,
      messages: unreadMessages
    };
  }, [user, kids, trainingPolls, announcements, messages]);

  const addKid = useCallback(async (name: string, yearOfBirth: number) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    // Input validation
    if (!name || name.trim().length < 2) {
      throw new Error('Child name must be at least 2 characters long');
    }
    
    const currentYear = new Date().getFullYear();
    if (yearOfBirth < 1900 || yearOfBirth > currentYear) {
      throw new Error('Please enter a valid year of birth');
    }
    
    if (yearOfBirth > currentYear - 4) {
      throw new Error('Child must be at least 4 years old to join');
    }
    
    try {
      console.log('Adding new kid:', name, yearOfBirth);
      
      const age = currentYear - yearOfBirth;
      const team = age >= 10 ? 'A' : 'B';
      
      const newKid: Kid = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        parentId: user.id,
        name: name.trim(),
        yearOfBirth,
        team,
        createdAt: new Date().toISOString()
      };
      
      const updatedKids = [...kids, newKid];
      setKids(updatedKids);
      await AsyncStorage.setItem('kids', JSON.stringify(updatedKids));
      
      console.log('Kid added successfully:', newKid.name, 'Team:', newKid.team);
    } catch (error) {
      console.error('Failed to add kid:', error);
      throw error;
    }
  }, [user, kids]);

  const updateKid = useCallback(async (kidId: string, updates: Partial<Kid>) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    // Validate updates
    if (updates.name && updates.name.trim().length < 2) {
      throw new Error('Child name must be at least 2 characters long');
    }
    
    if (updates.yearOfBirth) {
      const currentYear = new Date().getFullYear();
      if (updates.yearOfBirth < 1900 || updates.yearOfBirth > currentYear) {
        throw new Error('Please enter a valid year of birth');
      }
      if (updates.yearOfBirth > currentYear - 4) {
        throw new Error('Child must be at least 4 years old to join');
      }
    }
    
    try {
      console.log('Updating kid:', kidId);
      
      const kidToUpdate = kids.find(k => k.id === kidId);
      if (!kidToUpdate) {
        throw new Error('Child not found');
      }
      
      // Check if user owns this kid (security check)
      if (user.role !== 'admin' && kidToUpdate.parentId !== user.id) {
        throw new Error('You can only update your own children');
      }
      
      // Recalculate team if year of birth is updated
      let finalUpdates = { ...updates };
      if (updates.yearOfBirth) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - updates.yearOfBirth;
        finalUpdates.team = age >= 10 ? 'A' : 'B';
      }
      
      const updatedKids = kids.map(k => 
        k.id === kidId 
          ? { ...k, ...finalUpdates, name: finalUpdates.name?.trim() || k.name }
          : k
      );
      
      setKids(updatedKids);
      await AsyncStorage.setItem('kids', JSON.stringify(updatedKids));
      
      console.log('Kid updated successfully');
    } catch (error) {
      console.error('Failed to update kid:', error);
      throw error;
    }
  }, [user, kids]);

  const deleteKid = useCallback(async (kidId: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      console.log('Deleting kid:', kidId);
      
      const kidToDelete = kids.find(k => k.id === kidId);
      if (!kidToDelete) {
        throw new Error('Child not found');
      }
      
      // Check if user owns this kid (security check)
      if (user.role !== 'admin' && kidToDelete.parentId !== user.id) {
        throw new Error('You can only delete your own children');
      }
      
      const updatedKids = kids.filter(k => k.id !== kidId);
      setKids(updatedKids);
      await AsyncStorage.setItem('kids', JSON.stringify(updatedKids));
      
      // Also remove any poll responses for this kid
      const updatedPolls = trainingPolls.map(poll => ({
        ...poll,
        responses: poll.responses.filter(r => r.kidId !== kidId)
      }));
      setTrainingPolls(updatedPolls);
      await AsyncStorage.setItem('trainingPolls', JSON.stringify(updatedPolls));
      
      console.log('Kid deleted successfully');
    } catch (error) {
      console.error('Failed to delete kid:', error);
      throw error;
    }
  }, [user, kids, trainingPolls]);

  const submitPayment = useCallback(async (payment: Omit<Payment, 'id' | 'submittedAt' | 'status'>) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    // Input validation
    if (!payment.kidIds || payment.kidIds.length === 0) {
      throw new Error('Please select at least one child');
    }
    
    if (!payment.amount || payment.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }
    
    if (!payment.feeType || !['yearly', 'monthly'].includes(payment.feeType)) {
      throw new Error('Please select a valid fee type');
    }
    
    if (!payment.period || payment.period.trim().length === 0) {
      throw new Error('Please specify the payment period');
    }
    
    // Validate that user owns all the kids in the payment
    const userKids = kids.filter(k => k.parentId === user.id);
    const userKidIds = userKids.map(k => k.id);
    const invalidKids = payment.kidIds.filter(kidId => !userKidIds.includes(kidId));
    
    if (invalidKids.length > 0) {
      throw new Error('You can only submit payments for your own children');
    }
    
    try {
      console.log('Submitting payment:', payment);
      
      const newPayment: Payment = {
        ...payment,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        period: payment.period.trim()
      };
      
      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      await AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));
      
      console.log('Payment submitted successfully:', newPayment.id);
    } catch (error) {
      console.error('Failed to submit payment:', error);
      throw error;
    }
  }, [user, kids, payments]);

  const verifyPayment = useCallback(async (paymentId: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only administrators can verify payments');
    }
    
    try {
      console.log('Verifying payment:', paymentId);
      
      const paymentToVerify = payments.find(p => p.id === paymentId);
      if (!paymentToVerify) {
        throw new Error('Payment not found');
      }
      
      const updatedPayments = payments.map(p => 
        p.id === paymentId 
          ? { ...p, status: 'verified' as const, verifiedAt: new Date().toISOString() }
          : p
      );
      
      setPayments(updatedPayments);
      await AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));
      
      console.log('Payment verified successfully');
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw error;
    }
  }, [user, payments]);

  const updateFeeStructure = useCallback(async (fees: FeeStructure) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only administrators can update fee structure');
    }
    
    // Validate fee structure
    if (!fees.yearlyFirstKid || fees.yearlyFirstKid < 0) {
      throw new Error('Yearly first kid fee must be a positive number');
    }
    
    if (!fees.yearlyAdditional || fees.yearlyAdditional < 0) {
      throw new Error('Yearly additional kid fee must be a positive number');
    }
    
    if (!fees.monthlyFirstKid || fees.monthlyFirstKid < 0) {
      throw new Error('Monthly first kid fee must be a positive number');
    }
    
    if (!fees.monthlyAdditional || fees.monthlyAdditional < 0) {
      throw new Error('Monthly additional kid fee must be a positive number');
    }
    
    try {
      console.log('Updating fee structure:', fees);
      
      setFeeStructure(fees);
      await AsyncStorage.setItem('feeStructure', JSON.stringify(fees));
      
      console.log('Fee structure updated successfully');
    } catch (error) {
      console.error('Failed to update fee structure:', error);
      throw error;
    }
  }, [user]);

  const createTrainingPoll = useCallback(async (poll: Omit<TrainingPoll, 'id' | 'createdAt' | 'responses'>) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only administrators can create training polls');
    }
    
    if (!poll.title || poll.title.trim().length === 0) {
      throw new Error('Poll title is required');
    }
    
    if (!poll.date || poll.date.trim().length === 0) {
      throw new Error('Poll date is required');
    }
    
    try {
      console.log('Creating training poll:', poll.title);
      
      const newPoll: TrainingPoll = {
        ...poll,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: poll.title.trim(),
        description: poll.description?.trim() || '',
        createdAt: new Date().toISOString(),
        responses: []
      };
      
      const updatedPolls = [...trainingPolls, newPoll];
      setTrainingPolls(updatedPolls);
      await AsyncStorage.setItem('trainingPolls', JSON.stringify(updatedPolls));
      
      console.log('Training poll created successfully');
    } catch (error) {
      console.error('Failed to create training poll:', error);
      throw error;
    }
  }, [user, trainingPolls]);

  const respondToPoll = useCallback(async (pollId: string, kidId: string, attending: boolean) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      console.log('Responding to poll:', pollId, 'Kid:', kidId, 'Attending:', attending);
      
      const poll = trainingPolls.find(p => p.id === pollId);
      if (!poll) {
        throw new Error('Training poll not found');
      }
      
      const kid = kids.find(k => k.id === kidId);
      if (!kid) {
        throw new Error('Child not found');
      }
      
      // Check if user owns this kid
      if (user.role !== 'admin' && kid.parentId !== user.id) {
        throw new Error('You can only respond for your own children');
      }
      
      const updatedPolls = trainingPolls.map(poll => {
        if (poll.id === pollId) {
          const existingResponse = poll.responses.find(r => r.kidId === kidId);
          if (existingResponse) {
            return {
              ...poll,
              responses: poll.responses.map(r => 
                r.kidId === kidId ? { ...r, attending } : r
              )
            };
          } else {
            return {
              ...poll,
              responses: [...poll.responses, { kidId, attending }]
            };
          }
        }
        return poll;
      });
      
      setTrainingPolls(updatedPolls);
      await AsyncStorage.setItem('trainingPolls', JSON.stringify(updatedPolls));
      
      console.log('Poll response recorded successfully');
    } catch (error) {
      console.error('Failed to respond to poll:', error);
      throw error;
    }
  }, [user, kids, trainingPolls]);

  const createAnnouncement = useCallback(async (title: string, content: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only administrators can create announcements');
    }
    
    if (!title || title.trim().length === 0) {
      throw new Error('Announcement title is required');
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('Announcement content is required');
    }
    
    try {
      console.log('Creating announcement:', title);
      
      const newAnnouncement: Announcement = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        readBy: []
      };
      
      const updatedAnnouncements = [...announcements, newAnnouncement];
      setAnnouncements(updatedAnnouncements);
      await AsyncStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
      
      console.log('Announcement created successfully');
    } catch (error) {
      console.error('Failed to create announcement:', error);
      throw error;
    }
  }, [user, announcements]);

  const markAnnouncementRead = useCallback(async (announcementId: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      console.log('Marking announcement as read:', announcementId);
      
      const updatedAnnouncements = announcements.map(a => 
        a.id === announcementId && !a.readBy.includes(user.id)
          ? { ...a, readBy: [...a.readBy, user.id] }
          : a
      );
      
      setAnnouncements(updatedAnnouncements);
      await AsyncStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    } catch (error) {
      console.error('Failed to mark announcement as read:', error);
      throw error;
    }
  }, [user, announcements]);

  const sendMessage = useCallback(async (toUserId: string, content: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    if (!toUserId || toUserId.trim().length === 0) {
      throw new Error('Recipient is required');
    }
    
    if (!content || content.trim().length === 0) {
      throw new Error('Message content is required');
    }
    
    try {
      console.log('Sending message to:', toUserId);
      
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fromUserId: user.id,
        toUserId: toUserId.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        read: false
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
      
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [user, messages]);

  const markMessageRead = useCallback(async (messageId: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      console.log('Marking message as read:', messageId);
      
      const updatedMessages = messages.map(m => 
        m.id === messageId ? { ...m, read: true } : m
      );
      
      setMessages(updatedMessages);
      await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  }, [user, messages]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      console.log('Deleting message:', messageId);
      
      const messageToDelete = messages.find(m => m.id === messageId);
      if (!messageToDelete) {
        throw new Error('Message not found');
      }
      
      // Check if user can delete this message (recipient or admin)
      if (user.role !== 'admin' && messageToDelete.toUserId !== user.id) {
        throw new Error('You can only delete messages sent to you');
      }
      
      const updatedMessages = messages.filter(m => m.id !== messageId);
      setMessages(updatedMessages);
      await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
      
      console.log('Message deleted successfully');
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, [user, messages]);

  const uploadMedia = useCallback(async (url: string, type: 'image' | 'video', caption?: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only administrators can upload media');
    }
    
    if (!url || url.trim().length === 0) {
      throw new Error('Media URL is required');
    }
    
    if (!type || !['image', 'video'].includes(type)) {
      throw new Error('Media type must be image or video');
    }
    
    try {
      console.log('Uploading media:', type, url);
      
      const newMedia: Media = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: url.trim(),
        type,
        caption: caption?.trim(),
        uploadedAt: new Date().toISOString()
      };
      
      // Keep only the latest media item (Pic of the Week)
      setMedia([newMedia]);
      await AsyncStorage.setItem('media', JSON.stringify([newMedia]));
      
      console.log('Media uploaded successfully');
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  }, [user]);

  const getTeamRoster = useCallback((team: 'A' | 'B') => {
    return kids.filter(k => k.team === team);
  }, [kids]);

  const memoizedUnreadCounts = useMemo(() => calculateUnreadCounts(), [
    calculateUnreadCounts
  ]);
  
  const markCommunicationTabOpened = useCallback(async (tabType: 'polls' | 'announcements' | 'messages') => {
    if (!user) return;
    
    try {
      console.log('Marking communication tab as opened:', tabType);
      
      if (tabType === 'announcements') {
        // Mark all unread announcements as read
        const unreadAnnouncements = announcements.filter(a => !a.readBy.includes(user.id));
        if (unreadAnnouncements.length > 0) {
          const updatedAnnouncements = announcements.map(a => 
            !a.readBy.includes(user.id) ? { ...a, readBy: [...a.readBy, user.id] } : a
          );
          setAnnouncements(updatedAnnouncements);
          await AsyncStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        }
      } else if (tabType === 'messages') {
        // Mark all unread messages TO this user as read
        const unreadMessages = messages.filter(m => m.toUserId === user.id && !m.read);
        if (unreadMessages.length > 0) {
          const updatedMessages = messages.map(m => 
            m.toUserId === user.id && !m.read ? { ...m, read: true } : m
          );
          setMessages(updatedMessages);
          await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
        }
      }
      // Note: polls don't auto-mark as read since they require user action
    } catch (error) {
      console.error('Failed to mark communication tab as opened:', error);
    }
  }, [user, announcements, messages]);
  
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);
  
  return {
    kids,
    payments,
    feeStructure,
    trainingPolls,
    announcements,
    messages,
    media,
    unreadCounts: memoizedUnreadCounts,
    addKid,
    updateKid,
    deleteKid,
    submitPayment,
    verifyPayment,
    updateFeeStructure,
    createTrainingPoll,
    respondToPoll,
    createAnnouncement,
    markAnnouncementRead,
    sendMessage,
    markMessageRead,
    deleteMessage,
    uploadMedia,
    markCommunicationTabOpened,
    getTeamRoster,
    refreshData
  };
});