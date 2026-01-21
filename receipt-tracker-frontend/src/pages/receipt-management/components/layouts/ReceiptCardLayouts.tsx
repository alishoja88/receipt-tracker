import type { ReceiptListItem } from '@/modules/receipts/types/receipt.types';
import { ReceiptEditableField } from '../fields/ReceiptEditableField';
import { ReceiptEditableSelect } from '../fields/ReceiptEditableSelect';
import {
  ReceiptEditButton,
  ReceiptDeleteButton,
  ReceiptSaveCancelButtons,
} from '../buttons/ReceiptActionButtons';

interface ReceiptCardLayoutsProps {
  receipt: ReceiptListItem;
  isEditing: boolean;
  hasChanges: boolean;
  isLoading: boolean;
  editingId: string | null;
  editedValues: { [key: string]: Partial<ReceiptListItem> };
  getFieldValue: (
    receipt: ReceiptListItem,
    field: 'storeName' | 'receiptDate' | 'total' | 'paymentMethod' | 'category',
  ) => string | number | null;
  onFieldChange: (receiptId: string, field: string, value: string | number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ReceiptCardMobile = ({
  receipt,
  isEditing,
  hasChanges,
  isLoading,
  getFieldValue,
  onFieldChange,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: ReceiptCardLayoutsProps) => {
  return (
    <div className="sm:hidden space-y-4">
      {/* Top Row: Store Name and Amount */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200/50">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-slate-400">
            Store Name
          </p>
          <ReceiptEditableField
            receipt={receipt}
            field="storeName"
            isEditing={isEditing}
            value={getFieldValue(receipt, 'storeName') as string}
            onFieldChange={onFieldChange}
            className="text-base font-semibold break-words text-slate-800"
          />
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-slate-400">
            Amount
          </p>
          <ReceiptEditableField
            receipt={receipt}
            field="total"
            isEditing={isEditing}
            value={getFieldValue(receipt, 'total') as number}
            onFieldChange={onFieldChange}
            className="text-lg font-bold text-blue-600"
          />
        </div>
      </div>

      {/* Middle Row: Date and Payment */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200/50">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-slate-400">Date</p>
          <ReceiptEditableField
            receipt={receipt}
            field="receiptDate"
            isEditing={isEditing}
            value={getFieldValue(receipt, 'receiptDate') as string}
            onFieldChange={onFieldChange}
            className="text-sm font-semibold text-slate-800"
          />
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-slate-400">
            Payment
          </p>
          <ReceiptEditableSelect
            receipt={receipt}
            type="paymentMethod"
            isEditing={isEditing}
            value={getFieldValue(receipt, 'paymentMethod') as string | null}
            onFieldChange={onFieldChange}
            className="text-sm font-semibold text-slate-800"
          />
        </div>
      </div>

      {/* Bottom Row: Category and Actions */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-400">
            Category
          </p>
          <ReceiptEditableSelect
            receipt={receipt}
            type="category"
            isEditing={isEditing}
            value={getFieldValue(receipt, 'category') as string | null}
            onFieldChange={onFieldChange}
          />
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <ReceiptEditButton
              receipt={receipt}
              isEditing={isEditing}
              isLoading={isLoading}
              onEdit={onEdit}
            />
            <ReceiptDeleteButton onDelete={onDelete} isLoading={isLoading} />
          </div>
        )}
      </div>

      {/* Save/Cancel Buttons for Mobile */}
      {isEditing && (
        <ReceiptSaveCancelButtons
          hasChanges={hasChanges}
          isLoading={isLoading}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export const ReceiptCardTablet = ({
  receipt,
  isEditing,
  hasChanges,
  isLoading,
  getFieldValue,
  onFieldChange,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: ReceiptCardLayoutsProps) => {
  return (
    <div className="hidden sm:block md:hidden">
      <div className="grid grid-cols-3 gap-4">
        {/* Left Column: Store Name and Payment */}
        <div className="space-y-4 min-w-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-slate-400">
              Store Name
            </p>
            <ReceiptEditableField
              receipt={receipt}
              field="storeName"
              isEditing={isEditing}
              value={getFieldValue(receipt, 'storeName') as string}
              onFieldChange={onFieldChange}
              className="text-base font-semibold break-words text-slate-800"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-slate-400">
              Payment
            </p>
            <ReceiptEditableSelect
              receipt={receipt}
              type="paymentMethod"
              isEditing={isEditing}
              value={getFieldValue(receipt, 'paymentMethod') as string | null}
              onFieldChange={onFieldChange}
              className="text-sm font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Middle Column: Date and Category */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-slate-400">
              Date
            </p>
            <ReceiptEditableField
              receipt={receipt}
              field="receiptDate"
              isEditing={isEditing}
              value={getFieldValue(receipt, 'receiptDate') as string}
              onFieldChange={onFieldChange}
              className="text-base font-semibold text-slate-800"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-400">
              Category
            </p>
            <ReceiptEditableSelect
              receipt={receipt}
              type="category"
              isEditing={isEditing}
              value={getFieldValue(receipt, 'category') as string | null}
              onFieldChange={onFieldChange}
            />
          </div>
        </div>

        {/* Right Column: Amount and Actions */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-slate-400">
              Amount
            </p>
            <ReceiptEditableField
              receipt={receipt}
              field="total"
              isEditing={isEditing}
              value={getFieldValue(receipt, 'total') as number}
              onFieldChange={onFieldChange}
              className="text-lg font-bold text-blue-600"
            />
          </div>
          {!isEditing && (
            <div className="flex flex-col gap-2">
              <ReceiptEditButton
                receipt={receipt}
                isEditing={isEditing}
                isLoading={isLoading}
                onEdit={onEdit}
              />
              <ReceiptDeleteButton onDelete={onDelete} isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>

      {/* Save/Cancel Buttons for Tablet */}
      {isEditing && (
        <ReceiptSaveCancelButtons
          hasChanges={hasChanges}
          isLoading={isLoading}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export const ReceiptCardDesktop = ({
  receipt,
  isEditing,
  hasChanges,
  isLoading,
  getFieldValue,
  onFieldChange,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: ReceiptCardLayoutsProps) => {
  return (
    <div className="hidden md:grid md:grid-cols-12 gap-6 items-center">
      {/* Store Name */}
      <div className="md:col-span-3 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-400">
          Store Name
        </p>
        <ReceiptEditableField
          receipt={receipt}
          field="storeName"
          isEditing={isEditing}
          value={getFieldValue(receipt, 'storeName') as string}
          onFieldChange={onFieldChange}
          className="text-base font-semibold break-words text-slate-800 max-w-full"
        />
      </div>

      {/* Date */}
      <div className="md:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-400">Date</p>
        <ReceiptEditableField
          receipt={receipt}
          field="receiptDate"
          isEditing={isEditing}
          value={getFieldValue(receipt, 'receiptDate') as string}
          onFieldChange={onFieldChange}
          className="text-base font-semibold text-slate-800"
        />
      </div>

      {/* Amount */}
      <div className="md:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-400">
          Amount
        </p>
        <ReceiptEditableField
          receipt={receipt}
          field="total"
          isEditing={isEditing}
          value={getFieldValue(receipt, 'total') as number}
          onFieldChange={onFieldChange}
          className="text-base font-semibold text-blue-600"
        />
      </div>

      {/* Payment Method */}
      <div className="md:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-400">
          Payment
        </p>
        <ReceiptEditableSelect
          receipt={receipt}
          type="paymentMethod"
          isEditing={isEditing}
          value={getFieldValue(receipt, 'paymentMethod') as string | null}
          onFieldChange={onFieldChange}
          className="text-base font-semibold text-slate-800"
        />
      </div>

      {/* Category Badge */}
      <div className="md:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 md:mb-2 text-slate-400">
          Category
        </p>
        <ReceiptEditableSelect
          receipt={receipt}
          type="category"
          isEditing={isEditing}
          value={getFieldValue(receipt, 'category') as string | null}
          onFieldChange={onFieldChange}
        />
      </div>

      {/* Action Buttons */}
      {!isEditing && (
        <div className="md:col-span-1 flex flex-row gap-2 items-start justify-end pt-7">
          <ReceiptEditButton
            receipt={receipt}
            isEditing={isEditing}
            isLoading={isLoading}
            onEdit={onEdit}
          />
          <ReceiptDeleteButton onDelete={onDelete} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};
