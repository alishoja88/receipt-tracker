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

// Colors for bars (matching the image)
const barColors = [
  '#8b5cf6', // Purple
  '#a78bfa', // Light purple
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Green
  '#F59E0B', // Orange
];

export const TopStoresChart = ({ data, dateFrom, dateTo }: TopStoresChartProps) => {
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div
          className="bg-slate-800 border border-blue-400/30 rounded-lg p-3 shadow-lg"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            borderWidth: '1px',
            padding: '12px',
            borderRadius: '8px',
          }}
        >
          <p className="text-slate-100 font-semibold mb-1" style={{ color: '#F1F5F9' }}>
            {dataPoint.storeName}
          </p>
          <p className="text-blue-400 text-sm" style={{ color: '#CBD5E1' }}>
            ${dataPoint.total.toFixed(2)}
          </p>
          <p className="text-slate-400 text-xs" style={{ color: '#94A3B8' }}>
            {dataPoint.receiptsCount} receipt{dataPoint.receiptsCount !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  // Sort data by total (descending) and limit to top 6
  const sortedData = [...data].sort((a, b) => b.total - a.total).slice(0, 6);

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
        Top Stores
      </h3>

      {/* Chart */}
      {sortedData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(226, 232, 240, 0.5)"
              horizontal={false}
            />

            <XAxis
              type="number"
              stroke="#718096"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#718096',
              }}
              tick={{ fill: '#718096' }}
              tickFormatter={value => `$${value}`}
            />

            <YAxis
              type="category"
              dataKey="storeName"
              stroke="#718096"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#718096',
              }}
              tick={{ fill: '#718096' }}
              width={90}
            />

            <Tooltip content={customTooltip} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />

            <Bar
              dataKey="total"
              radius={[0, 8, 8, 0]}
              isAnimationActive={true}
              animationDuration={800}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-slate-500">No store data available</p>
        </div>
      )}

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="mt-4 text-xs text-slate-400">
          Filters: {dateFrom || 'N/A'} to {dateTo || 'N/A'} | Stores: {sortedData.length}
        </div>
      )}
    </div>
  );
};
