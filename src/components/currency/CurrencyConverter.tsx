import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
];

interface CurrencyConverterProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert?: (amount: number, currency: string, convertedAmount: number, targetCurrency: string) => void;
  initialAmount?: number;
  initialCurrency?: string;
}

export function CurrencyConverter({
  isOpen,
  onClose,
  onConvert,
  initialAmount = 0,
  initialCurrency = 'USD',
}: CurrencyConverterProps) {
  const [amount, setAmount] = useState(initialAmount.toString());
  const [fromCurrency, setFromCurrency] = useState(initialCurrency);
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsConverting(true);
    try {
      const { data, error } = await supabase.functions.invoke('convert-currency', {
        body: {
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(amount),
        },
      });

      if (error) throw error;

      setConvertedAmount(data.data.convertedAmount);
      setRate(data.data.rate);
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setConvertedAmount(null);
    setRate(null);
  };

  const handleUseAmount = () => {
    if (convertedAmount && onConvert) {
      onConvert(parseFloat(amount), fromCurrency, convertedAmount, toCurrency);
      onClose();
    }
  };

  const getSymbol = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol || code;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Currency Converter
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {getSymbol(fromCurrency)}
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setConvertedAmount(null);
                }}
                placeholder="0.00"
                className="pl-10 h-12 rounded-xl text-lg font-semibold"
              />
            </div>
          </div>

          {/* Currency Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">From</Label>
              <Select value={fromCurrency} onValueChange={(v) => { setFromCurrency(v); setConvertedAmount(null); }}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={swapCurrencies}
              className="mt-5 w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex-1 space-y-1">
              <Label className="text-xs">To</Label>
              <Select value={toCurrency} onValueChange={(v) => { setToCurrency(v); setConvertedAmount(null); }}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={isConverting || !amount || parseFloat(amount) <= 0}
          >
            {isConverting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              'Convert'
            )}
          </Button>

          {/* Result */}
          {convertedAmount !== null && rate !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary rounded-2xl p-4 text-center"
            >
              <p className="text-sm text-muted-foreground mb-1">Converted Amount</p>
              <p className="text-3xl font-bold text-foreground">
                {getSymbol(toCurrency)}{convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
              </p>

              {onConvert && (
                <Button
                  onClick={handleUseAmount}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Use this amount
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
