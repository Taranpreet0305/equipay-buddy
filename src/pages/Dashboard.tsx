import { PageLayout } from '@/components/layout/PageLayout';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { GroupCard } from '@/components/dashboard/GroupCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useApp } from '@/contexts/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, groups, expenses } = useApp();

  // Calculate totals
  const youAreOwed = groups.reduce((sum, g) => {
    const balance = g.members[0]?.balance || 0;
    return sum + (balance > 0 ? balance : 0);
  }, 0);

  const youOwe = groups.reduce((sum, g) => {
    const balance = g.members[0]?.balance || 0;
    return sum + (balance < 0 ? Math.abs(balance) : 0);
  }, 0);

  const totalBalance = youAreOwed - youOwe;

  return (
    <PageLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 border-2 border-primary/20">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="font-bold text-lg text-foreground">{user?.displayName?.split(' ')[0]} 👋</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <Link to="/notifications" className="relative w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
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

        {/* Groups */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Your Groups</h2>
            <Link to="/groups" className="text-sm text-primary font-medium">See all</Link>
          </div>

          <div className="space-y-3">
            {groups.slice(0, 3).map((group, index) => (
              <GroupCard key={group.id} group={group} delay={index * 0.05} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity expenses={expenses} />
      </div>
    </PageLayout>
  );
}
