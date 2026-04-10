import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Settings, 
  Trash2, 
  Save, 
  Loader2, 
  Users,
  UserMinus,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  getGroupWithMembers, 
  updateGroup, 
  deleteGroup, 
  removeGroupMember,
  GroupDB, 
  GroupMemberDB 
} from '@/lib/database';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function GroupSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshGroups } = useAuth();
  
  const [group, setGroup] = useState<GroupDB | null>(null);
  const [members, setMembers] = useState<GroupMemberDB[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  async function loadGroupData() {
    setIsLoading(true);
    const { group, members } = await getGroupWithMembers(id!);
    if (group) {
      setGroup(group);
      setName(group.name);
      setDescription(group.description || '');
      setMembers(members || []);
    }
    setIsLoading(false);
  }

  const handleUpdate = async () => {
    if (!id || !name.trim()) return;
    
    setIsSaving(true);
    try {
      const { error } = await updateGroup(id, { name, description });
      if (error) throw error;
      
      toast.success('Group updated successfully!');
      refreshGroups();
    } catch (error) {
      toast.error('Failed to update group');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await deleteGroup(id);
      if (error) throw error;
      
      toast.success('Group deleted');
      refreshGroups();
      navigate('/groups');
    } catch (error) {
      toast.error('Failed to delete group');
      setIsDeleting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberStateId: string) => {
    if (memberId === user?.id) {
        toast.error("You cannot remove yourself. Leave the group instead.");
        return;
    }

    try {
      const { error } = await removeGroupMember(memberStateId);
      if (error) throw error;
      
      setMembers(members.filter(m => m.id !== memberStateId));
      toast.success('Member removed');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!group) return null;

  return (
    <PageLayout showNav={false}>
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">
        <header className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Group Settings
            </h1>
            <p className="text-sm text-muted-foreground truncate">{group.name}</p>
          </div>
        </header>

        <section className="space-y-4 bg-card p-4 rounded-2xl border border-border/50 shadow-soft">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">General Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="What's this group for?"
                className="rounded-xl resize-none min-h-[100px]"
              />
            </div>
            <Button 
                onClick={handleUpdate} 
                disabled={isSaving} 
                className="w-full rounded-xl"
                variant="gradient"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              Manage Members ({members.length})
            </h2>
          </div>
          <div className="grid gap-2">
            {members.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 shadow-soft"
              >
                <Avatar className="w-10 h-10 border border-primary/10">
                  <AvatarImage src={member.profiles?.photo_url || undefined} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs">
                    {member.profiles?.display_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {member.profiles?.display_name} {member.user_id === user?.id && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1">You</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{member.profiles?.email}</p>
                </div>
                {member.user_id !== user?.id && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 rounded-lg h-9 w-9"
                    onClick={() => handleRemoveMember(member.user_id, member.id)}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive h-12 shadow-soft">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the 
                  <strong> {group.name}</strong> group and all associated expenses and history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete Group
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="mt-4 flex items-start gap-2 text-[10px] text-muted-foreground bg-warning/5 p-3 rounded-lg border border-warning/10">
            <AlertCircle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
            <p>Warning: Deleting a group will remove all split data for all members. Ensure everyone is settled up before proceeding.</p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
