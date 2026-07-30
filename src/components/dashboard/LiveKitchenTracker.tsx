'use client';

import React from 'react';
import { Clock, CheckCircle2, Utensils, Truck, AlertCircle, XCircle } from 'lucide-react';
import { Order } from '@/types/restaurant';

interface LiveKitchenTrackerProps {
  order: Order | null;
  onCancelOrder?: (orderId: number) => void;
  formatCurrency: (val: string | number) => string;
}

export function LiveKitchenTracker({
  order,
  onCancelOrder,
  formatCurrency
}: LiveKitchenTrackerProps) {
  if (!order) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-center text-slate-400 space-y-2">
        <Utensils className="h-8 w-8 text-rose-500/60 mx-auto animate-pulse" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Active Orders</h3>
        <p className="text-xs text-slate-400">Place a new dine-in or delivery order to track live kitchen preparation progress.</p>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Received', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    { key: 'cooking', label: 'Cooking', icon: Utensils },
    { key: 'ready', label: order.orderType === 'delivery' ? 'Dispatched' : 'Ready to Serve', icon: CheckCircle2 },
    { key: 'completed', label: 'Served / Completed', icon: CheckCircle2 }
  ];

  const statusOrder = ['pending', 'accepted', 'cooking', 'ready', 'served', 'out_for_delivery', 'completed'];
  const currentIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/40 p-5 shadow-2xl space-y-4 text-slate-100 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Kitchen Tracker</span>
          </div>
          <h3 className="text-lg font-black text-white mt-1 flex items-center gap-1.5">
            Order #{order.id} ({order.orderType === 'delivery' ? <span className="flex items-center gap-1 text-rose-300"><Truck className="h-4 w-4 text-rose-400" /> Delivery</span> : <span className="flex items-center gap-1 text-emerald-300"><Utensils className="h-4 w-4 text-emerald-400" /> Dine-in Table</span>})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-xs uppercase">
            {order.status}
          </span>
          {order.status === 'pending' && onCancelOrder && (
            <button
              type="button"
              onClick={() => onCancelOrder(order.id)}
              className="px-3 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold text-xs transition flex items-center gap-1"
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      {!isCancelled ? (
        <div className="py-2 overflow-x-auto">
          <div className="grid grid-cols-5 gap-1 min-w-[280px] relative">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const stepIndex = statusOrder.indexOf(step.key);
              const isDone = currentIndex >= stepIndex && currentIndex !== -1;
              const isCurrent = order.status === step.key;

              return (
                <div key={step.key} className="flex flex-col items-center text-center space-y-1 z-10">
                  <div
                    className={`h-7 w-7 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs transition-all border ${
                      isCurrent
                        ? 'bg-rose-600 text-white border-rose-400 ring-2 sm:ring-4 ring-rose-500/30 scale-105 sm:scale-110 shadow-lg'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-955 text-slate-600 border-white/10'
                    }`}
                  >
                    <StepIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span className={`text-[8px] sm:text-[10px] font-extrabold uppercase tracking-tight sm:tracking-wider leading-tight ${isCurrent ? 'text-rose-300' : isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center text-rose-300 text-xs font-bold flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400" />
          <span>This order has been cancelled.</span>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs pt-2 border-t border-white/10 text-slate-400">
        <span>Total Bill: <strong className="text-white font-black">{formatCurrency(parseFloat(order.finalAmount || '0').toFixed(2))}</strong></span>
        <span>Estimated Time: <strong className="text-emerald-400 font-bold">15-20 Mins</strong></span>
      </div>
    </div>
  );
}
