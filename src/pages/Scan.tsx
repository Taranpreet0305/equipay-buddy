import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Upload, Loader2, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { scanReceipt } from '@/lib/database';

export default function Scan() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!preview) return;
    
    setIsScanning(true);
    try {
      const { data, error } = await scanReceipt(preview);

      if (error) {
        toast.error(error.message || 'Failed to scan receipt');
        return;
      }

      if (data) {
        toast.success('Receipt scanned successfully!');
        // Navigate to add expense with pre-filled data
        navigate('/add-expense', { 
          state: { 
            amount: data.amount,
            description: data.description,
            category: data.category 
          }
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan receipt');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <PageLayout showNav={false}>
      <div className="px-4 py-6 min-h-screen flex flex-col">
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
            <h1 className="text-xl font-bold text-foreground">Scan Receipt</h1>
            <p className="text-sm text-muted-foreground">AI-powered OCR extraction</p>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-sm border-2 border-dashed border-primary/30 rounded-3xl p-8 sm:p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground mb-2 text-lg">
                    Scan a receipt
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a photo or upload an image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
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
                className="flex-1 flex flex-col"
              >
                <div className="relative rounded-2xl overflow-hidden flex-1 max-h-[60vh]">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="w-full h-full object-contain bg-secondary"
                  />
                  
                  {isScanning && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                      <p className="font-semibold text-foreground">Analyzing receipt...</p>
                      <p className="text-sm text-muted-foreground">Using AI to extract details</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  {!isScanning && (
                    <>
                      <Button
                        onClick={processImage}
                        variant="gradient"
                        size="xl"
                        className="w-full"
                      >
                        <Receipt className="w-5 h-5" />
                        Extract Details
                      </Button>
                      <Button
                        onClick={() => {
                          setPreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        variant="outline"
                        size="lg"
                        className="w-full"
                      >
                        Take Another Photo
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}
