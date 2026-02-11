import { supabase } from '@/integrations/supabase/client';

export interface UserBalance {
  youOwe: number;
  youAreOwed: number;
  totalBalance: number;
  categoryTotals: Record<string, number>;
}

export async function calculateUserBalances(userId: string): Promise<UserBalance> {
  // Get all expense splits for this user across all their groups
  const { data: splits } = await supabase
    .from('expense_splits')
    .select(`
      amount,
      is_paid,
      expense_id,
      user_id,
      expenses (
        amount,
        paid_by,
        category,
        is_settled
      )
    `)
    .eq('user_id', userId);

  // Get all expenses paid by this user
  const { data: paidExpenses } = await supabase
    .from('expenses')
    .select(`
      id,
      amount,
      category,
      is_settled,
      expense_splits (
        user_id,
        amount,
        is_paid
      )
    `)
    .eq('paid_by', userId)
    .eq('is_settled', false);

  let youAreOwed = 0;
  let youOwe = 0;
  const categoryTotals: Record<string, number> = {};

  // Calculate what others owe you (from expenses you paid)
  if (paidExpenses) {
    for (const expense of paidExpenses) {
      const expenseSplits = (expense as any).expense_splits;
      if (expenseSplits) {
        for (const split of expenseSplits) {
          if (split.user_id !== userId && !split.is_paid) {
            youAreOwed += Number(split.amount);
          }
        }
      }
      // Track category spending
      const cat = expense.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(expense.amount);
    }
  }

  // Calculate what you owe others (splits where you haven't paid)
  if (splits) {
    for (const split of splits) {
      const expense = (split as any).expenses;
      if (expense && !expense.is_settled && expense.paid_by !== userId && !split.is_paid) {
        youOwe += Number(split.amount);
      }
      // Also track categories from expenses you're part of
      if (expense) {
        const cat = expense.category || 'other';
        if (!categoryTotals[cat]) {
          categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(split.amount);
        }
      }
    }
  }

  return {
    youOwe: Math.round(youOwe * 100) / 100,
    youAreOwed: Math.round(youAreOwed * 100) / 100,
    totalBalance: Math.round((youAreOwed - youOwe) * 100) / 100,
    categoryTotals,
  };
}
