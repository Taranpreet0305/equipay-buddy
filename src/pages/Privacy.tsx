import { PageLayout } from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, FileText, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <PageLayout showNav={false}>
      <div className="px-4 py-6 sm:py-10 max-w-2xl mx-auto space-y-8">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        <section>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-success" />
            Privacy & Security
          </h1>
          <p className="text-muted-foreground">Your financial security and data privacy are our top priorities.</p>
        </section>

        <div className="grid gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">End-to-End Protection</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use bank-grade encryption to protect your data. All communication between your device and our servers is encrypted using industry-standard TSL/SSL protocols.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold">Data Privacy</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              EquiPay doesn't sell your personal data. We only collect information necessary to provide splitting services and improve your experience. Your phone number and email are used solely for authentication and group invites.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-warning" />
              </div>
              <h2 className="text-lg font-semibold">Account Control</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have full control over your account. You can update your profile, change your display name, and manage your group memberships at any time. If you wish to delete your account, you can do so through the profile settings.
            </p>
          </motion.div>
        </div>

        <section className="bg-card p-6 rounded-2xl border border-border/50 shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Terms of Service
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By using EquiPay, you agree to our standard terms of service. This includes responsible use of the app and maintaining the confidentiality of your login credentials. We are not a bank or financial institution; we provide a tool for expense tracking and coordination.
          </p>
        </section>

        <footer className="text-center pt-6 text-[10px] text-muted-foreground">
          <p>Last updated: March 2026</p>
          <p className="mt-1">For questions regarding your privacy, contact privacy@equipay.com</p>
        </footer>
      </div>
    </PageLayout>
  );
}
