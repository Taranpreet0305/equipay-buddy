import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Plus, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface RecurringExpense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  category: string;
  frequency: string;
  next_due_date: string;
  is_active: boolean;
}

export function RecurringExpenses() {
  const { user, groups } = useAuth();
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    group_id: '',
    description: '',
    amount: '',
    category: 'utilities',
    frequency: 'monthly',
    next_due_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) fetchRecurring();
  }, [user]);

  const fetchRecurring = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('is_active', true)
      .order('next_due_date', { ascending: true });
    if (data) setExpenses(data as RecurringExpense[]);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!form.group_id || !form.description || !form.amount || !user) {
      toast.error('Fill all required fields');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('recurring_expenses').insert({
      group_id: form.group_id,
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      frequency: form.frequency,
      next_due_date: form.next_due_date,
      paid_by: user.id,
      created_by: user.id,
    });
    if (error) {
      toast.error('Failed to create recurring expense');
    } else {
      toast.success('Recurring expense added!');
      setIsOpen(false);
      setForm({ group_id: '', description: '', amount: '', category: 'utilities', frequency: 'monthly', next_due_date: new Date().toISOString().split('T')[0] });
      fetchRecurring();
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('recurring_expenses').update({ is_active: false }).eq('id', id);
    if (!error) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast.success('Removed');
    }
  };

  const frequencyLabel: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
  const categoryEmoji: Record<string, string> = { rent: '🏠', utilities: '⚡', food: '🍕', transport: '🚗', entertainment: '🎬', shopping: '🛒', health: '💊', other: '📦' };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-primary" />
          Recurring Bills
        </h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Add Recurring Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Group</Label>
                <Select value={form.group_id} onValueChange={v => setForm(f => ({ ...f, group_id: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>
                    {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g., Netflix, Rent" className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Amount (₹)</Label>
                  <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Frequency</Label>
                  <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Next Due Date</Label>
                <Input type="date" value={form.next_due_date} onChange={e => setForm(f => ({ ...f, next_due_date: e.target.value }))} className="h-9 text-sm" />
              </div>
              <Button onClick={handleCreate} variant="gradient" className="w-full h-9 text-sm" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Recurring Expense'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : expenses.length === 0 ? (
        <div className="bg-card rounded-xl p-4 text-center shadow-soft border border-border/50">
          <p className="text-xs text-muted-foreground">No recurring bills. Add rent, subscriptions etc.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp, i) => (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl p-3 shadow-soft border border-border/50 flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-base flex-shrink-0">
                {categoryEmoji[exp.category] || '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-xs truncate">{exp.description}</p>
                <p className="text-[10px] text-muted-foreground">{frequencyLabel[exp.frequency]} · Due {new Date(exp.next_due_date).toLocaleDateString()}</p>
              </div>
              <p className="font-semibold text-foreground text-sm flex-shrink-0">₹{Number(exp.amount).toLocaleString('en-IN')}</p>
              <button onClick={() => handleDelete(exp.id)} className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
