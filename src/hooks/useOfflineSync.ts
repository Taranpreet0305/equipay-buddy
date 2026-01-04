import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingExpense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  category: string;
  splitType: string;
  paidBy: string;
  splits: Array<{ userId: string; amount: number }>;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = 'equipay_pending_expenses';
const SYNC_INTERVAL = 30000; // 30 seconds

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending expenses from localStorage
  const getPendingExpenses = useCallback((): PendingExpense[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save pending expenses to localStorage
  const savePendingExpenses = useCallback((expenses: PendingExpense[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    setPendingCount(expenses.length);
  }, []);

  // Add expense to offline queue
  const addOfflineExpense = useCallback((expense: Omit<PendingExpense, 'id' | 'createdAt'>) => {
    const pending = getPendingExpenses();
    const newExpense: PendingExpense = {
      ...expense,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    pending.push(newExpense);
    savePendingExpenses(pending);
    toast.info('Expense saved offline', {
      description: 'Will sync when connection is restored',
    });
    return newExpense;
  }, [getPendingExpenses, savePendingExpenses]);

  // Sync a single expense to the server
  const syncExpense = async (expense: PendingExpense): Promise<boolean> => {
    try {
      // Create the expense
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          group_id: expense.groupId,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          split_type: expense.splitType,
          paid_by: expense.paidBy,
          notes: expense.notes || null,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create splits
      const splits = expense.splits.map(split => ({
        expense_id: expenseData.id,
        user_id: split.userId,
        amount: split.amount,
      }));

      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splits);

      if (splitsError) throw splitsError;

      return true;
    } catch (error) {
      console.error('Failed to sync expense:', error);
      return false;
    }
  };

  // Sync all pending expenses
  const syncAllPending = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    const pending = getPendingExpenses();
    if (pending.length === 0) return;

    setIsSyncing(true);
    const syncedIds: string[] = [];
    const failedIds: string[] = [];

    for (const expense of pending) {
      const success = await syncExpense(expense);
      if (success) {
        syncedIds.push(expense.id);
      } else {
        failedIds.push(expense.id);
      }
    }

    // Remove synced expenses from storage
    const remaining = pending.filter(e => !syncedIds.includes(e.id));
    savePendingExpenses(remaining);

    if (syncedIds.length > 0) {
      toast.success(`Synced ${syncedIds.length} expense(s)`, {
        description: failedIds.length > 0 ? `${failedIds.length} failed to sync` : undefined,
      });
    }

    setIsSyncing(false);
  }, [isOnline, isSyncing, getPendingExpenses, savePendingExpenses]);

  // Clear all pending expenses
  const clearPending = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPendingCount(0);
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online!', {
        description: 'Syncing pending expenses...',
      });
      syncAllPending();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline', {
        description: 'Expenses will be saved locally',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load
    const pending = getPendingExpenses();
    setPendingCount(pending.length);

    // Auto-sync on load if online and have pending
    if (navigator.onLine && pending.length > 0) {
      syncAllPending();
    }

    // Periodic sync attempt
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        syncAllPending();
      }
    }, SYNC_INTERVAL);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    addOfflineExpense,
    syncAllPending,
    clearPending,
    getPendingExpenses,
  };
}
