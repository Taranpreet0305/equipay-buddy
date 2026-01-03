import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Group, Expense, Settlement } from '@/types';

// Mock data for demo
const mockUser: User = {
  id: '1',
  email: 'demo@equipay.com',
  displayName: 'Alex Johnson',
  photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  upiId: 'alex@upi',
  phone: '+91 98765 43210',
  createdAt: new Date(),
};

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Weekend Trip 🏖️',
    description: 'Goa trip with friends',
    createdBy: '1',
    members: [
      { id: '1', userId: '1', displayName: 'Alex Johnson', email: 'alex@equipay.com', balance: 1250, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      { id: '2', userId: '2', displayName: 'Sarah Wilson', email: 'sarah@equipay.com', balance: -450, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
      { id: '3', userId: '3', displayName: 'Mike Chen', email: 'mike@equipay.com', balance: -800, photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    ],
    createdAt: new Date('2024-01-15'),
    totalExpenses: 15000,
  },
  {
    id: '2',
    name: 'Apartment 🏠',
    description: 'Monthly shared expenses',
    createdBy: '1',
    members: [
      { id: '1', userId: '1', displayName: 'Alex Johnson', email: 'alex@equipay.com', balance: -2100, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      { id: '4', userId: '4', displayName: 'Emma Davis', email: 'emma@equipay.com', balance: 2100, photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
    ],
    createdAt: new Date('2023-06-01'),
    totalExpenses: 45000,
  },
  {
    id: '3',
    name: 'Office Lunch 🍕',
    description: 'Daily lunch expenses',
    createdBy: '2',
    members: [
      { id: '1', userId: '1', displayName: 'Alex Johnson', email: 'alex@equipay.com', balance: 350, photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      { id: '2', userId: '2', displayName: 'Sarah Wilson', email: 'sarah@equipay.com', balance: -175, photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
      { id: '5', userId: '5', displayName: 'Tom Brown', email: 'tom@equipay.com', balance: -175, photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
    ],
    createdAt: new Date('2024-02-01'),
    totalExpenses: 8500,
  },
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    groupId: '1',
    description: 'Hotel booking',
    amount: 9000,
    currency: 'INR',
    paidBy: '1',
    paidByName: 'Alex Johnson',
    splitType: 'equal',
    splitDetails: [
      { userId: '1', displayName: 'Alex Johnson', amount: 3000, isPaid: true },
      { userId: '2', displayName: 'Sarah Wilson', amount: 3000, isPaid: false },
      { userId: '3', displayName: 'Mike Chen', amount: 3000, isPaid: false },
    ],
    category: 'travel',
    createdAt: new Date('2024-01-16'),
    isSettled: false,
  },
  {
    id: '2',
    groupId: '1',
    description: 'Dinner at Beach Shack',
    amount: 3500,
    currency: 'INR',
    paidBy: '2',
    paidByName: 'Sarah Wilson',
    splitType: 'equal',
    splitDetails: [
      { userId: '1', displayName: 'Alex Johnson', amount: 1166.67, isPaid: false },
      { userId: '2', displayName: 'Sarah Wilson', amount: 1166.67, isPaid: true },
      { userId: '3', displayName: 'Mike Chen', amount: 1166.66, isPaid: false },
    ],
    category: 'food',
    createdAt: new Date('2024-01-17'),
    isSettled: false,
  },
  {
    id: '3',
    groupId: '2',
    description: 'Electricity Bill',
    amount: 4200,
    currency: 'INR',
    paidBy: '4',
    paidByName: 'Emma Davis',
    splitType: 'equal',
    splitDetails: [
      { userId: '1', displayName: 'Alex Johnson', amount: 2100, isPaid: false },
      { userId: '4', displayName: 'Emma Davis', amount: 2100, isPaid: true },
    ],
    category: 'utilities',
    createdAt: new Date('2024-02-01'),
    isSettled: false,
  },
];

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  settlements: Settlement[];
  setSettlements: (settlements: Settlement[]) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'totalExpenses'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const isAuthenticated = user !== null;

  const login = async (email: string, password: string) => {
    // Mock login
    setUser(mockUser);
  };

  const loginWithGoogle = async () => {
    // Mock Google login
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const addGroup = (groupData: Omit<Group, 'id' | 'createdAt' | 'totalExpenses'>) => {
    const newGroup: Group = {
      ...groupData,
      id: Date.now().toString(),
      createdAt: new Date(),
      totalExpenses: 0,
    };
    setGroups([...groups, newGroup]);
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setExpenses([...expenses, newExpense]);

    // Update group total
    setGroups(groups.map(g => 
      g.id === expenseData.groupId 
        ? { ...g, totalExpenses: g.totalExpenses + expenseData.amount }
        : g
    ));
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      groups,
      setGroups,
      expenses,
      setExpenses,
      settlements,
      setSettlements,
      isAuthenticated,
      login,
      loginWithGoogle,
      logout,
      addGroup,
      addExpense,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
