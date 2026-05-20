// Central API request utility — handles auth headers, errors, and token expiry

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/**
 * Generic fetch wrapper that attaches JWT from localStorage,
 * handles 401 auto-logout, and throws typed errors.
 */
export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  // Only access localStorage in browser
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  // Handle CSV/blob responses (export endpoint)
  if (res.headers.get('content-type')?.includes('text/csv')) {
    return res as unknown as T;
  }

  const data = await res.json();

  // Force logout on token expiry
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  if (!res.ok) {
    const err = new Error(data.message ?? 'Request failed') as Error & { errors?: string[]; status?: number };
    err.errors = data.errors;
    err.status = res.status;
    throw err;
  }

  return data.data as T;
}

/** Trigger a CSV file download from the export endpoint */
export async function downloadCsv(month?: number, year?: number, category?: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const params = new URLSearchParams();
  if (month) params.set('month', String(month));
  if (year) params.set('year', String(year));
  if (category) params.set('category', category);

  const res = await fetch(`${BASE_URL}/expenses/export?${params}`, {
    headers: { Authorization: `Bearer ${token ?? ''}` },
  });

  if (!res.ok) throw new Error('Export failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${month ? `${year}-${String(month).padStart(2, '0')}` : 'all'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
