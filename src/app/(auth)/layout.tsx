// Centered auth layout with decorative background

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden">
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-soft to-amber-dark/30" />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(var(--cream-dark) 1px, transparent 1px), linear-gradient(90deg, var(--cream-dark) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-brand rounded-lg flex items-center justify-center">
              <span className="text-ink text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>L</span>
            </div>
            <span className="text-cream text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Ledger</span>
          </div>
          <div>
            <h1 className="text-cream text-5xl font-bold leading-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Know where<br />
              <span className="text-amber-brand">every rupee</span><br />
              goes.
            </h1>
            <p className="text-cream/60 text-lg leading-relaxed">
              AI-powered expense tracking that reads your bills, organises your spending, and keeps you on budget.
            </p>
          </div>
          <div className="flex gap-8 text-cream/40 text-sm">
            <span>Smart AI categorization</span>
            <span>·</span>
            <span>Budget alerts</span>
            <span>·</span>
            <span>CSV exports</span>
          </div>
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
