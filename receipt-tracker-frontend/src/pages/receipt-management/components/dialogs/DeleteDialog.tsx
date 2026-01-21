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
      <DialogContent className="bg-slate-800 border-red-500 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <DialogTitle className="text-slate-100">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 mt-3">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <Button
            onClick={onCancel}
            className="bg-gray-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              isLoading ? 'bg-red-400 cursor-not-allowed opacity-60' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
