import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupChat } from '@/components/chat/GroupChat';
import { InviteDialog } from '@/components/group/InviteDialog';
import { SettlementHistory } from '@/components/group/SettlementHistory';
import { 
  ArrowLeft, Plus, Settings, Users, Receipt, TrendingUp,
  MessageCircle, Loader2, UserPlus, History, Download
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getGroupWithMembers, getGroupExpenses, GroupDB, GroupMemberDB, ExpenseDB } from '@/lib/database';
import { GroupBalances } from '@/components/group/GroupBalances';
import { exportGroupExpensesCSV } from '@/lib/exportCSV';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('expenses');
  const [group, setGroup] = useState<GroupDB | null>(null);
  const [members, setMembers] = useState<GroupMemberDB[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      Promise.all([
        getGroupWithMembers(id),
        getGroupExpenses(id)
      ]).then(([groupResult, expensesResult]) => {
        if (groupResult.group) setGroup(groupResult.group);
        if (groupResult.members) setMembers(groupResult.members);
        if (expensesResult.data) setExpenses(expensesResult.data);
        setIsLoading(false);
      });
    }
  }, [id]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!group) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Group not found</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="pb-4">
        {/* Header */}
        <div className="gradient-hero px-4 pt-4 pb-5 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <Link to="/groups" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex gap-1.5">
              <button
                onClick={() => setIsInviteOpen(true)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate(`/groups/${id}/settings`)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center transition-colors hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold mb-0.5">{group.name}</h1>
            <p className="text-xs opacity-80">{members.length} members · {expenses.length} expenses</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-3 -mt-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-card shadow-soft rounded-lg p-1">
              <TabsTrigger value="expenses" className="flex-1 rounded-md text-xs">
                <Receipt className="w-3.5 h-3.5 mr-1" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="balances" className="flex-1 rounded-md text-xs">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Balances
              </TabsTrigger>
              <TabsTrigger value="settlements" className="flex-1 rounded-md text-xs">
                <History className="w-3.5 h-3.5 mr-1" />
                History
              </TabsTrigger>
              <TabsTrigger value="members" className="flex-1 rounded-md text-xs">
                <Users className="w-3.5 h-3.5 mr-1" />
                Members
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-3 space-y-2">
              <div className="flex gap-2">
                <Link to="/add-expense" className="flex-1">
                  <Button variant="outline" className="w-full h-10 rounded-lg border-dashed text-xs">
                    <Plus className="w-3.5 h-3.5" />
                    Add Expense
                  </Button>
                </Link>
                {expenses.length > 0 && (
                  <Button
                    variant="outline"
                    className="h-10 rounded-lg text-xs px-3"
                    onClick={() => {
                      exportGroupExpensesCSV(group.id, group.name);
                      toast.success('Exporting CSV...');
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </Button>
                )}
              </div>

              {expenses.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  No expenses yet. Add your first expense!
                </div>
              ) : (
                expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg p-3 shadow-soft border border-border/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm truncate">{expense.description}</h3>
                        <p className="text-xs text-muted-foreground">
                          Paid by {expense.profiles?.display_name || 'Unknown'}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(expense.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {expense.is_settled && (
                            <span className="ml-1.5 text-green-500 font-medium">✓ Settled</span>
                          )}
                        </p>
                      </div>
                      <p className="font-bold text-foreground text-sm flex-shrink-0 ml-2">
                        ₹{Number(expense.amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="balances" className="mt-3">
              <GroupBalances groupId={id!} members={members} />
            </TabsContent>

            <TabsContent value="settlements" className="mt-3">
              <SettlementHistory groupId={id!} members={members} />
            </TabsContent>

            <TabsContent value="members" className="mt-3 space-y-2">
              <div className="flex items-center justify-between px-1 mb-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Group Participants</p>
                <button 
                    onClick={() => setIsInviteOpen(true)}
                    className="text-[10px] text-primary font-bold flex items-center gap-1"
                >
                    <UserPlus className="w-3 h-3" /> Invite
                </button>
              </div>
              {members.map((member) => (
                <div key={member.id} className="bg-card rounded-lg p-3 shadow-soft border border-border/50 flex items-start gap-3">
                  <Avatar className="w-9 h-9 border border-primary/10 flex-shrink-0">
                    <AvatarImage src={member.profiles?.photo_url || undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs">
                      {member.profiles?.display_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-xs truncate">{member.profiles?.display_name}</p>
                      {member.user_id === user?.id && (
                        <span className="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full flex-shrink-0">YOU</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                        {member.profiles?.upi_id ? `UPI: ${member.profiles.upi_id}` : 'No UPI ID set'}
                    </p>
                    {(member.profiles as any)?.bio && (
                      <p className="text-[11px] text-foreground/80 mt-1 whitespace-pre-wrap break-words line-clamp-3">
                        {(member.profiles as any).bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Group Chat */}
      {id && (
        <GroupChat
          groupId={id}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Invite Dialog */}
      <InviteDialog
        groupId={group.id}
        groupName={group.name}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </PageLayout>
  );
}
