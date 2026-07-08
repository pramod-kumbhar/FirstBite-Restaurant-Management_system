'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

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

        <h2 className="text-3xl font-extrabold text-white text-center mb-1">Verify Account</h2>
        <p className="text-slate-300 text-sm text-center mb-6 leading-relaxed">{message}</p>

        <form className="space-y-4" onSubmit={handleVerify}>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="verify-email">Email</label>
            <input
              id="verify-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none ring-0 focus:border-rose-500/40 transition"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">OTP Verification Code</label>
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
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-900/80 text-center text-lg font-bold text-white outline-none focus:border-rose-500/50 transition"
                  placeholder="•"
                  required
                />
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
          
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full rounded-full border border-white/10 bg-slate-900/50 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
          >
            {resendLoading ? 'Resending…' : 'Resend OTP'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-slate-400">
          New here?{' '}
          <Link className="font-semibold text-rose-300 hover:text-rose-200 hover:underline" href="/signup">
            Create an account
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
