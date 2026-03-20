import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Filter, TrendingUp, TrendingDown, Receipt, CheckCircle2, Banknote, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'expense' | 'settlement';
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  category?: string;
  method?: string;
  toUser?: string;
}

export default function Activity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyOwed, setMonthlyOwed] = useState(0);
  const [monthlyOwe, setMonthlyOwe] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadActivity();
  }, [user]);

  async function loadActivity() {
    setIsLoading(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [expensesRes, settlementsRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('id, description, amount, category, created_at, paid_by, profiles:paid_by(display_name)')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('settlements')
        .select('id, amount, method, created_at, from_user_id, to_user_id, profiles_from:from_user_id(display_name), profiles_to:to_user_id(display_name)')
        .or(`from_user_id.eq.${user!.id},to_user_id.eq.${user!.id}`)
        .order('created_at', { ascending: false })
        .limit(50)
    ]);

    const items: ActivityItem[] = [];

    if (expensesRes.data) {
      for (const exp of expensesRes.data) {
        items.push({
          id: exp.id,
          type: 'expense',
          description: exp.description,
          amount: Number(exp.amount),
          date: exp.created_at,
          paidBy: (exp as any).profiles?.display_name || 'Unknown',
          category: exp.category,
        });
      }
    }

    if (settlementsRes.data) {
      for (const s of settlementsRes.data) {
        items.push({
          id: s.id,
          type: 'settlement',
          description: 'Settlement',
          amount: Number(s.amount),
          date: s.created_at,
          paidBy: (s as any).profiles_from?.display_name || 'Unknown',
          toUser: (s as any).profiles_to?.display_name || 'Unknown',
          method: s.method,
        });
      }
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivities(items);

    // Monthly calculations
    const monthExpenses = expensesRes.data?.filter(e => e.created_at >= startOfMonth) || [];
    let owed = 0, owe = 0;
    for (const exp of monthExpenses) {
      if (exp.paid_by === user!.id) {
        owed += Number(exp.amount);
      }
    }
    setMonthlyOwed(owed);
    setMonthlyOwe(owe);
    setIsLoading(false);
  }

  return (
    <PageLayout>
      <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Activity</h1>
            <p className="text-xs text-muted-foreground">Expenses & settlements</p>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2"
        >
          <div className="bg-green-500/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-[10px] text-green-600 font-medium">This Month</span>
            </div>
            <p className="text-lg font-bold text-green-600">₹{monthlyOwed.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-green-600/70">You paid</p>
          </div>

          <div className="bg-destructive/10 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <span className="text-[10px] text-destructive font-medium">Settlements</span>
            </div>
            <p className="text-lg font-bold text-destructive">
              {activities.filter(a => a.type === 'settlement').length}
            </p>
            <p className="text-[10px] text-destructive/70">Completed</p>
          </div>
        </motion.div>

        {/* Activity List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No activity yet. Add your first expense!
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-card rounded-lg p-3 shadow-soft border border-border/50"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === 'settlement' 
                      ? 'bg-green-500/10' 
                      : 'bg-primary/10'
                  }`}>
                    {item.type === 'settlement' ? (
                      item.method === 'upi' ? (
                        <Smartphone className="w-4 h-4 text-green-600" />
                      ) : (
                        <Banknote className="w-4 h-4 text-green-600" />
                      )
                    ) : (
                      <Receipt className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {item.type === 'settlement' 
                        ? `${item.paidBy} → ${item.toUser}`
                        : item.description
                      }
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.type === 'expense' ? `Paid by ${item.paidBy}` : `Settled via ${item.method}`}
                      {' · '}
                      {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${
                      item.type === 'settlement' ? 'text-green-600' : 'text-foreground'
                    }`}>
                      {item.type === 'settlement' && <CheckCircle2 className="w-3 h-3 inline mr-0.5 mb-0.5" />}
                      ₹{item.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
