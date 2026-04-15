import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Users, Receipt, Globe, MessageCircle, Sparkles, CreditCard, ArrowRight, Shield, WifiOff, Download, Zap, TrendingUp, Wallet, ChevronDown, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

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
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeWhy, setActiveWhy] = useState(0);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg sm:text-xl font-bold text-foreground"
            style={{ fontFamily: 'Space Grotesk' }}
          >
            <span className="text-foreground">Equi</span>
            <span className="text-primary">Pay</span>
          </motion.span>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="outline" size="sm" className="rounded-full text-[10px] sm:text-xs h-8 sm:h-9 px-3 sm:px-5">
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
      <section className="min-h-screen flex flex-col items-center justify-center pt-14 sm:pt-16 relative overflow-hidden hero-dark-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(ellipse, hsl(230, 65%, 50%) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/4 w-[300px] sm:w-[500px] h-[200px] sm:h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, hsl(250, 55%, 45%) 0%, transparent 70%)' }} />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-4 sm:mb-6 tracking-tight"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              <span className="text-white">Equi</span>
              <span style={{ color: 'hsl(250, 76%, 70%)' }}>Pay</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sm sm:text-lg lg:text-xl text-white/60 max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
            >
              The ultimate expense splitting and tracking app. Fair, fast, and powered by AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/auth">
                <Button size="lg" className="rounded-full h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base shadow-glow bg-primary hover:bg-primary/90 text-white">
                  Get Started
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pb-6 sm:pb-8 text-white/40 text-[10px] sm:text-xs tracking-[0.3em] uppercase flex flex-col items-center gap-2"
        >
          <span>Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Horizontal scrollable on mobile, list+tile on desktop */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              Everything you need
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base max-w-xl mx-auto">
              Powerful features for shared expenses, packed into one beautiful app.
            </p>
          </motion.div>

          {/* Mobile: horizontal scroll */}
          <div className="flex lg:hidden overflow-x-auto gap-3 pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="min-w-[240px] sm:min-w-[280px] snap-start bg-card rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50 flex-shrink-0"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl gradient-primary flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop: list on left, detail tile on right */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <div className="col-span-2 space-y-1.5">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeFeature === index;
                return (
                  <motion.button
                    key={feature.title}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveFeature(index)}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                      isActive 
                        ? 'bg-primary/10 border border-primary/30 shadow-sm' 
                        : 'hover:bg-secondary/50 border border-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'gradient-primary' : 'bg-secondary'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`font-medium text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {feature.title}
                    </span>
                    {isActive && <ChevronRight className="w-4 h-4 text-primary ml-auto" />}
                  </motion.button>
                );
              })}
            </div>
            <div className="col-span-3 flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: 30, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-2xl p-8 shadow-elevated border border-border/50 w-full"
                >
                  {(() => {
                    const Icon = features[activeFeature].icon;
                    return (
                      <>
                        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-5 shadow-glow">
                          <Icon className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <h3 className="font-bold text-foreground text-xl mb-3">{features[activeFeature].title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{features[activeFeature].description}</p>
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Why EquiPay Section - list on left, expanded tile on right */}
      <section className="py-16 sm:py-20 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              Why EquiPay?
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base max-w-lg mx-auto">
              Built for real life, not just spreadsheets.
            </p>
          </motion.div>

          {/* Mobile: stacked cards */}
          <div className="flex flex-col sm:hidden gap-3 max-w-md mx-auto">
            {whyEquipay.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-card rounded-xl p-4 shadow-soft border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold text-xs">{index + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tablet+Desktop: list + expanded tile side by side */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              {whyEquipay.map((item, index) => {
                const isActive = activeWhy === index;
                return (
                  <motion.button
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => setActiveWhy(index)}
                    className={`w-full flex items-center gap-3 rounded-xl p-4 text-left transition-all ${
                      isActive 
                        ? 'bg-primary/10 border border-primary/30 shadow-sm' 
                        : 'bg-card hover:bg-card/80 border border-border/50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'gradient-primary' : 'bg-secondary'
                    }`}>
                      <span className={`font-bold text-xs ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{index + 1}</span>
                    </div>
                    <span className={`font-semibold text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <div className="flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeWhy}
                  initial={{ opacity: 0, x: 30, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-2xl p-6 sm:p-8 shadow-elevated border border-border/50 w-full"
                >
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4">
                    <span className="text-primary-foreground font-bold text-lg">{activeWhy + 1}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg sm:text-xl mb-3">{whyEquipay[activeWhy].title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{whyEquipay[activeWhy].description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 sm:py-16 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12"
          >
            {[
              { icon: Shield, title: 'Bank-Level Security', sub: 'End-to-end encrypted', color: 'bg-primary/10 text-primary' },
              { icon: WifiOff, title: 'Works Offline', sub: 'Sync when connected', color: 'bg-accent/10 text-accent' },
              { icon: Sparkles, title: 'AI Powered', sub: 'Smart suggestions', color: 'bg-success/10 text-success' },
              { icon: Download, title: 'Install as App', sub: 'Add to home screen', color: 'bg-warning/10 text-warning' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-2">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${item.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color.split(' ')[1]}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{item.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-primary rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                Start splitting smarter
              </h2>
              <p className="opacity-80 mb-6 sm:mb-8 text-xs sm:text-sm lg:text-base max-w-lg mx-auto">
                Join thousands managing shared expenses with AI-powered insights.
              </p>
              <Link to="/auth">
                <Button variant="glass" size="lg" className="rounded-full text-primary-foreground border-white/20 h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3" style={{ fontFamily: 'Space Grotesk' }}>
                <span>Equi</span><span className="text-primary">Pay</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Split expenses, not friendships. The smart way to manage shared costs.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-2 sm:mb-3">Pages</h4>
              <div className="space-y-1.5 sm:space-y-2">
                <Link to="/auth" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">Login / Sign Up</Link>
                <Link to="/help" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">Help & Support</Link>
                <Link to="/privacy" className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">Privacy & Security</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-2 sm:mb-3">Features</h4>
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Group Expenses</p>
                <p className="text-xs sm:text-sm text-muted-foreground">AI Receipt Scan</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Multi-Currency</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Personal Budget</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
            <p className="text-[10px] sm:text-xs text-muted-foreground">© 2026 EquiPay. All rights reserved.</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">EquiPay — By Asteriq</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
