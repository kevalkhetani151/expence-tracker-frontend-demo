'use client';
// Dashboard shell: sidebar nav + page content area

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Receipt, Target, Settings,
  LogOut, Menu, X, Download, Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-amber-brand border-t-transparent animate-spin" />
    </div>
  );

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-ink text-cream w-64 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-8 h-8 bg-amber-brand rounded-lg flex items-center justify-center">
          <span className="text-ink font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>L</span>
        </div>
        <span className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Ledger</span>
        {/* Mobile close */}
        <button className="ml-auto lg:hidden text-cream/50 hover:text-cream" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-amber-brand text-ink'
                  : 'text-cream/70 hover:text-cream hover:bg-white/10',
              )}>
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-5 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-brand/20 flex items-center justify-center text-amber-brand font-semibold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-cream truncate">{user.name}</p>
            <p className="text-xs text-cream/50 truncate">{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-cream/50 hover:text-cream text-sm w-full px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-cream-dark sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-ink-muted hover:text-ink">
            <Menu size={22} />
          </button>
          <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Ledger</span>
          <div className="ml-auto flex items-center gap-1 text-xs text-amber-dark bg-amber-brand/10 px-2 py-1 rounded-full">
            <Sparkles size={11} />
            AI-powered
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
