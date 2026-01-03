import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Receipt, 
  PieChart, 
  CreditCard, 
  ArrowRight,
  Check
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Group Expenses', description: 'Split bills with friends & family' },
  { icon: Receipt, title: 'Receipt Scanning', description: 'Scan & auto-extract details' },
  { icon: PieChart, title: 'Smart Analytics', description: 'Track spending patterns' },
  { icon: CreditCard, title: 'Easy Settlements', description: 'Settle via UPI or cash' },
];

const benefits = [
  'Split expenses equally or custom',
  'Multi-currency support',
  'Real-time balance tracking',
  'Push notifications & reminders',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="gradient-hero relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative z-10 px-6 pt-12 pb-20 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-xl font-bold">EquiPay</span>
            </div>

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Split Expenses<br />
              <span className="opacity-80">Effortlessly</span>
            </h1>
            <p className="text-lg opacity-80 mb-8 max-w-sm">
              The smartest way to share costs with friends, roommates, and groups. Track, split, and settle with ease.
            </p>

            <div className="flex gap-3">
              <Link to="/auth">
                <Button variant="glass" size="lg" className="text-primary-foreground border-white/20">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="px-6 -mb-16"
        >
          <div className="bg-card rounded-3xl shadow-float p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-foreground">+₹1,250</p>
              </div>
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-card"
                  />
                ))}
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-card text-xs font-medium text-muted-foreground">
                  +5
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-success/10 rounded-xl p-3">
                <p className="text-xs text-success font-medium mb-1">You get</p>
                <p className="text-lg font-bold text-success">₹2,500</p>
              </div>
              <div className="bg-destructive/10 rounded-xl p-3">
                <p className="text-xs text-destructive font-medium mb-1">You owe</p>
                <p className="text-lg font-bold text-destructive">₹1,250</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">Everything you need</h2>
          <p className="text-muted-foreground">Powerful features to manage shared expenses</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-4 shadow-soft border border-border/50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-secondary rounded-3xl p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Why EquiPay?</h2>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-4 h-4 text-success-foreground" />
                </div>
                <span className="text-foreground font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-12 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="gradient-primary rounded-3xl p-8 text-center text-primary-foreground"
        >
          <h2 className="text-2xl font-bold mb-2">Ready to start?</h2>
          <p className="opacity-80 mb-6">Join thousands of users splitting expenses smarter</p>
          <Link to="/auth">
            <Button variant="glass" size="lg" className="text-primary-foreground border-white/20">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
