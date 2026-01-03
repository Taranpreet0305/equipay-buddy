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
      className="relative overflow-hidden rounded-xl sm:rounded-2xl gradient-hero p-4 sm:p-6 text-primary-foreground"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
          <span className="text-xs sm:text-sm font-medium opacity-80">Total Balance</span>
        </div>
        
        <div className="flex items-baseline gap-1 mb-4 sm:mb-6">
          <span className="text-2xl sm:text-3xl font-bold">
            {isPositive ? '+' : '-'}₹{Math.abs(totalBalance).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-success-foreground" />
              </div>
              <span className="text-[10px] sm:text-xs opacity-80">You get</span>
            </div>
            <span className="text-base sm:text-lg font-semibold">₹{youAreOwed.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <span className="text-[10px] sm:text-xs opacity-80">You owe</span>
            </div>
            <span className="text-base sm:text-lg font-semibold">₹{youOwe.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
