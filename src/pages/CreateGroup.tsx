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
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Create Group</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Add members to split expenses</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5 sm:space-y-6"
        >
          {/* Group Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center">
                <span className="text-3xl sm:text-4xl">👥</span>
              </div>
              <button className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-foreground" />
              </button>
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Group Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekend Trip, Apartment"
              className="h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group for?"
              className="rounded-lg sm:rounded-xl text-sm min-h-[80px]"
            />
          </div>

          {/* Add Members */}
          <div className="space-y-2.5 sm:space-y-3">
            <Label className="text-xs sm:text-sm">Add Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-9 sm:pl-10 h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground animate-spin" />
              )}
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card rounded-lg sm:rounded-xl shadow-elevated border border-border/50 overflow-hidden"
                >
                  {searchResults.map((userData) => (
                    <button
                      key={userData.id}
                      onClick={() => addMember(userData)}
                      className="w-full flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 hover:bg-secondary/50 transition-colors"
                    >
                      <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                        <AvatarImage src={userData.photo_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                          {userData.display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{userData.display_name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{userData.email}</p>
                      </div>
                      <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <p className="text-xs sm:text-sm text-muted-foreground text-center py-2 sm:py-3">
                No users found. They can join later!
              </p>
            )}
          </div>

          {/* Selected Members */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm">Group Members ({selectedMembers.length})</Label>
            </div>
            <div className="space-y-2">
              {selectedMembers.map((member, index) => (
                <motion.div
                  key={member.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2.5 sm:gap-3 bg-secondary rounded-lg sm:rounded-xl p-2.5 sm:p-3"
                >
                  <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarImage src={member.photo_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                      {member.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {member.display_name}
                      {member.user_id === user?.id && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground ml-1.5 sm:ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  {member.user_id !== user?.id && (
                    <button
                      onClick={() => removeMember(member.user_id)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
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
            className="w-full h-11 sm:h-12 text-sm sm:text-base"
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              'Create Group'
            )}
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
}
