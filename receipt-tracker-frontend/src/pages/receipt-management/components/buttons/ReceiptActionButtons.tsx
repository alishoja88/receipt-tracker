import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { ReceiptListItem } from '@/modules/receipts/types/receipt.types';

interface ReceiptActionButtonsProps {
  receipt: ReceiptListItem;
  isEditing: boolean;
  hasChanges: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ReceiptEditButton = ({
  receipt,
  isEditing,
  isLoading,
  onEdit,
}: Pick<ReceiptActionButtonsProps, 'receipt' | 'isEditing' | 'isLoading' | 'onEdit'>) => {
  if (isEditing) {
    return null;
  }

  return (
    <button
      onClick={onEdit}
      disabled={isLoading}
      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-[10px] text-sm font-semibold flex items-center justify-center gap-1.5 transition-all hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-lg shadow-md disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Pencil className="w-4 h-4" />
      <span>Edit</span>
    </button>
  );
};

export const ReceiptDeleteButton = ({
  onDelete,
  isLoading,
}: Pick<ReceiptActionButtonsProps, 'onDelete' | 'isLoading'>) => {
  return (
    <button
      onClick={onDelete}
      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-[10px] text-sm font-semibold flex items-center justify-center gap-1.5 transition-all hover:from-red-600 hover:to-red-700 hover:-translate-y-0.5 hover:shadow-lg shadow-md disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0 whitespace-nowrap"
    >
      <Trash2 className="w-4 h-4" />
      <span>Delete</span>
    </button>
  );
};

export const ReceiptSaveCancelButtons = ({
  hasChanges,
  isLoading,
  onSave,
  onCancel,
}: Pick<ReceiptActionButtonsProps, 'hasChanges' | 'isLoading' | 'onSave' | 'onCancel'>) => {
  return (
    <>
      <style>{`
        .save-cancel-buttons-container {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
        }
        @media (min-width: 1024px) {
          .save-cancel-buttons-container {
            width: 50% !important;
            margin-left: auto !important;
          }
        }
      `}</style>
      <div className="save-cancel-buttons-container mt-4 pt-4 border-t border-slate-200/50 w-full gap-3">
        <button
          onClick={onSave}
          disabled={isLoading || !hasChanges}
          className={`
            flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold 
            transition-all whitespace-nowrap
            ${
              hasChanges
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60'
                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md cursor-not-allowed'
            }
          `}
        >
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Save</span>
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-300 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </>
  );
};
