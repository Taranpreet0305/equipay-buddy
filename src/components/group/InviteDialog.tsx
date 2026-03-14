import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Link2, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InviteDialogProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteDialog({ groupId, groupName, isOpen, onClose }: InviteDialogProps) {
  const { user } = useAuth();
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInvite = async () => {
    if (!user) return;
    setIsGenerating(true);

    try {
      const { data, error } = await (supabase as any)
        .from('group_invites')
        .insert({ group_id: groupId, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      const code = data.invite_code;
      setInviteCode(code);
      setInviteLink(`${window.location.origin}/join/${code}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate invite');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName}`,
          text: `Join my group "${groupName}" on SplitSmart!`,
          url: inviteLink,
        });
      } catch {}
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Invite to {groupName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!inviteLink ? (
            <Button
              onClick={generateInvite}
              disabled={isGenerating}
              variant="gradient"
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Generate Invite Link
                </>
              )}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Share this link or code:</p>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="text-xs h-9"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="flex-shrink-0 h-9 w-9 p-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">Invite Code</p>
                  <p className="text-lg font-mono font-bold text-foreground tracking-widest">{inviteCode}</p>
                </div>
              </div>

              <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="w-4 h-4" />
                Share Invite
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                Link expires in 7 days
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
