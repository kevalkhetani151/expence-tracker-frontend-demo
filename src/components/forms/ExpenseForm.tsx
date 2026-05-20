'use client';
// ExpenseForm — used for both create and edit.
// Includes the AI auto-fill textarea that pre-populates fields from raw text.

import { useState, useEffect, FormEvent } from 'react';
import { Expense, ExpenseCategory, CATEGORIES, ExtractedExpense } from '@/types';
import { apiRequest } from '@/lib/api';
import { Sparkles, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  initial?: Partial<Expense>;
  onSubmit: (data: {
    amount: number;
    category: ExpenseCategory;
    date: string;
    note?: string;
  }) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function ExpenseForm({ initial, onSubmit, onCancel, submitLabel = 'Save expense' }: Props) {
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? 'Food');
  const [date, setDate] = useState(initial?.date ? format(new Date(initial.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState(initial?.note ?? '');

  // AI extract state
  const [rawText, setRawText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAi, setShowAi] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Apply extracted data
  function applyExtracted(data: ExtractedExpense) {
    if (data.amount !== null) setAmount(String(data.amount));
    if (data.category !== null) setCategory(data.category);
    if (data.date !== null) setDate(data.date);
    if (data.note !== null) setNote(data.note ?? '');
    setShowAi(false);
    setRawText('');
  }

  async function handleAiExtract() {
    if (!rawText.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const data = await apiRequest<ExtractedExpense>('/ai/extract', {
        method: 'POST',
        body: JSON.stringify({ text: rawText }),
      });
      if (!data.amount && !data.category && !data.date) {
        setAiError("Couldn't extract data — please fill the form manually.");
      } else {
        applyExtracted(data);
      }
    } catch {
      setAiError('AI extraction failed. Please fill manually.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Enter a valid amount'); return; }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ amount: parsedAmount, category, date, note: note || undefined });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* AI auto-fill section */}
      <div className="bg-amber-brand/10 border border-amber-brand/30 rounded-xl p-4">
        <button
          type="button"
          onClick={() => setShowAi(v => !v)}
          className="flex items-center gap-2 text-amber-dark font-medium text-sm w-full"
        >
          <Sparkles size={15} />
          ✨ Auto-fill with AI
          <span className="ml-auto text-xs text-amber-dark/60">{showAi ? 'Hide' : 'Paste a bill, SMS, or receipt'}</span>
        </button>

        {showAi && (
          <div className="mt-3 space-y-3">
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={`Paste text like:\n"Paid Rs 850 at Dominos on 15 Jul"\n"HDFC Bank: Debit Rs.1500.00 on 18-07-24 at BigBazaar"`}
              rows={4}
              className="input-field text-sm resize-none"
            />
            {aiError && <p className="text-xs text-red-600">{aiError}</p>}
            <button
              type="button"
              onClick={handleAiExtract}
              disabled={aiLoading || !rawText.trim()}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {aiLoading ? 'Extracting…' : 'Extract & fill form'}
            </button>
          </div>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="label">Amount (₹)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          className="input-field"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <select
          className="input-field"
          value={category}
          onChange={e => setCategory(e.target.value as ExpenseCategory)}
          required
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="label">Date</label>
        <input
          type="date"
          className="input-field"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          max={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      {/* Note */}
      <div>
        <label className="label">Note <span className="text-slate font-normal">(optional)</span></label>
        <input
          type="text"
          className="input-field"
          placeholder="Add a note…"
          value={note}
          onChange={e => setNote(e.target.value)}
          maxLength={500}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" className="btn-primary flex items-center gap-2 flex-1 justify-center" disabled={submitting}>
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
