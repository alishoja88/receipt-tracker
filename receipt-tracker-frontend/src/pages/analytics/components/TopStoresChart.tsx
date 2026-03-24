import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StoreData {
  storeName: string;
  total: number;
  receiptsCount: number;
  percentage: number;
}

interface TopStoresChartProps {
  data: StoreData[];
  dateFrom?: string;
  dateTo?: string;
}

const barColors = ['#2dd4bf', '#60a5fa', '#f59e0b', '#a78bfa', '#ec4899', '#34d399'];

export const TopStoresChart = ({ data }: TopStoresChartProps) => {
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
          <p className="text-sm font-semibold text-slate-100">{d.storeName}</p>
          <p className="text-sm text-teal-400">${d.total.toFixed(2)}</p>
          <p className="text-xs text-slate-400">
            {d.receiptsCount} receipt{d.receiptsCount !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const sorted = [...data].sort((a, b) => b.total - a.total).slice(0, 6);

  if (sorted.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
        No store data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(148, 163, 184, 0.08)"
          horizontal={false}
        />
        <XAxis
          type="number"
          stroke="transparent"
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={v => `$${v}`}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="storeName"
          stroke="transparent"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip content={customTooltip} cursor={{ fill: 'rgba(20, 184, 166, 0.06)' }} />
        <Bar dataKey="total" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={800}>
          {sorted.map((_, i) => (
            <Cell key={`cell-${i}`} fill={barColors[i % barColors.length]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
