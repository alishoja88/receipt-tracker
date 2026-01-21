import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
    isNeutral?: boolean;
  };
  subtitle?: string;
}

const StatCard = ({ title, value, trend, subtitle }: StatCardProps) => {
  // Determine trend display
  const getTrendDisplay = () => {
    if (!trend) return null;

    // If neutral (0% change), show neutral icon
    if (trend.isNeutral) {
      return (
        <div className="flex items-center gap-1 text-slate-400">
          <Minus className="w-4 h-4" />
          <span className="text-sm font-semibold">{trend.value}</span>
        </div>
      );
    }

    // For spending: increase (positive %) = bad = red, decrease (negative %) = good = green
    // isPositive: true means it's a good trend (decrease in spending) = green
    // isPositive: false means it's a bad trend (increase in spending) = red
    if (trend.isPositive) {
      // Good trend: decrease in spending
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-semibold">{trend.value}</span>
        </div>
      );
    } else {
      // Bad trend: increase in spending
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">{trend.value}</span>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {getTrendDisplay()}
      </div>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};

interface AnalyticsStatsProps {
  totalSpent: number;
  transactions: number;
  avgTransaction: number;
  topCategory: {
    name: string;
    amount: number;
  };
  totalSpentTrend?: {
    value: string;
    isPositive: boolean;
    isNeutral?: boolean;
  };
  transactionsTrend?: {
    value: string;
    isPositive: boolean;
    isNeutral?: boolean;
  };
}

export const AnalyticsStats = ({
  totalSpent,
  transactions,
  avgTransaction,
  topCategory,
  totalSpentTrend,
  transactionsTrend,
}: AnalyticsStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* TOTAL SPENT */}
      <StatCard title="TOTAL SPENT" value={`$${totalSpent.toFixed(2)}`} trend={totalSpentTrend} />

      {/* TRANSACTIONS */}
      <StatCard title="TRANSACTIONS" value={transactions.toString()} trend={transactionsTrend} />

      {/* AVG TRANSACTION */}
      <StatCard title="AVG TRANSACTION" value={`$${avgTransaction.toFixed(2)}`} />

      {/* TOP CATEGORY */}
      <StatCard
        title="TOP CATEGORY"
        value={topCategory.name}
        subtitle={`$${topCategory.amount.toFixed(2)}`}
      />
    </div>
  );
};
