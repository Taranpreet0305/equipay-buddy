import { supabase } from '@/integrations/supabase/client';

export async function exportGroupExpensesCSV(groupId: string, groupName: string) {
  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      description, amount, category, currency, split_type, created_at, is_settled,
      profiles:paid_by(display_name),
      expense_splits(user_id, amount, is_paid, profiles:user_id(display_name))
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (!expenses || expenses.length === 0) return;

  const { data: settlements } = await supabase
    .from('settlements')
    .select(`
      amount, method, status, created_at, completed_at,
      profiles_from:from_user_id(display_name),
      profiles_to:to_user_id(display_name)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  const rows: string[] = [];
  
  // Expenses section
  rows.push('Type,Date,Description,Amount,Category,Paid By,Split Type,Settled');
  for (const exp of expenses) {
    const date = new Date(exp.created_at).toLocaleDateString('en-IN');
    const paidBy = (exp as any).profiles?.display_name || 'Unknown';
    rows.push(
      `Expense,"${date}","${exp.description}",${exp.amount},${exp.category},"${paidBy}",${exp.split_type},${exp.is_settled}`
    );
  }

  // Settlements section
  if (settlements && settlements.length > 0) {
    rows.push('');
    rows.push('Type,Date,From,To,Amount,Method,Status');
    for (const s of settlements) {
      const date = new Date(s.created_at).toLocaleDateString('en-IN');
      const from = (s as any).profiles_from?.display_name || 'Unknown';
      const to = (s as any).profiles_to?.display_name || 'Unknown';
      rows.push(`Settlement,"${date}","${from}","${to}",${s.amount},${s.method},${s.status}`);
    }
  }

  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${groupName.replace(/[^a-zA-Z0-9]/g, '_')}_expenses.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
