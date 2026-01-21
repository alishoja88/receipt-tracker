import { CreditCard, DollarSign } from 'lucide-react';

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

export const PaymentMethodsCard = ({ data, dateFrom, dateTo }: PaymentMethodsCardProps) => {
  // Get CARD and CASH data
  const cardData = data.find(item => item.paymentMethod === 'CARD');
  const cashData = data.find(item => item.paymentMethod === 'CASH');
  const otherData = data.find(item => item.paymentMethod === 'OTHER');

  // Calculate totals
  const cardTotal = cardData ? cardData.total : 0;
  const cashTotal = cashData ? cashData.total : 0;
  const otherTotal = otherData ? otherData.total : 0;

  return (
    <div
      className="bg-white rounded-[20px] relative transition-all duration-300 ease-out overflow-hidden group h-full"
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Top gradient bar - appears on hover */}
      <div
        className="absolute top-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          height: '4px',
          background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
        }}
      />

      <style>{`
        .group:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.12);
        }
        .group:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Title */}
      <h3
        className="text-xl font-bold text-slate-800 mb-6 relative"
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#1E293B',
          marginBottom: '24px',
          paddingLeft: '16px',
        }}
      >
        <span
          className="absolute left-0 top-0 bottom-0 w-1 rounded"
          style={{
            width: '4px',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          }}
        />
        Payment Methods
      </h3>

      {/* Payment Method Cards */}
      <div className="space-y-4">
        {/* CARD Payment */}
        <div
          className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
          style={{
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: '#3B82F6',
            }}
          >
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p
              className="text-2xl font-bold text-slate-900"
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0F172A',
              }}
            >
              ${cardTotal.toFixed(2)}
            </p>
            <p
              className="text-sm text-slate-600 mt-1"
              style={{
                fontSize: '14px',
                color: '#475569',
              }}
            >
              CARD
            </p>
          </div>
        </div>

        {/* CASH Payment */}
        <div
          className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
          style={{
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: '#3B82F6',
            }}
          >
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p
              className="text-2xl font-bold text-slate-900"
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0F172A',
              }}
            >
              ${cashTotal.toFixed(2)}
            </p>
            <p
              className="text-sm text-slate-600 mt-1"
              style={{
                fontSize: '14px',
                color: '#475569',
              }}
            >
              CASH
            </p>
          </div>
        </div>

        {/* OTHER Payment (if exists) */}
        {otherTotal > 0 && (
          <div
            className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
            style={{
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: '#3B82F6',
              }}
            >
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p
                className="text-2xl font-bold text-slate-900"
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                ${otherTotal.toFixed(2)}
              </p>
              <p
                className="text-sm text-slate-600 mt-1"
                style={{
                  fontSize: '14px',
                  color: '#475569',
                }}
              >
                OTHER
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="mt-4 text-xs text-slate-400">
          Filters: {dateFrom || 'N/A'} to {dateTo || 'N/A'}
        </div>
      )}
    </div>
  );
};
