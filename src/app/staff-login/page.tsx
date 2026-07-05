'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ArrowLeft, ChefHat, CircleDollarSign, UserCog, Users } from 'lucide-react';

const roleLabels: Record<string, string> = {
  manager: 'Manager',
  chef: 'Chef',
  waiter: 'Waiter',
  cashier: 'Cashier',
};

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requested = searchParams.get('role');
    if (requested && roleLabels[requested]) {
      setRole(requested);
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Sign in failed');
      }

      window.localStorage.setItem('authToken', result.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(248,113,113,0.2), transparent 45%), linear-gradient(135deg, #111827 0%, #1f2937 100%)' }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center">
        <div className="flex-1">
          <button onClick={() => router.push('/welcome')} className="mb-4 flex items-center gap-2 text-sm text-rose-300">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <p className="text-sm uppercase tracking-[0.3em] text-rose-300">Staff access</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Sign in as {roleLabels[role] || 'Staff'}</h1>
          <p className="mt-4 text-lg text-slate-300">Use the role-specific credentials provided by the manager.</p>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <div className="mb-4 flex gap-2">
            {Object.entries(roleLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${role === value ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none" required />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none" required />
            </div>
            {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
            <button type="submit" disabled={loading} className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-70">
              {loading ? 'Signing in…' : `Sign in as ${roleLabels[role] || 'Staff'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>}>
      <StaffLoginForm />
    </Suspense>
  );
}
