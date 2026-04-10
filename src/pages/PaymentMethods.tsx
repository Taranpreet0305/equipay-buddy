import { PageLayout } from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, Banknote, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentMethods() {
  const navigate = useNavigate();

  const methods = [
    { title: "UPI (Unified Payments Interface)", desc: "The fastest way to settle in India. Add your UPI ID in settings so others can pay you directly.", icon: Smartphone, color: "bg-blue-500/10 text-blue-600" },
    { title: "Cash", desc: "For face-to-face settlements. Simply record the cash payment in the app to update the balance.", icon: Banknote, color: "bg-green-500/10 text-green-600" },
    { title: "Bank Transfer", desc: "Ideal for larger amounts. Exchange account details privately to settle external to the app.", icon: CreditCard, color: "bg-purple-500/10 text-purple-600" }
  ];

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
            <CreditCard className="w-8 h-8 text-primary" />
            Payment Methods
          </h1>
          <p className="text-muted-foreground">Learn how to settle your debts and receive payments from friends.</p>
        </section>

        <div className="grid gap-4">
          {methods.map((method, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-4 rounded-2xl border border-border/50 shadow-soft flex items-start gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${method.color}`}>
                <method.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">{method.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{method.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="bg-secondary/30 rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h2 className="font-semibold text-foreground">Secure Settlements</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            EquiPay records the transaction history but does not touch your money. All payments happen directly between you and your friends on your preferred banking platforms.
          </p>
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center justify-between w-full p-3 bg-card rounded-xl border border-border/50 text-xs font-semibold hover:bg-accent/5 transition-colors"
          >
            Update your UPI ID in Settings
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        <footer className="text-center pt-6 text-[10px] text-muted-foreground">
          <p>Need help with a payment? Contact our support team.</p>
        </footer>
      </div>
    </PageLayout>
  );
}
