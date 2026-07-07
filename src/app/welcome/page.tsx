'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, ChefHat, ShoppingBag, Users } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(248,113,113,0.2), transparent 45%), linear-gradient(135deg, #111827 0%, #1f2937 100%)' }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-300">FirstBite</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Choose your access path</h1>
          <p className="mt-4 text-lg text-slate-300">Select whether you are a customer or part of the restaurant staff to enter the correct workspace.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => router.push('/login?mode=customer')}
            className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-left transition hover:border-rose-400/40 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-7 w-7 text-rose-400" />
                <div>
                  <h2 className="text-xl font-semibold">Customer</h2>
                  <p className="text-sm text-slate-400">Browse menu, place orders, and manage reservations.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </div>
          </button>

          <button
            onClick={() => router.push('/staff-login')}
            className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-left transition hover:border-rose-400/40 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChefHat className="h-7 w-7 text-rose-400" />
                <div>
                  <h2 className="text-xl font-semibold">Staff</h2>
                  <p className="text-sm text-slate-400">Sign in as manager, chef, waiter, or cashier.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

