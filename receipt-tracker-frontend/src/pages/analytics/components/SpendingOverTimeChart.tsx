import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export const SpendingOverTimeChart = ({ data }: SpendingOverTimeChartProps) => {
  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const dataPoint = payload[0]?.payload || {};
    const amount = payload[0]?.value ?? dataPoint.amount ?? 0;
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    const storeName = dataPoint?.storeName || 'Unknown Store';
    const formattedDate = dataPoint?.formattedDate || dataPoint?.date || label || '';

    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
        {dataPoint?.storeName ? (
          <>
            <p className="text-sm font-semibold text-slate-100">{storeName}</p>
            <p className="text-xs text-slate-400">{formattedDate}</p>
            <p className="mt-1 text-sm font-semibold text-teal-400">${numericAmount.toFixed(2)}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-100">{formattedDate}</p>
            <p className="mt-0.5 text-sm font-semibold text-teal-400">
              ${numericAmount.toFixed(2)}
            </p>
          </>
        )}
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 60 }}>
        <defs>
          <linearGradient id="barGradientTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
        <XAxis
          dataKey="formattedDate"
          stroke="transparent"
          tick={{ fill: '#64748b', fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={70}
          tickLine={false}
        />
        <YAxis
          stroke="transparent"
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={value => `$${value}`}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={customTooltip}
          cursor={{ fill: 'rgba(20, 184, 166, 0.06)' }}
          wrapperStyle={{ zIndex: 50 }}
        />
        <Bar
          dataKey="amount"
          fill="url(#barGradientTeal)"
          radius={[6, 6, 0, 0]}
          isAnimationActive
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
