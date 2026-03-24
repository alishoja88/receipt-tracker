import { CreditCard, DollarSign, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PaymentMethodData {
  paymentMethod: string;
  total: number;
  receiptsCount: number;
  percentage: number;
}

interface PaymentMethodsCardProps {
  data: PaymentMethodData[];
  dateFrom?: string;
  dateTo?: string;
}

const methodMeta: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  CARD: { icon: CreditCard, color: '#60a5fa', label: 'Card' },
  CASH: { icon: DollarSign, color: '#2dd4bf', label: 'Cash' },
  OTHER: { icon: Wallet, color: '#a78bfa', label: 'Other' },
};

export const PaymentMethodsCard = ({ data }: PaymentMethodsCardProps) => {
  const grandTotal = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {data.map(item => {
        const meta = methodMeta[item.paymentMethod] || methodMeta.OTHER;
        const Icon = meta.icon;
        const pct = grandTotal > 0 ? ((item.total / grandTotal) * 100).toFixed(0) : '0';

        return (
          <div
            key={item.paymentMethod}
            className="flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.015] p-4 transition-colors duration-200 hover:border-white/[0.10]"
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${meta.color}18` }}
            >
              <Icon className="h-5 w-5" style={{ color: meta.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-300">{meta.label}</p>
              <p className="text-xs text-slate-500">${item.total.toFixed(2)}</p>
            </div>
            <p className="text-xl font-bold tabular-nums text-slate-100">{pct}%</p>
          </div>
        );
      })}
    </div>
  );
};
