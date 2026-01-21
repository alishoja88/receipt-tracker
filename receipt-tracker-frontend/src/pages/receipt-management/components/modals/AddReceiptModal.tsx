import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useCreateReceipt } from '@/modules/receipts/hooks/receipts.mutations';
import { PaymentMethod } from '@/modules/receipts/types/receipt.types';
import { categories } from '../../utils/receiptUtils';

interface AddReceiptModalProps {
  open: boolean;
  onClose: () => void;
}

const paymentMethods = [
  { value: PaymentMethod.CARD, label: 'Credit Card' },
  { value: PaymentMethod.CASH, label: 'Cash' },
  { value: PaymentMethod.OTHER, label: 'Other' },
];

const AddReceiptModal = ({ open, onClose }: AddReceiptModalProps) => {
  const [storeName, setStoreName] = useState('');
  const [receiptDate, setReceiptDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [total, setTotal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  const createMutation = useCreateReceipt();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      return;
    }

    if (total <= 0) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        storeName: storeName.trim(),
        receiptDate,
        total,
        paymentMethod: paymentMethod && paymentMethod.trim() ? paymentMethod : null,
        category: category && category.trim() ? category : null,
      });

      // Reset form
      setStoreName('');
      setReceiptDate(new Date().toISOString().split('T')[0]);
      setTotal(0);
      setPaymentMethod('');
      setCategory('');

      onClose();
    } catch (error) {
      console.error('Error creating receipt:', error);
    }
  };

  const handleCancel = () => {
    setStoreName('');
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setTotal(0);
    setPaymentMethod('');
    setCategory('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Add New Receipt</h2>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="Enter store name"
              className="w-full px-4 py-3 bg-slate-900 border border-green-500 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Date</label>
            <div className="relative">
              <input
                type="date"
                value={receiptDate}
                onChange={e => setReceiptDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                required
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={total || ''}
              onChange={e => setTotal(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Payment Method</label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-900">
                  Select payment method
                </option>
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value} className="bg-slate-900">
                    {method.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-900">
                  Select category
                </option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-slate-900">
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !storeName.trim() || total <= 0}
              className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReceiptModal;
