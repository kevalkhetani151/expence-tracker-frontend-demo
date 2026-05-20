'use client';
// Hook for budget CRUD and alert status

import { useState, useCallback } from 'react';
import { BudgetStatus, ExpenseCategory } from '@/types';
import { apiRequest } from '@/lib/api';

export function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBudgets = useCallback(async (month?: number, year?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (month) params.set('month', String(month));
      if (year) params.set('year', String(year));
      const qs = params.toString();
      const data = await apiRequest<BudgetStatus[]>(`/budgets${qs ? `?${qs}` : ''}`);
      setBudgets(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveBudget = useCallback(async (payload: {
    category: ExpenseCategory;
    month: number;
    year: number;
    limitAmount: number;
  }) => {
    await apiRequest('/budgets', { method: 'POST', body: JSON.stringify(payload) });
  }, []);

  const removeBudget = useCallback(async (category: ExpenseCategory, month: number, year: number) => {
    await apiRequest('/budgets', {
      method: 'DELETE',
      body: JSON.stringify({ category, month, year }),
    });
    setBudgets(prev => prev.filter(b => b.budget.category !== category));
  }, []);

  return { budgets, loading, fetchBudgets, saveBudget, removeBudget };
}
