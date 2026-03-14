import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface BalanceCardProps {
  totalBalance: number;
  youOwe: number;
  youAreOwed: number;
}

export function BalanceCard({ totalBalance, youOwe, youAreOwed }: BalanceCardProps) {
  const isPositive = totalBalance >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl gradient-hero p-3.5 sm:p-5 text-primary-foreground"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-1">
          <Wallet className="w-3.5 h-3.5 opacity-80" />
          <span className="text-[10px] font-medium opacity-80">Total Balance</span>
        </div>
        
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-xl sm:text-2xl font-bold">
            {isPositive ? '+' : '-'}₹{Math.abs(totalBalance).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-success-foreground" />
              </div>
              <span className="text-[10px] opacity-80">You get</span>
            </div>
            <span className="text-sm font-semibold">₹{youAreOwed.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
                <TrendingDown className="w-3 h-3" />
              </div>
              <span className="text-[10px] opacity-80">You owe</span>
            </div>
            <span className="text-sm font-semibold">₹{youOwe.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
