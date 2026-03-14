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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`pb-16 sm:pb-20 w-full max-w-full ${className}`}
      >
        {children}
      </motion.main>
      {showNav && <BottomNav />}
    </div>
  );
}
