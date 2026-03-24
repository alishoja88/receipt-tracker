import { TrendingUp, TrendingDown, Minus, DollarSign, Receipt, BarChart3, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TrendData {
  value: string;
  isPositive: boolean;
  isNeutral?: boolean;
}

const TrendBadge = ({ trend, className = '' }: { trend: TrendData; className?: string }) => {
  if (trend.isNeutral) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-slate-600/40 bg-slate-800/50 px-2.5 py-1 ${className}`}
      >
        <Minus className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-400">{trend.value}</span>
      </span>
    );
  }

  if (trend.isPositive) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 ${className}`}
      >
        <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-400">{trend.value}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 ${className}`}
    >
      <TrendingUp className="h-3.5 w-3.5 text-red-400" />
      <span className="text-xs font-semibold text-red-400">{trend.value}</span>
    </span>
  );
};

interface SecondaryStatProps {
  title: string;
  value: string;
  trend?: TrendData;
  subtitle?: string;
  icon: LucideIcon;
}

const SecondaryStatCard = ({ title, value, trend, subtitle, icon: Icon }: SecondaryStatProps) => (
  <div
    className="relative rounded-[22px] border border-white/[0.08] p-5"
    style={{
      background: 'linear-gradient(180deg, rgba(18, 27, 39, 0.92), rgba(12, 19, 30, 0.96))',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}
  >
    <div className="flex items-start justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <Icon className="h-4 w-4 text-slate-600" />
    </div>
    <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    {trend && <TrendBadge trend={trend} className="mt-2" />}
    {subtitle && <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>}
  </div>
);

interface AnalyticsStatsProps {
  totalSpent: number;
  transactions: number;
  avgTransaction: number;
  topCategory: {
    name: string;
    amount: number;
  };
  totalSpentTrend?: TrendData;
  transactionsTrend?: TrendData;
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
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* Hero — Total Spent */}
      <div className="xl:col-span-5">
        <div
          className="relative h-full overflow-hidden rounded-[28px] border border-white/[0.08] p-6 md:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(18, 27, 39, 0.95), rgba(12, 19, 30, 0.98))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Accent left edge */}
          <div
            className="absolute bottom-0 left-0 top-0 w-1 rounded-l-[28px]"
            style={{ background: 'linear-gradient(180deg, #2dd4bf, #14b8a6)' }}
          />

          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/80">
              Total Spent
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10">
              <DollarSign className="h-5 w-5 text-teal-400" />
            </div>
          </div>

          <p className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            ${totalSpent.toFixed(2)}
          </p>

          {totalSpentTrend && <TrendBadge trend={totalSpentTrend} className="mt-3" />}

          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Your tracked spending for the selected period.
          </p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 xl:col-span-7">
        <SecondaryStatCard
          title="Transactions"
          value={transactions.toString()}
          trend={transactionsTrend}
          icon={Receipt}
        />
        <SecondaryStatCard
          title="Avg Transaction"
          value={`$${avgTransaction.toFixed(2)}`}
          icon={BarChart3}
        />
        <SecondaryStatCard
          title="Top Category"
          value={topCategory.name}
          subtitle={`$${topCategory.amount.toFixed(2)}`}
          icon={Tag}
        />
      </div>
    </section>
  );
};
