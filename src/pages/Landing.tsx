import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Users, Receipt, PieChart, CreditCard, ArrowRight, Check, Globe, MessageCircle, Sparkles, Shield, WifiOff, Zap, Download } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { useRef } from 'react';

const features = [
  { icon: Users, title: 'Group Expenses', description: 'Create groups and split bills with friends, roommates, and travel buddies effortlessly.' },
  { icon: Receipt, title: 'AI Receipt Scan', description: 'Snap a photo of any receipt and let AI extract amounts, items, and categories instantly.' },
  { icon: Globe, title: 'Multi-Currency', description: 'Travel-friendly with real-time currency conversion for international group expenses.' },
  { icon: MessageCircle, title: 'Group Chat', description: 'Discuss expenses, send reminders, and coordinate payments within your group.' },
  { icon: Sparkles, title: 'AI Insights', description: 'Get personalized spending analytics and smart budgeting recommendations.' },
  { icon: CreditCard, title: 'Instant Settle', description: 'Settle debts via UPI or cash with one tap. Smart debt simplification included.' },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '₹2Cr+', label: 'Expenses Split' },
  { value: '10K+', label: 'Groups Created' },
];

import { Users, Receipt, PieChart, CreditCard, ArrowRight, Check, Globe, MessageCircle, Sparkles, Shield, WifiOff } from 'lucide-react';

const features = [{
  icon: Users,
  title: 'Group Expenses',
  description: 'Split bills with friends'
}, {
  icon: Receipt,
  title: 'Expense Tracking',
  description: 'Log bills in seconds'
}, {
  icon: Globe,
  title: 'Multi-Currency',
  description: 'Travel-friendly'
}, {
  icon: MessageCircle,
  title: 'Group Chat',
  description: 'Discuss & remind'
}, {
  icon: Sparkles,
  title: 'Spending Insights',
  description: 'Track your habits'
}, {
  icon: CreditCard,
  title: 'UPI Pay',
  description: 'Settle instantly'
}];
const benefits = ['Split expenses equally or custom', 'Real-time currency conversion', 'Detailed spending analytics', 'Works offline - sync when online'];
export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden">
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <img src={logoImg} alt="EquiPay" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: 'Space Grotesk' }}>EquiPay</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="outline" size="sm" className="rounded-full text-xs h-9 px-5">
                Log in
              </Button>
            </Link>
            <Link to="/auth" className="hidden sm:block">
              <Button variant="gradient" size="sm" className="rounded-full text-xs h-9 px-5">
                Sign up free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-16 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Expense Splitting
        <div className="relative z-10 px-5 sm:px-6 pt-6 sm:pt-8 pb-8 text-primary-foreground flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/logo2.png" alt="EquiPay" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">EquiPay</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              Split Expenses,<br />
              <span className="text-gradient">Not Friendships</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The smartest way to share costs with friends, roommates, and travel buddies. 
              AI-powered receipt scanning, real-time balances, and instant settlements.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="gradient" size="lg" className="rounded-full h-14 px-8 text-base shadow-glow">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base">
                  See how it works
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 max-w-md mx-auto"
          >
            <div className="bg-card rounded-3xl shadow-float p-6 border border-border/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                Live Preview
              </div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                  <p className="text-3xl font-bold text-foreground">+₹1,250</p>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full gradient-primary border-2 border-card" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-card text-xs font-medium text-muted-foreground">
                    +5
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-success/10 rounded-xl p-3">
                  <p className="text-[10px] text-success font-medium mb-1">You get</p>
                  <p className="text-xl font-bold text-success">₹2,500</p>
                </div>
                <div className="bg-destructive/10 rounded-xl p-3">
                  <p className="text-[10px] text-destructive font-medium mb-1">You owe</p>
                  <p className="text-xl font-bold text-destructive">₹1,250</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-4xl font-bold text-gradient">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - List tiles on left */}
      <section className="min-h-screen flex items-center py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">Powerful features for shared expenses, packed into one beautiful app.</p>
          </motion.div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-5 bg-card rounded-2xl p-5 sm:p-6 shadow-soft border border-border/50 hover:shadow-elevated hover:border-primary/20 transition-all group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:shadow-glow transition-shadow">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base sm:text-lg mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Bank-Level Security</p>
                <p className="text-xs text-muted-foreground">End-to-end encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Works Offline</p>
                <p className="text-xs text-muted-foreground">Sync when connected</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Powered</p>
                <p className="text-xs text-muted-foreground">Smart suggestions</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Install as App</p>
                <p className="text-xs text-muted-foreground">Add to home screen</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-[60vh] flex items-center py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-primary rounded-3xl p-10 sm:p-16 text-center text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Start splitting smarter</h2>
              <p className="opacity-80 mb-8 text-base sm:text-lg max-w-lg mx-auto">
                Join thousands of users managing shared expenses with AI-powered insights
              </p>
              <Link to="/auth">
                <Button variant="glass" size="lg" className="rounded-full text-primary-foreground border-white/20 h-14 px-10 text-base">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden">
              <img src={logoImg} alt="EquiPay" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-foreground">EquiPay</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 EquiPay. Split expenses, not friendships.</p>
        </div>
      </footer>
    </div>
  );
      {/* Trust Section */}
      <div className="px-5 sm:px-6 py-8 sm:py-10">
        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} className="flex items-center justify-center gap-5 sm:gap-8 text-muted-foreground">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">Secure</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-2 sm:gap-2.5">
            <WifiOff className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">Works Offline</span>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="px-5 sm:px-6 py-10 sm:py-14 pb-14 sm:pb-24">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} whileInView={{
        opacity: 1,
        scale: 1
      }} viewport={{
        once: true
      }} className="gradient-primary rounded-2xl sm:rounded-3xl p-7 sm:p-10 text-center text-primary-foreground max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Start splitting smarter</h2>
          <p className="opacity-80 mb-6 sm:mb-8 text-sm sm:text-base">Join thousands of users managing shared expenses</p>
          <Link to="/auth">
            <Button variant="glass" size="lg" className="w-full sm:w-auto text-primary-foreground border-white/20 h-13 sm:h-14 text-base px-8">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>;
}