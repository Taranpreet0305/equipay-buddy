import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Sun,
  Check,
  X,
  AtSign,
  FileText,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { updateProfile } from '@/lib/database';
import { useTheme } from '@/hooks/useTheme';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';

const menuItems = [
  { icon: CreditCard, label: 'Payment Methods', path: '/payment-methods' },
  { icon: Shield, label: 'Privacy & Security', path: '/privacy' },
  { icon: HelpCircle, label: 'Help & Support', path: '/help' },
];

type EditField = 'name' | 'username' | 'upi' | 'bio' | null;

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, groups, logout, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
  } = usePushNotifications(user?.id);

  const [analytics, setAnalytics] = useState({
    totalExpenses: 0,
    totalPaid: 0,
    groupsCount: groups.length,
    settledCount: 0,
  });
  const [editing, setEditing] = useState<EditField>(null);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [upiId, setUpiId] = useState(profile?.upi_id || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState((profile as any)?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setDisplayName(profile?.display_name || '');
    setUpiId(profile?.upi_id || '');
    setUsername(profile?.username || '');
    setBio((profile as any)?.bio || '');
  }, [profile]);

  const startEdit = (field: EditField) => setEditing(field);
  const cancelEdit = () => {
    setEditing(null);
    setDisplayName(profile?.display_name || '');
    setUpiId(profile?.upi_id || '');
    setUsername(profile?.username || '');
    setBio((profile as any)?.bio || '');
  };

  const handleSave = async (field: Exclude<EditField, null>) => {
    if (!user) return;

    if (field === 'name' && (!displayName || displayName.trim().length < 2)) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (field === 'username' && (!username || username.length < 3)) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (field === 'bio' && bio.length > 300) {
      toast.error('Bio must be 300 characters or less');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any =
        field === 'name'
          ? { display_name: displayName.trim() }
          : field === 'username'
          ? { username }
          : field === 'bio'
          ? { bio: bio.trim() || null }
          : { upi_id: upiId };

      const { error } = await updateProfile(user.id, payload);
      if (error) throw error;

      await refreshProfile();
      toast.success('Profile updated');
      setEditing(null);
    } catch (error: any) {
      if (error?.message?.includes('unique') || error?.code === '23505') {
        toast.error('Username already taken');
      } else {
        toast.error('Failed to update');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushToggle = async () => {
    if (pushSubscribed) {
      const ok = await unsubscribeFromPush();
      ok ? toast.success('Notifications disabled') : toast.error('Failed');
    } else {
      const ok = await subscribeToPush();
      ok ? toast.success('Notifications enabled') : toast.error('Allow in browser settings');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out');
    } catch {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (user) {
      import('@/lib/database').then(({ getUserStats }) => {
        getUserStats(user.id).then((stats) =>
          setAnalytics({ ...stats, groupsCount: groups.length })
        );
      });
    }
  }, [user, groups.length]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${publicData.publicUrl}?t=${Date.now()}`;

      const { error } = await updateProfile(user.id, { photo_url: publicUrl });
      if (error) throw error;

      await refreshProfile();
      toast.success('Photo updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update photo');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_my_account' as any);
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success('Account deleted');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete account');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const stats = [
    { icon: Receipt, label: 'Total Spent', value: `₹${analytics.totalExpenses.toLocaleString('en-IN')}`, color: 'primary' },
    { icon: Wallet, label: 'Amount Paid', value: `₹${analytics.totalPaid.toLocaleString('en-IN')}`, color: 'accent' },
    { icon: TrendingUp, label: 'Groups', value: analytics.groupsCount, color: 'primary' },
    { icon: CreditCard, label: 'Settled', value: analytics.settledCount, color: 'accent' },
  ];

  return (
    <PageLayout>
      <div className="pb-6 max-w-2xl mx-auto w-full">
        {/* Profile Header Card */}
        <div className="px-3 sm:px-4 md:px-6 pt-4 sm:pt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Avatar - left */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.photo_url || undefined} />
                  <AvatarFallback className="text-lg sm:text-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                    {profile?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition shadow-md ring-2 ring-card"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  )}
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    disabled={isUploadingAvatar}
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>

              {/* Name + Email - right */}
              <div className="flex-1 min-w-0">
                {editing === 'name' ? (
                  <div className="flex gap-1.5 items-center">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-8 text-sm rounded-lg"
                      maxLength={50}
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => handleSave('name')} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-success" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={cancelEdit}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
                      {profile?.display_name || 'User'}
                    </h1>
                    <button
                      onClick={() => startEdit('name')}
                      className="text-muted-foreground hover:text-primary transition flex-shrink-0"
                      aria-label="Edit name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {profile?.username && (
                  <p className="text-xs text-primary font-medium mt-0.5 truncate">@{profile.username}</p>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{user?.email}</p>
                {profile?.phone && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground/80 mt-0.5 truncate">{profile.phone}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-3 pt-3 border-t border-border/50">
              {editing === 'bio' ? (
                <div className="space-y-2">
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your group members a bit about yourself..."
                    className="text-sm rounded-lg resize-none min-h-[72px]"
                    maxLength={300}
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">{bio.length}/300</span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-8" onClick={cancelEdit}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="default" className="h-8" onClick={() => handleSave('bio')} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => startEdit('bio')}
                  className="w-full text-left flex items-start gap-2 group"
                >
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">About</p>
                    {(profile as any)?.bio ? (
                      <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap break-words">
                        {(profile as any).bio}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground italic group-hover:text-primary transition">
                        Add a short bio so group members can learn about you
                      </p>
                    )}
                  </div>
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition flex-shrink-0 mt-0.5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="px-3 sm:px-4 md:px-6 mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-card rounded-xl p-3 shadow-soft border border-border/50 hover:border-primary/30 transition"
                >
                  <div className={`w-8 h-8 rounded-lg bg-${stat.color}/10 flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 text-${stat.color}`} />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-foreground truncate">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Account Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden"
          >
            <div className="px-4 pt-3 pb-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account</h2>
            </div>

            {/* Username row */}
            <div className="px-4 py-3 border-t border-border/50">
              <div className="flex items-center gap-3">
                <AtSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Username</p>
                  {editing === 'username' ? (
                    <div className="flex gap-1.5 items-center mt-1">
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="your_username"
                        className="h-8 text-sm rounded-lg"
                        maxLength={30}
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSave('username')} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-success" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.username ? `@${profile.username}` : <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  )}
                </div>
                {editing !== 'username' && (
                  <button onClick={() => startEdit('username')} className="text-primary text-xs font-medium flex items-center gap-1 flex-shrink-0">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* UPI row */}
            <div className="px-4 py-3 border-t border-border/50">
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">UPI ID</p>
                  {editing === 'upi' ? (
                    <div className="flex gap-1.5 items-center mt-1">
                      <Input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="h-8 text-sm rounded-lg"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSave('upi')} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-success" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.upi_id || <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  )}
                </div>
                {editing !== 'upi' && (
                  <button onClick={() => startEdit('upi')} className="text-primary text-xs font-medium flex items-center gap-1 flex-shrink-0">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Preferences Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden"
          >
            <div className="px-4 pt-3 pb-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preferences</h2>
            </div>

            {/* Theme */}
            <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {isDark ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Appearance</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{isDark ? 'Dark mode' : 'Light mode'}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="rounded-lg text-xs h-8">
                {isDark ? 'Light' : 'Dark'}
              </Button>
            </div>

            {/* Push */}
            {pushSupported && (
              <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Push Notifications</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Get notified about expenses</p>
                  </div>
                </div>
                <Switch checked={pushSubscribed} onCheckedChange={handlePushToggle} disabled={pushLoading} />
              </div>
            )}
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl shadow-soft border border-border/50 overflow-hidden"
          >
            <div className="px-4 pt-3 pb-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">More</h2>
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition border-t border-border/50"
                >
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 text-sm"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
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
