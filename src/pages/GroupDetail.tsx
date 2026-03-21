import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getGroupWithMembers, getGroupExpenses, GroupDB, GroupMemberDB, ExpenseDB } from '@/lib/database';
import { GroupBalances } from '@/components/group/GroupBalances';
import { exportGroupExpensesCSV } from '@/lib/exportCSV';

export default function GroupDetail() {
  const { id } = useParams();
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
              <button className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
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
            </TabsList>

            <TabsContent value="expenses" className="mt-3 space-y-2">
              <Link to="/add-expense">
                <Button variant="outline" className="w-full h-10 rounded-lg border-dashed text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  Add Expense
                </Button>
              </Link>

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
