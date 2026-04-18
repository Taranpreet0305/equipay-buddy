import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Wallet, AtSign, Receipt, ArrowDownRight, ArrowUpRight, Equal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MemberProfile {
  user_id: string;
  display_name: string;
  email?: string;
  photo_url?: string | null;
  upi_id?: string | null;
  username?: string | null;
  bio?: string | null;
}

interface MemberProfileDialogProps {
  open: boolean;
  onClose: () => void;
  member: MemberProfile | null;
  groupId: string;
  currentUserId?: string;
}

export function MemberProfileDialog({
  open,
  onClose,
  member,
  groupId,
  currentUserId,
}: MemberProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [balanceWithMe, setBalanceWithMe] = useState(0); // positive => member owes you, negative => you owe member

  const isSelf = member?.user_id === currentUserId;

  useEffect(() => {
    if (!open || !member) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Total they paid in this group
        const { data: paidExpenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('group_id', groupId)
          .eq('paid_by', member.user_id);

        const totalPaid = (paidExpenses || []).reduce(
          (sum, e: any) => sum + Number(e.amount || 0),
          0
        );

        if (cancelled) return;
        setTotalSpent(totalPaid);

        // Balance between you and this member (only when not self)
        if (!isSelf && currentUserId) {
          // Pull all unsettled expenses + splits for the group
          const { data: expenses } = await supabase
            .from('expenses')
            .select('id, paid_by, is_settled, expense_splits(user_id, amount, is_paid)')
            .eq('group_id', groupId)
            .eq('is_settled', false);

          let balance = 0; // member's balance toward me; positive => member owes me
          (expenses || []).forEach((exp: any) => {
            const splits = exp.expense_splits || [];
            if (exp.paid_by === currentUserId) {
              // I paid; what member owes me from this expense
              const memberSplit = splits.find(
                (s: any) => s.user_id === member.user_id && !s.is_paid
              );
              if (memberSplit) balance += Number(memberSplit.amount || 0);
            } else if (exp.paid_by === member.user_id) {
              // Member paid; what I owe them
              const mySplit = splits.find(
                (s: any) => s.user_id === currentUserId && !s.is_paid
              );
              if (mySplit) balance -= Number(mySplit.amount || 0);
            }
          });

          if (cancelled) return;
          setBalanceWithMe(balance);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, member, groupId, currentUserId, isSelf]);

  if (!member) return null;

  const fmt = (n: number) =>
    `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">Member profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center pt-1">
          <Avatar className="w-20 h-20 ring-2 ring-primary/20">
            <AvatarImage src={member.photo_url || undefined} />
            <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
              {member.display_name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-3 text-base font-bold text-foreground break-words max-w-full px-2">
            {member.display_name}
          </h3>
          {member.username && (
            <p className="text-xs text-primary font-medium mt-0.5 break-all px-2">
              @{member.username}
            </p>
          )}
          {member.email && (
            <p className="text-xs text-muted-foreground mt-0.5 break-all px-2">{member.email}</p>
          )}
          {isSelf && (
            <span className="mt-2 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              YOU
            </span>
          )}
        </div>

        {member.bio && (
          <div className="mt-3 px-3 py-2.5 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">About</p>
            <p className="text-xs text-foreground whitespace-pre-wrap break-words">{member.bio}</p>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {/* UPI */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border/50">
            <Wallet className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">UPI</p>
              <p className="text-xs font-medium text-foreground break-all">
                {member.upi_id || <span className="text-muted-foreground italic">Not set</span>}
              </p>
            </div>
          </div>

          {/* Total spent in group */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border/50">
            <Receipt className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Paid in this group
              </p>
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground mt-1" />
              ) : (
                <p className="text-sm font-bold text-foreground">{fmt(totalSpent)}</p>
              )}
            </div>
          </div>

          {/* Balance with you */}
          {!isSelf && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border/50">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
              ) : balanceWithMe > 0 ? (
                <ArrowDownRight className="w-4 h-4 text-success flex-shrink-0" />
              ) : balanceWithMe < 0 ? (
                <ArrowUpRight className="w-4 h-4 text-destructive flex-shrink-0" />
              ) : (
                <Equal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Balance with you
                </p>
                {loading ? (
                  <p className="text-xs text-muted-foreground">Calculating...</p>
                ) : balanceWithMe > 0 ? (
                  <p className="text-sm font-bold text-success break-words">
                    Owes you {fmt(balanceWithMe)}
                  </p>
                ) : balanceWithMe < 0 ? (
                  <p className="text-sm font-bold text-destructive break-words">
                    You owe {fmt(balanceWithMe)}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-foreground">All settled</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
