import { WifiOff, Cloud, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync();

  return (
    <AnimatePresence>
      {(!isOnline || pendingCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[60] px-4 py-2"
        >
          <div className={`
            mx-auto max-w-md rounded-b-xl px-4 py-2 flex items-center justify-center gap-2
            ${!isOnline 
              ? 'bg-warning/90 text-warning-foreground' 
              : 'bg-primary/90 text-primary-foreground'
            }
            backdrop-blur-sm shadow-lg
          `}>
            {!isOnline ? (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">
                  You're offline
                  {pendingCount > 0 && ` • ${pendingCount} pending`}
                </span>
              </>
            ) : isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Syncing {pendingCount} expense(s)...</span>
              </>
            ) : pendingCount > 0 ? (
              <>
                <Cloud className="w-4 h-4" />
                <span className="text-sm font-medium">{pendingCount} pending sync</span>
              </>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
