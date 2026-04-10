import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Users, Globe } from 'lucide-react';

const actions = [
  { icon: Plus, label: 'Add', path: '/add-expense', color: 'bg-primary' },
  { icon: Users, label: 'Group', path: '/groups/new', color: 'bg-accent' },
  { icon: Globe, label: 'Convert', path: '/convert', color: 'bg-success' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={action.path}
              className="flex flex-col items-center gap-1"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${action.color} flex items-center justify-center shadow-soft`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </motion.div>
              <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground text-center">
                {action.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
