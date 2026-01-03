import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useApp } from '@/contexts/AppContext';
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
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function GroupDetail() {
  const { id } = useParams();
  const { groups, expenses } = useApp();
  const [activeTab, setActiveTab] = useState('expenses');

  const group = groups.find(g => g.id === id);
  const groupExpenses = expenses.filter(e => e.groupId === id);

  if (!group) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Group not found</p>
        </div>
      </PageLayout>
    );
  }

  const userBalance = group.members[0]?.balance || 0;
  const isPositive = userBalance >= 0;

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
            <p className="text-sm opacity-80">{group.members.length} members</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">Your balance</p>
                <p className={`text-2xl font-bold ${isPositive ? 'text-success-foreground' : ''}`}>
                  {isPositive ? '+' : '-'}₹{Math.abs(userBalance).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="glass" size="sm" className="text-primary-foreground border-white/20">
                  <CreditCard className="w-4 h-4" />
                  Settle
                </Button>
              </div>
            </div>
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

              {groupExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-4 shadow-soft border border-border/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{expense.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        Paid by {expense.paidByName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(expense.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    {expense.splitDetails.map((split) => (
                      <div
                        key={split.userId}
                        className="flex-1 bg-secondary rounded-lg p-2 text-center"
                      >
                        <p className="text-xs text-muted-foreground truncate">{split.displayName.split(' ')[0]}</p>
                        <p className="text-sm font-medium text-foreground">
                          ₹{split.amount.toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="balances" className="mt-4 space-y-3">
              {group.members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-4 shadow-soft border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.photoURL} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{member.displayName}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {member.balance >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-success" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                        <span className={`font-bold ${member.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {member.balance >= 0 ? '+' : '-'}₹{Math.abs(member.balance).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.balance >= 0 ? 'gets back' : 'owes'}
                      </p>
                    </div>
                  </div>

                  {member.balance !== 0 && member.userId !== '1' && (
                    <div className="mt-3 pt-3 border-t border-border flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1">
                        Remind
                      </Button>
                      <Button variant="gradient" size="sm" className="flex-1">
                        Settle Up
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
