import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { Group } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GroupCardProps {
  group: Group;
  delay?: number;
}

export function GroupCard({ group, delay = 0 }: GroupCardProps) {
  const userBalance = group.members[0]?.balance || 0;
  const isPositive = userBalance >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Link to={`/groups/${group.id}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card rounded-2xl p-4 shadow-soft border border-border/50 hover:shadow-elevated transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{group.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 3).map((member) => (
                    <Avatar key={member.id} className="w-5 h-5 border-2 border-card">
                      <AvatarImage src={member.photoURL} />
                      <AvatarFallback className="text-[8px]">
                        {member.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {group.members.length > 3 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{group.members.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span
                className={`font-semibold ${
                  isPositive ? 'text-success' : 'text-destructive'
                }`}
              >
                {isPositive ? '+' : '-'}₹{Math.abs(userBalance).toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-muted-foreground">
                {isPositive ? 'you get back' : 'you owe'}
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
