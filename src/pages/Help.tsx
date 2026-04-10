import { PageLayout } from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, MessageCircle, Mail, Globe, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export default function Help() {
  const navigate = useNavigate();

  const faqs = [
    { q: "How do I create a group?", a: "Go to the 'Groups' tab and tap the '+' icon or 'Create Group' button. Enter a name and description to get started." },
    { q: "How are expenses split?", a: "You can split expenses equally, by exact amounts, or by percentages. The app calculates how much each person owes or is owed automatically." },
    { q: "How do I settle a debt?", a: "Navigate to a group, tap on a member you owe, and select 'Settle Up'. You can record a payment made via UPI or Cash." },
    { q: "Can I use multiple currencies?", a: "Yes! Use the 'Convert' tool on the dashboard to calculate exchange rates for international trips." }
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
            <HelpCircle className="w-8 h-8 text-primary" />
            Help & Support
          </h1>
          <p className="text-muted-foreground">Find answers to common questions and get in touch with our team.</p>
        </section>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search for help..." className="pl-10 h-12 rounded-xl" />
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
          <div className="grid gap-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-4 rounded-xl border border-border/50 shadow-soft"
              >
                <h3 className="font-semibold text-sm mb-2 text-foreground">{faq.q}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
          <h2 className="text-lg font-semibold text-foreground mb-4">Still need help?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold">Email Us</p>
                <p className="text-[10px] text-muted-foreground">support@equipay.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs font-bold">Live Chat</p>
                <p className="text-[10px] text-muted-foreground">Available 9am - 6pm</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center pt-10 text-[10px] text-muted-foreground">
          <div className="flex justify-center gap-4 mb-2">
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Worldwide Support</span>
            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> v1.0.2</span>
          </div>
          <p>© 2026 EquiPay Buddy. All rights reserved.</p>
        </footer>
      </div>
    </PageLayout>
  );
}
