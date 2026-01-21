import { useState } from 'react';
import { CloudUpload, Info } from 'lucide-react';
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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      return;
    }

    // Clear any previous errors when selecting a new file
    if (error) {
      // This will be handled by parent component, but we can clear modal state
      setIsModalOpen(false);
    }

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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(droppedFile.type)) {
      return;
    }

    // Validate file size
    if (droppedFile.size > 10 * 1024 * 1024) {
      return;
    }

    // Clear any previous errors when dropping a new file
    if (error) {
      setIsModalOpen(false);
    }

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
    if (onUpload) {
      // onUpload is async, but we don't need to wait for it
      // Error handling is done in the parent component
      onUpload();
    }
  };

  return (
    <div className="w-full px-3 md:px-4 lg:px-0">
      {/* Information Banner */}
      <div
        className="mb-6 p-4 rounded-lg flex items-start gap-3"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}
      >
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#3B82F6' }} />
        <p className="text-sm" style={{ color: '#F1F5F9' }}>
          Upload your receipt images and our AI will automatically extract store name, date, amount,
          payment method, and category for easy tracking.
        </p>
      </div>

      {/* Upload Area - Show when no file selected OR when there's an error (so user can try again) */}
      {(!file || error) && (
        <div
          className="border-2 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all duration-300 ease-in-out relative"
          style={{
            borderColor: error ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)',
            backgroundColor: 'rgba(241, 245, 249, 0.98)',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = error ? '#EF4444' : '#3B82F6';
            e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = error
              ? 'rgba(239, 68, 68, 0.4)'
              : 'rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 0.98)';
          }}
        >
          <input
            id="receipt-file-input"
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
          />

          {/* Upload Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              }}
            >
              <CloudUpload className="w-10 h-10" style={{ color: error ? '#EF4444' : '#3B82F6' }} />
            </div>
          </div>

          {/* Text Content */}
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#0F172A' }}>
            {error ? 'Try uploading again' : 'Drop your receipts here'}
          </h3>
          <p className="text-base mb-6" style={{ color: '#64748B' }}>
            {error ? 'Select a different file or try again' : 'or click to browse your files'}
          </p>

          {/* Browse Files Button */}
          <Button
            onClick={handleBrowseClick}
            size="lg"
            className={`font-semibold px-8 py-6 text-base ${
              error
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {error ? 'Select New File' : 'Browse Files'}
          </Button>

          {/* File Format Info */}
          <p className="text-sm mt-6" style={{ color: '#94A3B8' }}>
            Supports JPG, PNG, PDF up to 10MB
          </p>
        </div>
      )}

      {/* Receipt Selection Modal - Only show when no error */}
      <Dialog
        open={isModalOpen && !error}
        onOpenChange={open => {
          if (!open) {
            // If modal is closed (e.g., clicking outside), remove file
            onFileRemove();
          }
          setIsModalOpen(open);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: '#F0F9FF',
            border: '2px dashed rgba(59, 130, 246, 0.3)',
          }}
        >
          <DialogHeader>
            <div className="flex flex-col items-center gap-4 mb-4">
              {/* Receipt Icon */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#86EFAC' }}
              >
                <ReceiptIcon className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center" style={{ color: '#0F172A' }}>
                Receipt Selected
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* File Info */}
          {file && (
            <div
              className="rounded-xl p-4 mb-4 flex items-center gap-3"
              style={{
                backgroundColor: '#E0F2FE',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <ReceiptIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#3B82F6' }} />
              <p className="text-sm font-medium truncate flex-1" style={{ color: '#0F172A' }}>
                {file.name}
              </p>
            </div>
          )}

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              style={{
                backgroundColor: '#F1F5F9',
                borderColor: '#E2E8F0',
                color: '#0F172A',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              className="flex-1"
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
              }}
            >
              Upload Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Message with Try Again Button */}
      {error && (
        <div
          className="mt-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #EF4444',
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: '#EF4444' }}>
                Upload Failed
              </p>
              <p className="text-sm" style={{ color: '#EF4444' }}>
                {error}
              </p>
            </div>
          </div>
          {onTryAgain && (
            <div className="flex gap-2 mt-3">
              <Button
                onClick={onTryAgain}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={onFileRemove}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
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
