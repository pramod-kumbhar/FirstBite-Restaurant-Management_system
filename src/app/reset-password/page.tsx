'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

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
    <div 
      className="min-h-screen w-full flex items-center justify-center px-4 py-12 text-white relative"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.75)), url('/firstbite_welcome_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-md bg-slate-950/65 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative">
        <button 
          onClick={() => router.push('/login')} 
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-rose-300 hover:text-rose-200 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </button>

        <div className="mb-6 text-center select-none flex items-center gap-2 justify-center">
          <span className="italic font-extrabold text-2xl">First</span>
          <span className="bg-rose-500 text-white px-2.5 py-0.5 rounded-xl not-italic text-lg font-bold">Bite</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white text-center mb-1">New Password</h1>
        <p className="text-slate-300 text-sm text-center mb-6">Enter your new password below</p>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="password">New password</label>
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
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="confirmPassword">Confirm password</label>
            <input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-rose-500/40 transition" 
              placeholder="••••••••"
              required 
            />
          </div>
          {error ? <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
          {message ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p> : null}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-70 mt-2"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
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
