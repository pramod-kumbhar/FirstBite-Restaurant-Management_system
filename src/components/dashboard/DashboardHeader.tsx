'use client';

import React from 'react';
import { 
  UtensilsCrossed, Users, ShieldCheck, PieChart, ChefHat, 
  UserCheck, CreditCard, Truck, ShoppingCart, LogOut
} from 'lucide-react';
import { User } from '@/types/restaurant';

interface DashboardHeaderProps {
  currentUser: User | null;
  currentRole: string;
  setCurrentRole: (role: any) => void;
  availableRoles: string[];
  customerBranch: string;
  setCustomerBranch: (branch: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onLogout: () => void;
  showToast: (msg: string, type: string) => void;
}

export function DashboardHeader({
  currentUser,
  currentRole,
  setCurrentRole,
  availableRoles,
  customerBranch,
  setCustomerBranch,
  cartCount,
  onOpenCart,
  onLogout,
  showToast
}: DashboardHeaderProps) {
  const displayName = currentUser?.name || 'Customer';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 select-none">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30 border border-white/15">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-1">
              <span className="italic text-white">First</span>
              <span className="text-rose-500 font-extrabold">Bite</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Gourmet Dining & POS</p>
          </div>
        </div>

        {/* Role Switcher & Active Branch */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {['owner', 'manager'].includes(currentRole) && (
            <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 rounded-xl px-2.5 py-1 shrink-0">
              <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider">Branch:</span>
              <select
                value={customerBranch}
                onChange={(e) => {
                  setCustomerBranch(e.target.value);
                  showToast('Switched active branch view to: ' + e.target.value, 'info');
                }}
                className="bg-transparent text-[11px] font-extrabold text-rose-300 outline-none cursor-pointer border-none p-0 pr-2 select-none"
              >
                <option value="Ichalkaranji" className="bg-slate-950 text-white font-semibold">Ichalkaranji</option>
                <option value="Chinchwad" className="bg-slate-950 text-white font-semibold">Chinchwad</option>
                <option value="Shivajinagar" className="bg-slate-950 text-white font-semibold">Shivajinagar</option>
                <option value="Kolhapur" className="bg-slate-950 text-white font-semibold">Kolhapur</option>
              </select>
            </div>
          )}

          <div className="bg-slate-900/60 p-1 rounded-xl flex items-center gap-1 border border-white/5">
            {availableRoles.includes('customer') && (
              <button 
                onClick={() => setCurrentRole('customer')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentRole === 'customer' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Users className="h-3.5 w-3.5" /> Customer
              </button>
            )}
            {availableRoles.includes('owner') && (
              <button 
                onClick={() => setCurrentRole('owner')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentRole === 'owner' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Owner
              </button>
            )}
            {availableRoles.includes('manager') && (
              <button 
                onClick={() => setCurrentRole('manager')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentRole === 'manager' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <PieChart className="h-3.5 w-3.5" /> Manager
              </button>
            )}
            {availableRoles.includes('chef') && (
              <button 
                onClick={() => setCurrentRole('chef')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentRole === 'chef' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ChefHat className="h-3.5 w-3.5" /> Chef
              </button>
            )}
            {availableRoles.includes('waiter') && (
              <button 
                onClick={() => setCurrentRole('waiter')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentRole === 'waiter' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <UserCheck className="h-3.5 w-3.5" /> Waiter
              </button>
            )}
            {availableRoles.includes('cashier') && (
              <button 
                onClick={() => setCurrentRole('cashier')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentRole === 'cashier' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <CreditCard className="h-3.5 w-3.5" /> Cashier
              </button>
            )}
            {availableRoles.includes('delivery') && (
              <button 
                onClick={() => setCurrentRole('delivery')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${currentRole === 'delivery' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Truck className="h-3.5 w-3.5" /> Delivery
              </button>
            )}
          </div>
        </div>

        {/* Right Actions (Cart & Logout) */}
        <div className="flex items-center gap-2">
          {currentRole === 'customer' && (
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 transition shadow-md flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-extrabold hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <span className="text-xs font-bold text-slate-300 hidden md:inline">{displayName}</span>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-rose-600 text-slate-400 hover:text-white transition shadow-sm"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
