'use client';
// Settings page: profile info and export controls

import { useAuth } from '@/hooks/useAuth';
import { downloadCsv } from '@/lib/api';
import { useState } from 'react';
import { User, Download, Shield, Palette } from 'lucide-react';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const now = new Date();

  async function handleExportAll() {
    setExporting(true);
    try { await downloadCsv(); } finally { setExporting(false); }
  }

  async function handleExportMonth() {
    setExporting(true);
    try { await downloadCsv(now.getMonth() + 1, now.getFullYear()); } finally { setExporting(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
        <p className="text-slate mt-0.5">Manage your account and data</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <User size={18} className="text-amber-brand" />
          <h2 className="font-semibold text-ink">Profile</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <div className="input-field bg-cream-warm/50 text-ink-muted cursor-not-allowed">{user?.name}</div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="input-field bg-cream-warm/50 text-ink-muted cursor-not-allowed">{user?.email}</div>
          </div>
        </div>
        <p className="text-xs text-slate mt-3">Profile editing coming soon.</p>
      </div>

      {/* Export */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <Download size={18} className="text-amber-brand" />
          <h2 className="font-semibold text-ink">Export data</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-cream-warm rounded-xl px-4 py-3">
            <div>
              <p className="font-medium text-ink text-sm">This month</p>
              <p className="text-slate text-xs">{format(now, 'MMMM yyyy')}</p>
            </div>
            <button onClick={handleExportMonth} disabled={exporting} className="btn-secondary text-sm flex items-center gap-1.5">
              <Download size={13} />
              Download CSV
            </button>
          </div>
          <div className="flex items-center justify-between bg-cream-warm rounded-xl px-4 py-3">
            <div>
              <p className="font-medium text-ink text-sm">All time</p>
              <p className="text-slate text-xs">Complete expense history</p>
            </div>
            <button onClick={handleExportAll} disabled={exporting} className="btn-secondary text-sm flex items-center gap-1.5">
              <Download size={13} />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Security info */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={18} className="text-amber-brand" />
          <h2 className="font-semibold text-ink">Security</h2>
        </div>
        <div className="space-y-2 text-sm text-slate">
          <p>✅ Password stored with bcrypt hashing</p>
          <p>✅ JWT tokens for session management</p>
          <p>✅ All API requests use HTTPS in production</p>
        </div>
      </div>

      {/* App info */}
      <div className="card p-5 bg-ink text-cream">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-amber-brand rounded flex items-center justify-center">
            <span className="text-ink text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</span>
          </div>
          <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Ledger</span>
          <span className="ml-auto text-cream/40 text-xs">v1.0.0</span>
        </div>
        <p className="text-cream/60 text-sm">AI-powered expense tracker. Built with Next.js 14, Node.js, MongoDB.</p>
      </div>
    </div>
  );
}
