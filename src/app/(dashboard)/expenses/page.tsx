'use client';
// Expenses page: filterable list of expenses with CRUD operations and CSV export

import { useEffect, useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense, ExpenseCategory, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types';
import { downloadCsv } from '@/lib/api';
import ExpenseForm from '@/components/forms/ExpenseForm';
import Modal from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Download, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function ExpensesPage() {
  const { expenses, loading, fetchExpenses, createExpense, updateExpense, deleteExpense } = useExpenses();

  // Filter state
  const now = new Date();
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('');
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [search, setSearch] = useState('');

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchExpenses({
      ...(filterCategory ? { category: filterCategory } : {}),
      month: filterMonth,
      year: filterYear,
    });
  }, [filterCategory, filterMonth, filterYear, fetchExpenses]);

  const filtered = expenses.filter(e =>
    !search || e.note?.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(data: Parameters<typeof createExpense>[0]) {
    await createExpense(data);
    setShowAdd(false);
  }

  async function handleUpdate(data: Parameters<typeof createExpense>[0]) {
    if (!editExpense) return;
    await updateExpense(editExpense._id, data);
    setEditExpense(null);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteExpense(deleteId);
    setDeleteId(null);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await downloadCsv(filterMonth, filterYear, filterCategory || undefined);
    } finally {
      setExporting(false);
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: format(new Date(2024, i), 'MMMM') }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>Expenses</h1>
          <p className="text-slate mt-0.5">{filtered.length} records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} disabled={exporting}
            className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={15} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} />
            Add expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field text-sm w-40" value={filterCategory} onChange={e => setFilterCategory(e.target.value as ExpenseCategory | '')}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field text-sm w-36" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select className="input-field text-sm w-28" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Table / List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 skeleton rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-ink font-medium">No expenses found</p>
            <p className="text-slate text-sm mt-1">Add your first expense for this period</p>
          </div>
        ) : (
          <div className="divide-y divide-cream-warm">
            {/* Desktop header */}
            <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-xs font-medium text-slate uppercase tracking-wide bg-cream-warm/50">
              <div className="col-span-3">Date</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-4">Note</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1" />
            </div>
            {filtered.map(expense => (
              <ExpenseRow
                key={expense._id}
                expense={expense}
                onEdit={() => setEditExpense(expense)}
                onDelete={() => setDeleteId(expense._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add expense" onClose={() => setShowAdd(false)}>
          <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {/* Edit modal */}
      {editExpense && (
        <Modal title="Edit expense" onClose={() => setEditExpense(null)}>
          <ExpenseForm initial={editExpense} onSubmit={handleUpdate} onCancel={() => setEditExpense(null)} submitLabel="Update expense" />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete expense?" onClose={() => setDeleteId(null)}>
          <p className="text-slate mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} className="flex-1 bg-coral text-white font-medium py-2.5 rounded-lg hover:bg-coral/90 transition-colors">
              Delete
            </button>
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ExpenseRow({ expense, onEdit, onDelete }: { expense: Expense; onEdit: () => void; onDelete: () => void }) {
  const color = CATEGORY_COLORS[expense.category] ?? '#6b7280';
  const icon = CATEGORY_ICONS[expense.category] ?? '📦';

  return (
    <div className="grid grid-cols-12 items-center px-5 py-4 hover:bg-cream-warm/30 transition-colors group">
      <div className="col-span-6 sm:col-span-3 text-sm text-ink-muted">
        {format(new Date(expense.date), 'dd MMM yyyy')}
      </div>
      <div className="col-span-6 sm:col-span-3">
        <span className="tag text-white text-xs" style={{ background: color }}>
          {icon} {expense.category}
        </span>
      </div>
      <div className="col-span-10 sm:col-span-4 text-sm text-slate mt-1 sm:mt-0 truncate">
        {expense.note || <span className="text-cream-dark">—</span>}
      </div>
      <div className="col-span-1 text-right font-semibold text-ink amount text-sm hidden sm:block">
        ₹{expense.amount.toLocaleString('en-IN')}
      </div>
      <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 text-slate hover:text-ink rounded-lg hover:bg-cream-warm transition-colors">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 text-slate hover:text-coral rounded-lg hover:bg-red-50 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
      {/* Mobile amount */}
      <div className="col-span-2 sm:hidden font-semibold text-ink amount text-sm text-right">
        ₹{expense.amount.toLocaleString('en-IN')}
      </div>
    </div>
  );
}
