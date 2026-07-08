'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

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
          onClick={() => router.push('/welcome')} 
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-rose-300 hover:text-rose-200 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-6 text-center select-none flex items-center gap-2 justify-center">
          <span className="italic font-extrabold text-2xl">First</span>
          <span className="bg-rose-500 text-white px-2.5 py-0.5 rounded-xl not-italic text-lg font-bold">Bite</span>
        </div>

        <h2 className="text-3xl font-extrabold text-white text-center mb-1">
          {forgotPasswordMode ? 'Recover password' : 'Welcome back'}
        </h2>
        <p className="text-slate-300 text-sm text-center mb-6">
          {forgotPasswordMode ? 'Enter your email to receive a password reset link' : 'Sign in to access your dashboard'}
        </p>

        {forgotPasswordMode ? (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="forgotEmail">Email</label>
              <input 
                id="forgotEmail" 
                type="email" 
                value={forgotEmail} 
                onChange={(event) => setForgotEmail(event.target.value)} 
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none ring-0 focus:border-rose-500/40 transition" 
                placeholder="you@example.com" 
                required 
              />
            </div>
            {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
            {success ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</p> : null}
            <button 
              type="submit" 
              disabled={forgotLoading} 
              className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
            >
              {forgotLoading ? 'Sending…' : 'Send reset link'}
            </button>
            <button 
              type="button" 
              onClick={() => { setForgotPasswordMode(false); setError(''); setSuccess(''); }} 
              className="w-full text-sm text-rose-300 hover:text-rose-200 text-center block mt-2"
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none ring-0 focus:border-rose-500/40 transition"
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
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none ring-0 focus:border-rose-500/40 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
            {success ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <button 
              type="button" 
              onClick={() => { setForgotPasswordMode(true); setError(''); setSuccess(''); }} 
              className="w-full text-sm text-rose-300 hover:text-rose-200 text-center block mt-2"
            >
              Forgot password?
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-slate-400">
          New here?{' '}
          <Link className="font-semibold text-rose-300 hover:text-rose-200 hover:underline" href="/signup">
            Create an account
          </Link>
          <div className="mt-3">
            <Link className="font-medium text-rose-300 hover:text-rose-200 hover:underline" href="/staff-login">
              Staff login
            </Link>
          </div>
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
