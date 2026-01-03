import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useApp } from '@/contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Zap, 
  Home, 
  Plane, 
  Heart, 
  MoreHorizontal,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';

const categoryIcons: Record<string, any> = {
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

const categoryColors: Record<string, string> = {
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

export default function Activity() {
  const { expenses, groups, user } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  // Group expenses by date
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const date = format(expense.createdAt, 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, typeof expenses>);

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
            <p className="text-2xl font-bold text-success">
              +₹{(1600).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-success/70">You'll get back</p>
          </div>

          <div className="bg-destructive/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive font-medium">This Month</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              -₹{(2100).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-destructive/70">You owe</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-secondary rounded-xl p-1">
            <TabsTrigger value="all" className="flex-1 rounded-lg">All</TabsTrigger>
            <TabsTrigger value="paid" className="flex-1 rounded-lg">You Paid</TabsTrigger>
            <TabsTrigger value="owed" className="flex-1 rounded-lg">You Owe</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-6">
            {Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </h3>
                <div className="space-y-3">
                  {dayExpenses.map((expense, index) => {
                    const Icon = categoryIcons[expense.category];
                    const colorClass = categoryColors[expense.category];
                    const group = groups.find(g => g.id === expense.groupId);
                    const isPayer = expense.paidBy === user?.id;
                    const yourShare = expense.splitDetails.find(s => s.userId === user?.id)?.amount || 0;

                    return (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card rounded-xl p-4 shadow-soft border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {group?.name} • {expense.paidByName} paid
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-foreground">
                              ₹{expense.amount.toLocaleString('en-IN')}
                            </p>
                            {isPayer ? (
                              <p className="text-xs text-success">
                                you lent ₹{(expense.amount - yourShare).toFixed(0)}
                              </p>
                            ) : (
                              <p className="text-xs text-destructive">
                                you owe ₹{yourShare.toFixed(0)}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="paid" className="mt-4">
            <div className="space-y-3">
              {expenses.filter(e => e.paidBy === user?.id).map((expense, index) => {
                const Icon = categoryIcons[expense.category];
                const colorClass = categoryColors[expense.category];
                const group = groups.find(g => g.id === expense.groupId);

                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-soft border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">{group?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">₹{expense.amount.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(expense.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="owed" className="mt-4">
            <div className="space-y-3">
              {expenses.filter(e => e.paidBy !== user?.id).map((expense, index) => {
                const Icon = categoryIcons[expense.category];
                const colorClass = categoryColors[expense.category];
                const group = groups.find(g => g.id === expense.groupId);
                const yourShare = expense.splitDetails.find(s => s.userId === user?.id)?.amount || 0;

                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-soft border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">{group?.name} • to {expense.paidByName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-destructive">-₹{yourShare.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(expense.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
