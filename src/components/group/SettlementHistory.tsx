import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/debtSimplification';
import { CheckCircle2, Banknote, Smartphone, Loader2, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface MemberProfile {
  user_id: string;
  display_name: string;
  photo_url: string | null;
}

interface SettlementHistoryProps {
  groupId: string;
  members: Array<{ user_id: string; profiles?: MemberProfile }>;
}

interface Settlement {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  method: string;
  status: string;
  completed_at: string | null;
  created_at: string;
}

export function SettlementHistory({ groupId, members }: SettlementHistoryProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const profileMap = new Map<string, MemberProfile>();
  members.forEach(m => {
    if (m.profiles) profileMap.set(m.user_id, m.profiles);
  });

  useEffect(() => {
    loadSettlements();
  }, [groupId]);

  async function loadSettlements() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (data) setSettlements(data);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No settlements yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Settle debts from the Balances tab</p>
      </div>
    );
  }

  const totalSettled = settlements.reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total Settled</span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalSettled)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {settlements.length} settlement{settlements.length !== 1 ? 's' : ''} completed
        </p>
      </div>

      {settlements.map((settlement, i) => {
        const fromProfile = profileMap.get(settlement.from_user_id);
        const toProfile = profileMap.get(settlement.to_user_id);

        return (
          <motion.div
            key={settlement.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card rounded-lg p-3 shadow-soft border border-border/50"
          >
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={fromProfile?.photo_url || undefined} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {fromProfile?.display_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-medium text-foreground truncate">
                    {fromProfile?.display_name || 'Unknown'}
                  </span>
                  <span className="text-muted-foreground">paid</span>
                  <span className="font-medium text-foreground truncate">
                    {toProfile?.display_name || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {settlement.method === 'upi' ? (
                    <Smartphone className="w-3 h-3 text-primary" />
                  ) : (
                    <Banknote className="w-3 h-3 text-green-500" />
                  )}
                  <span className="text-[10px] text-muted-foreground capitalize">{settlement.method}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(settlement.completed_at || settlement.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(Number(settlement.amount))}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
