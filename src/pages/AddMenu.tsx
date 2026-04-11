import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Users, Camera, Wallet } from 'lucide-react';

export default function AddMenu() {
  const navigate = useNavigate();

  const items = [
    { icon: Plus, label: 'Add Expense', desc: 'Record a new shared expense', path: '/add-expense', color: 'gradient-primary' },
    { icon: Users, label: 'Add Group', desc: 'Create a group or join one', path: '/add/group', color: 'bg-accent' },
    { icon: Camera, label: 'Scan Receipt', desc: 'AI-powered receipt scanning', path: '/add-expense', color: 'bg-success' },
    { icon: Wallet, label: 'Personal Budget', desc: 'Track your personal spending', path: '/personal-budget', color: 'bg-warning' },
  ];

  return (
    <PageLayout showNav={false}>
      <div className="px-4 py-6 max-w-md mx-auto w-full space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Add</h1>
            <p className="text-sm text-muted-foreground">Choose what you want to add</p>
          </div>
        </motion.div>

        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(item.path)}
              className="w-full bg-card rounded-xl p-4 border border-border/50 shadow-soft text-left hover:shadow-elevated transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{item.label}</h2>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </PageLayout>
  );
}
