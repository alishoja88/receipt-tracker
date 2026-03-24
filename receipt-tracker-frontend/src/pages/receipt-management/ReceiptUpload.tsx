import { useState } from 'react';
import { CloudUpload, Info, Image, FileText, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Receipt as ReceiptIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReceiptUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  file: File | null;
  preview?: string | null;
  isUploading?: boolean;
  error?: string | null;
  onUpload?: () => void;
  onTryAgain?: () => void;
}

const ReceiptUpload = ({
  onFileSelect,
  onFileRemove,
  file,
  error = null,
  onUpload,
  onTryAgain,
}: ReceiptUploadProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) return;
    if (selectedFile.size > 10 * 1024 * 1024) return;

    if (error) setIsModalOpen(false);
    onFileSelect(selectedFile);
    setIsModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(droppedFile.type)) return;
    if (droppedFile.size > 10 * 1024 * 1024) return;

    if (error) setIsModalOpen(false);
    onFileSelect(droppedFile);
    setIsModalOpen(true);
  };

  const handleBrowseClick = () => {
    document.getElementById('receipt-file-input')?.click();
  };

  const handleCancel = () => {
    onFileRemove();
    setIsModalOpen(false);
  };

  const handleUpload = async () => {
    setIsModalOpen(false);
    if (onUpload) onUpload();
  };

  const formatBadges = [
    { icon: Image, label: 'JPG, PNG' },
    { icon: FileText, label: 'PDF' },
    { icon: HardDrive, label: 'Up to 25MB' },
  ];

  return (
    <div className="w-full">
      {/* Upload Area */}
      {(!file || error) && (
        <div
          className="relative rounded-[28px] border-2 border-dashed p-12 text-center transition-all duration-[200ms] hover:border-teal-400/40 hover:shadow-[0_0_24px_rgba(20,184,166,0.1),0_0_48px_rgba(20,184,166,0.05)] md:p-16"
          style={{
            borderColor: error ? 'rgba(239, 68, 68, 0.35)' : 'rgba(45, 212, 191, 0.2)',
            background: 'linear-gradient(180deg, rgba(18, 27, 39, 0.92), rgba(12, 19, 30, 0.96))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            id="receipt-file-input"
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
          />

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[22px] border border-teal-500/30 bg-gradient-to-br from-teal-500/20 to-teal-700/10 shadow-lg shadow-teal-950/30">
            <CloudUpload className="h-11 w-11" style={{ color: error ? '#f87171' : '#2dd4bf' }} />
          </div>

          <h3 className="mb-2 text-2xl font-bold text-white">
            {error ? 'Try uploading again' : 'Drop your receipts here'}
          </h3>
          <p className="mb-8 text-base text-slate-400">
            {error ? 'Select a different file or try again' : 'Drag and drop or click to browse'}
          </p>

          <p className="mb-4 text-sm text-slate-500">or</p>

          <Button
            onClick={handleBrowseClick}
            size="lg"
            className={`px-8 py-6 text-base font-semibold shadow-lg ${
              error
                ? 'bg-red-500 shadow-red-950/30 hover:bg-red-600'
                : 'bg-teal-500 shadow-teal-950/30 hover:bg-teal-600'
            } text-white`}
          >
            {error ? 'Select New File' : 'Browse Files'}
          </Button>

          {/* File format badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {formatBadges.map(b => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-400"
              >
                <b.icon className="h-3.5 w-3.5 text-slate-500" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Receipt Selection Modal */}
      <Dialog
        open={isModalOpen && !error}
        onOpenChange={open => {
          if (!open) onFileRemove();
          setIsModalOpen(open);
        }}
      >
        <DialogContent
          className="border-white/[0.08] sm:max-w-md"
          style={{
            backgroundColor: '#0e1520',
          }}
        >
          <DialogHeader>
            <div className="mb-4 flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/10">
                <ReceiptIcon className="h-8 w-8 text-teal-400" />
              </div>
              <DialogTitle className="text-center text-2xl font-bold text-white">
                Receipt Selected
              </DialogTitle>
            </div>
          </DialogHeader>

          {file && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <ReceiptIcon className="h-5 w-5 flex-shrink-0 text-teal-400" />
              <p className="flex-1 truncate text-sm font-medium text-slate-200">{file.name}</p>
            </div>
          )}

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-white/[0.08] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              className="flex-1 bg-teal-500 text-white hover:bg-teal-600"
            >
              Upload Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/[0.08] p-4">
          <div className="mb-3 flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium text-red-300">Upload Failed</p>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
          {onTryAgain && (
            <div className="mt-3 flex gap-2">
              <Button
                onClick={onTryAgain}
                size="sm"
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Try Again
              </Button>
              <Button
                onClick={onFileRemove}
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-300 hover:bg-red-500/10"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;
