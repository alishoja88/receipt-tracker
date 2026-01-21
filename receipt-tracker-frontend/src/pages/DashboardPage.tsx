import { useState, useMemo } from 'react';
import { AnalyticsStats } from './analytics/components/AnalyticsStats';
import { DashboardFilters } from './analytics/components/DashboardFilters';
import { SpendingOverTimeChart } from './analytics/components/SpendingOverTimeChart';
import { SpendingByCategoryChart } from './analytics/components/SpendingByCategoryChart';
import { categories } from './receipt-management/utils/receiptUtils';
import {
  useExpensesSummary,
  useDailyExpenses,
  useExpensesByCategory,
  useExpensesByStore,
  useExpensesByPaymentMethod,
} from '@/modules/expenses/hooks/expenses.queries';
import { useReceipts } from '@/modules/receipts/hooks/receipts.queries';
import { TopStoresChart } from './analytics/components/TopStoresChart';
import { PaymentMethodsCard } from './analytics/components/PaymentMethodsCard';
import { parseLocalDate } from '@/utils/date.util';

type TimePeriodPreset = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

interface DashboardFiltersState {
  preset: TimePeriodPreset;
  dateFrom: string;
  dateTo: string;
  selectedCategories: string[];
}

const DashboardPage = () => {
  const getInitialDates = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      from: monthStart.toISOString().split('T')[0],
      to: monthEnd.toISOString().split('T')[0],
    };
  };

  const initialDates = getInitialDates();

  const [filters, setFilters] = useState<DashboardFiltersState>({
    preset: 'thisMonth',
    dateFrom: initialDates.from,
    dateTo: initialDates.to,
    selectedCategories: categories.map(cat => cat.value),
  });

  // Fetch data from API - pass categories filter to all queries
  const { data: summaryData, isLoading: summaryLoading } = useExpensesSummary({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    categories:
      filters.selectedCategories.length < categories.length
        ? filters.selectedCategories
        : undefined,
  });

  const { data: dailyExpenses, isLoading: dailyLoading } = useDailyExpenses({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    categories:
      filters.selectedCategories.length < categories.length
        ? filters.selectedCategories
        : undefined,
  });

  // Fetch receipts for individual display when date range is short
  const { data: receiptsData } = useReceipts({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    limit: 10000,
  });

  const { data: categoryExpenses, isLoading: categoryLoading } = useExpensesByCategory({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    categories:
      filters.selectedCategories.length < categories.length
        ? filters.selectedCategories
        : undefined,
  });

  const { data: storeExpenses, isLoading: storeLoading } = useExpensesByStore({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    limit: 6,
    categories:
      filters.selectedCategories.length < categories.length
        ? filters.selectedCategories
        : undefined,
  });

  const { data: paymentMethodExpenses, isLoading: paymentMethodLoading } =
    useExpensesByPaymentMethod({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      categories:
        filters.selectedCategories.length < categories.length
          ? filters.selectedCategories
          : undefined,
    });

  // Transform API data for stats cards
  const statsData = useMemo(() => {
    if (!summaryData) {
      return {
        totalSpent: 0,
        transactions: 0,
        avgTransaction: 0,
        topCategory: {
          name: 'N/A',
          amount: 0,
        },
        totalSpentTrend: {
          value: '0%',
          isPositive: true,
        },
        transactionsTrend: {
          value: '0',
          isPositive: true,
        },
      };
    }

    // Ensure all values are numbers (handle null/undefined/string)
    const totalSpent =
      typeof summaryData.totalSpent === 'number'
        ? summaryData.totalSpent
        : parseFloat(summaryData.totalSpent) || 0;

    const totalReceipts =
      typeof summaryData.totalReceipts === 'number'
        ? summaryData.totalReceipts
        : parseInt(summaryData.totalReceipts) || 0;

    const avgPerReceipt =
      typeof summaryData.avgPerReceipt === 'number'
        ? summaryData.avgPerReceipt
        : parseFloat(summaryData.avgPerReceipt) || 0;

    const changePercentage =
      typeof summaryData.trends?.changePercentage === 'number'
        ? summaryData.trends.changePercentage
        : parseFloat(summaryData.trends?.changePercentage) || 0;

    const change =
      typeof summaryData.trends?.change === 'number'
        ? summaryData.trends.change
        : parseFloat(summaryData.trends?.change) || 0;

    // Calculate top category from categoryExpenses data (more accurate with filters)
    let topCategory = {
      name: 'N/A',
      amount: 0,
    };

    if (categoryExpenses && categoryExpenses.items && categoryExpenses.items.length > 0) {
      // Find the category with the highest total
      const sortedCategories = [...categoryExpenses.items].sort((a, b) => {
        const totalA = typeof a.total === 'number' ? a.total : parseFloat(a.total) || 0;
        const totalB = typeof b.total === 'number' ? b.total : parseFloat(b.total) || 0;
        return totalB - totalA;
      });

      const topCat = sortedCategories[0];
      if (topCat) {
        const topCatTotal =
          typeof topCat.total === 'number' ? topCat.total : parseFloat(topCat.total) || 0;
        topCategory = {
          name: topCat.categoryName || 'N/A',
          amount: topCatTotal,
        };
      }
    } else if (summaryData.topCategory) {
      // Fallback to summaryData if categoryExpenses is not available
      const topCategoryTotal = summaryData.topCategory.total
        ? typeof summaryData.topCategory.total === 'number'
          ? summaryData.topCategory.total
          : parseFloat(summaryData.topCategory.total) || 0
        : 0;
      topCategory = {
        name: summaryData.topCategory.name || 'N/A',
        amount: topCategoryTotal,
      };
    }

    // For spending trends:
    // - Increase (positive %) = bad = red (isPositive: false)
    // - Decrease (negative %) = good = green (isPositive: true)
    // - No change (0%) = neutral
    const totalSpentTrendValue =
      Math.abs(changePercentage) < 0.01
        ? '0.0%'
        : `${changePercentage >= 0 ? '+' : ''}${changePercentage.toFixed(1)}%`;

    const totalSpentTrend =
      Math.abs(changePercentage) < 0.01
        ? {
            value: totalSpentTrendValue,
            isPositive: false,
            isNeutral: true,
          }
        : {
            value: totalSpentTrendValue,
            isPositive: changePercentage < 0, // Negative change (decrease) is good
          };

    // For transactions: increase is generally good
    const transactionsTrendValue =
      change === 0 ? '0' : `${change >= 0 ? '+' : ''}${Math.abs(change).toFixed(0)}`;

    const transactionsTrend =
      change === 0
        ? {
            value: transactionsTrendValue,
            isPositive: false,
            isNeutral: true,
          }
        : {
            value: transactionsTrendValue,
            isPositive: change >= 0, // Increase in transactions is good
          };

    return {
      totalSpent,
      transactions: totalReceipts,
      avgTransaction: avgPerReceipt,
      topCategory,
      totalSpentTrend,
      transactionsTrend,
    };
  }, [summaryData, categoryExpenses]);

  // Transform daily expenses for chart
  // If date range is more than 90 days (3 months), group by month instead of day
  // If date range is 7 days or less, show individual receipts instead of aggregated daily totals
  // This prevents the chart from being too cluttered with many receipts
  const spendingOverTimeData = useMemo(() => {
    // Calculate date range
    const dateFrom = filters.dateFrom ? parseLocalDate(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? parseLocalDate(filters.dateTo) : null;
    const daysDiff =
      dateFrom && dateTo
        ? Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 0;

    // If 7 days or less, show individual receipts
    if (daysDiff <= 7 && receiptsData?.items) {
      let receipts = receiptsData.items;

      // Filter by categories if specified
      if (filters.selectedCategories.length < categories.length) {
        receipts = receipts.filter(
          (receipt: any) =>
            receipt.category && filters.selectedCategories.includes(receipt.category.toUpperCase()),
        );
      }

      return receipts
        .map((receipt: any, index: number) => {
          const date = receipt.receiptDate ? parseLocalDate(receipt.receiptDate) : new Date();
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          // Ensure amount is a number
          const amount =
            typeof receipt.total === 'number' ? receipt.total : parseFloat(receipt.total) || 0;

          const storeName = receipt.storeName || 'Unknown Store';
          const dateKey = receipt.receiptDate
            ? receipt.receiptDate.split('T')[0]
            : date.toISOString().split('T')[0];

          return {
            date: dateKey,
            amount,
            formattedDate: formattedDate, // Just the date for XAxis
            storeName: storeName, // Store name for tooltip
          };
        })
        .sort((a: any, b: any) => {
          // Sort by date first, then by store name
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.storeName.localeCompare(b.storeName);
        });
    }

    // If no daily expenses data, return empty array
    if (!dailyExpenses || dailyExpenses.length === 0) return [];

    // If more than 90 days (more than 3 months), group by month
    if (daysDiff > 90) {
      const monthlyMap = new Map<string, { total: number; count: number }>();

      dailyExpenses.forEach(item => {
        const date = parseLocalDate(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const amount = typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0;

        const existing = monthlyMap.get(monthKey) || { total: 0, count: 0 };
        monthlyMap.set(monthKey, {
          total: existing.total + amount,
          count: existing.count + 1,
        });
      });

      return Array.from(monthlyMap.entries())
        .map(([monthKey, data]) => {
          const [year, month] = monthKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          });

          return {
            date: `${year}-${month}-01`,
            amount: data.total,
            formattedDate,
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Otherwise (8-90 days), show daily aggregated data
    return dailyExpenses.map(item => {
      const date = parseLocalDate(item.date);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Ensure amount is a number
      const amount = typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0;

      return {
        date: item.date,
        amount,
        formattedDate,
      };
    });
  }, [dailyExpenses, receiptsData, filters.dateFrom, filters.dateTo, filters.selectedCategories]);

  // Transform category expenses for chart
  // Note: Data is already filtered by categories at API level
  const spendingByCategoryData = useMemo(() => {
    if (!categoryExpenses || !categoryExpenses.items) return [];

    const categoryColors: Record<string, string> = {
      GROCERY: '#10b981',
      SHOPPING: '#ec4899',
      UTILITIES: '#a78bfa',
      HEALTH: '#ef4444',
      TRANSPORTATION: '#3b82f6',
      RESTAURANT: '#F59E0B',
      ENTERTAINMENT: '#8b5cf6',
      EDUCATION: '#06b6d4',
      OTHER: '#6b7280',
    };

    // First, convert all items and ensure values are numbers
    const items = categoryExpenses.items.map(item => {
      const total = typeof item.total === 'number' ? item.total : parseFloat(item.total) || 0;

      return {
        name: item.categoryName,
        value: total,
        percentage:
          typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage) || 0,
        color: categoryColors[item.categoryName.toUpperCase()] || '#6b7280',
      };
    });

    // Recalculate percentages based on total of all categories to ensure accuracy
    const totalOfAllCategories = items.reduce((sum, item) => sum + item.value, 0);

    return items.map(item => ({
      ...item,
      percentage: totalOfAllCategories > 0 ? (item.value / totalOfAllCategories) * 100 : 0,
    }));
  }, [categoryExpenses]);

  const handleFiltersChange = (newFilters: DashboardFiltersState) => {
    setFilters(newFilters);
  };

  const isLoading =
    summaryLoading || dailyLoading || categoryLoading || storeLoading || paymentMethodLoading;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      {/* Header Section */}
      <div className="w-full py-8 px-3 md:px-4 lg:px-0" style={{ backgroundColor: '#0F172A' }}>
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-base text-slate-400">Track your spending patterns and insights</p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="container mx-auto max-w-7xl pb-8 space-y-6 px-3 md:px-4 lg:px-0">
        <AnalyticsStats {...statsData} />

        {/* Filters Section */}
        <DashboardFilters onFiltersChange={handleFiltersChange} />

        {/* Charts Section - Row 1: Spending Over Time and Spending by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Spending Over Time Chart */}
          <div className="lg:col-span-1 h-full">
            {isLoading ? (
              <div className="bg-white rounded-lg p-6 h-[400px] flex items-center justify-center">
                <p className="text-slate-500">Loading...</p>
              </div>
            ) : spendingOverTimeData.length > 0 ? (
              <SpendingOverTimeChart
                data={spendingOverTimeData}
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                selectedCategories={filters.selectedCategories}
              />
            ) : (
              <div className="bg-white rounded-lg p-6 h-[400px] flex items-center justify-center">
                <p className="text-slate-500">No data available for the selected period</p>
              </div>
            )}
          </div>

          {/* Spending by Category Chart */}
          <div className="lg:col-span-1 h-full">
            {isLoading ? (
              <div className="bg-white rounded-lg p-6 h-[400px] flex items-center justify-center">
                <p className="text-slate-500">Loading...</p>
              </div>
            ) : spendingByCategoryData.length > 0 ? (
              <SpendingByCategoryChart
                data={spendingByCategoryData}
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                selectedCategories={filters.selectedCategories}
              />
            ) : (
              <div className="bg-white rounded-lg p-6 h-[400px] flex items-center justify-center">
                <p className="text-slate-500">No categories selected</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section - Row 2: Top Stores and Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Top Stores Chart */}
          <div className="lg:col-span-1 h-full">
            {isLoading ? (
              <div className="bg-white rounded-lg p-6 h-[400px] flex items-center justify-center">
                <p className="text-slate-500">Loading...</p>
              </div>
            ) : storeExpenses && storeExpenses.items.length > 0 ? (
              <TopStoresChart
                data={storeExpenses.items}
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
              />
            ) : (
              <div className="bg-white rounded-lg p-6 h-[400px] flex items-center justify-center">
                <p className="text-slate-500">No store data available</p>
              </div>
            )}
          </div>

          {/* Payment Methods Card */}
          <div className="lg:col-span-1 h-full">
            {isLoading ? (
              <div className="bg-white rounded-lg p-6 h-[400px] flex items-center justify-center">
                <p className="text-slate-500">Loading...</p>
              </div>
            ) : paymentMethodExpenses && paymentMethodExpenses.items.length > 0 ? (
              <PaymentMethodsCard
                data={paymentMethodExpenses.items}
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
              />
            ) : (
              <div className="bg-white rounded-lg p-6 h-[400px] flex items-center justify-center">
                <p className="text-slate-500">No payment method data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
