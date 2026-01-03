import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
  Shield
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
  'Instant UPI settlements',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="gradient-hero relative overflow-hidden min-h-[60vh] flex flex-col">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative z-10 px-5 sm:px-6 pt-8 sm:pt-12 pb-8 text-primary-foreground flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold">EquiPay</span>
            </div>

            {/* Hero Text */}
            <div className="flex-1 flex flex-col justify-center max-w-lg">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                Split Expenses<br />
                <span className="opacity-80">Effortlessly</span>
              </h1>
              <p className="text-base sm:text-lg opacity-80 mb-6 sm:mb-8 max-w-sm">
                The smartest way to share costs with friends, roommates, and travel buddies.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button 
                    variant="glass" 
                    size="lg" 
                    className="w-full sm:w-auto text-primary-foreground border-white/20 h-12 sm:h-14 text-base"
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
          className="px-5 sm:px-6 -mb-20 sm:-mb-24"
        >
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-float p-4 sm:p-6 border border-border/50 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Balance</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">+₹1,250</p>
              </div>
              <div className="flex -space-x-2 sm:-space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-card"
                  />
                ))}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-card text-[10px] sm:text-xs font-medium text-muted-foreground">
                  +5
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-success/10 rounded-xl p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-success font-medium mb-0.5 sm:mb-1">You get</p>
                <p className="text-base sm:text-lg font-bold text-success">₹2,500</p>
              </div>
              <div className="bg-destructive/10 rounded-xl p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-destructive font-medium mb-0.5 sm:mb-1">You owe</p>
                <p className="text-base sm:text-lg font-bold text-destructive">₹1,250</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="px-5 sm:px-6 pt-28 sm:pt-32 pb-8 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Everything you need</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Powerful features for shared expenses</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-soft border border-border/50"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1">{feature.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-5 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-secondary rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg mx-auto"
        >
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Why EquiPay?</h2>
          <div className="space-y-2.5 sm:space-y-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2.5 sm:gap-3"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success-foreground" />
                </div>
                <span className="text-foreground font-medium text-sm sm:text-base">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trust Section */}
      <div className="px-5 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 sm:gap-6 text-muted-foreground"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Secure</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">10+ Currencies</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">AI Powered</span>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="px-5 sm:px-6 py-8 sm:py-12 pb-12 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="gradient-primary rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-primary-foreground max-w-lg mx-auto"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Start splitting smarter</h2>
          <p className="opacity-80 mb-5 sm:mb-6 text-sm sm:text-base">Join thousands of users managing shared expenses</p>
          <Link to="/auth">
            <Button 
              variant="glass" 
              size="lg" 
              className="w-full sm:w-auto text-primary-foreground border-white/20 h-12 sm:h-14 text-base"
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
