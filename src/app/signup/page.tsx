'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role: 'customer' }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Account creation failed');
      }

      setSuccess(result.message || 'Account created successfully. Please verify your email.');
      setTimeout(() => router.push(`/login?message=${encodeURIComponent(result.message || 'Account created. Please verify your email.')}`), 1000);
    } catch (err: any) {
      setError(err.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.2),_transparent_45%),linear-gradient(135deg,_#111827_0%,_#1f2937_100%)] px-4 py-12 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-300">CulinaryOS</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Create your account.</h1>
          <p className="mt-4 text-lg text-slate-300">Join the restaurant management experience with secure access and email verification.</p>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-2xl font-semibold">Sign up</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0"
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
            {success ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-400">
            Already have an account?{' '}
            <Link className="font-medium text-rose-300 hover:text-rose-200" href="/login">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
