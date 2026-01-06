import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { signUpWithEmail, signInWithEmail } from '@/lib/database';

export default function Auth() {
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!isLogin && !name) {
      toast.error('Please enter your name');
      return;
    }
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <div className="gradient-hero px-4 sm:px-6 pt-8 sm:pt-12 pb-12 sm:pb-16 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md mx-auto"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 sm:mb-6">
            <span className="text-2xl sm:text-3xl">💰</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">EquiPay</h1>
          <p className="text-base sm:text-lg opacity-90">Split expenses effortlessly</p>
        </motion.div>
      </div>

      {/* Auth Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 px-4 sm:px-6 -mt-6 sm:-mt-8 pb-8"
      >
        <div className="bg-card rounded-2xl sm:rounded-3xl shadow-elevated p-4 sm:p-6 border border-border/50 max-w-md mx-auto w-full">
          {/* Toggle */}
          <div className="flex bg-secondary rounded-lg sm:rounded-xl p-1 mb-4 sm:mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isLogin ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                !isLogin ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-9 sm:pl-10 h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                    required={!isLogin}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9 sm:pl-10 h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-[10px] sm:text-xs text-muted-foreground">Password must be at least 6 characters</p>
              )}
            </div>

            {isLogin && (
              <button type="button" className="text-xs sm:text-sm text-primary font-medium">
                Forgot password?
              </button>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full h-10 sm:h-12 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </Button>
          </form>

        </div>

        <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-4 sm:mt-6 max-w-md mx-auto">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
