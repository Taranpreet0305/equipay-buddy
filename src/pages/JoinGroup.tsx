import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Users, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function JoinGroup() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, refreshGroups } = useAuth();
  const [status, setStatus] = useState<'loading' | 'found' | 'joining' | 'joined' | 'error'>('loading');
  const [groupName, setGroupName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!code || !user) return;
    lookupInvite();
  }, [code, user]);

  const lookupInvite = async () => {
    const { data, error } = await (supabase as any)
      .from('group_invites')
      .select('*, groups(name)')
      .eq('invite_code', code!)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      setStatus('error');
      setErrorMsg('Invalid or expired invite link');
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setStatus('error');
      setErrorMsg('This invite has expired');
      return;
    }

    if (data.max_uses && data.use_count >= data.max_uses) {
      setStatus('error');
      setErrorMsg('This invite has reached its usage limit');
      return;
    }

    setGroupName(data.groups?.name || 'Unknown Group');
    setStatus('found');
  };

  const handleJoin = async () => {
    if (!user || !code) return;
    setStatus('joining');

    try {
      const { data: invite } = await (supabase as any)
        .from('group_invites')
        .select('*')
        .eq('invite_code', code)
        .eq('is_active', true)
        .single();

      if (!invite) throw new Error('Invite not found');

      // Check if already a member
      const { data: existing } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', invite.group_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.info('You are already a member of this group');
        navigate(`/groups/${invite.group_id}`);
        return;
      }

      const { error: joinError } = await supabase
        .from('group_members')
        .insert({ group_id: invite.group_id, user_id: user.id });

      if (joinError) throw joinError;

      await (supabase as any)
        .from('group_invites')
        .update({ use_count: invite.use_count + 1 })
        .eq('id', invite.id);

      await refreshGroups();
      setStatus('joined');
      toast.success('Joined group successfully!');
      setTimeout(() => navigate(`/groups/${invite.group_id}`), 1500);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Failed to join group');
    }
  };

  return (
    <PageLayout showNav={false}>
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-xl p-6 shadow-elevated border border-border/50 text-center max-w-sm w-full"
        >
          {status === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Looking up invite...</p>
            </>
          )}

          {status === 'found' && (
            <>
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">Join Group</h2>
              <p className="text-sm text-muted-foreground mb-4">
                You've been invited to join <span className="font-semibold text-foreground">{groupName}</span>
              </p>
              <Button onClick={handleJoin} variant="gradient" className="w-full">
                Join Group
              </Button>
            </>
          )}

          {status === 'joining' && (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Joining group...</p>
            </>
          )}

          {status === 'joined' && (
            <>
              <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground">You're in!</h2>
              <p className="text-sm text-muted-foreground">Redirecting...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-1">Oops!</h2>
              <p className="text-sm text-muted-foreground mb-4">{errorMsg}</p>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
}
