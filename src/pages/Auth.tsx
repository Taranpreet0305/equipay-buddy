import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { signUpWithEmail, signInWithEmail } from '@/lib/database';
import { supabase } from '@/integrations/supabase/client';
import logoImg from '@/assets/logo.png';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Password reset link sent! Check your email.');
          setMode('login');
        }
      } catch {
        toast.error('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    if (mode === 'signup' && !name) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          toast.error(error.message.includes('Invalid login credentials') ? 'Invalid email or password' : error.message);
          return;
        }
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          toast.error(error.message.includes('already registered') ? 'This email is already registered.' : error.message);
          return;
        }
        toast.success('Account created! Check your email to verify.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <div className="gradient-hero px-4 sm:px-6 pt-8 sm:pt-10 pb-10 sm:pb-14 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 -translate-y-1/2 translate-x-1/2 rounded-sm" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
            <span className="text-2xl">💰</span>
          </div>
          <h1 className="text-xl font-bold mb-1">EquiPay</h1>
          <p className="text-sm opacity-90">Split expenses effortlessly</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 px-4 sm:px-6 -mt-5 pb-8">
        <div className="bg-card rounded-2xl shadow-elevated p-4 sm:p-6 border border-border/50 max-w-md mx-auto w-full">
          {mode === 'forgot' ? (
            <>
              <button onClick={() => setMode('login')} className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </button>
              <h2 className="font-semibold text-foreground text-base mb-1">Reset Password</h2>
              <p className="text-xs text-muted-foreground mb-4">Enter your email to receive a reset link.</p>
            </>
          ) : (
            <div className="flex bg-secondary rounded-lg p-1 mb-4">
              <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${mode === 'login' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'}`}>
                Sign In
              </button>
              <button onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${mode === 'signup' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'}`}>
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="pl-9 h-10 rounded-lg text-sm" disabled={isLoading} />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9 h-10 rounded-lg text-sm" required disabled={isLoading} />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-9 pr-9 h-10 rounded-lg text-sm" required disabled={isLoading} minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary font-medium">
                Forgot password?
              </button>
            )}

            <Button type="submit" variant="gradient" className="w-full h-10 text-sm" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  {mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-4 max-w-md mx-auto">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
