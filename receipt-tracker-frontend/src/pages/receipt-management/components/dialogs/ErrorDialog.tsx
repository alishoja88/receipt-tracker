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

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
}

export const ErrorDialog = ({ open, onOpenChange, title, message }: ErrorDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-red-500 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <DialogTitle className="text-slate-100">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 mt-3">{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
