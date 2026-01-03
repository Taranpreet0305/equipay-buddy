import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Plus, X, UserPlus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { GroupMember } from '@/types';

// Mock users for search
const mockUsers = [
  { id: '2', displayName: 'Sarah Wilson', email: 'sarah@equipay.com', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { id: '3', displayName: 'Mike Chen', email: 'mike@equipay.com', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { id: '4', displayName: 'Emma Davis', email: 'emma@equipay.com', photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
  { id: '5', displayName: 'Tom Brown', email: 'tom@equipay.com', photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
];

export default function CreateGroup() {
  const navigate = useNavigate();
  const { user, addGroup } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<GroupMember[]>([
    {
      id: '1',
      userId: user?.id || '1',
      displayName: user?.displayName || 'You',
      email: user?.email || '',
      photoURL: user?.photoURL,
      balance: 0,
    },
  ]);

  const filteredUsers = mockUsers.filter(
    (u) =>
      !selectedMembers.find((m) => m.userId === u.id) &&
      (u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addMember = (userData: typeof mockUsers[0]) => {
    const newMember: GroupMember = {
      id: userData.id,
      userId: userData.id,
      displayName: userData.displayName,
      email: userData.email,
      photoURL: userData.photoURL,
      balance: 0,
    };
    setSelectedMembers([...selectedMembers, newMember]);
    setSearchQuery('');
  };

  const removeMember = (userId: string) => {
    if (userId === user?.id) return; // Can't remove yourself
    setSelectedMembers(selectedMembers.filter((m) => m.userId !== userId));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedMembers.length < 2) {
      toast.error('Please add at least one other member');
      return;
    }

    addGroup({
      name,
      description,
      createdBy: user?.id || '1',
      members: selectedMembers,
    });

    toast.success('Group created successfully!');
    navigate('/groups');
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
            <h1 className="text-xl font-bold text-foreground">Create Group</h1>
            <p className="text-sm text-muted-foreground">Add members to split expenses</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Group Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center">
                <span className="text-4xl">👥</span>
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Plus className="w-4 h-4 text-accent-foreground" />
              </button>
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label>Group Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekend Trip, Apartment"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group for?"
              className="rounded-xl"
            />
          </div>

          {/* Add Members */}
          <div className="space-y-3">
            <Label>Add Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10 h-12 rounded-xl"
              />
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card rounded-xl shadow-elevated border border-border/50 overflow-hidden"
                >
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((userData) => (
                      <button
                        key={userData.id}
                        onClick={() => addMember(userData)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={userData.photoURL} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {userData.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{userData.displayName}</p>
                          <p className="text-xs text-muted-foreground">{userData.email}</p>
                        </div>
                        <UserPlus className="w-5 h-5 text-primary" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <p className="text-sm">No users found</p>
                      <p className="text-xs mt-1">Invite them by email instead</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Group Members ({selectedMembers.length})</Label>
            </div>
            <div className="space-y-2">
              {selectedMembers.map((member, index) => (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 bg-secondary rounded-xl p-3"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.photoURL} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {member.displayName}
                      {member.userId === user?.id && (
                        <span className="text-xs text-muted-foreground ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  {member.userId !== user?.id && (
                    <button
                      onClick={() => removeMember(member.userId)}
                      className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} variant="gradient" size="xl" className="w-full">
            Create Group
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
}
