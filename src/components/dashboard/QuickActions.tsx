import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Users, Globe, Scan } from 'lucide-react';

const actions = [
  { icon: Plus, label: 'Add', path: '/add-expense', color: 'bg-primary' },
  { icon: Users, label: 'Group', path: '/groups/new', color: 'bg-accent' },
  { icon: Globe, label: 'Convert', path: '/convert', color: 'bg-success' },
  { icon: Scan, label: 'Scan', path: '/scan', color: 'bg-warning' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
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
              className="flex flex-col items-center gap-1.5 sm:gap-2"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${action.color} flex items-center justify-center shadow-soft`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </motion.div>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground text-center">
                {action.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
