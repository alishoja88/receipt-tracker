import { useState } from 'react';
import { CloudUpload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import {
  generateMockReceipt,
  saveDemoReceipt,
  canAddMoreDemoReceipts,
  getRemainingDemoUploads,
} from '@/utils/demoReceipts.util';
import { DemoReceiptList } from './components/DemoReceiptList';

export const DemoSection = () => {
  const { isAuthenticated } = useAuthStore();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect to upload if logged in
  if (isAuthenticated) {
    return null; // Don't show demo section if user is logged in
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file format. Please select JPG, PNG, or PDF.');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB. Please select a smaller file.');
      return;
    }

    // Check limit
    if (!canAddMoreDemoReceipts()) {
      setError(
        `You can only upload ${getRemainingDemoUploads()} more receipt${getRemainingDemoUploads() !== 1 ? 's' : ''} in demo mode. Sign up to upload unlimited receipts!`,
      );
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setSuccess(false);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Generate mock receipt
      const mockReceipt = generateMockReceipt(file.name);

      // Save to localStorage
      const saved = saveDemoReceipt(mockReceipt);

      if (!saved) {
        setError('Failed to save receipt. You may have reached the demo limit.');
        setIsProcessing(false);
        return;
      }

      // Clear file and show success
      setFile(null);
      setSuccess(true);

      // Dispatch custom event to update receipt list
      window.dispatchEvent(new Event('demoReceiptAdded'));

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
  };

  const remainingUploads = getRemainingDemoUploads();

  return (
    <section id="try-it-now" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-[#0F172A]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              Try It Now
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400">
              Upload a sample receipt to see the magic happen (Demo: {remainingUploads} upload
              {remainingUploads !== 1 ? 's' : ''} remaining)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                ×
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-400">
                Receipt processed successfully!{' '}
                {remainingUploads > 0 &&
                  `You can upload ${remainingUploads} more receipt${remainingUploads !== 1 ? 's' : ''}.`}
              </p>
            </div>
          )}

          {/* Upload Area */}
          {!file && !isProcessing && (
            <div
              className={`
                relative
                border-2 border-dashed rounded-2xl
                p-8 sm:p-12 md:p-16 lg:p-20
                text-center
                cursor-pointer
                transition-all duration-300 ease-in-out
                ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-[rgba(59,130,246,0.4)] bg-[rgba(30,41,59,0.3)] hover:border-blue-500 hover:bg-[rgba(59,130,246,0.05)]'
                }
                ${remainingUploads === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => {
                if (remainingUploads > 0) {
                  document.getElementById('file-upload')?.click();
                }
              }}
            >
              {/* Hidden File Input */}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileInputChange}
                disabled={remainingUploads === 0}
              />

              {/* Upload Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
                  <CloudUpload className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-blue-500" />
                </div>
              </div>

              {/* Upload Text */}
              <div className="space-y-2 sm:space-y-3">
                <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                  {remainingUploads === 0
                    ? 'Demo limit reached'
                    : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-400">
                  {remainingUploads === 0
                    ? 'Sign up to upload unlimited receipts!'
                    : 'Supports JPG, PNG, PDF (Max 10MB)'}
                </p>
              </div>

              {/* Drag Overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/5 rounded-2xl flex items-center justify-center">
                  <p className="text-xl sm:text-2xl font-semibold text-blue-400">
                    Drop your receipt here
                  </p>
                </div>
              )}
            </div>
          )}

          {/* File Selected / Processing */}
          {file && (
            <div className="border-2 border-dashed border-blue-500 rounded-2xl p-8 bg-[rgba(30,41,59,0.3)]">
              <div className="text-center space-y-4">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <p className="text-lg font-semibold text-white">Processing receipt...</p>
                    <p className="text-sm text-gray-400">
                      Please wait while we extract and analyze your receipt
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-lg font-semibold text-white">{file.name}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleUpload}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Process Receipt
                      </button>
                      <button
                        onClick={handleRemoveFile}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Demo Receipts List */}
          <DemoReceiptList />
        </div>
      </div>
    </section>
  );
};
