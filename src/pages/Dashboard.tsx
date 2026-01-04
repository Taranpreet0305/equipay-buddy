import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SpendingInsights } from '@/components/insights/SpendingInsights';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserNotifications, NotificationDB, subscribeToNotifications } from '@/lib/database';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, profile, groups, refreshGroups } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDB[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      refreshGroups();
      
      // Fetch notifications
      getUserNotifications(user.id).then(({ data }) => {
        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      });

      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(user.id, (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.info(notification.title, {
          description: notification.message,
        });
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Mock data for insights (will be replaced with real data)
  const mockExpenses = [
    { description: 'Lunch', amount: 350, category: 'food' },
    { description: 'Uber', amount: 200, category: 'transport' },
  ];
  const mockCategories = { food: 1500, transport: 800, shopping: 2000 };

  // Calculate totals
  const youAreOwed = 1600;
  const youOwe = 2100;
  const totalBalance = youAreOwed - youOwe;

  return (
    <PageLayout>
      <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="w-11 h-11 sm:w-12 sm:h-12 border-2 border-primary/20">
              <AvatarImage src={profile?.photo_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="font-bold text-base sm:text-lg text-foreground">
                {profile?.display_name?.split(' ')[0] || 'Friend'} 👋
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-secondary flex items-center justify-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </button>
            <Link to="/notifications" className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-secondary flex items-center justify-center">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </motion.div>

        {/* Balance Card */}
        <BalanceCard
          totalBalance={totalBalance}
          youOwe={youOwe}
          youAreOwed={youAreOwed}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* AI Insights */}
        <div className="pt-2">
          <SpendingInsights
            expenses={mockExpenses}
            totalSpent={4300}
            categories={mockCategories}
          />
        </div>

        {/* Groups */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm sm:text-base">Your Groups</h2>
            <Link to="/groups" className="text-xs sm:text-sm text-primary font-medium">See all</Link>
          </div>

          {groups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-soft border border-border/50"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 sm:w-9 sm:h-9 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">No groups yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5">
                Create a group to start splitting expenses
              </p>
              <Link to="/groups/new" className="text-primary font-medium text-xs sm:text-sm">
                Create your first group →
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {groups.slice(0, 3).map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/groups/${group.id}`}>
                    <div className="bg-card rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-soft border border-border/50 hover:shadow-elevated transition-shadow active:scale-[0.98]">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{group.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {group.description || 'Tap to view details'}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-4 pt-2">
            <h2 className="font-semibold text-foreground text-sm sm:text-base">Recent Activity</h2>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card rounded-xl sm:rounded-2xl p-4 shadow-soft border border-border/50 ${
                    !notification.is_read ? 'border-l-4 border-l-primary' : ''
                  }`}
                >
                  <p className="font-medium text-foreground text-xs sm:text-sm">{notification.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{notification.message}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
