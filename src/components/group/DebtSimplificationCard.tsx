import { motion } from 'framer-motion';
import { Balance, SimplifiedDebt, simplifyDebts, formatCurrency } from '@/lib/debtSimplification';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, CreditCard } from 'lucide-react';

interface DebtSimplificationCardProps {
  balances: Balance[];
  onSettle: (debt: SimplifiedDebt) => void;
  currentUserId: string;
}

export function DebtSimplificationCard({
  balances,
  onSettle,
  currentUserId,
}: DebtSimplificationCardProps) {
  const simplifiedDebts = simplifyDebts(balances);
  const userDebts = simplifiedDebts.filter(
    (d) => d.from === currentUserId || d.to === currentUserId
  );

  if (userDebts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-soft border border-border/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Smart Settlements</h3>
          <p className="text-xs text-muted-foreground">Minimum transactions to settle</p>
        </div>
      </div>

      <div className="space-y-3">
        {userDebts.map((debt, index) => {
          const isUserPaying = debt.from === currentUserId;
          
          return (
            <motion.div
              key={`${debt.from}-${debt.to}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 bg-secondary rounded-xl p-3"
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className={isUserPaying ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}>
                  {(isUserPaying ? debt.fromName : debt.toName).charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {isUserPaying ? (
                  <p className="text-sm">
                    <span className="font-semibold">You</span> pay{' '}
                    <span className="font-semibold text-destructive">{formatCurrency(debt.amount)}</span>{' '}
                    to <span className="font-semibold">{debt.toName}</span>
                  </p>
                ) : (
                  <p className="text-sm">
                    <span className="font-semibold">{debt.fromName}</span> pays you{' '}
                    <span className="font-semibold text-success">{formatCurrency(debt.amount)}</span>
                  </p>
                )}
              </div>

              {isUserPaying && (
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => onSettle(debt)}
                >
                  <CreditCard className="w-4 h-4" />
                  Settle
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {simplifiedDebts.length > userDebts.length && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          +{simplifiedDebts.length - userDebts.length} other settlements in the group
        </p>
      )}
    </motion.div>
  );
}
