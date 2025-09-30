export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'parent';
  createdAt: string;
}

export interface Kid {
  id: string;
  parentId: string;
  name: string;
  yearOfBirth: number;
  team: 'A' | 'B'; // Team A: 10+, Team B: <10
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  kidIds: string[];
  amount: number;
  feeType: 'yearly' | 'monthly';
  period: string; // "2024" for yearly, "2024-01" for monthly
  receiptUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
}

export interface FeeStructure {
  yearlyFirstKid: number;
  yearlyAdditional: number;
  monthlyFirstKid: number;
  monthlyAdditional: number;
}

export interface TrainingPoll {
  id: string;
  title: string;
  date: string;
  description: string;
  createdAt: string;
  responses: {
    kidId: string;
    attending: boolean;
  }[];
  expiresAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  readBy: string[]; // user IDs
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  uploadedAt: string;
}