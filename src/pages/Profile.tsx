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
      <div className="pb-8 max-w-2xl mx-auto w-full overflow-x-hidden">
        {/* Header */}
        <div className="gradient-hero px-4 sm:px-6 pt-6 sm:pt-8 pb-14 sm:pb-16 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative inline-block">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-4 border-white/20">
                <AvatarImage src={profile?.photo_url || undefined} />
                <AvatarFallback className="text-xl sm:text-2xl md:text-3xl bg-white/20">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-accent flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-3 sm:mt-4 md:mt-5 truncate px-4">
              {profile?.display_name || 'User'}
            </h1>
            <p className="text-sm sm:text-base opacity-80 mt-1 truncate px-4">{user?.email}</p>
            {profile?.phone && (
              <p className="text-xs sm:text-sm opacity-60 mt-1">{profile.phone}</p>
            )}
          </motion.div>
        </div>

        <div className="px-4 sm:px-6 -mt-8 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50">
              <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">
                ₹{analytics.totalExpenses.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">Total Expenses</p>
            </div>

            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50">
              <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-success/10 flex items-center justify-center mb-2 sm:mb-3">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success" />
              </div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">
                ₹{analytics.totalPaid.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">Amount Paid</p>
            </div>

            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50">
              <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center mb-2 sm:mb-3">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">{analytics.groupsCount}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">Active Groups</p>
            </div>

            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50">
              <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-warning/10 flex items-center justify-center mb-2 sm:mb-3">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-warning" />
              </div>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">{analytics.settledCount}</p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">Settlements</p>
            </div>
          </motion.div>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  {isDark ? (
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm sm:text-base">Appearance</p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                    {isDark ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="rounded-lg sm:rounded-xl text-xs sm:text-sm flex-shrink-0"
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
              className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base">Push Notifications</p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                      Get notified about expenses & reminders
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
            className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Label className="font-semibold text-sm sm:text-base">UPI ID</Label>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {isEditing ? (
              <div className="flex gap-2 sm:gap-3">
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                />
                <Button onClick={handleSaveUPI} variant="gradient" disabled={isSaving} size="sm" className="sm:size-default">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            ) : (
              <p className="text-foreground font-medium text-sm sm:text-base">
                {profile?.upi_id || 'Not set'}
              </p>
            )}
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-2 sm:mt-3">
              Used for receiving payments from group members
            </p>
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl sm:rounded-2xl shadow-soft border border-border/50 overflow-hidden"
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 md:p-5 hover:bg-secondary/50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-left font-medium text-foreground text-xs sm:text-sm md:text-base">{item.label}</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-2"
          >
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full h-12 sm:h-14 text-destructive hover:text-destructive hover:bg-destructive/10 text-sm sm:text-base"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
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
