import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, Receipt, Camera, Utensils, Car, ShoppingBag, Film, Zap, Home, Plane, Heart, MoreHorizontal, Loader2, Users, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createExpense, getGroupWithMembers, GroupMemberDB } from '@/lib/database';
import { notifyExpenseAdded } from '@/lib/notifications';
import { Link } from 'react-router-dom';
import { ScanReceiptDialog } from '@/components/receipt/ScanReceiptDialog';

const categories = [
  { value: 'food', label: 'Food & Drinks', icon: Utensils },
  { value: 'transport', label: 'Transport', icon: Car },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'entertainment', label: 'Entertainment', icon: Film },
  { value: 'utilities', label: 'Utilities', icon: Zap },
  { value: 'rent', label: 'Rent', icon: Home },
  { value: 'travel', label: 'Travel', icon: Plane },
  { value: 'health', label: 'Health', icon: Heart },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const splitTypes = [
  { value: 'equal', label: 'Split Equally' },
  { value: 'exact', label: 'By Exact Amount' },
  { value: 'percentage', label: 'By Percentage' },
  { value: 'shares', label: 'By Shares' },
];

export default function AddExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, groups, refreshGroups } = useAuth();

  const [selectedGroup, setSelectedGroup] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage' | 'shares'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [groupMembers, setGroupMembers] = useState<GroupMemberDB[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'expense' | 'group'>('expense');

  useEffect(() => {
    const state = location.state as { amount?: number; description?: string; category?: string } | null;
    if (!state) return;
    if (typeof state.amount === 'number' && Number.isFinite(state.amount) && state.amount > 0) setAmount(state.amount.toString());
    if (typeof state.description === 'string' && state.description.trim()) setDescription(state.description.trim());
    if (typeof state.category === 'string' && categories.some(c => c.value === state.category)) setCategory(state.category);
  }, [location.state]);

  useEffect(() => {
    if (selectedGroup) {
      setIsLoading(true);
      getGroupWithMembers(selectedGroup).then(({ members }) => {
        if (members) {
          setGroupMembers(members);
          setSelectedMembers(members.map(m => m.user_id));
          const amts: Record<string, string> = {};
          members.forEach(m => { amts[m.user_id] = ''; });
          setCustomAmounts(amts);
        }
        setIsLoading(false);
      });
    } else {
      setGroupMembers([]);
      setSelectedMembers([]);
      setCustomAmounts({});
    }
  }, [selectedGroup]);

  const handleSelectAll = () => {
    if (selectedMembers.length === groupMembers.length) setSelectedMembers([]);
    else setSelectedMembers(groupMembers.map(m => m.user_id));
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleScanComplete = (data: { amount: number; currency: string; description: string; category: string }) => {
    setAmount(data.amount.toString());
    setDescription(data.description);
    setCategory(data.category);
  };

  const handleCustomAmountChange = (userId: string, value: string) => {
    setCustomAmounts(prev => ({ ...prev, [userId]: value }));
  };

  const customTotal = Object.entries(customAmounts)
    .filter(([uid]) => selectedMembers.includes(uid))
    .reduce((sum, [, val]) => sum + (parseFloat(val) || 0), 0);

  const handleSubmit = async () => {
    if (!selectedGroup || !description || !amount || selectedMembers.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!user) { toast.error('Please sign in to add an expense'); return; }

    const amountNum = parseFloat(amount);
    if (splitType === 'exact') {
      if (Math.abs(customTotal - amountNum) > 0.01) {
        toast.error(`Custom amounts (₹${customTotal.toFixed(2)}) don't match total (₹${amountNum.toFixed(2)})`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const splits = selectedMembers.map(userId => {
        let splitAmount = amountNum / selectedMembers.length;
        if (splitType === 'exact') splitAmount = parseFloat(customAmounts[userId] || '0');
        return { userId, amount: splitAmount };
      });

      const { error } = await createExpense(selectedGroup, description, amountNum, user.id, splitType, category, splits, notes || undefined);
      if (error) throw error;

      const memberProfile = groupMembers.find(m => m.user_id === user.id)?.profiles;
      notifyExpenseAdded(selectedGroup, description, amountNum, memberProfile?.display_name || 'Someone', user.id);

      await refreshGroups();
      toast.success('Expense added successfully!');
      navigate(-1);
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout showNav={false}>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto w-full overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-5"
        >
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 hover:bg-secondary/80 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground">Add New</h1>
            <p className="text-sm text-muted-foreground">Expense or group</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex bg-secondary rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'expense' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'}`}
          >
            <Receipt className="w-4 h-4" /> Add Expense
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'group' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'}`}
          >
            <Users className="w-4 h-4" /> Add Group
          </button>
        </div>

        {activeTab === 'group' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Create a New Group</h3>
            <p className="text-sm text-muted-foreground mb-6">Start a group to split expenses with friends, roommates, or travel buddies.</p>
            <Link to="/groups/new">
              <Button variant="gradient" size="lg" className="rounded-xl">
                <Plus className="w-5 h-5" /> Create Group
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
            {/* Amount Input */}
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center">
              <Label className="text-muted-foreground text-sm">Amount</Label>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-3xl font-bold text-foreground">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-4xl font-bold text-foreground bg-transparent border-none outline-none text-center w-40"
                />
              </div>
              <button onClick={() => setShowScanDialog(true)} className="mt-3 flex items-center gap-2 text-sm text-primary font-medium mx-auto hover:underline">
                <Camera className="w-4 h-4" /> Scan Receipt
              </button>
            </div>

            {/* Group Selection */}
            <div className="space-y-2">
              <Label>Select Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Choose a group" /></SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {groups.length === 0 && <p className="text-xs text-muted-foreground">Create a group first to add expenses</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this expense for?" className="h-12 rounded-xl" />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-5 gap-2">
                {categories.slice(0, 5).map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.value;
                  return (
                    <button key={cat.value} onClick={() => setCategory(cat.value)} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isSelected ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-[9px] leading-tight">{cat.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {categories.slice(5).map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.value;
                  return (
                    <button key={cat.value} onClick={() => setCategory(cat.value)} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isSelected ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-[9px] leading-tight">{cat.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Type */}
            <div className="space-y-2">
              <Label>Split Type</Label>
              <Select value={splitType} onValueChange={(v: 'equal' | 'exact' | 'percentage' | 'shares') => setSplitType(v)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {splitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Members Selection */}
            {selectedGroup && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Split Between</Label>
                  <button onClick={handleSelectAll} className="text-sm text-primary font-medium">
                    {selectedMembers.length === groupMembers.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupMembers.map((member) => {
                      const memberProfile = member.profiles;
                      if (!memberProfile) return null;
                      const isSelected = selectedMembers.includes(member.user_id);
                      
                      return (
                        <div key={member.id} className={`rounded-xl transition-all border-2 ${isSelected ? 'bg-primary/5 border-primary' : 'bg-secondary border-transparent'}`}>
                          <div onClick={() => toggleMember(member.user_id)} className="flex items-center gap-3 p-3 cursor-pointer">
                            <Checkbox checked={isSelected} className="pointer-events-none" />
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarImage src={memberProfile.photo_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">{memberProfile.display_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {memberProfile.display_name}
                                {member.user_id === user?.id && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{memberProfile.email}</p>
                            </div>
                            {isSelected && splitType === 'equal' && amount && (
                              <span className="font-semibold text-primary text-sm flex-shrink-0">
                                ₹{(parseFloat(amount) / selectedMembers.length).toFixed(0)}
                              </span>
                            )}
                          </div>
                          
                          {isSelected && splitType === 'exact' && (
                            <div className="px-3 pb-3 pl-14">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">₹</span>
                                <Input
                                  type="number"
                                  value={customAmounts[member.user_id] || ''}
                                  onChange={(e) => handleCustomAmountChange(member.user_id, e.target.value)}
                                  placeholder="0.00"
                                  className="h-9 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {splitType === 'exact' && amount && (
                      <div className={`text-sm font-medium text-center p-2 rounded-lg ${
                        Math.abs(customTotal - parseFloat(amount)) < 0.01 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        Total: ₹{customTotal.toFixed(2)} / ₹{parseFloat(amount).toFixed(2)}
                        {Math.abs(customTotal - parseFloat(amount)) >= 0.01 && (
                          <span className="ml-2">(₹{(parseFloat(amount) - customTotal).toFixed(2)} remaining)</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any additional notes..." className="rounded-xl min-h-[80px]" />
            </div>

            {/* Submit */}
            <Button onClick={handleSubmit} variant="gradient" size="lg" className="w-full h-12 rounded-xl" disabled={isSubmitting || !selectedGroup || !description || !amount || selectedMembers.length === 0}>
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><Receipt className="w-5 h-5" /> Add Expense</>)}
            </Button>
          </motion.div>
        )}
      </div>

      <ScanReceiptDialog
        isOpen={showScanDialog}
        onClose={() => setShowScanDialog(false)}
        onScanComplete={handleScanComplete}
      />
    </PageLayout>
  );
}
