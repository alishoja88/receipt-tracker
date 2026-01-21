import { useQuery } from '@tanstack/react-query';
import {
  getExpensesSummary,
  getMonthlyExpenses,
  getExpensesByCategory,
  getDailyExpenses,
  getExpensesByStore,
  getExpensesByPaymentMethod,
} from '../api/expenses.api';
import type {
  ExpensesSummary,
  MonthlyExpense,
  CategoryExpense,
  DailyExpense,
  ExpensesByStoreResponse,
  ExpensesByPaymentMethodResponse,
} from '../types/expenses.types';

// Query keys
export const expensesKeys = {
  all: ['expenses'] as const,
  summary: (params?: { dateFrom?: string; dateTo?: string; categories?: string[] }) =>
    [...expensesKeys.all, 'summary', params] as const,
  monthly: (params?: { dateFrom?: string; dateTo?: string; categories?: string[] }) =>
    [...expensesKeys.all, 'monthly', params] as const,
  byCategory: (params?: { dateFrom?: string; dateTo?: string; categories?: string[] }) =>
    [...expensesKeys.all, 'by-category', params] as const,
  daily: (params?: { dateFrom?: string; dateTo?: string; categories?: string[] }) =>
    [...expensesKeys.all, 'daily', params] as const,
  byStore: (params?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    categories?: string[];
  }) => [...expensesKeys.all, 'by-store', params] as const,
  byPaymentMethod: (params?: { dateFrom?: string; dateTo?: string; categories?: string[] }) =>
    [...expensesKeys.all, 'by-payment-method', params] as const,
};

/**
 * Hook to fetch expenses summary
 */
export const useExpensesSummary = (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}) => {
  return useQuery<ExpensesSummary>({
    queryKey: expensesKeys.summary(params),
    queryFn: () => getExpensesSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch monthly expenses
 */
export const useMonthlyExpenses = (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}) => {
  return useQuery<{ items: MonthlyExpense[]; summary: any }>({
    queryKey: expensesKeys.monthly(params),
    queryFn: () => getMonthlyExpenses(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch expenses by category
 */
export const useExpensesByCategory = (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}) => {
  return useQuery<{ items: CategoryExpense[]; summary: any }>({
    queryKey: expensesKeys.byCategory(params),
    queryFn: () => getExpensesByCategory(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch daily expenses
 */
export const useDailyExpenses = (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}) => {
  return useQuery<DailyExpense[]>({
    queryKey: expensesKeys.daily(params),
    queryFn: () => getDailyExpenses(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch expenses by store
 */
export const useExpensesByStore = (params?: {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  categories?: string[];
}) => {
  return useQuery<ExpensesByStoreResponse>({
    queryKey: expensesKeys.byStore(params),
    queryFn: () => getExpensesByStore(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch expenses by payment method
 */
export const useExpensesByPaymentMethod = (params?: {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}) => {
  return useQuery<ExpensesByPaymentMethodResponse>({
    queryKey: expensesKeys.byPaymentMethod(params),
    queryFn: () => getExpensesByPaymentMethod(params),
    staleTime: 5 * 60 * 1000,
  });
};
