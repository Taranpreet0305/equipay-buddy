import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useApp } from '@/contexts/AppContext';
import { GroupCard } from '@/components/dashboard/GroupCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Groups() {
  const { groups } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Groups</h1>
            <p className="text-sm text-muted-foreground">Manage your expense groups</p>
          </div>
          <Link to="/groups/new">
            <Button variant="gradient" size="icon" className="rounded-xl">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-secondary border-0"
          />
        </motion.div>

        {/* Groups List */}
        {filteredGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No groups yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a group to start splitting expenses with friends
            </p>
            <Link to="/groups/new">
              <Button variant="gradient">
                <Plus className="w-4 h-4" />
                Create Group
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group, index) => (
              <GroupCard key={group.id} group={group} delay={index * 0.05} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
