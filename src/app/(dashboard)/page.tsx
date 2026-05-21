import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// The root of the dashboard route group redirects to /dashboard
export default function DashboardRoot() {
  redirect('/home');
}
