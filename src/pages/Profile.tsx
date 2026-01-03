import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { updateProfile } from '@/lib/database';

const menuItems = [
  { icon: CreditCard, label: 'Payment Methods', path: '/payment-methods' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Shield, label: 'Privacy & Security', path: '/security' },
  { icon: HelpCircle, label: 'Help & Support', path: '/support' },
];

export default function Profile() {
  const { user, profile, groups, logout, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [upiId, setUpiId] = useState(profile?.upi_id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      <div className="pb-6">
        {/* Header */}
        <div className="gradient-hero px-4 pt-6 pb-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarImage src={profile?.photo_url || undefined} />
                <AvatarFallback className="text-2xl bg-white/20">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h1 className="text-2xl font-bold mt-4">{profile?.display_name || 'User'}</h1>
            <p className="text-sm opacity-80">{user?.email}</p>
            {profile?.phone && (
              <p className="text-sm opacity-60 mt-1">{profile.phone}</p>
            )}
          </motion.div>
        </div>

        <div className="px-4 -mt-6 space-y-4">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                ₹{analytics.totalExpenses.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
            </div>

            <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-2">
                <Wallet className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                ₹{analytics.totalPaid.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">Amount Paid</p>
            </div>

            <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.groupsCount}</p>
              <p className="text-xs text-muted-foreground">Active Groups</p>
            </div>

            <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5 text-warning" />
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.settledCount}</p>
              <p className="text-xs text-muted-foreground">Settlements</p>
            </div>
          </motion.div>

          {/* UPI ID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-4 shadow-soft border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <Label className="font-semibold">UPI ID</Label>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary text-sm font-medium flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="flex-1 h-11 rounded-xl"
                />
                <Button onClick={handleSaveUPI} variant="gradient" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            ) : (
              <p className="text-foreground font-medium">
                {profile?.upi_id || 'Not set'}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Used for receiving payments from group members
            </p>
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden"
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors ${
                    index !== menuItems.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
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
