import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, Receipt, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { scanReceipt } from '@/lib/database';

interface ScanReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: {
    amount: number;
    currency: string;
    description: string;
    category: string;
    date?: string;
  }) => void;
}

export function ScanReceiptDialog({
  isOpen,
  onClose,
  onScanComplete,
}: ScanReceiptDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageBase64: string) => {
    setIsScanning(true);
    try {
      const { data, error } = await scanReceipt(imageBase64);

      if (error) {
        toast.error(error.message || 'Failed to scan receipt');
        return;
      }

      if (data) {
        toast.success('Receipt scanned successfully!');
        onScanComplete({
          amount: data.amount || 0,
          currency: data.currency || 'INR',
          description: data.description || 'Scanned receipt',
          category: data.category || 'other',
          date: data.date,
        });
        onClose();
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan receipt');
    } finally {
      setIsScanning(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Scan Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground text-center">
                  Take a photo or upload an image of your receipt to automatically extract expense details
                </p>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium text-foreground mb-1">
                    Tap to take a photo or upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG up to 5MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="w-full max-h-64 object-contain bg-secondary"
                  />
                  {!isScanning && (
                    <button
                      onClick={clearPreview}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-destructive-foreground" />
                    </button>
                  )}
                  
                  {isScanning && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                      <p className="font-medium text-foreground">Analyzing receipt...</p>
                      <p className="text-sm text-muted-foreground">Using AI to extract details</p>
                    </div>
                  )}
                </div>

                {!isScanning && (
                  <Button
                    onClick={() => processImage(preview)}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                  >
                    <Upload className="w-5 h-5" />
                    Scan Receipt
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
