'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole] = useState<'customer'>('customer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccess(decodeURIComponent(message));
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
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

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to send reset email.');
      }
      setSuccess(result.message || 'If an account exists, a reset email has been sent.');
      setForgotPasswordMode(false);
    } catch (err: any) {
      setError(err.message || 'Unable to send reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.2),transparent_45%),linear-gradient(135deg,#111827_0%,#1f2937_100%)] px-4 py-12 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-300">FirstBite</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Welcome back.</h1>
          <p className="mt-4 text-lg text-slate-300">Sign in to manage reservations, orders, and staff operations in real time.</p>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-2xl font-semibold">{forgotPasswordMode ? 'Recover your password' : 'Log in'}</h2>
          {forgotPasswordMode ? (
            <form className="mt-6 space-y-4" onSubmit={handleForgotPassword}>
              <div>
                <label className="mb-2 block text-sm text-slate-300" htmlFor="forgotEmail">Email</label>
                <input id="forgotEmail" type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0" placeholder="you@example.com" required />
              </div>
              {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
              {success ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</p> : null}
              <button type="submit" disabled={forgotLoading} className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70">{forgotLoading ? 'Sending…' : 'Send reset link'}</button>
              <button type="button" onClick={() => { setForgotPasswordMode(false); setError(''); setSuccess(''); }} className="w-full text-sm text-rose-300">Back to sign in</button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                <label className="mb-2 block text-sm text-slate-300" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0"
                  placeholder="••••••••"
                  required
                />
              </div>
              {/* <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100"> */}
                {/* <p className="font-semibold">Customer sign-in</p> */}
                {/* <p className="mt-1 text-xs text-rose-200/80">Need staff access? Use the dedicated staff portal for manager, chef, waiter, or cashier sign-in.</p> */}
              {/* </div> */}

              {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
              {success ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <button type="button" onClick={() => { setForgotPasswordMode(true); setError(''); setSuccess(''); }} className="w-full text-sm text-rose-300">Forgot password?</button>
            </form>
          )}

          <p className="mt-4 text-sm text-slate-400">
            New here?{' '}
            <Link className="font-medium text-rose-300 hover:text-rose-200" href="/signup">
              Create an account
            </Link>
            {' • '}
            <Link className="font-medium text-rose-300 hover:text-rose-200" href="/staff-login">
              Staff login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
