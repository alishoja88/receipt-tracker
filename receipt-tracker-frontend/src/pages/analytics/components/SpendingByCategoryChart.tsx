import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap } from 'lucide-react';

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface SpendingByCategoryChartProps {
  data: CategoryData[];
  dateFrom?: string;
  dateTo?: string;
  selectedCategories?: string[];
}

export const SpendingByCategoryChart = ({
  data,
  dateFrom,
  dateTo,
  selectedCategories,
}: SpendingByCategoryChartProps) => {
  const [isAnimated, setIsAnimated] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Format tooltip - Single line format: "Category: $Amount (Percentage%)"
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
          <p className="text-slate-100 font-semibold" style={{ color: '#F1F5F9' }}>
            {dataPoint.name}: ${dataPoint.value.toFixed(2)} ({dataPoint.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Sort data by percentage (descending) for legend display
  const sortedDataForLegend = [...data].sort((a, b) => b.percentage - a.percentage);

  // Format legend - Right side with color indicators and percentages (sorted by percentage)
  const renderLegend = () => {
    return (
      <div className="flex flex-col gap-2">
        {sortedDataForLegend.map((dataPoint, index: number) => {
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: dataPoint.color,
                  width: '12px',
                  height: '12px',
                }}
              />
              <span
                className="text-sm text-slate-700 font-semibold"
                style={{
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {dataPoint.name}
              </span>
              <span
                className="text-xs text-slate-500 ml-auto"
                style={{
                  color: '#64748B',
                  fontSize: '12px',
                }}
              >
                ({dataPoint.percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate outer and inner radius for 60% cutout
  // When segment is hovered, increase outer radius by 15px (hover offset)
  const baseOuterRadius = 100;
  const hoverOffset = 15;
  const innerRadius = baseOuterRadius * 0.6; // 60% cutout

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

      {/* Hover effect - card lifts up */}
      <style>{`
        .group:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.12);
        }
        .group:hover::before {
          opacity: 1;
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

      {/* Chart Title with gradient left border */}
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
        Spending by Category
      </h3>

      {/* Chart */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Donut Chart - Visible on all screen sizes */}
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={(entry: any) => {
                  const index = data.findIndex(
                    d => d.name === entry.name || d.value === entry.value,
                  );
                  return activeIndex === index ? baseOuterRadius + hoverOffset : baseOuterRadius;
                }}
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={isAnimated}
                animationDuration={1000}
                animationBegin={0}
                paddingAngle={0}
                stroke="#FFFFFF"
                strokeWidth={4}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend - Always visible, full width on mobile/tablet, right side on desktop (sorted by percentage) */}
        <div className="w-full lg:w-auto lg:min-w-[220px]">{renderLegend()}</div>
      </div>

      {import.meta.env.DEV && (
        <div className="mt-4 text-xs text-slate-400">
          Filters: {dateFrom || 'N/A'} to {dateTo || 'N/A'} | Categories:{' '}
          {selectedCategories?.length || 'All'}
        </div>
      )}
    </div>
  );
};
