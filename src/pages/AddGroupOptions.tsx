import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AddGroupOptions() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = () => {
    const code = joinCode.trim();
    if (!code) {
      toast.error('Please enter an invite code');
      return;
    }
    navigate(`/join/${encodeURIComponent(code)}`);
  };

  return (
    <PageLayout showNav={false}>
      <div className="px-4 py-6 max-w-md mx-auto w-full space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Add Group</h1>
            <p className="text-sm text-muted-foreground">Create new or join existing group</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate('/groups/new')}
          className="w-full bg-card rounded-xl p-4 border border-border/50 shadow-soft text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Create Group</h2>
              <p className="text-xs text-muted-foreground">Start a new expense group</p>
            </div>
          </div>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 border border-border/50 shadow-soft space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Join Group</h2>
              <p className="text-xs text-muted-foreground">Use an invite code</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJoin();
              }}
              className="h-10 rounded-lg bg-secondary border-0 text-sm"
            />
            <Button onClick={handleJoin} variant="gradient" size="sm" className="h-10 px-3">
              Join
            </Button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
