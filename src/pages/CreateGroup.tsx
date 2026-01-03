import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Plus, X, UserPlus, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { createGroup, addGroupMember, searchProfiles, ProfileDB } from '@/lib/database';

export default function CreateGroup() {
  const navigate = useNavigate();
  const { user, profile, refreshGroups } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileDB[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<ProfileDB[]>(
    profile ? [profile] : []
  );
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const excludeIds = selectedMembers.map(m => m.user_id);
    const { data, error } = await searchProfiles(query, excludeIds);
    
    if (data) {
      setSearchResults(data);
    }
    setIsSearching(false);
  };

  const addMember = (member: ProfileDB) => {
    setSelectedMembers([...selectedMembers, member]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeMember = (userId: string) => {
    if (userId === user?.id) return; // Can't remove yourself
    setSelectedMembers(selectedMembers.filter((m) => m.user_id !== userId));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (!user) {
      toast.error('Please sign in to create a group');
      return;
    }

    setIsCreating(true);
    try {
      // Create the group
      const { data: group, error: groupError } = await createGroup(
        name,
        description || null,
        user.id
      );

      if (groupError || !group) {
        throw groupError || new Error('Failed to create group');
      }

      // Add other members
      const otherMembers = selectedMembers.filter(m => m.user_id !== user.id);
      for (const member of otherMembers) {
        await addGroupMember(group.id, member.user_id);
      }

      await refreshGroups();
      toast.success('Group created successfully!');
      navigate(`/groups/${group.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setIsCreating(false);
    }
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
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10 h-12 rounded-xl"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
              )}
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card rounded-xl shadow-elevated border border-border/50 overflow-hidden"
                >
                  {searchResults.map((userData) => (
                    <button
                      key={userData.id}
                      onClick={() => addMember(userData)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={userData.photo_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {userData.display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">{userData.display_name}</p>
                        <p className="text-xs text-muted-foreground">{userData.email}</p>
                      </div>
                      <UserPlus className="w-5 h-5 text-primary" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <p className="text-sm text-muted-foreground text-center py-3">
                No users found. They can join later!
              </p>
            )}
          </div>

          {/* Selected Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Group Members ({selectedMembers.length})</Label>
            </div>
            <div className="space-y-2">
              {selectedMembers.map((member, index) => (
                <motion.div
                  key={member.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 bg-secondary rounded-xl p-3"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.photo_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {member.display_name}
                      {member.user_id === user?.id && (
                        <span className="text-xs text-muted-foreground ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  {member.user_id !== user?.id && (
                    <button
                      onClick={() => removeMember(member.user_id)}
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
          <Button 
            onClick={handleSubmit} 
            variant="gradient" 
            size="xl" 
            className="w-full"
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create Group'
            )}
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
}
