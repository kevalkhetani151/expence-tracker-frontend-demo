# Ledger — Expense Tracker Frontend

A production-ready **Next.js 14** frontend for the Ledger expense tracker. Features AI-powered expense extraction, beautiful charts, budget alerts, and CSV export.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design tokens
- **Charts**: Recharts (pie + bar)
- **Icons**: Lucide React
- **Language**: TypeScript (strict mode)

## Features

- ✅ JWT authentication (register + login)
- ✅ Dashboard with monthly totals, category pie chart, 6-month trend
- ✅ Full expense CRUD with filters (category, month, year)
- ✅ **AI Auto-Fill** — paste a bill/SMS/receipt, AI extracts amount/category/date
- ✅ Budget limits per category with visual progress + alerts
- ✅ CSV export (filtered or all-time)
- ✅ Fully responsive (mobile sidebar)

## Local Setup

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:5000`

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx       # Login form
│   │   └── register/page.tsx    # Register form
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar shell + auth guard
│   │   ├── dashboard/page.tsx   # Main dashboard with charts
│   │   ├── expenses/page.tsx    # Expense list + CRUD + AI fill
│   │   ├── budgets/page.tsx     # Budget limits + alerts
│   │   └── settings/page.tsx    # Profile + export
│   ├── layout.tsx               # Root layout (fonts, AuthProvider)
│   └── globals.css              # Design tokens + component classes
├── components/
│   ├── forms/ExpenseForm.tsx    # Reusable expense form with AI section
│   └── ui/Modal.tsx             # Modal overlay component
├── hooks/
│   ├── useAuth.ts               # Auth context + login/register/logout
│   ├── useExpenses.ts           # Expense CRUD hook
│   └── useBudgets.ts            # Budget CRUD + alert status hook
├── lib/
│   └── api.ts                   # Fetch wrapper (auth headers, errors, CSV download)
└── types/
    └── index.ts                 # All shared TypeScript types
```

## API Integration

All API calls go through `src/lib/api.ts → apiRequest()`.

- Auth token stored in `localStorage` as `token`
- `401` responses auto-redirect to `/login`
- AI extraction at `POST /ai/extract` pre-fills the expense form

See the full **Frontend API Guide** for detailed endpoint documentation.

## Build & Deploy

```bash
npm run build    # Production build
npm run start    # Start production server
```

For Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add `NEXT_PUBLIC_API_URL` environment variable
4. Deploy
