'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CheckCircle, ShieldCheck, Key, UserCheck, AlertTriangle } from 'lucide-react';

function VerifyInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitedUser, setInvitedUser] = useState<{ name: string; email: string; role: string } | null>(null);

  // Form states
  const [identityValue, setIdentityValue] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Verify identity, 2: Set password, 3: Success
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
      setLoading(false);
      return;
    }

    async function loadInvitation() {
      try {
        const res = await fetch(`/api/auth/verify-invitation?token=${token}`);
        const result = await res.json();
        if (result.success) {
          setInvitedUser(result.user);
        } else {
          setError(result.error || 'This invitation is invalid or has expired.');
        }
      } catch (err) {
        setError('Failed to contact server. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [token]);

  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identityValue.trim()) {
      setError('Please enter your Employee ID or Phone Number.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          identityValue,
          password
        })
      });
      const result = await res.json();
      if (result.success) {
        setStep(3);
      } else {
        setError(result.error || 'Failed to activate account.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500"></div>
        <p className="text-slate-300 text-sm">Validating invitation token...</p>
      </div>
    );
  }

  if (error && step !== 2) {
    return (
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Activation Failed</h2>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <button
          onClick={() => router.push('/login')}
          className="w-full rounded-full bg-slate-900 border border-white/10 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center select-none flex items-center gap-2 justify-center">
        <span className="italic font-extrabold text-2xl">First</span>
        <span className="bg-rose-500 text-white px-2.5 py-0.5 rounded-xl not-italic text-lg font-bold">Bite</span>
      </div>

      {step === 1 && invitedUser && (
        <form onSubmit={handleVerifyIdentity} className="space-y-5">
          <div className="text-center">
            <UserCheck className="h-12 w-12 text-rose-400 mx-auto mb-3" />
            <h2 className="text-2xl font-extrabold text-white">Join the Team</h2>
            <p className="text-slate-300 text-sm mt-1">
              Welcome <strong>{invitedUser.name}</strong>! You have been invited as a <strong>{invitedUser.role}</strong>.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block mb-1">Identity Verification Required</span>
            For security, please verify your account by entering your Employee ID or Phone Number as set by the manager.
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="identity">Employee ID or Phone Number</label>
            <input
              id="identity"
              type="text"
              value={identityValue}
              onChange={(e) => setIdentityValue(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-rose-500/40 transition placeholder-slate-500"
              placeholder="e.g. Employee ID or 10-digit Phone"
              required
            />
          </div>

          {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 shadow-lg shadow-rose-500/20"
          >
            Verify Identity
          </button>
        </form>
      )}

      {step === 2 && invitedUser && (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="text-center">
            <Key className="h-12 w-12 text-rose-400 mx-auto mb-3" />
            <h2 className="text-2xl font-extrabold text-white">Set Your Password</h2>
            <p className="text-slate-400 text-sm mt-1">Configure your login credentials for FirstBite.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-rose-500/40 transition"
              placeholder="Min. 6 characters"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-rose-500/40 transition"
              placeholder="Re-enter password"
              required
            />
          </div>

          {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-75"
          >
            {submitting ? 'Activating...' : 'Activate Account'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-2" />
          <h2 className="text-3xl font-extrabold text-white">Activated!</h2>
          <p className="text-slate-300 text-sm">
            Congratulations! Your FirstBite employee account has been successfully set up and activated.
          </p>

          <button
            onClick={() => router.push('/staff-login')}
            className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 shadow-lg shadow-rose-500/20 mt-4"
          >
            Go to Staff Login
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyInvitationPage() {
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
        <Suspense fallback={<div className="text-center">Loading verification context...</div>}>
          <VerifyInvitationForm />
        </Suspense>
      </div>
    </div>
  );
}
