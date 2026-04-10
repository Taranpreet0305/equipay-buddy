import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Users } from 'lucide-react';

export default function AddMenu() {
  const navigate = useNavigate();

  return (
    <PageLayout showNav={false}>
      <div className="px-4 py-6 max-w-md mx-auto w-full space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Add</h1>
            <p className="text-sm text-muted-foreground">Choose what you want to add</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate('/add-expense')}
          className="w-full bg-card rounded-xl p-4 border border-border/50 shadow-soft text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Add Expense</h2>
              <p className="text-xs text-muted-foreground">Record a new shared expense</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/add/group')}
          className="w-full bg-card rounded-xl p-4 border border-border/50 shadow-soft text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Add Group</h2>
              <p className="text-xs text-muted-foreground">Create a group or join one</p>
            </div>
          </div>
        </motion.button>
      </div>
    </PageLayout>
  );
}
