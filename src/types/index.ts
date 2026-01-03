export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  upiId?: string;
  phone?: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: Date;
  totalExpenses: number;
}

export interface GroupMember {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  email: string;
  balance: number; // positive means owed to them, negative means they owe
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string; // userId
  paidByName: string;
  splitType: 'equal' | 'exact' | 'percentage' | 'shares';
  splitDetails: SplitDetail[];
  category: ExpenseCategory;
  receipt?: string;
  notes?: string;
  createdAt: Date;
  isSettled: boolean;
}

export interface SplitDetail {
  userId: string;
  displayName: string;
  amount: number;
  percentage?: number;
  shares?: number;
  isPaid: boolean;
}

export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'utilities'
  | 'rent'
  | 'travel'
  | 'health'
  | 'other';

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  method: 'cash' | 'upi' | 'bank';
  status: 'pending' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

export interface Balance {
  userId: string;
  displayName: string;
  amount: number; // positive = owed to them, negative = they owe
}

export interface SimplifiedDebt {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface Analytics {
  totalExpenses: number;
  totalPaid: number;
  totalOwed: number;
  totalOwing: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  monthlyTrend: { month: string; amount: number }[];
}
