import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap } from 'lucide-react';

interface SpendingDataPoint {
  date: string;
  amount: number;
  formattedDate: string;
  storeName?: string;
}

interface SpendingOverTimeChartProps {
  data: SpendingDataPoint[];
  dateFrom?: string;
  dateTo?: string;
  selectedCategories?: string[];
}

export const SpendingOverTimeChart = ({
  data,
  dateFrom,
  dateTo,
  selectedCategories,
}: SpendingOverTimeChartProps) => {
  const [isAnimated, setIsAnimated] = useState(true);

  // Debug: Log data when it changes
  if (import.meta.env.DEV && data && data.length > 0) {
    console.log('📊 SpendingOverTimeChart data:', data.slice(0, 3));
  }

  // Format tooltip
  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const dataPoint = payload[0]?.payload || {};

    // Try multiple ways to get the amount value
    let amount = 0;
    if (payload[0]?.value !== undefined && payload[0].value !== null) {
      amount = payload[0].value;
    } else if (dataPoint.amount !== undefined && dataPoint.amount !== null) {
      amount = dataPoint.amount;
    } else if (payload[0]?.payload?.amount !== undefined && payload[0].payload.amount !== null) {
      amount = payload[0].payload.amount;
    }

    // Ensure amount is a number
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

    // Check if this is an individual receipt (has storeName) or aggregated data
    const isIndividualReceipt = dataPoint?.storeName;
    const storeName = dataPoint?.storeName || 'Unknown Store';
    const formattedDate = dataPoint?.formattedDate || dataPoint?.date || label || '';

    return (
      <div
        className="bg-slate-800 border border-blue-400/30 rounded-lg p-3 shadow-lg"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          borderWidth: '1px',
          padding: '12px',
          borderRadius: '8px',
          zIndex: 1000,
        }}
      >
        {isIndividualReceipt ? (
          <>
            <p className="text-slate-100 font-semibold mb-1" style={{ color: '#F1F5F9' }}>
              {storeName}
            </p>
            <p className="text-slate-400 text-xs mb-1" style={{ color: '#94A3B8' }}>
              {formattedDate}
            </p>
            <p className="text-blue-400 text-sm font-semibold" style={{ color: '#60A5FA' }}>
              ${numericAmount.toFixed(2)}
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-100 font-semibold mb-1" style={{ color: '#F1F5F9' }}>
              {formattedDate}
            </p>
            <p className="text-blue-400 text-sm font-semibold" style={{ color: '#60A5FA' }}>
              ${numericAmount.toFixed(2)}
            </p>
          </>
        )}
      </div>
    );
  };

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

      {/* Hover effect */}
      <style>{`
        .group:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.12);
        }
      `}</style>

      {/* Animated Button */}
      <button
        onClick={() => setIsAnimated(!isAnimated)}
        className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all z-10 ${
          isAnimated
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        <Zap className="w-3 h-3" />
        Animated
      </button>

      {/* Chart Title */}
      <h3
        className="text-xl font-bold text-slate-800 mb-6 pr-24 relative"
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
        Spending Over Time
      </h3>

      {/* Chart */}
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(226, 232, 240, 0.5)"
              vertical={false}
            />

            <XAxis
              dataKey="formattedDate"
              stroke="#718096"
              tick={{ fill: '#718096', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />

            <YAxis
              stroke="#718096"
              tick={{ fill: '#718096', fontSize: 12 }}
              tickFormatter={value => `$${value}`}
            />

            <Tooltip
              content={customTooltip}
              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
              wrapperStyle={{ zIndex: 1000 }}
              formatter={(value: any) =>
                `$${typeof value === 'number' ? value.toFixed(2) : '0.00'}`
              }
              labelFormatter={(label: any) => label || ''}
            />

            <Bar
              dataKey="amount"
              fill="rgba(99, 102, 241, 0.8)"
              radius={[8, 8, 0, 0]}
              isAnimationActive={isAnimated}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-slate-400">
          No data available
        </div>
      )}

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="mt-4 text-xs text-slate-400">
          Filters: {dateFrom || 'N/A'} to {dateTo || 'N/A'} | Categories:{' '}
          {selectedCategories?.length || 'All'} | Data points: {data.length}
        </div>
      )}
    </div>
  );
};
