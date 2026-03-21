import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateBalances, simplifyDebts, formatCurrency, SimplifiedDebt } from '@/lib/debtSimplification';
import { ArrowRight, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function DebtSummaryCard() {
  const { user, groups } = useAuth();
  const [debts, setDebts] = useState<(SimplifiedDebt & { groupId: string; groupName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && groups.length > 0) loadAllDebts();
    else setIsLoading(false);
  }, [user, groups]);

  async function loadAllDebts() {
    setIsLoading(true);
    const allDebts: (SimplifiedDebt & { groupId: string; groupName: string })[] = [];

    for (const group of groups) {
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id, profiles(display_name)')
        .eq('group_id', group.id);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('id, amount, paid_by, is_settled, expense_splits(user_id, amount, is_paid)')
        .eq('group_id', group.id)
        .eq('is_settled', false);

      if (!expenses || expenses.length === 0) continue;

      const profileMap = new Map<string, string>();
      members?.forEach((m: any) => profileMap.set(m.user_id, m.profiles?.display_name || 'Unknown'));

      const formatted = expenses.map((exp: any) => ({
        paid_by: exp.paid_by,
        paidByName: profileMap.get(exp.paid_by) || 'Unknown',
        splits: (exp.expense_splits || []).map((s: any) => ({
          user_id: s.user_id,
          displayName: profileMap.get(s.user_id) || 'Unknown',
          amount: Number(s.amount),
          is_paid: s.is_paid,
        })),
      }));

      const balances = calculateBalances(formatted);
      const simplified = simplifyDebts(balances);
      
      const userDebts = simplified.filter(d => d.from === user!.id || d.to === user!.id);
      userDebts.forEach(d => allDebts.push({ ...d, groupId: group.id, groupName: group.name }));
    }

    setDebts(allDebts);
    setIsLoading(false);
  }

  if (isLoading) return null;
  if (debts.length === 0) return null;

  const totalYouOwe = debts.filter(d => d.from === user?.id).reduce((s, d) => s + d.amount, 0);
  const totalOwedToYou = debts.filter(d => d.to === user?.id).reduce((s, d) => s + d.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-3 shadow-soft border border-border/50"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-xs">Smart Settle</h3>
          <p className="text-[10px] text-muted-foreground">
            {debts.length} optimized payment{debts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {totalYouOwe > 0 && (
          <div className="bg-destructive/5 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">You owe</p>
            <p className="text-sm font-bold text-destructive">{formatCurrency(totalYouOwe)}</p>
          </div>
        )}
        {totalOwedToYou > 0 && (
          <div className="bg-green-500/5 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">You get</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(totalOwedToYou)}</p>
          </div>
        )}
      </div>

      {/* Debt list */}
      <div className="space-y-1.5">
        {debts.slice(0, 4).map((debt, i) => {
          const isMyDebt = debt.from === user?.id;
          return (
            <Link
              key={`${debt.from}-${debt.to}-${debt.groupId}`}
              to={`/groups/${debt.groupId}`}
              className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2 hover:bg-secondary transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="font-medium text-foreground truncate">
                    {isMyDebt ? 'You' : debt.fromName}
                  </span>
                  <ArrowRight className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-foreground truncate">
                    {!isMyDebt ? 'You' : debt.toName}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground truncate">{debt.groupName}</p>
              </div>
              <span className={`text-xs font-bold flex-shrink-0 ${isMyDebt ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                {formatCurrency(debt.amount)}
              </span>
            </Link>
          );
        })}
        {debts.length > 4 && (
          <p className="text-[10px] text-muted-foreground text-center">
            +{debts.length - 4} more
          </p>
        )}
      </div>
    </motion.div>
  );
}
