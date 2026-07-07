'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(''));
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Enter your email and the OTP code sent to you.');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = codeDigits.join('');

  const handleDigitChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) {
      return;
    }

    const nextDigits = [...codeDigits];
    nextDigits[index] = value.slice(-1);
    setCodeDigits(nextDigits);

    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const messageParam = searchParams.get('message');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (messageParam) {
      setMessage(messageParam);
      setStatus('success');
    }
  }, [searchParams]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('Verifying your OTP...');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'OTP verification failed');
      }
      setStatus('success');
      setMessage(result.message || 'Your email was verified successfully. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1200);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Unable to verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Enter your email first to resend OTP.');
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Resend OTP failed');
      }
      setStatus('success');
      setMessage(result.message || 'OTP resent successfully.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Unable to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.2),transparent_45%),linear-gradient(135deg,#111827_0%,#1f2937_100%)] px-4 py-12 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-300">OTP Email verification</p>
        <h1 className="mt-3 text-3xl font-semibold">Verify your account with OTP</h1>
        <p className="mt-4 text-lg text-slate-300">{message}</p>

        <form className="mt-6 space-y-4" onSubmit={handleVerify}>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="verify-email">Email</label>
            <input
              id="verify-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">OTP Code</label>
            <div className="grid grid-cols-6 gap-2">
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleDigitChange(index, event.target.value)}
                  onKeyDown={(event) => handleDigitKeyDown(index, event)}
                  className="h-14 rounded-2xl border border-white/10 bg-slate-900 text-center text-xl font-bold text-white outline-none ring-0"
                  placeholder="•"
                  required
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full rounded-full border border-white/20 bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {resendLoading ? 'Resending…' : 'Resend OTP'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
            Back to sign in
          </Link>
          <Link href="/signup" className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
