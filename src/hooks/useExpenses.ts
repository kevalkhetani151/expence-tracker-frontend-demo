'use client';
// Hook for CRUD operations on expenses

import { useState, useCallback } from 'react';
import { Expense, ExpenseCategory } from '@/types';
import { apiRequest } from '@/lib/api';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (params?: {
    category?: ExpenseCategory;
    month?: number;
    year?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.month) query.set('month', String(params.month));
      if (params?.year) query.set('year', String(params.year));
      const qs = query.toString();
      const data = await apiRequest<Expense[]>(`/expenses${qs ? `?${qs}` : ''}`);
      setExpenses(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpense = useCallback(async (payload: {
    amount: number;
    category: ExpenseCategory;
    date: string;
    note?: string;
  }) => {
    const created = await apiRequest<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setExpenses(prev => [created, ...prev]);
    return created;
  }, []);

  const updateExpense = useCallback(async (id: string, payload: Partial<{
    amount: number;
    category: ExpenseCategory;
    date: string;
    note: string;
  }>) => {
    const updated = await apiRequest<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setExpenses(prev => prev.map(e => e._id === id ? updated : e));
    return updated;
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await apiRequest(`/expenses/${id}`, { method: 'DELETE' });
    setExpenses(prev => prev.filter(e => e._id !== id));
  }, []);

  return { expenses, loading, error, fetchExpenses, createExpense, updateExpense, deleteExpense };
}
