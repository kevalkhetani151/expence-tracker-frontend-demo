'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-7 h-7 bg-amber-brand rounded-lg flex items-center justify-center">
          <span className="text-ink font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</span>
        </div>
        <span className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Ledger</span>
      </div>

      <h2 className="text-3xl font-bold text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>Create account</h2>
      <p className="text-slate mb-8">Start tracking your expenses for free</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Your name</label>
          <input
            type="text"
            className="input-field"
            placeholder="John Doe"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="label">Email address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              className="input-field pr-11"
              placeholder="Min 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex gap-1 mt-2">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= i * 2 ? 'bg-amber-brand' : 'bg-cream-dark'}`} />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="text-center text-slate mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-amber-dark font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
