import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupChat } from '@/components/chat/GroupChat';
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  Users, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getGroupWithMembers, getGroupExpenses, GroupDB, GroupMemberDB, ExpenseDB } from '@/lib/database';

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('expenses');
  const [group, setGroup] = useState<GroupDB | null>(null);
  const [members, setMembers] = useState<GroupMemberDB[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
      <div className="pb-6">
        {/* Header */}
        <div className="gradient-hero px-4 pt-5 sm:pt-6 pb-6 sm:pb-8 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-5 sm:mb-6"
          >
            <Link to="/groups" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center relative"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-2.5 sm:mb-3">
              <Users className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">{group.name}</h1>
            <p className="text-xs sm:text-sm opacity-80">{members.length} members</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-4 -mt-3 sm:-mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-card shadow-soft rounded-lg sm:rounded-xl p-1">
              <TabsTrigger value="expenses" className="flex-1 rounded-md sm:rounded-lg text-xs sm:text-sm">
                <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="balances" className="flex-1 rounded-md sm:rounded-lg text-xs sm:text-sm">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Balances
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
              <Link to="/add-expense">
                <Button variant="outline" className="w-full h-11 sm:h-12 rounded-lg sm:rounded-xl border-dashed text-sm">
                  <Plus className="w-4 h-4" />
                  Add Expense
                </Button>
              </Link>

              {expenses.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                  No expenses yet. Add your first expense!
                </div>
              ) : (
                expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg sm:rounded-xl p-3.5 sm:p-4 shadow-soft border border-border/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{expense.description}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Paid by {expense.profiles?.display_name || 'Unknown'}
                        </p>
                      </div>
                      <p className="font-bold text-foreground text-sm sm:text-base flex-shrink-0 ml-2">
                        ₹{Number(expense.amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="balances" className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
              {members.map((member) => {
                const profile = member.profiles;
                if (!profile) return null;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card rounded-lg sm:rounded-xl p-3.5 sm:p-4 shadow-soft border border-border/50"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarImage src={profile.photo_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {profile.display_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {profile.display_name}
                          {member.user_id === user?.id && (
                            <span className="text-[10px] sm:text-xs text-muted-foreground ml-1.5 sm:ml-2">(You)</span>
                          )}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{profile.email}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
    </PageLayout>
  );
}
