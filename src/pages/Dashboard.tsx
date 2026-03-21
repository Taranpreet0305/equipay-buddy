import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SpendingInsights } from '@/components/insights/SpendingInsights';
import { SpendingAnalytics } from '@/components/analytics/SpendingAnalytics';
import { RecurringExpenses } from '@/components/recurring/RecurringExpenses';
import { DebtSummaryCard } from '@/components/dashboard/DebtSummaryCard';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Users, ChevronRight, Receipt, CheckCircle2, Banknote, Smartphone } from 'lucide-react';
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
  const [settlementCount, setSettlementCount] = useState(0);

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
      setSettlementCount(settlementsRes.data.length);
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

  return (
    <PageLayout>
      <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 max-w-4xl mx-auto w-full overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-9 h-9 border-2 border-primary/20 flex-shrink-0">
              <AvatarImage src={profile?.photo_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Welcome back,</p>
              <h1 className="font-bold text-sm text-foreground truncate">
                {profile?.display_name?.split(' ')[0] || 'Friend'} 👋
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <ThemeToggle />
            <Link to="/activity" className="relative w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </motion.div>

        {/* Balance Card */}
        <BalanceCard
          totalBalance={balances.totalBalance}
          youOwe={balances.youOwe}
          youAreOwed={balances.youAreOwed}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity (Expenses + Settlements) */}
        {recentItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground text-xs">Recent Activity</h2>
              <Link to="/activity" className="text-[10px] text-primary font-medium">See all</Link>
            </div>
            <div className="space-y-1.5">
              {recentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-card rounded-lg p-2.5 shadow-soft border border-border/50"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.type === 'settlement' ? 'bg-green-500/10' : 'bg-primary/10'
                    }`}>
                      {item.type === 'settlement' ? (
                        item.method === 'upi' ? (
                          <Smartphone className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Banknote className="w-3.5 h-3.5 text-green-600" />
                        )
                      ) : (
                        <Receipt className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-xs truncate">
                        {item.type === 'settlement'
                          ? `${item.paidBy} → ${item.toUser}`
                          : item.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${
                      item.type === 'settlement' ? 'text-green-600' : 'text-foreground'
                    }`}>
                      {item.type === 'settlement' && '✓ '}
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Debt Simplification Summary */}
        <DebtSummaryCard />

        {/* Spending Analytics */}
        <SpendingAnalytics categoryData={balances.categoryTotals} />

        {/* Recurring Bills */}
        <RecurringExpenses />

        {/* AI Insights */}
        <SpendingInsights
          expenses={[]}
          totalSpent={Object.values(balances.categoryTotals).reduce((a, b) => a + b, 0)}
          categories={balances.categoryTotals}
        />

        {/* Groups */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-xs">Your Groups</h2>
            <Link to="/groups" className="text-[10px] text-primary font-medium">See all</Link>
          </div>

          {groups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl p-4 text-center shadow-soft border border-border/50"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-xs">No groups yet</h3>
              <p className="text-[10px] text-muted-foreground mb-2">Create a group to start splitting</p>
              <Link to="/groups/new" className="text-primary font-medium text-[10px]">Create your first group →</Link>
            </motion.div>
          ) : (
            <div className="space-y-1.5">
              {groups.slice(0, 3).map((group, index) => (
                <motion.div key={group.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={`/groups/${group.id}`}>
                    <div className="bg-card rounded-lg p-2.5 shadow-soft border border-border/50 hover:shadow-elevated transition-shadow active:scale-[0.98]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate text-xs">{group.name}</h3>
                          <p className="text-[10px] text-muted-foreground truncate">{group.description || 'Tap to view'}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
