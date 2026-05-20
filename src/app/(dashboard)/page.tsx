import { redirect } from 'next/navigation';
// The root of the dashboard route group redirects to /dashboard
export default function DashboardRoot() {
  redirect('/dashboard');
}
