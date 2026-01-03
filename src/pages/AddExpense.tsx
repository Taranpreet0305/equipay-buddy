import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Receipt, 
  Camera,
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Zap, 
  Home, 
  Plane, 
  Heart, 
  MoreHorizontal 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ExpenseCategory, SplitDetail } from '@/types';
import { toast } from 'sonner';

const categories: { value: ExpenseCategory; label: string; icon: any }[] = [
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
  const { groups, user, addExpense } = useApp();

  const [selectedGroup, setSelectedGroup] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage' | 'shares'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const currentGroup = groups.find(g => g.id === selectedGroup);

  const handleSelectAll = () => {
    if (currentGroup) {
      if (selectedMembers.length === currentGroup.members.length) {
        setSelectedMembers([]);
      } else {
        setSelectedMembers(currentGroup.members.map(m => m.userId));
      }
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (!selectedGroup || !description || !amount || selectedMembers.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    const splitAmount = amountNum / selectedMembers.length;

    const splitDetails: SplitDetail[] = selectedMembers.map(userId => {
      const member = currentGroup?.members.find(m => m.userId === userId);
      return {
        userId,
        displayName: member?.displayName || 'Unknown',
        amount: splitAmount,
        isPaid: userId === user?.id,
      };
    });

    addExpense({
      groupId: selectedGroup,
      description,
      amount: amountNum,
      currency: 'INR',
      paidBy: user?.id || '',
      paidByName: user?.displayName || '',
      splitType,
      splitDetails,
      category,
      notes,
      isSettled: false,
    });

    toast.success('Expense added successfully!');
    navigate(-1);
  };

  return (
    <PageLayout showNav={false}>
      <div className="px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Add Expense</h1>
            <p className="text-sm text-muted-foreground">Split a bill with your group</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
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
            <button className="mt-3 flex items-center gap-2 text-sm text-primary font-medium mx-auto">
              <Camera className="w-4 h-4" />
              Scan Receipt
            </button>
          </div>

          {/* Group Selection */}
          <div className="space-y-2">
            <Label>Select Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Choose a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-5 gap-2">
              {categories.slice(0, 5).map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px]">{cat.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Type */}
          <div className="space-y-2">
            <Label>Split Type</Label>
            <Select value={splitType} onValueChange={(v: any) => setSplitType(v)}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {splitTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Members Selection */}
          {currentGroup && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Split Between</Label>
                <button 
                  onClick={handleSelectAll}
                  className="text-sm text-primary font-medium"
                >
                  {selectedMembers.length === currentGroup.members.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="space-y-2">
                {currentGroup.members.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.userId)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedMembers.includes(member.userId)
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-secondary border-2 border-transparent'
                    }`}
                  >
                    <Checkbox 
                      checked={selectedMembers.includes(member.userId)}
                      className="pointer-events-none"
                    />
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.photoURL} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{member.displayName}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    {selectedMembers.includes(member.userId) && amount && (
                      <span className="font-semibold text-primary">
                        ₹{(parseFloat(amount) / selectedMembers.length).toFixed(0)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="rounded-xl"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            variant="gradient"
            size="xl"
            className="w-full"
          >
            <Receipt className="w-5 h-5" />
            Add Expense
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
}
