import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
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
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createExpense, getGroupWithMembers, GroupMemberDB } from '@/lib/database';
import { ScanReceiptDialog } from '@/components/expense/ScanReceiptDialog';

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
  const { user, groups, refreshGroups } = useAuth();

  const [selectedGroup, setSelectedGroup] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'percentage' | 'shares'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [groupMembers, setGroupMembers] = useState<GroupMemberDB[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);

  // Load group members when group is selected
  useEffect(() => {
    if (selectedGroup) {
      setIsLoading(true);
      getGroupWithMembers(selectedGroup).then(({ members }) => {
        if (members) {
          setGroupMembers(members);
          // Select all members by default
          setSelectedMembers(members.map(m => m.user_id));
        }
        setIsLoading(false);
      });
    } else {
      setGroupMembers([]);
      setSelectedMembers([]);
    }
  }, [selectedGroup]);

  const handleSelectAll = () => {
    if (selectedMembers.length === groupMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(groupMembers.map(m => m.user_id));
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleScanComplete = (data: {
    amount: number;
    currency: string;
    description: string;
    category: string;
  }) => {
    setAmount(data.amount.toString());
    setDescription(data.description);
    setCategory(data.category);
  };

  const handleSubmit = async () => {
    if (!selectedGroup || !description || !amount || selectedMembers.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      toast.error('Please sign in to add an expense');
      return;
    }

    setIsSubmitting(true);

    try {
      const amountNum = parseFloat(amount);
      const splitAmount = amountNum / selectedMembers.length;

      const splits = selectedMembers.map(userId => {
        return {
          userId,
          amount: splitAmount,
        };
      });

      const { error } = await createExpense(
        selectedGroup,
        description,
        amountNum,
        user.id,
        splitType,
        category,
        splits,
        notes || undefined
      );

      if (error) throw error;

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
          className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6"
        >
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Add Expense</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Split a bill with your group</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5 sm:space-y-6"
        >
          {/* Amount Input */}
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50 text-center">
            <Label className="text-muted-foreground text-xs sm:text-sm">Amount</Label>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-3xl sm:text-4xl font-bold text-foreground bg-transparent border-none outline-none text-center w-28 sm:w-40"
              />
            </div>
            <button 
              onClick={() => setShowScanDialog(true)}
              className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary font-medium mx-auto"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Scan Receipt
            </button>
          </div>

          {/* Group Selection */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Select Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm">
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
            {groups.length === 0 && (
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Create a group first to add expenses
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Category</Label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {categories.slice(0, 5).map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[10px] leading-tight">{cat.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Type */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Split Type</Label>
            <Select value={splitType} onValueChange={(v: 'equal' | 'exact' | 'percentage' | 'shares') => setSplitType(v)}>
              <SelectTrigger className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm">
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
          {selectedGroup && (
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm">Split Between</Label>
                <button 
                  onClick={handleSelectAll}
                  className="text-xs sm:text-sm text-primary font-medium"
                >
                  {selectedMembers.length === groupMembers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-2">
                  {groupMembers.map((member) => {
                    const profile = member.profiles;
                    if (!profile) return null;
                    
                    return (
                      <div
                        key={member.id}
                        onClick={() => toggleMember(member.user_id)}
                        className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                          selectedMembers.includes(member.user_id)
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'bg-secondary border-2 border-transparent'
                        }`}
                      >
                        <Checkbox 
                          checked={selectedMembers.includes(member.user_id)}
                          className="pointer-events-none w-4 h-4"
                        />
                        <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                          <AvatarImage src={profile.photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                            {profile.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {profile.display_name}
                            {member.user_id === user?.id && (
                              <span className="text-[10px] sm:text-xs text-muted-foreground ml-1.5 sm:ml-2">(You)</span>
                            )}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{profile.email}</p>
                        </div>
                        {selectedMembers.includes(member.user_id) && amount && (
                          <span className="font-semibold text-primary text-sm flex-shrink-0">
                            ₹{(parseFloat(amount) / selectedMembers.length).toFixed(0)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="rounded-lg sm:rounded-xl text-sm min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            variant="gradient"
            size="xl"
            className="w-full h-11 sm:h-12 text-sm sm:text-base"
            disabled={isSubmitting || !selectedGroup || !description || !amount || selectedMembers.length === 0}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <>
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Expense
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Scan Receipt Dialog */}
      <ScanReceiptDialog
        isOpen={showScanDialog}
        onClose={() => setShowScanDialog(false)}
        onScanComplete={handleScanComplete}
      />
    </PageLayout>
  );
}
