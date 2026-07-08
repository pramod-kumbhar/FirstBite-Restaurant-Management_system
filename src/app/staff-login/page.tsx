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
    <div 
      className="min-h-screen w-full flex items-center justify-center px-4 py-6 sm:py-12 text-white relative"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.75)), url('/firstbite_welcome_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-md bg-slate-950/65 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl relative">
        <button 
          onClick={() => router.push('/login')} 
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-rose-300 hover:text-rose-200 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-6 text-center select-none flex items-center gap-2 justify-center">
          <span className="italic font-extrabold text-2xl">First</span>
          <span className="bg-rose-500 text-white px-2.5 py-0.5 rounded-xl not-italic text-lg font-bold">Bite</span>
        </div>

        <h2 className="text-3xl font-extrabold text-white text-center mb-1">Staff Access</h2>
        <p className="text-slate-300 text-sm text-center mb-6">Sign in as manager, chef, waiter, or cashier</p>

        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {Object.entries(roleLabels).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${role === value ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' : 'bg-slate-900/60 text-slate-300 border border-white/5 hover:bg-slate-800'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-rose-500/40 transition" 
              placeholder="staff@firstbite.com" 
              required 
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-rose-500/40 transition" 
              placeholder="••••••••" 
              required 
            />
          </div>
          {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-70 mt-2"
          >
            {loading ? 'Signing in…' : `Sign in as ${roleLabels[role] || 'Staff'}`}
          </button>
        </form>
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
