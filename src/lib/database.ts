import { supabase } from '@/integrations/supabase/client';

// Types for our database operations
export interface ProfileDB {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  upi_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupDB {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupMemberDB {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  profiles?: ProfileDB;
}

export interface ExpenseDB {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  paid_by: string;
  split_type: string;
  category: string;
  receipt_url: string | null;
  notes: string | null;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
  profiles?: ProfileDB;
}

export interface ExpenseSplitDB {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  percentage: number | null;
  shares: number | null;
  is_paid: boolean;
  created_at: string;
  profiles?: ProfileDB;
}

export interface NotificationDB {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}



// Auth functions
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
      },
    },
  });
  
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}


export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Profile functions
export async function getUserStats(userId: string) {
  const [expensesPaid, expenseSplits, settlements] = await Promise.all([
    supabase.from('expenses').select('amount').eq('paid_by', userId),
    supabase.from('expense_splits').select('amount').eq('user_id', userId),
    supabase.from('settlements').select('id').or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
  ]);

  const totalPaid = (expensesPaid.data || []).reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalExpenses = (expenseSplits.data || []).reduce((sum, split) => sum + Number(split.amount), 0);
  const settledCount = (settlements.data || []).length;

  return { totalPaid, totalExpenses, settledCount };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  return { data: data as ProfileDB | null, error };
}

export async function updateProfile(userId: string, updates: Partial<ProfileDB>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data: data as ProfileDB | null, error };
}

export async function searchProfiles(query: string, excludeUserIds: string[] = []) {
  // Sanitize input to prevent injection
  const sanitizedQuery = query.replace(/[%_\\]/g, '\\$&').trim();
  
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    return { data: [], error: null };
  }
  
  // Validate UUIDs to prevent injection
  const validExcludeIds = excludeUserIds.filter(id => 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
  
  let queryBuilder = supabase
    .from('profiles')
    .select('*')
    .or(`display_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%`)
    .limit(10);
  
  if (validExcludeIds.length > 0) {
    queryBuilder = queryBuilder.not('user_id', 'in', `(${validExcludeIds.join(',')})`);
  }
  
  const { data, error } = await queryBuilder;
  
  return { data: data as ProfileDB[] | null, error };
}

// Group functions
export async function getUserGroups(userId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups (
        id,
        name,
        description,
        image_url,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId);
  
  if (error) return { data: null, error };
  
  const groups = data?.map(item => (item as any).groups).filter(Boolean) as GroupDB[];
  return { data: groups, error: null };
}

export async function getGroupWithMembers(groupId: string) {
  const [groupResult, membersResult] = await Promise.all([
    supabase.from('groups').select('*').eq('id', groupId).single(),
    supabase.from('group_members').select(`
      *,
      profiles (*)
    `).eq('group_id', groupId)
  ]);
  
  return {
    group: groupResult.data as GroupDB | null,
    members: membersResult.data as GroupMemberDB[] | null,
    error: groupResult.error || membersResult.error,
  };
}

export async function createGroup(name: string, description: string | null, createdBy: string) {
  // First create the group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({ name, description, created_by: createdBy })
    .select()
    .single();
  
  if (groupError || !group) return { data: null, error: groupError };
  
  // Add creator as member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: createdBy });
  
  return { data: group as GroupDB, error: memberError };
}

export async function addGroupMember(groupId: string, userId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId })
    .select()
    .single();
  
  return { data: data as GroupMemberDB | null, error };
}

// Expense functions
export async function updateGroup(id: string, updates: Partial<GroupDB>) {
  return await supabase.from('groups').update(updates).eq('id', id);
}

export async function deleteGroup(id: string) {
  return await supabase.from('groups').delete().eq('id', id);
}

export async function removeGroupMember(memberId: string) {
  return await supabase.from('group_members').delete().eq('id', memberId);
}

export async function getGroupExpenses(groupId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      profiles:paid_by (*)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  
  return { data: data as ExpenseDB[] | null, error };
}

export async function getExpenseWithSplits(expenseId: string) {
  const [expenseResult, splitsResult] = await Promise.all([
    supabase.from('expenses').select(`*, profiles:paid_by (*)`).eq('id', expenseId).single(),
    supabase.from('expense_splits').select(`*, profiles:user_id (*)`).eq('expense_id', expenseId)
  ]);
  
  return {
    expense: expenseResult.data as ExpenseDB | null,
    splits: splitsResult.data as ExpenseSplitDB[] | null,
    error: expenseResult.error || splitsResult.error,
  };
}

export async function createExpense(
  groupId: string,
  description: string,
  amount: number,
  paidBy: string,
  splitType: string,
  category: string,
  splits: Array<{ userId: string; amount: number; percentage?: number; shares?: number }>,
  notes?: string,
  receiptUrl?: string
) {
  // Create expense
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      group_id: groupId,
      description,
      amount,
      paid_by: paidBy,
      split_type: splitType,
      category,
      notes,
      receipt_url: receiptUrl,
    })
    .select()
    .single();
  
  if (expenseError || !expense) return { data: null, error: expenseError };
  
  // Create splits
  const splitInserts = splits.map(split => ({
    expense_id: expense.id,
    user_id: split.userId,
    amount: split.amount,
    percentage: split.percentage,
    shares: split.shares,
    is_paid: split.userId === paidBy,
  }));
  
  const { error: splitsError } = await supabase
    .from('expense_splits')
    .insert(splitInserts);
  
  if (splitsError) {
    // Rollback expense if splits fail
    await supabase.from('expenses').delete().eq('id', expense.id);
    return { data: null, error: splitsError };
  }
  
  return { data: expense as ExpenseDB, error: null };
}



// Notifications
export async function getUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  return { data: data as NotificationDB[] | null, error };
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  
  return { error };
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  
  return { error };
}

// Subscribe to notifications
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: NotificationDB) => void
) {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as NotificationDB);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}
