// All shared TypeScript types for the Expense Tracker frontend

export type ExpenseCategory =
  | 'Food' | 'Transport' | 'Shopping' | 'Entertainment'
  | 'Health' | 'Utilities' | 'Rent' | 'Education' | 'Travel' | 'Other';

export const CATEGORIES: ExpenseCategory[] = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Utilities', 'Rent', 'Education', 'Travel', 'Other',
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#e8a020',
  Transport: '#4a7c59',
  Shopping: '#d95f3b',
  Entertainment: '#7c3aed',
  Health: '#0891b2',
  Utilities: '#6b7280',
  Rent: '#b45309',
  Education: '#1d4ed8',
  Travel: '#be185d',
  Other: '#374151',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Food: '🍽️',
  Transport: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Health: '❤️',
  Utilities: '💡',
  Rent: '🏠',
  Education: '📚',
  Travel: '✈️',
  Other: '📦',
};

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  monthTotal: number;
  categoryBreakdown: { category: string; total: number }[];
  monthlyTrend: { year: number; month: number; total: number }[];
}

export interface Budget {
  _id: string;
  category: ExpenseCategory;
  month: number;
  year: number;
  limitAmount: number;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  percentage: number;
  status: 'ok' | 'warning' | 'danger';
}

export interface ExtractedExpense {
  amount: number | null;
  category: ExpenseCategory | null;
  date: string | null;
  note: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
