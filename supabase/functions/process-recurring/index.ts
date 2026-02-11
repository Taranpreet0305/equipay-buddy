import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split('T')[0];

    // Get all active recurring expenses due today or overdue
    const { data: dueExpenses, error: fetchError } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('is_active', true)
      .lte('next_due_date', today);

    if (fetchError) throw fetchError;

    const results = [];

    for (const recurring of dueExpenses || []) {
      // Get group members for splitting
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', recurring.group_id);

      if (!members || members.length === 0) continue;

      const splitAmount = recurring.amount / members.length;

      // Create the expense
      const { data: expense, error: expError } = await supabase
        .from('expenses')
        .insert({
          group_id: recurring.group_id,
          description: `${recurring.description} (Auto)`,
          amount: recurring.amount,
          paid_by: recurring.paid_by,
          split_type: recurring.split_type,
          category: recurring.category,
          currency: recurring.currency,
          notes: 'Auto-created from recurring expense',
        })
        .select()
        .single();

      if (expError || !expense) {
        results.push({ id: recurring.id, error: expError?.message });
        continue;
      }

      // Create splits
      const splits = members.map((m: { user_id: string }) => ({
        expense_id: expense.id,
        user_id: m.user_id,
        amount: splitAmount,
        is_paid: m.user_id === recurring.paid_by,
      }));

      await supabase.from('expense_splits').insert(splits);

      // Calculate next due date
      const nextDate = new Date(recurring.next_due_date);
      switch (recurring.frequency) {
        case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
        case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
        case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
        case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
      }

      // Update next due date
      await supabase
        .from('recurring_expenses')
        .update({ next_due_date: nextDate.toISOString().split('T')[0] })
        .eq('id', recurring.id);

      results.push({ id: recurring.id, expense_id: expense.id, next_due: nextDate.toISOString().split('T')[0] });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
