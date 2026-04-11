import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Users, Receipt, Globe, MessageCircle, Sparkles, CreditCard, ArrowRight, Shield, WifiOff, Download, Zap, TrendingUp, Wallet } from 'lucide-react';
import { useRef } from 'react';

const features = [
  { icon: Users, title: 'Group Expenses', description: 'Create groups and split bills with friends, roommates, and travel buddies effortlessly.' },
  { icon: Receipt, title: 'AI Receipt Scan', description: 'Snap a photo of any receipt and let AI extract amounts, items, and categories instantly.' },
  { icon: Globe, title: 'Multi-Currency', description: 'Travel-friendly with real-time currency conversion for international group expenses.' },
  { icon: MessageCircle, title: 'Group Chat', description: 'Discuss expenses, send reminders, and coordinate payments within your group.' },
  { icon: Sparkles, title: 'AI Insights', description: 'Get personalized spending analytics and smart budgeting recommendations powered by AI.' },
  { icon: CreditCard, title: 'Instant Settle', description: 'Settle debts via UPI or cash with one tap. Smart debt simplification included.' },
  { icon: Wallet, title: 'Personal Budget', description: 'Track your personal spending with budget goals, overspend alerts, and visual breakdowns.' },
  { icon: TrendingUp, title: 'Spending Analytics', description: 'Beautiful charts and graphs showing your spending patterns, trends, and category breakdowns.' },
];

const whyEquipay = [
  { title: 'No More Awkwardness', description: 'Transparent splitting means no uncomfortable money conversations with friends.' },
  { title: 'AI Does the Work', description: 'Scan receipts, get insights, and auto-categorize — so you don\'t have to.' },
  { title: 'Works Everywhere', description: 'Offline support, PWA install, multi-currency — use it anywhere in the world.' },
  { title: 'Completely Free', description: 'No hidden fees, no premium tiers. All features available to everyone.' },
];

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden">
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: 'Space Grotesk' }}
          >
            EquiPay
          </motion.span>
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

      {/* Hero Section - Full screen centered */}
      <section className="min-h-screen flex items-center justify-center pt-16 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated app name */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gradient mb-4 tracking-tight"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              EquiPay
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Expense splitting & tracking app. Split costs with friends, scan receipts with AI, and settle up instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/auth">
                <Button variant="gradient" size="lg" className="rounded-full h-14 px-8 text-base shadow-glow">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - List tiles */}
      <section className="min-h-screen flex items-center py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Everything you need
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Powerful features for shared expenses, packed into one beautiful app.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className="flex items-start gap-4 bg-card rounded-2xl p-5 shadow-soft border border-border/50 hover:shadow-elevated hover:border-primary/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:shadow-glow transition-shadow">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why EquiPay Section */}
      <section className="min-h-[80vh] flex items-center py-20 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Why EquiPay?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
              Built for real life, not just spreadsheets.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whyEquipay.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center"
              >
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">{index + 1}</span>
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { icon: Shield, title: 'Bank-Level Security', sub: 'End-to-end encrypted', color: 'bg-primary/10 text-primary' },
              { icon: WifiOff, title: 'Works Offline', sub: 'Sync when connected', color: 'bg-accent/10 text-accent' },
              { icon: Sparkles, title: 'AI Powered', sub: 'Smart suggestions', color: 'bg-success/10 text-success' },
              { icon: Download, title: 'Install as App', sub: 'Add to home screen', color: 'bg-warning/10 text-warning' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-full ${item.color.split(' ')[0]} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${item.color.split(' ')[1]}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              );
            })}
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
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                Start splitting smarter
              </h2>
              <p className="opacity-80 mb-8 text-base sm:text-lg max-w-lg mx-auto">
                Join thousands managing shared expenses with AI-powered insights.
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
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: 'Space Grotesk' }}>EquiPay</h3>
              <p className="text-sm text-muted-foreground">Split expenses, not friendships. The smart way to manage shared costs.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Pages</h4>
              <div className="space-y-2">
                <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Login / Sign Up</Link>
                <Link to="/help" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Help & Support</Link>
                <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Privacy & Security</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Features</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Group Expenses</p>
                <p className="text-sm text-muted-foreground">AI Receipt Scan</p>
                <p className="text-sm text-muted-foreground">Multi-Currency</p>
                <p className="text-sm text-muted-foreground">Personal Budget</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2026 EquiPay. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">EquiPay — By Asteriq</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
