import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { ReceiptListItem } from '@/modules/receipts/types/receipt.types';
import { getDemoReceipts, deleteDemoReceipt } from '@/utils/demoReceipts.util';
import { formatDate } from '@/utils/date.util';
import { getCategoryLabel } from '@/pages/receipt-management/utils/receiptUtils';
import { PaymentMethod } from '@/modules/receipts/types/receipt.types';

export const DemoReceiptList = () => {
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);

  useEffect(() => {
    // Load receipts from localStorage
    setReceipts(getDemoReceipts());
  }, []);

  // Listen for storage changes (when new receipt is added)
  useEffect(() => {
    const handleStorageChange = () => {
      setReceipts(getDemoReceipts());
    };

    // Listen for custom event when receipt is added
    window.addEventListener('demoReceiptAdded', handleStorageChange);

    return () => {
      window.removeEventListener('demoReceiptAdded', handleStorageChange);
    };
  }, []);

  const handleDelete = (id: string) => {
    deleteDemoReceipt(id);
    setReceipts(getDemoReceipts());
  };

  if (receipts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-white mb-6">
        Your Demo Receipts ({receipts.length}/2)
      </h3>

      <div className="space-y-4">
        {receipts.map(receipt => (
          <div
            key={receipt.id}
            className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 hover:bg-slate-800/80 hover:border-slate-600/90 transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Receipt Info */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Store */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    STORE
                  </p>
                  <p className="text-base font-bold text-white">{receipt.storeName}</p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    DATE
                  </p>
                  <p className="text-sm font-semibold text-slate-200">
                    {formatDate(receipt.receiptDate, 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    AMOUNT
                  </p>
                  <p className="text-lg font-extrabold text-blue-500">
                    ${(receipt.total || 0).toFixed(2)}
                  </p>
                </div>

                {/* Category & Payment */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    DETAILS
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {receipt.category && (
                      <span className="inline-block px-3 py-1 text-xs font-bold rounded-xl text-blue-200 bg-blue-500/20 border border-blue-500/40">
                        {getCategoryLabel(receipt.category)}
                      </span>
                    )}
                    {receipt.paymentMethod && (
                      <span className="inline-block px-3 py-1 text-xs font-bold rounded-xl text-lime-200 bg-lime-500/15 border border-lime-500/30">
                        {receipt.paymentMethod === PaymentMethod.CARD
                          ? 'Card'
                          : receipt.paymentMethod === PaymentMethod.CASH
                            ? 'Cash'
                            : receipt.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <div className="flex items-center">
                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 text-red-200 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 hover:border-red-500/50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
