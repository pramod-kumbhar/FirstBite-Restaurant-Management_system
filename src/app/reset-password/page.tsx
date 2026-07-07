'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const providedToken = searchParams.get('token') || '';
    setToken(providedToken);
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Unable to reset password.');
      }
      setMessage(result.message || 'Password updated successfully.');
      setTimeout(() => router.push('/login?message=' + encodeURIComponent('Password updated successfully. Please sign in.')), 1000);
    } catch (err: any) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white/90 px-4 py-12 text-slate-900" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.9), transparent 45%), linear-gradient(180deg, rgba(255,255,255,0.85), rgba(241,245,249,0.95))' }}>
      <div className="mx-auto max-w-md w-full rounded-[32px] border border-slate-200/40 bg-white/80 p-8 shadow-2xl backdrop-blur-3xl ring-1 ring-slate-200/30">
        <h1 className="text-3xl font-semibold text-slate-900">Set a new password</h1>
        <p className="mt-3 text-sm text-slate-600">Enter your new password below.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="password">New password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200/40 bg-slate-50 px-4 py-3 text-slate-900 outline-none" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-600" htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-slate-200/40 bg-slate-50 px-4 py-3 text-slate-900 outline-none" required />
          </div>
          {error ? <p className="rounded-lg border border-rose-200/60 bg-rose-100/80 p-3 text-sm text-rose-700">{error}</p> : null}
          {message ? <p className="rounded-lg border border-emerald-200/60 bg-emerald-100/80 p-3 text-sm text-emerald-700">{message}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70">{loading ? 'Updating…' : 'Update password'}</button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
