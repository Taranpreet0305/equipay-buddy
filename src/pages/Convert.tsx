import { useState } from 'react';
import { CurrencyConverter } from '@/components/currency/CurrencyConverter';
import { PageLayout } from '@/components/layout/PageLayout';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Convert() {
  const navigate = useNavigate();

  return (
    <PageLayout showNav={false}>
      <div className="px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Currency Converter</h1>
            <p className="text-sm text-muted-foreground">Convert between 10+ currencies</p>
          </div>
        </motion.div>

        <CurrencyConverter 
          isOpen={true} 
          onClose={() => navigate(-1)}
        />
      </div>
    </PageLayout>
  );
}
