import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { 
  Users, 
  Receipt, 
  PieChart, 
  CreditCard, 
  ArrowRight,
  Check,
  Globe,
  MessageCircle,
  Sparkles,
  Shield,
  WifiOff
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Group Expenses', description: 'Split bills with friends' },
  { icon: Receipt, title: 'Receipt Scan', description: 'Auto-extract with AI' },
  { icon: Globe, title: 'Multi-Currency', description: 'Travel-friendly' },
  { icon: MessageCircle, title: 'Group Chat', description: 'Discuss & remind' },
  { icon: Sparkles, title: 'AI Insights', description: 'Smart budgeting' },
  { icon: CreditCard, title: 'UPI Pay', description: 'Settle instantly' },
];

const benefits = [
  'Split expenses equally or custom',
  'Real-time currency conversion',
  'AI-powered spending insights',
  'Works offline - sync when online',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="gradient-hero relative overflow-hidden min-h-[60vh] flex flex-col">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative z-10 px-5 sm:px-6 pt-6 sm:pt-8 pb-8 text-primary-foreground flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold">EquiPay</span>
            </div>
            <ThemeToggle variant="ghost" className="text-primary-foreground hover:bg-white/10" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col"
          >

            {/* Hero Text */}
            <div className="flex-1 flex flex-col justify-center max-w-lg">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 leading-tight">
                Split Expenses<br />
                <span className="opacity-80">Effortlessly</span>
              </h1>
              <p className="text-base sm:text-lg opacity-80 mb-8 sm:mb-10 max-w-sm leading-relaxed">
                The smartest way to share costs with friends, roommates, and travel buddies.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button 
                    variant="glass" 
                    size="lg" 
                    className="w-full sm:w-auto text-primary-foreground border-white/20 h-13 sm:h-14 text-base"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="px-5 sm:px-6 -mb-24 sm:-mb-28"
        >
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-float p-5 sm:p-6 border border-border/50 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">+₹1,250</p>
              </div>
              <div className="flex -space-x-2 sm:-space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-card"
                  />
                ))}
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-secondary flex items-center justify-center border-2 border-card text-[10px] sm:text-xs font-medium text-muted-foreground">
                  +5
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-success/10 rounded-xl p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-success font-medium mb-1">You get</p>
                <p className="text-lg sm:text-xl font-bold text-success">₹2,500</p>
              </div>
              <div className="bg-destructive/10 rounded-xl p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-destructive font-medium mb-1">You owe</p>
                <p className="text-lg sm:text-xl font-bold text-destructive">₹1,250</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="px-5 sm:px-6 pt-32 sm:pt-36 pb-10 sm:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Everything you need</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Powerful features for shared expenses</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 max-w-2xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50"
              >
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-5 sm:px-6 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-secondary rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-lg mx-auto"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5 sm:mb-6">Why EquiPay?</h2>
          <div className="space-y-4 sm:space-y-5">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success-foreground" />
                </div>
                <span className="text-foreground font-medium text-sm sm:text-base">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trust Section */}
      <div className="px-5 sm:px-6 py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-5 sm:gap-8 text-muted-foreground"
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">Secure</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-2 sm:gap-2.5">
            <WifiOff className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">Works Offline</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">AI Powered</span>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="px-5 sm:px-6 py-10 sm:py-14 pb-14 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="gradient-primary rounded-2xl sm:rounded-3xl p-7 sm:p-10 text-center text-primary-foreground max-w-lg mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Start splitting smarter</h2>
          <p className="opacity-80 mb-6 sm:mb-8 text-sm sm:text-base">Join thousands of users managing shared expenses</p>
          <Link to="/auth">
            <Button 
              variant="glass" 
              size="lg" 
              className="w-full sm:w-auto text-primary-foreground border-white/20 h-13 sm:h-14 text-base px-8"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
