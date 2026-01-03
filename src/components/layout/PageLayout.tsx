import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { motion } from 'framer-motion';

interface PageLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
}

export function PageLayout({ children, showNav = true, className = '' }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`pb-20 ${className}`}
      >
        {children}
      </motion.main>
      {showNav && <BottomNav />}
    </div>
  );
}
