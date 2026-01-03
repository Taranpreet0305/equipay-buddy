import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Activity() {
  const { user, groups } = useAuth();

  return (
    <PageLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity</h1>
            <p className="text-sm text-muted-foreground">Your expense history</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-success/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm text-success font-medium">This Month</span>
            </div>
            <p className="text-2xl font-bold text-success">+₹0</p>
            <p className="text-xs text-success/70">You'll get back</p>
          </div>

          <div className="bg-destructive/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive font-medium">This Month</span>
            </div>
            <p className="text-2xl font-bold text-destructive">-₹0</p>
            <p className="text-xs text-destructive/70">You owe</p>
          </div>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground">No expenses yet. Add your first expense to see activity here!</p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
