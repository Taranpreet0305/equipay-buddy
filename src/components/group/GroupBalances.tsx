import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { calculateBalances, simplifyDebts, formatCurrency, SimplifiedDebt } from '@/lib/debtSimplification';
import { SettleDialog } from '@/components/settle/SettleDialog';
import { ArrowRight, Loader2, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface MemberProfile {
  user_id: string;
  display_name: string;
  email: string;
  photo_url: string | null;
  upi_id: string | null;
}

interface GroupBalancesProps {
  groupId: string;
  members: Array<{ user_id: string; profiles?: MemberProfile }>;
}

export function GroupBalances({ groupId, members }: GroupBalancesProps) {
  const { user } = useAuth();
  const [debts, setDebts] = useState<SimplifiedDebt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settleTarget, setSettleTarget] = useState<SimplifiedDebt | null>(null);

  const profileMap = new Map<string, MemberProfile>();
  members.forEach(m => {
    if (m.profiles) profileMap.set(m.user_id, m.profiles);
  });

  useEffect(() => {
    loadBalances();
  }, [groupId]);

  async function loadBalances() {
    setIsLoading(true);
    try {
      // Get all unsettled expenses with their splits for this group
      const { data: expenses } = await supabase
        .from('expenses')
        .select(`
          id, amount, paid_by, is_settled,
          expense_splits (user_id, amount, is_paid)
        `)
        .eq('group_id', groupId)
        .eq('is_settled', false);

      if (!expenses || expenses.length === 0) {
        setDebts([]);
        setIsLoading(false);
        return;
      }

      const formattedExpenses = expenses.map(exp => ({
        paid_by: exp.paid_by,
        paidByName: profileMap.get(exp.paid_by)?.display_name || 'Unknown',
        splits: ((exp as any).expense_splits || []).map((s: any) => ({
          user_id: s.user_id,
          displayName: profileMap.get(s.user_id)?.display_name || 'Unknown',
          amount: Number(s.amount),
          is_paid: s.is_paid,
        })),
      }));

      const balances = calculateBalances(formattedExpenses);
      const simplified = simplifyDebts(balances);
      setDebts(simplified);
    } catch (err) {
      console.error('Error loading balances:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSettle(method: 'cash' | 'upi') {
    if (!settleTarget || !user) return;

    const { error } = await supabase
      .from('settlements')
      .insert({
        group_id: groupId,
        from_user_id: settleTarget.from,
        to_user_id: settleTarget.to,
        amount: settleTarget.amount,
        method,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Mark related expense splits as paid
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, expense_splits(id, user_id, is_paid)')
      .eq('group_id', groupId)
      .eq('paid_by', settleTarget.to)
      .eq('is_settled', false);

    if (expenses) {
      for (const exp of expenses) {
        const splits = (exp as any).expense_splits || [];
        const userSplit = splits.find((s: any) => s.user_id === settleTarget!.from && !s.is_paid);
        if (userSplit) {
          await supabase
            .from('expense_splits')
            .update({ is_paid: true })
            .eq('id', userSplit.id);
        }
      }
    }

    await loadBalances();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="text-center py-8">
        <HandCoins className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">All settled up! 🎉</p>
        <p className="text-xs text-muted-foreground/60 mt-1">No outstanding debts in this group</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground px-1">
        {debts.length} payment{debts.length > 1 ? 's' : ''} to settle
      </p>

      {debts.map((debt, i) => {
        const fromProfile = profileMap.get(debt.from);
        const toProfile = profileMap.get(debt.to);
        const isMyDebt = debt.from === user?.id;
        const isOwedToMe = debt.to === user?.id;

        return (
          <motion.div
            key={`${debt.from}-${debt.to}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-lg p-3 shadow-soft border border-border/50"
          >
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={fromProfile?.photo_url || undefined} />
                <AvatarFallback className="bg-destructive/10 text-destructive text-xs">
                  {debt.fromName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium text-foreground truncate">
                    {isMyDebt ? 'You' : debt.fromName}
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-foreground truncate">
                    {isOwedToMe ? 'You' : debt.toName}
                  </span>
                </div>
                <p className={`text-sm font-bold ${isMyDebt ? 'text-destructive' : isOwedToMe ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                  {formatCurrency(debt.amount)}
                </p>
              </div>
              {isMyDebt && (
                <Button
                  size="sm"
                  variant="gradient"
                  className="h-7 text-xs px-3"
                  onClick={() => setSettleTarget(debt)}
                >
                  Settle
                </Button>
              )}
            </div>
          </motion.div>
        );
      })}

      {settleTarget && (
        <SettleDialog
          isOpen={!!settleTarget}
          onClose={() => setSettleTarget(null)}
          fromUser={{
            id: settleTarget.from,
            name: settleTarget.fromName,
            photoUrl: profileMap.get(settleTarget.from)?.photo_url || undefined,
          }}
          toUser={{
            id: settleTarget.to,
            name: settleTarget.toName,
            photoUrl: profileMap.get(settleTarget.to)?.photo_url || undefined,
            upiId: profileMap.get(settleTarget.to)?.upi_id || undefined,
          }}
          amount={settleTarget.amount}
          onSettle={handleSettle}
        />
      )}
    </div>
  );
}
