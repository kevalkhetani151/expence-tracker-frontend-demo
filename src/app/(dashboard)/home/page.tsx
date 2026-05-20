'use client';
// Main dashboard: month total, category breakdown, monthly trend, budget alerts

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBudgets } from '@/hooks/useBudgets';
import { apiRequest } from '@/lib/api';
import { DashboardData, CATEGORY_COLORS, CATEGORY_ICONS, ExpenseCategory } from '@/types';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { format, subMonths } from 'date-fns';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function StatCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="card p-5">
      <p className="text-slate text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink amount mb-1">{value}</p>
      {sub && (
        <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-coral' : trend === 'down' ? 'text-sage' : 'text-slate'}`}>
          {trend === 'up' && <TrendingUp size={12} />}
          {trend === 'down' && <TrendingDown size={12} />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { budgets, fetchBudgets } = useBudgets();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();

  useEffect(() => {
    async function load() {
      try {
        const [dash] = await Promise.all([
          apiRequest<DashboardData>('/expenses/dashboard'),
          fetchBudgets(now.getMonth() + 1, now.getFullYear()),
        ]);
        setDashboard(dash);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build trend chart data (last 6 months labels)
  const trendData = (() => {
    if (!dashboard?.monthlyTrend) return [];
    return dashboard.monthlyTrend.map(t => ({
      name: MONTH_NAMES[t.month - 1],
      total: t.total,
    }));
  })();

  const prevMonthTotal = trendData.length >= 2 ? trendData[trendData.length - 2]?.total ?? 0 : 0;
  const trendPct = prevMonthTotal > 0
    ? Math.round(((dashboard?.monthTotal ?? 0) - prevMonthTotal) / prevMonthTotal * 100)
    : 0;

  const alertBudgets = budgets.filter(b => b.status !== 'ok');

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Good {getGreeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate mt-1">{format(now, 'MMMM yyyy')} overview</p>
      </div>

      {/* Budget alerts */}
      {alertBudgets.length > 0 && (
        <div className="space-y-2">
          {alertBudgets.map(b => (
            <div key={b.budget._id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                b.status === 'danger'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
              <AlertTriangle size={16} />
              <span>
                <strong>{b.budget.category}</strong>: {b.percentage}% of ₹{b.budget.limitAmount.toLocaleString()} budget used
                {b.status === 'danger' ? ' — limit exceeded!' : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Spent this month"
          value={formatINR(dashboard?.monthTotal ?? 0)}
          sub={trendPct !== 0 ? `${Math.abs(trendPct)}% vs last month` : 'No prior data'}
          trend={trendPct > 0 ? 'up' : trendPct < 0 ? 'down' : 'neutral'}
        />
        <StatCard
          label="Categories active"
          value={String(dashboard?.categoryBreakdown?.length ?? 0)}
          sub="this month"
        />
        <StatCard
          label="Budgets on track"
          value={String(budgets.filter(b => b.status === 'ok').length)}
          sub={`of ${budgets.length} set`}
          trend={budgets.length > 0 && alertBudgets.length === 0 ? 'down' : 'neutral'}
        />
        <StatCard
          label="Highest spend"
          value={dashboard?.categoryBreakdown?.[0]
            ? `${CATEGORY_ICONS[dashboard.categoryBreakdown[0].category as ExpenseCategory] ?? ''} ${dashboard.categoryBreakdown[0].category}`
            : '—'}
          sub={dashboard?.categoryBreakdown?.[0] ? formatINR(dashboard.categoryBreakdown[0].total) : ''}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Category breakdown pie */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-ink mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            By category
          </h2>
          {dashboard?.categoryBreakdown?.length ? (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dashboard.categoryBreakdown}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {dashboard.categoryBreakdown.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[entry.category as ExpenseCategory] ?? '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #d9cfbf', fontFamily: 'var(--font-body)', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="w-full space-y-1.5">
                {dashboard.categoryBreakdown.slice(0, 6).map(entry => (
                  <div key={entry.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: CATEGORY_COLORS[entry.category as ExpenseCategory] }} />
                      <span className="text-ink-muted">{CATEGORY_ICONS[entry.category as ExpenseCategory]} {entry.category}</span>
                    </div>
                    <span className="text-ink font-medium amount">{formatINR(entry.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate text-sm text-center py-12">No expenses this month</p>
          )}
        </div>

        {/* Monthly trend bar */}
        <div className="card p-6 lg:col-span-3">
          <h2 className="text-lg font-semibold text-ink mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            6-month trend
          </h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trendData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9cfbf" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Total']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #d9cfbf', fontFamily: 'var(--font-body)', fontSize: '13px' }}
                  cursor={{ fill: '#f5f0e8' }}
                />
                <Bar dataKey="total" fill="#e8a020" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate text-sm text-center py-16">Not enough data yet</p>
          )}
        </div>
      </div>

      {/* Budget progress section */}
      {budgets.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-ink mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Budget status
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(b => (
              <BudgetProgressCard key={b.budget._id} item={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetProgressCard({ item }: { item: import('@/types').BudgetStatus }) {
  const pct = Math.min(item.percentage, 100);
  const colorClass = item.status === 'danger' ? 'bg-coral' : item.status === 'warning' ? 'bg-amber-brand' : 'bg-sage';

  return (
    <div className="bg-cream-warm rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-ink">
          {CATEGORY_ICONS[item.budget.category as ExpenseCategory]} {item.budget.category}
        </span>
        <div className="flex items-center gap-1">
          {item.status === 'ok'
            ? <CheckCircle size={13} className="text-sage" />
            : <AlertTriangle size={13} className={item.status === 'danger' ? 'text-coral' : 'text-amber-brand'} />
          }
          <span className={`text-xs font-medium ${item.status === 'danger' ? 'text-coral' : item.status === 'warning' ? 'text-amber-dark' : 'text-sage'}`}>
            {item.percentage}%
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-slate">
        <span className="amount">₹{item.spent.toLocaleString('en-IN')}</span>
        <span className="amount">₹{item.budget.limitAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="h-10 w-64 skeleton rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="h-80 skeleton rounded-xl lg:col-span-2" />
        <div className="h-80 skeleton rounded-xl lg:col-span-3" />
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
