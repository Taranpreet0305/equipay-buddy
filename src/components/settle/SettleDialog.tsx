import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateUPILink, isMobileDevice, formatCurrency } from '@/lib/debtSimplification';
import { CreditCard, Banknote, Smartphone, ExternalLink, Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SettleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fromUser: {
    id: string;
    name: string;
    photoUrl?: string;
  };
  toUser: {
    id: string;
    name: string;
    photoUrl?: string;
    upiId?: string;
  };
  amount: number;
  onSettle: (method: 'cash' | 'upi') => Promise<void>;
}

export function SettleDialog({
  isOpen,
  onClose,
  fromUser,
  toUser,
  amount,
  onSettle,
}: SettleDialogProps) {
  const [isSettling, setIsSettling] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'upi' | null>(null);

  const handleCashSettle = async () => {
    setSelectedMethod('cash');
    setIsSettling(true);
    try {
      await onSettle('cash');
      toast.success('Settlement recorded!');
      onClose();
    } catch (error) {
      toast.error('Failed to record settlement');
    } finally {
      setIsSettling(false);
    }
  };

  const handleUPIPayment = async () => {
    if (!toUser.upiId) {
      toast.error(`${toUser.name} hasn't added their UPI ID yet`);
      return;
    }

    setSelectedMethod('upi');

    const upiLink = generateUPILink(
      toUser.upiId,
      amount,
      toUser.name,
      `EquiPay settlement from ${fromUser.name}`
    );

    if (isMobileDevice()) {
      // Open UPI app
      window.location.href = upiLink;
      
      // Record settlement after a delay (user needs to confirm in UPI app)
      setTimeout(async () => {
        setIsSettling(true);
        try {
          await onSettle('upi');
          toast.success('Settlement recorded! Please confirm payment in your UPI app.');
          onClose();
        } catch (error) {
          toast.error('Failed to record settlement');
        } finally {
          setIsSettling(false);
        }
      }, 1000);
    } else {
      // On desktop, show UPI ID to copy
      toast.info('Open your UPI app and pay to the UPI ID shown');
    }
  };

  const copyUPIId = () => {
    if (toUser.upiId) {
      navigator.clipboard.writeText(toUser.upiId);
      toast.success('UPI ID copied!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-secondary rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={fromUser.photoUrl} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {fromUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">You pay</p>
                <p className="font-semibold text-foreground">{formatCurrency(amount)}</p>
              </div>
            </div>
            
            <div className="text-2xl">→</div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-semibold text-foreground">{toUser.name}</p>
              </div>
              <Avatar className="w-12 h-12">
                <AvatarImage src={toUser.photoUrl} />
                <AvatarFallback className="bg-success/10 text-success">
                  {toUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Choose payment method</p>

            {/* UPI Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUPIPayment}
              disabled={isSettling}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border-2 border-primary/20 hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">Pay via UPI</p>
                <p className="text-sm text-muted-foreground">
                  {toUser.upiId ? 'Opens your UPI app' : 'UPI ID not available'}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-primary" />
            </motion.button>

            {/* Show UPI ID and QR if on desktop or if user needs it */}
            {toUser.upiId && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary/50 rounded-2xl p-4 border border-border/50 text-center space-y-3"
              >
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Scan to Pay {toUser.name}</p>
                  <div className="bg-white p-2 rounded-xl inline-block shadow-soft mx-auto">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateUPILink(toUser.upiId, amount, toUser.name, `EquiPay settlement`))}`} 
                      alt="UPI QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-card rounded-xl p-2.5 border border-border/50">
                  <div className="text-left min-w-0">
                    <p className="text-[10px] text-muted-foreground mb-0.5">UPI ID</p>
                    <p className="font-mono text-xs font-bold text-foreground truncate">{toUser.upiId}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={copyUPIId} className="h-8 w-8 rounded-lg">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Scan this QR code with any UPI app (GPay, PhonePe, Paytm) to pay the exact amount.
                </p>
              </motion.div>
            )}

            {/* Cash Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCashSettle}
              disabled={isSettling}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border-2 border-border hover:border-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">Mark as Settled Manually</p>
                <p className="text-sm text-muted-foreground">For cash or other external payments</p>
              </div>
              {selectedMethod === 'cash' && isSettling ? (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5 text-muted-foreground" />
              )}
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
