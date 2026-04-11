import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { signUpWithEmail, signInWithEmail } from '@/lib/database';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setMode('reset');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'reset') {
      if (!newPassword || newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) toast.error(error.message);
        else {
          toast.success('Password updated successfully!');
          navigate('/dashboard');
        }
      } catch {
        toast.error('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email) { toast.error('Please enter your email'); return; }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) toast.error(error.message);
        else {
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

    if (!password) { toast.error('Please enter your password'); return; }
    if (mode === 'signup' && !name) { toast.error('Please enter your name'); return; }

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
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-primary-foreground max-w-md"
        >
          <span className="text-4xl font-bold mb-6 block" style={{ fontFamily: 'Space Grotesk' }}>EquiPay</span>
          <h1 className="text-3xl font-bold mb-4 leading-tight">
            Split expenses,<br />not friendships.
          </h1>
          <p className="text-lg opacity-80 mb-8">
            AI-powered expense splitting for groups. Scan receipts, track balances, and settle up instantly.
          </p>
          <div className="space-y-3">
            {['AI Receipt Scanning', 'Real-time Balances', 'Instant Settlements', 'Works Offline'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span className="text-sm font-medium opacity-90">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Space Grotesk' }}>EquiPay</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {mode === 'reset' ? (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Set New Password</h2>
                  <p className="text-sm text-muted-foreground mb-6">Enter your new password below.</p>
                </>
              ) : mode === 'forgot' ? (
                <>
                  <button onClick={() => setMode('login')} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </button>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
                  <p className="text-sm text-muted-foreground mb-6">We'll send you a reset link via email.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {mode === 'login' ? 'Welcome back' : 'Create account'}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    {mode === 'login' ? 'Sign in to continue' : 'Start splitting expenses for free'}
                  </p>

                  <div className="flex bg-secondary rounded-xl p-1 mb-6">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground'}`}
                    >
                      Sign Up
                    </button>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="pl-10 h-12 rounded-xl" disabled={isLoading} />
                    </div>
                  </div>
                )}

                {mode === 'reset' ? (
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 rounded-xl"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10 h-12 rounded-xl" required disabled={isLoading} />
                      </div>
                    </div>

                    {mode !== 'forgot' && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10 h-12 rounded-xl" required disabled={isLoading} minLength={6} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} className="text-sm text-primary font-medium hover:underline">
                    Forgot password?
                  </button>
                )}

                <Button type="submit" variant="gradient" className="w-full h-12 rounded-xl text-sm font-semibold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      {mode === 'reset' ? 'Update Password' : mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-8">
          <button onClick={() => navigate('/help')} className="hover:text-primary transition-colors">Help & Support</button>
          <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors">Privacy & Security</button>
        </div>
      </div>
    </div>
  );
}
