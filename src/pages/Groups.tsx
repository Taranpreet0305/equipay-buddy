import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Groups() {
  const { groups } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6 max-w-4xl mx-auto w-full overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Groups</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage your expense groups</p>
          </div>
          <Link to="/groups/new">
            <Button variant="gradient" size="icon" className="rounded-lg sm:rounded-xl w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-secondary border-0 text-sm"
          />
        </motion.div>

        {/* Groups List */}
        {filteredGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10 sm:py-12 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary flex items-center justify-center mb-3 sm:mb-4">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">
              {searchQuery ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 max-w-xs px-4">
              {searchQuery ? 'Try a different search' : 'Create a group to start splitting expenses with friends'}
            </p>
            {!searchQuery && (
              <Link to="/groups/new">
                <Button variant="gradient" size="sm" className="sm:size-default">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/groups/${group.id}`}>
                  <div className="bg-card rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-soft border border-border/50 hover:shadow-elevated transition-shadow active:scale-[0.98]">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{group.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {group.description || 'Tap to view details'}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
