import { motion } from 'framer-motion';
import { Expense } from '@/types';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Zap, 
  Home, 
  Plane, 
  Heart, 
  MoreHorizontal 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const categoryIcons = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Film,
  utilities: Zap,
  rent: Home,
  travel: Plane,
  health: Heart,
  other: MoreHorizontal,
};

const categoryColors = {
  food: 'bg-orange-100 text-orange-600',
  transport: 'bg-blue-100 text-blue-600',
  shopping: 'bg-pink-100 text-pink-600',
  entertainment: 'bg-purple-100 text-purple-600',
  utilities: 'bg-yellow-100 text-yellow-600',
  rent: 'bg-green-100 text-green-600',
  travel: 'bg-cyan-100 text-cyan-600',
  health: 'bg-red-100 text-red-600',
  other: 'bg-gray-100 text-gray-600',
};

interface RecentActivityProps {
  expenses: Expense[];
}

export function RecentActivity({ expenses }: RecentActivityProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm text-primary font-medium">View all</button>
      </div>

      <div className="space-y-2">
        {expenses.slice(0, 5).map((expense, index) => {
          const Icon = categoryIcons[expense.category];
          const colorClass = categoryColors[expense.category];

          return (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-3 shadow-soft border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Paid by {expense.paidByName} • {formatDistanceToNow(expense.createdAt, { addSuffix: true })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {expense.splitDetails.length} people
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
