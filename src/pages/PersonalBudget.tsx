import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Wallet, Plus, TrendingUp, AlertTriangle, CheckCircle, Trash2, ArrowLeft, Edit2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PersonalExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface BudgetEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
}

const categoryColors: Record<string, string> = {
  food: 'hsl(340, 82%, 58%)',
  transport: 'hsl(250, 76%, 58%)',
  shopping: 'hsl(38, 92%, 50%)',
  entertainment: 'hsl(280, 72%, 55%)',
  utilities: 'hsl(200, 80%, 50%)',
  health: 'hsl(152, 69%, 40%)',
  other: 'hsl(220, 10%, 46%)',
};

export default function PersonalBudget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetEntry[]>([]);
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('other');

  // Budget form
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmt, setBudgetAmt] = useState('');
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editBudgetName, setEditBudgetName] = useState('');
  const [editBudgetAmt, setEditBudgetAmt] = useState('');

  useEffect(() => {
    if (!user) return;
    const key = `personal_budget_v2_${user.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      setBudgets(data.budgets || []);
      setExpenses(data.expenses || []);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const key = `personal_budget_v2_${user.id}`;
    localStorage.setItem(key, JSON.stringify({ budgets, expenses }));
  }, [budgets, expenses, user]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const progress = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOverBudget = totalSpent > totalBudget && totalBudget > 0;

  const handleAddBudget = () => {
    const val = parseFloat(budgetAmt);
    if (!budgetName.trim() || !val || val <= 0) { toast.error('Enter budget name and amount'); return; }
    const entry: BudgetEntry = { id: crypto.randomUUID(), name: budgetName.trim(), amount: val, date: new Date().toISOString() };
    setBudgets(prev => [...prev, entry]);
    setBudgetName('');
    setBudgetAmt('');
    toast.success(`Budget "${entry.name}" added: ₹${val.toLocaleString('en-IN')}`);
  };

  const handleEditBudget = (id: string) => {
    const val = parseFloat(editBudgetAmt);
    if (!editBudgetName.trim() || !val || val <= 0) { toast.error('Enter valid name and amount'); return; }
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, name: editBudgetName.trim(), amount: val } : b));
    setEditingBudget(null);
    toast.success('Budget updated');
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    toast.success('Budget removed');
  };

  const handleAddExpense = () => {
    if (!desc || !amt) { toast.error('Fill in description and amount'); return; }
    const amtNum = parseFloat(amt);
    if (!amtNum || amtNum <= 0) { toast.error('Enter a valid amount'); return; }
    const newExpense: PersonalExpense = { id: crypto.randomUUID(), description: desc, amount: amtNum, category: cat, date: new Date().toISOString() };
    setExpenses(prev => [newExpense, ...prev]);
    setDesc('');
    setAmt('');
    setCat('other');
    if (totalSpent + amtNum > totalBudget && totalBudget > 0) {
      toast.warning('⚠️ You are over budget!');
    } else {
      toast.success('Expense added');
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success('Expense removed');
  };

  const categoryBreakdown = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: categoryColors[name] || categoryColors.other,
  }));

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-24 overflow-x-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Personal Budget</h1>
            <p className="text-sm text-muted-foreground">Track your spending</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {/* Budget Summary Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">₹{totalBudget.toLocaleString('en-IN')}</p>
              </div>
              {totalBudget > 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isOverBudget ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                }`}>
                  {isOverBudget ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {isOverBudget ? 'Over Budget' : 'On Track'}
                </div>
              )}
            </div>
            {totalBudget > 0 && (
              <>
                <Progress value={progress} className="h-3 rounded-full mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Spent: ₹{totalSpent.toLocaleString('en-IN')}</span>
                  <span className={remaining < 0 ? 'text-destructive font-semibold' : ''}>
                    {remaining >= 0 ? `Remaining: ₹${remaining.toLocaleString('en-IN')}` : `Over by: ₹${Math.abs(remaining).toLocaleString('en-IN')}`}
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Add Budget */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 space-y-3">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" /> Add Budget
            </h3>
            <div className="flex gap-2">
              <Input value={budgetName} onChange={e => setBudgetName(e.target.value)} placeholder="Budget name (e.g. Groceries)" className="h-11 rounded-xl flex-1" />
              <div className="relative w-28">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                <Input type="number" value={budgetAmt} onChange={e => setBudgetAmt(e.target.value)} placeholder="0" className="pl-8 h-11 rounded-xl" />
              </div>
              <Button onClick={handleAddBudget} variant="gradient" className="h-11 rounded-xl px-4">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Budget List - Editable */}
            {budgets.length > 0 && (
              <div className="space-y-2 pt-2">
                {budgets.map(b => (
                  <div key={b.id} className="flex items-center gap-2 bg-secondary/50 rounded-xl p-2.5">
                    {editingBudget === b.id ? (
                      <>
                        <Input value={editBudgetName} onChange={e => setEditBudgetName(e.target.value)} className="h-9 rounded-lg flex-1 text-sm" />
                        <div className="relative w-24">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                          <Input type="number" value={editBudgetAmt} onChange={e => setEditBudgetAmt(e.target.value)} className="pl-6 h-9 rounded-lg text-sm" />
                        </div>
                        <Button size="sm" onClick={() => handleEditBudget(b.id)} className="h-9 px-3 rounded-lg text-xs">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingBudget(null)} className="h-9 px-2">✕</Button>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium text-foreground truncate">{b.name}</span>
                        <span className="text-sm font-bold text-foreground">₹{b.amount.toLocaleString('en-IN')}</span>
                        <button onClick={() => { setEditingBudget(b.id); setEditBudgetName(b.name); setEditBudgetAmt(String(b.amount)); }} className="text-muted-foreground hover:text-primary transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteBudget(b.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Add Expense */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Add Personal Expense</h3>
            <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="h-11 rounded-xl" />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0" className="pl-8 h-11 rounded-xl" />
              </div>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="w-32 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryColors).map(c => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddExpense} variant="gradient" className="w-full h-11 rounded-xl">
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
          </motion.div>

          {/* Charts */}
          {expenses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-5 shadow-soft border border-border/50">
              <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Spending Breakdown
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Expense List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm">Expenses ({expenses.length})</h3>
            {expenses.length === 0 ? (
              <div className="bg-card rounded-xl p-5 text-center shadow-soft border border-border/50">
                <p className="text-sm text-muted-foreground">No expenses yet. Add one above!</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <motion.div key={expense.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl p-3 shadow-soft border border-border/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${categoryColors[expense.category]}20` }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[expense.category] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">{expense.category} · {new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-foreground text-sm">₹{expense.amount.toLocaleString('en-IN')}</span>
                  <button onClick={() => handleDeleteExpense(expense.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
