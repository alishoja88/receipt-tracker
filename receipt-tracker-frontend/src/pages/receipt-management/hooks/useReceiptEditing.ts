import { useState } from 'react';
import type { ReceiptListItem } from '@/modules/receipts/types/receipt.types';

export const useReceiptEditing = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<{
    [key: string]: Partial<ReceiptListItem>;
  }>({});

  const hasUnsavedChanges = (receiptId: string, receipts: ReceiptListItem[]): boolean => {
    if (editingId !== receiptId) return false;
    const changes = editedValues[receiptId];
    if (!changes || Object.keys(changes).length === 0) return false;

    const receipt = receipts.find(r => r.id === receiptId);
    if (!receipt) return false;

    return Object.keys(changes).some(key => {
      const newValue = changes[key as keyof typeof changes];
      const oldValue = receipt[key as keyof ReceiptListItem];
      return newValue !== oldValue;
    });
  };

  const handleStartEdit = (receipt: ReceiptListItem) => {
    setEditingId(receipt.id);
    setEditedValues({
      ...editedValues,
      [receipt.id]: {},
    });
  };

  const handleCancelEdit = (receiptId: string) => {
    setEditingId(null);
    const newEditedValues = { ...editedValues };
    delete newEditedValues[receiptId];
    setEditedValues(newEditedValues);
  };

  const handleFieldChange = (receiptId: string, field: string, value: string | number) => {
    setEditedValues({
      ...editedValues,
      [receiptId]: {
        ...editedValues[receiptId],
        [field]: value,
      },
    });
  };

  return {
    editingId,
    editedValues,
    hasUnsavedChanges,
    handleStartEdit,
    handleCancelEdit,
    handleFieldChange,
  };
};
