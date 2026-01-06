import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Camera, 
  Edit2, 
  LogOut, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Receipt,
  Wallet,
  Loader2,
  Moon,
  Sun
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { updateProfile } from '@/lib/database';
import { useTheme } from '@/hooks/useTheme';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const menuItems = [
  { icon: CreditCard, label: 'Payment Methods', path: '/payment-methods' },
  { icon: Shield, label: 'Privacy & Security', path: '/security' },
  { icon: HelpCircle, label: 'Help & Support', path: '/support' },
];

export default function Profile() {
  const { user, profile, groups, logout, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { 
    isSupported: pushSupported, 
    isSubscribed: pushSubscribed, 
    isLoading: pushLoading,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush 
  } = usePushNotifications(user?.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [upiId, setUpiId] = useState(profile?.upi_id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isDark = theme === 'dark';

  const handleSaveUPI = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await updateProfile(user.id, { upi_id: upiId });
      if (error) throw error;
      
      await refreshProfile();
      toast.success('UPI ID updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update UPI ID');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushToggle = async () => {
    if (pushSubscribed) {
      const success = await unsubscribeFromPush();
      if (success) {
        toast.success('Push notifications disabled');
      } else {
        toast.error('Failed to disable notifications');
      }
    } else {
      const success = await subscribeToPush();
      if (success) {
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Failed to enable notifications. Please allow notifications in your browser.');
      }
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Analytics
  const analytics = {
    totalExpenses: 0,
    totalPaid: 0,
    groupsCount: groups.length,
    settledCount: 0,
  };

  return (
    <PageLayout>
      <div className="pb-6 max-w-2xl mx-auto w-full overflow-x-hidden">
        {/* Header */}
        <div className="gradient-hero px-3 sm:px-4 md:px-6 pt-5 sm:pt-6 pb-12 sm:pb-14 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative inline-block">
              <Avatar className="w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 border-4 border-white/20">
                <AvatarImage src={profile?.photo_url || undefined} />
                <AvatarFallback className="text-lg sm:text-xl md:text-2xl bg-white/20">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent flex items-center justify-center">
                <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mt-2.5 sm:mt-3 truncate px-4">
              {profile?.display_name || 'User'}
            </h1>
            <p className="text-xs sm:text-sm opacity-80 mt-0.5 truncate px-4">{user?.email}</p>
            {profile?.phone && (
              <p className="text-[10px] sm:text-xs opacity-60 mt-0.5">{profile.phone}</p>
            )}
          </motion.div>
        </div>

        <div className="px-3 sm:px-4 md:px-6 -mt-6 space-y-3 sm:space-y-4">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-2 sm:gap-3"
          >
            <div className="bg-card rounded-xl p-3 sm:p-4 shadow-soft border border-border/50">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Receipt className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
              </div>
              <p className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                ₹{analytics.totalExpenses.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Total Expenses</p>
            </div>

            <div className="bg-card rounded-xl p-3 sm:p-4 shadow-soft border border-border/50">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-success/10 flex items-center justify-center mb-2">
                <Wallet className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-success" />
              </div>
              <p className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                ₹{analytics.totalPaid.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Amount Paid</p>
            </div>

            <div className="bg-card rounded-xl p-3 sm:p-4 shadow-soft border border-border/50">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-accent" />
              </div>
              <p className="text-base sm:text-lg md:text-xl font-bold text-foreground">{analytics.groupsCount}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active Groups</p>
            </div>

            <div className="bg-card rounded-xl p-3 sm:p-4 shadow-soft border border-border/50">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-warning/10 flex items-center justify-center mb-2">
                <CreditCard className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-warning" />
              </div>
              <p className="text-base sm:text-lg md:text-xl font-bold text-foreground">{analytics.settledCount}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Settlements</p>
            </div>
          </motion.div>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-xl p-3 sm:p-4 shadow-soft border border-border/50"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  {isDark ? (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-xs sm:text-sm">Appearance</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {isDark ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="rounded-lg text-xs flex-shrink-0 h-8"
              >
                {isDark ? 'Light' : 'Dark'}
              </Button>
            </div>
          </motion.div>

          {/* Push Notifications */}
          {pushSupported && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="bg-card rounded-xl p-3 sm:p-4 shadow-soft border border-border/50"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-xs sm:text-sm">Push Notifications</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Get notified about expenses
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pushSubscribed}
                  onCheckedChange={handlePushToggle}
                  disabled={pushLoading}
                />
              </div>
            </motion.div>
          )}

          {/* UPI ID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-3 sm:p-4 shadow-soft border border-border/50"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Label className="font-semibold text-xs sm:text-sm">UPI ID</Label>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary text-xs font-medium flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="flex-1 h-9 sm:h-10 rounded-lg text-sm"
                />
                <Button onClick={handleSaveUPI} variant="gradient" disabled={isSaving} size="sm" className="h-9 sm:h-10">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            ) : (
              <p className="text-foreground font-medium text-xs sm:text-sm">
                {profile?.upi_id || 'Not set'}
              </p>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
              Used for receiving payments from group members
            </p>
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden"
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 hover:bg-secondary/50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-left font-medium text-foreground text-xs sm:text-sm">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-1"
          >
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full h-11 sm:h-12 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs sm:text-sm"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Log Out
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
