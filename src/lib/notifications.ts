import { supabase } from '@/integrations/supabase/client';

/**
 * Send in-app notification to a user when an expense is added
 */
export async function notifyExpenseAdded(
  groupId: string,
  expenseDescription: string,
  amount: number,
  paidByName: string,
  excludeUserId: string
) {
  try {
    // Get all group members except the one who added the expense
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .neq('user_id', excludeUserId);

    if (!members || members.length === 0) return;

    const notifications = members.map(m => ({
      user_id: m.user_id,
      type: 'expense_added',
      title: 'New Expense Added',
      message: `${paidByName} added "${expenseDescription}" for ₹${amount.toLocaleString('en-IN')}`,
      data: { group_id: groupId },
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (err) {
    console.error('Failed to send expense notifications:', err);
  }
}

/**
 * Send in-app notification when a debt is settled
 */
export async function notifySettlement(
  groupId: string,
  fromUserName: string,
  toUserId: string,
  amount: number,
  method: string
) {
  try {
    await supabase.from('notifications').insert({
      user_id: toUserId,
      type: 'settlement',
      title: 'Payment Received',
      message: `${fromUserName} settled ₹${amount.toLocaleString('en-IN')} via ${method}`,
      data: { group_id: groupId },
    });
  } catch (err) {
    console.error('Failed to send settlement notification:', err);
  }
}
