import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, Plus, Receipt, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Users, label: 'Groups', path: '/groups' },
  { icon: Plus, label: 'Add', path: '/add-expense', isAction: true },
  { icon: Receipt, label: 'Activity', path: '/activity' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link key={item.path} to={item.path} className="-mt-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full gradient-primary shadow-glow flex items-center justify-center"
                >
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              <motion.div
                initial={false}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                className="flex flex-col items-center gap-1"
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
