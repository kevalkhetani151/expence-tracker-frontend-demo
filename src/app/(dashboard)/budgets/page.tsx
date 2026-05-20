'use client';
// Budgets page: set monthly limits per category and view alert status

import { useEffect, useState, FormEvent } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { ExpenseCategory, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types';
import Modal from '@/components/ui/Modal';
import { Plus, Trash2, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function BudgetsPage() {
  const { budgets, loading, fetchBudgets, saveBudget, removeBudget } = useBudgets();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchBudgets(month, year);
  }, [month, year, fetchBudgets]);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: format(new Date(2024, i), 'MMMM') }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>Budgets</h1>
          <p className="text-slate mt-0.5">Set monthly limits and track overspending</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} />
          Set budget
        </button>
      </div>

      {/* Month selector */}
      <div className="flex gap-3">
        <select className="input-field text-sm w-40" value={month} onChange={e => setMonth(Number(e.target.value))}>
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select className="input-field text-sm w-28" value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Budget cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 skeleton rounded-xl" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-ink font-medium">No budgets set</p>
          <p className="text-slate text-sm mt-1">Set limits per category to get spending alerts</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => (
            <BudgetCard
              key={b.budget._id}
              item={b}
              onRemove={() => removeBudget(b.budget.category as ExpenseCategory, month, year)}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Set budget limit" onClose={() => setShowAdd(false)}>
          <SetBudgetForm
            month={month}
            year={year}
            existingCategories={budgets.map(b => b.budget.category as ExpenseCategory)}
            onSave={async (data) => {
              await saveBudget(data);
              await fetchBudgets(month, year);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function BudgetCard({ item, onRemove }: { item: import('@/types').BudgetStatus; onRemove: () => void }) {
  const pct = Math.min(item.percentage, 100);
  const barColor = item.status === 'danger' ? '#d95f3b' : item.status === 'warning' ? '#e8a020' : '#4a7c59';
  const icon = CATEGORY_ICONS[item.budget.category as ExpenseCategory] ?? '📦';

  return (
    <div className="card p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="font-semibold text-ink">{item.budget.category}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {item.status === 'ok' && <CheckCircle size={12} className="text-sage" />}
              {item.status === 'warning' && <AlertTriangle size={12} className="text-amber-brand" />}
              {item.status === 'danger' && <XCircle size={12} className="text-coral" />}
              <span className={clsx('text-xs font-medium', {
                'text-sage': item.status === 'ok',
                'text-amber-dark': item.status === 'warning',
                'text-coral': item.status === 'danger',
              })}>
                {item.status === 'ok' ? 'On track' : item.status === 'warning' ? 'Nearing limit' : 'Over budget!'}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate hover:text-coral rounded-lg hover:bg-red-50 transition-all">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-cream-dark rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-slate">Spent: <span className="text-ink font-medium amount">₹{item.spent.toLocaleString('en-IN')}</span></span>
        <span className="text-slate">Limit: <span className="text-ink font-medium amount">₹{item.budget.limitAmount.toLocaleString('en-IN')}</span></span>
      </div>
      <p className="text-xs text-slate mt-1">{item.percentage}% used</p>
    </div>
  );
}

function SetBudgetForm({ month, year, existingCategories, onSave, onCancel }: {
  month: number;
  year: number;
  existingCategories: ExpenseCategory[];
  onSave: (data: { category: ExpenseCategory; month: number; year: number; limitAmount: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const available = CATEGORIES; // Allow updating existing too
  const [category, setCategory] = useState<ExpenseCategory>(available[0]);
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amount = parseFloat(limit);
    if (isNaN(amount) || amount < 1) { setError('Enter a valid limit'); return; }
    setSaving(true);
    try {
      await onSave({ category, month, year, limitAmount: amount });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-cream-warm rounded-lg px-4 py-3 text-sm text-ink-muted">
        Setting budget for <strong>{months[month - 1]} {year}</strong>
      </div>

      <div>
        <label className="label">Category</label>
        <select className="input-field" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}>
          {available.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Monthly limit (₹)</label>
        <input
          type="number"
          min="1"
          step="1"
          className="input-field"
          placeholder="5000"
          value={limit}
          onChange={e => setLimit(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save budget
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
