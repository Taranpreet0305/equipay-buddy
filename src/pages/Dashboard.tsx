import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SpendingAnalytics } from '@/components/analytics/SpendingAnalytics';
import { RecurringExpenses } from '@/components/recurring/RecurringExpenses';
import { DebtSummaryCard } from '@/components/dashboard/DebtSummaryCard';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Users, ChevronRight, Receipt, Banknote, Smartphone, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getUserNotifications, NotificationDB, subscribeToNotifications } from '@/lib/database';
import { calculateUserBalances, UserBalance } from '@/lib/balanceCalculations';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface RecentItem {
  id: string;
  type: 'expense' | 'settlement';
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  method?: string;
  toUser?: string;
}

export default function Dashboard() {
  const { user, profile, groups, refreshGroups } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDB[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [balances, setBalances] = useState<UserBalance>({ youOwe: 0, youAreOwed: 0, totalBalance: 0, categoryTotals: {} });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    if (user) {
      refreshGroups();
      calculateUserBalances(user.id).then(setBalances);
      loadRecentActivity();

      getUserNotifications(user.id).then(({ data }) => {
        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      });

      const unsubscribe = subscribeToNotifications(user.id, (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.info(notification.title, { description: notification.message });
      });

      return () => unsubscribe();
    }
  }, [user]);

  async function loadRecentActivity() {
    if (!user) return;

    const [expensesRes, settlementsRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('id, description, amount, category, created_at, paid_by, profiles:paid_by(display_name)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('settlements')
        .select('id, amount, method, created_at, from_user_id, to_user_id, profiles_from:from_user_id(display_name), profiles_to:to_user_id(display_name)')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    const items: RecentItem[] = [];

    if (expensesRes.data) {
      for (const exp of expensesRes.data) {
        items.push({
          id: exp.id,
          type: 'expense',
          description: exp.description,
          amount: Number(exp.amount),
          date: exp.created_at,
          paidBy: (exp as any).profiles?.display_name || 'Unknown',
        });
      }
    }

    if (settlementsRes.data) {
      for (const s of settlementsRes.data) {
        items.push({
          id: s.id,
          type: 'settlement',
          description: 'Settlement',
          amount: Number(s.amount),
          date: s.created_at,
          paidBy: (s as any).profiles_from?.display_name || 'Unknown',
          toUser: (s as any).profiles_to?.display_name || 'Unknown',
          method: s.method,
        });
      }
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentItems(items.slice(0, 5));
  }

  const totalSpent = Object.values(balances.categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto w-full overflow-x-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-10 h-10 border-2 border-primary/20 flex-shrink-0">
                <AvatarImage src={profile?.photo_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Welcome back,</p>
                <h1 className="font-bold text-base text-foreground truncate">
                  {profile?.display_name?.split(' ')[0] || 'Friend'} 👋
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle />
              <Link to="/activity" className="relative w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-accent text-accent-foreground text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="px-4 sm:px-6 space-y-4 pb-4">
          {/* Balance + Quick Actions row on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <BalanceCard
                totalBalance={balances.totalBalance}
                youOwe={balances.youOwe}
                youAreOwed={balances.youAreOwed}
              />
            </div>
            <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
              <h3 className="font-semibold text-foreground text-sm mb-3">Quick Actions</h3>
              <QuickActions />
            </div>
          </div>

          {/* Analytics + Debt Summary side by side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SpendingAnalytics categoryData={balances.categoryTotals} />
            <DebtSummaryCard />
          </div>

          {/* AI Insights */}
          <SpendingInsights
            expenses={[]}
            totalSpent={totalSpent}
            categories={balances.categoryTotals}
          />

          {/* Groups + Recent Activity side by side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Groups */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground text-sm">Your Groups</h2>
                <Link to="/groups" className="text-xs text-primary font-medium">See all</Link>
              </div>

              {groups.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-xl p-5 text-center shadow-soft border border-border/50"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">No groups yet</h3>
                  <p className="text-xs text-muted-foreground mb-3">Create a group to start splitting</p>
                  <Link to="/groups/new" className="text-primary font-medium text-xs">Create your first group →</Link>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {groups.slice(0, 4).map((group, index) => (
                    <motion.div key={group.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                      <Link to={`/groups/${group.id}`}>
                        <div className="bg-card rounded-xl p-3 shadow-soft border border-border/50 hover:shadow-elevated transition-all active:scale-[0.98]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate text-sm">{group.name}</h3>
                              <p className="text-xs text-muted-foreground truncate">{group.description || 'Tap to view'}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  <Link to="/groups/new">
                    <div className="bg-card rounded-xl p-3 shadow-soft border border-dashed border-border hover:border-primary/50 transition-all text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-medium">Create New Group</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debt Simplification Summary */}
        <DebtSummaryCard />

        {/* Spending Analytics */}
        <SpendingAnalytics categoryData={balances.categoryTotals} />

        {/* Recurring Bills */}
        <RecurringExpenses />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-xs">Your Groups</h2>
            <Link to="/groups" className="text-[10px] text-primary font-medium">
              {groups.length > 3 ? `Show more (${groups.length - 3})` : 'See all'}
            </Link>
          </div>

            {/* Recent Activity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground text-sm">Recent Activity</h2>
                <Link to="/activity" className="text-xs text-primary font-medium">See all</Link>
              </div>
              {recentItems.length > 0 ? (
                <div className="space-y-2">
                  {recentItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="bg-card rounded-xl p-3 shadow-soft border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.type === 'settlement' ? 'bg-success/10' : 'bg-primary/10'
                        }`}>
                          {item.type === 'settlement' ? (
                            item.method === 'upi' ? (
                              <Smartphone className="w-4 h-4 text-success" />
                            ) : (
                              <Banknote className="w-4 h-4 text-success" />
                            )
                          ) : (
                            <Receipt className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {item.type === 'settlement'
                              ? `${item.paidBy} → ${item.toUser}`
                              : item.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                          </p>
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${
                          item.type === 'settlement' ? 'text-success' : 'text-foreground'
                        }`}>
                          {item.type === 'settlement' && '✓ '}
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl p-5 text-center shadow-soft border border-border/50">
                  <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                  <p className="text-xs text-muted-foreground">Add an expense to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Recurring Bills */}
          <RecurringExpenses />
        </div>
      </div>
    </PageLayout>
  );
}