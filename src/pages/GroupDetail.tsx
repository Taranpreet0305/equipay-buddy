import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  Users, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  CreditCard,
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
        <div className="gradient-hero px-4 pt-6 pb-8 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <Link to="/groups" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-1">{group.name}</h1>
            <p className="text-sm opacity-80">{members.length} members</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-4 -mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-card shadow-soft rounded-xl p-1">
              <TabsTrigger value="expenses" className="flex-1 rounded-lg">
                <Receipt className="w-4 h-4 mr-2" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="balances" className="flex-1 rounded-lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                Balances
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-4 space-y-3">
              <Link to="/add-expense">
                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed">
                  <Plus className="w-4 h-4" />
                  Add Expense
                </Button>
              </Link>

              {expenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No expenses yet. Add your first expense!
                </div>
              ) : (
                expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl p-4 shadow-soft border border-border/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{expense.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          Paid by {expense.profiles?.display_name || 'Unknown'}
                        </p>
                      </div>
                      <p className="font-bold text-foreground">
                        ₹{Number(expense.amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="balances" className="mt-4 space-y-3">
              {members.map((member) => {
                const profile = member.profiles;
                if (!profile) return null;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card rounded-xl p-4 shadow-soft border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.photo_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {profile.display_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {profile.display_name}
                          {member.user_id === user?.id && (
                            <span className="text-xs text-muted-foreground ml-2">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
