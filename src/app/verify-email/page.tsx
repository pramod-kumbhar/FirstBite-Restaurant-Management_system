'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('The verification link is missing its token.');
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Verification failed');
        }
        setStatus('success');
        setMessage(result.message || 'Your email was verified successfully.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Unable to verify your email address.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.2),_transparent_45%),linear-gradient(135deg,_#111827_0%,_#1f2937_100%)] px-4 py-12 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-300">Email verification</p>
        <h1 className="mt-3 text-3xl font-semibold">{status === 'success' ? 'Email verified' : status === 'error' ? 'Verification issue' : 'Checking your link'}</h1>
        <p className="mt-4 text-lg text-slate-300">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login" className="rounded-full bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-600">
            Continue to sign in
          </Link>
          <Link href="/" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
            Go home
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
