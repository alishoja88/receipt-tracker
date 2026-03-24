import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

export const SpendingByCategoryChart = ({ data }: SpendingByCategoryChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
          <p className="text-sm font-semibold text-slate-100">
            {d.name}: ${d.value.toFixed(2)} ({d.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const sortedLegend = [...data].sort((a, b) => b.percentage - a.percentage);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const outerRadius = 100;
  const innerRadius = outerRadius * 0.6;

  return (
    <div className="flex flex-col items-start gap-6 lg:flex-row">
      {/* Donut chart with center label */}
      <div className="relative w-full flex-1">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              dataKey="value"
              isAnimationActive
              animationDuration={800}
              stroke="rgba(14, 21, 32, 0.9)"
              strokeWidth={3}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex !== null && activeIndex !== index ? 0.45 : 1}
                  style={{ cursor: 'pointer', transition: 'opacity 200ms ease' }}
                />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-100">
              ${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500">tracked total</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-2.5 lg:w-auto lg:min-w-[180px]">
        {sortedLegend.map((d, i) => (
          <div
            key={`legend-${i}`}
            className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-white/[0.015] px-3.5 py-2"
          >
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-sm font-medium text-slate-300">{d.name}</span>
            <span className="ml-auto text-sm font-semibold tabular-nums text-slate-100">
              {d.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
