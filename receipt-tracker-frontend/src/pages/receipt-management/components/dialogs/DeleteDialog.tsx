import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
  message?: string;
}

export const DeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isLoading = false,
  title = 'Delete Receipt',
  message = 'Are you sure you want to delete this receipt? This action cannot be undone.',
}: DeleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={open => !open && onCancel()}>
      <DialogContent className="border-white/[0.08] bg-[#0e1520] text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <DialogTitle className="text-white">{title}</DialogTitle>
          </div>
          <DialogDescription className="mt-3 text-slate-400">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <Button
            onClick={onCancel}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-5 py-2 text-sm font-medium text-slate-300 transition-all duration-[180ms] hover:bg-white/[0.06]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white transition-all duration-[180ms] hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
