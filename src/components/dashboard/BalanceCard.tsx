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
      className="relative overflow-hidden rounded-2xl gradient-hero p-6 text-primary-foreground"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-80">Total Balance</span>
        </div>
        
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-3xl font-bold">
            {isPositive ? '+' : '-'}₹{Math.abs(totalBalance).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-success-foreground" />
              </div>
              <span className="text-xs opacity-80">You are owed</span>
            </div>
            <span className="text-lg font-semibold">₹{youAreOwed.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs opacity-80">You owe</span>
            </div>
            <span className="text-lg font-semibold">₹{youOwe.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
