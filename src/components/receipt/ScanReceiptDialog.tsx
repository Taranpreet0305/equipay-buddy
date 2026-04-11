import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScanReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: { amount: number; currency: string; description: string; category: string }) => void;
}

export function ScanReceiptDialog({ isOpen, onClose, onScanComplete }: ScanReceiptDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsScanning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Please sign in'); return; }

      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve((r.result as string).split(',')[1]);
        r.readAsDataURL(file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-receipt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Scan failed');

      onScanComplete({
        amount: result.data?.amount || 0,
        currency: result.data?.currency || 'INR',
        description: result.data?.description || 'Scanned receipt',
        category: result.data?.category || 'other',
      });
      toast.success('Receipt scanned successfully!');
      onClose();
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan receipt. Try again.');
    } finally {
      setIsScanning(false);
      setPreview(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Scan Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={preview} alt="Receipt preview" className="w-full max-h-64 object-contain" />
              {isScanning && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">AI is scanning...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">Upload Receipt</p>
              <p className="text-xs text-muted-foreground mt-1">Take a photo or choose from gallery</p>
              <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
            </label>
          )}

          <Button variant="outline" onClick={onClose} className="w-full" disabled={isScanning}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
