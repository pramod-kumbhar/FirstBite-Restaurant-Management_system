'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Home, 
  Save, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Bell, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [user, setUser] = useState<any>(null);
  
  // Profile Form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine: '',
    district: '',
    state: '',
    pincode: '',
  });

  // Security Form
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailReceipts: true,
    orderUpdatesSms: true,
    loyaltyPromos: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      const token = window.localStorage.getItem('authToken');
      if (!token) {
        router.replace('/welcome');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (!result.success || !result.user) {
          window.localStorage.removeItem('authToken');
          router.replace('/welcome');
          return;
        }

        setUser(result.user);
        setForm({
          name: result.user.name || '',
          email: result.user.email || '',
          phone: result.user.phone || '',
          addressLine: result.user.addressLine || result.user.address || '',
          district: result.user.district || 'Ichalkaranji',
          state: result.user.state || 'Maharashtra',
          pincode: result.user.pincode || '416115',
        });
      } catch (err) {
        window.localStorage.removeItem('authToken');
        router.replace('/welcome');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  // Handle Profile & Address Save
  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    setSubmittingProfile(true);
    try {
      const token = window.localStorage.getItem('authToken');
      const res = await fetch('/api/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'saveMyProfile',
          payload: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            addressLine: form.addressLine.trim(),
            district: form.district.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
        }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || 'Unable to save profile.');
      } else {
        setSuccess(result.message || 'Profile saved successfully!');
        setUser((prev: any) => ({ ...prev, ...form }));
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while saving profile.');
    } finally {
      setSubmittingProfile(false);
    }
  };

  // Handle Security Password Update
  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setSubmittingPassword(true);
    try {
      const token = window.localStorage.getItem('authToken');
      const res = await fetch('/api/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'saveMyProfile',
          payload: {
            password: passwordForm.newPassword.trim(),
          },
        }),
      });
      const result = await res.json();
      if (!result.success) {
        setPasswordError(result.error || 'Unable to update password.');
      } else {
        setPasswordSuccess('Password updated successfully! You can now log in with your new password.');
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Network error while updating password.');
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    setSubmittingDelete(true);
    try {
      const token = window.localStorage.getItem('authToken');
      const res = await fetch('/api/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'deleteMyAccount',
          payload: {},
        }),
      });
      const result = await res.json();
      if (result.success) {
        window.localStorage.removeItem('authToken');
        router.replace('/welcome');
      } else {
        setError(result.error || 'Failed to delete account.');
        setShowDeleteModal(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error during account deletion.');
      setShowDeleteModal(false);
    } finally {
      setSubmittingDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-955 text-white">
        <div className="flex items-center gap-3 bg-slate-900 border border-white/15 px-6 py-4 rounded-3xl shadow-2xl">
          <div className="h-6 w-6 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
          <span className="text-sm font-bold">Loading Account Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 font-sans selection:bg-rose-500 selection:text-white pb-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* TOP BAR NAVIGATION & HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-xs font-extrabold text-white backdrop-blur-md transition hover:bg-slate-800 hover:border-white/20 shadow-md"
            >
              <ArrowLeft className="h-4 w-4 text-rose-400" /> Back to Dashboard
            </button>
            <h1 className="mt-4 text-2xl sm:text-3xl font-black text-white italic tracking-tight">
              Account <span className="text-rose-500">Settings</span> & Security
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
              Manage your personal information, security password, address, and notification preferences.
            </p>
          </div>

          {/* USER PROFILE HEADER CARD */}
          <div className="rounded-3xl border border-white/15 bg-slate-900/90 p-4 shadow-xl backdrop-blur-xl sm:w-80">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white text-lg font-black shadow-lg border border-white/20">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-white text-sm truncate">{user?.name || 'Customer'}</h3>
                  <span className="text-[9px] rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 font-bold">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'No email'}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-955 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Loyalty Points</span>
                <span className="text-sm font-black text-rose-400">{user?.loyaltyPoints ?? 0} pts</span>
              </div>
              <div className="bg-slate-955 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Role</span>
                <span className="text-xs font-bold text-white capitalize">{user?.role || 'Customer'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          
          {/* LEFT COLUMN: PROFILE FORM & PASSWORD UPDATE */}
          <div className="space-y-8">
            
            {/* CARD 1: PROFILE & DELIVERY ADDRESS DETAILS */}
            <div className="rounded-3xl bg-slate-900/80 border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="p-2.5 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Profile Details & Address</h2>
                  <p className="text-xs text-slate-400">Update your name, contact phone, and primary delivery location.</p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-2xl border border-white/15 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-semibold"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Address (Locked)
                    </label>
                    <input
                      value={form.email}
                      disabled
                      className="w-full rounded-2xl border border-white/10 bg-slate-955/50 px-4 py-3 text-xs text-slate-400 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Mobile Phone Number
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-2xl border border-white/15 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-semibold"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Pincode
                    </label>
                    <input
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      className="w-full rounded-2xl border border-white/15 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-semibold"
                      placeholder="6-digit postal pincode"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Street / Flat / Building Address Line
                    </label>
                    <input
                      value={form.addressLine}
                      onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                      className="w-full rounded-2xl border border-white/15 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-medium"
                      placeholder="Flat 302, Green Acres Apartment, Shivaji Chowk"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        District / City
                      </label>
                      <input
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        className="w-full rounded-2xl border border-white/15 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-semibold"
                        placeholder="District / City name"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        State
                      </label>
                      <input
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full rounded-2xl border border-white/15 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-semibold"
                        placeholder="State name"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" /> {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> {success}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white px-6 py-3 text-xs font-extrabold transition shadow-lg shadow-rose-600/30 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {submittingProfile ? 'Saving Profile...' : 'Save Profile & Address'}
                  </button>
                </div>
              </form>
            </div>

            {/* CARD 2: SECURITY & PASSWORD MANAGEMENT (SET / CHANGE PASSWORD) */}
            <div className="rounded-3xl bg-slate-900/80 border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Security & Password Management</h2>
                  <p className="text-xs text-slate-400">Set or change your account login password securely.</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full rounded-2xl border border-white/15 bg-slate-955 pl-4 pr-10 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-semibold"
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full rounded-2xl border border-white/15 bg-slate-955 pl-4 pr-10 py-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-semibold"
                      placeholder="Re-type new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" /> {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> {passwordSuccess}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white px-6 py-3 text-xs font-extrabold transition shadow-lg shadow-amber-600/30 disabled:opacity-60"
                  >
                    <Lock className="h-4 w-4" />
                    {submittingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* RIGHT COLUMN: PREFERENCES, SAVED ADDRESS SUMMARY, & DANGER ZONE */}
          <div className="space-y-6">
            
            {/* CARD 3: SAVED ADDRESS SUMMARY */}
            <div className="rounded-3xl border border-white/15 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-white">
                <Home className="h-5 w-5 text-rose-400" />
                <div>
                  <h3 className="text-sm font-extrabold">Active Delivery Address</h3>
                  <p className="text-xs text-slate-400">Used for food delivery & order dispatches.</p>
                </div>
              </div>
              <div className="bg-slate-955 p-4 rounded-2xl border border-white/10 space-y-1 text-xs text-slate-300 font-medium">
                <p className="font-bold text-white">{form.addressLine || 'No street address set'}</p>
                <p>{form.district || 'Ichalkaranji'}, {form.state || 'Maharashtra'} - <span className="text-rose-400 font-bold">{form.pincode || '416115'}</span></p>
                <p className="text-[11px] text-slate-400 pt-1 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-500" /> Contact: {form.phone || 'Not set'}
                </p>
              </div>
            </div>

            {/* CARD 4: NOTIFICATION PREFERENCES */}
            <div className="rounded-3xl border border-white/15 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-white pb-2 border-b border-white/10">
                <Bell className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-extrabold">Notification Preferences</h3>
                  <p className="text-xs text-slate-400">Control receipt alerts & SMS updates.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-955 border border-white/5">
                  <div>
                    <p className="font-bold text-white">Email Receipts</p>
                    <p className="text-[10px] text-slate-400">Receive PDF receipts on order completion</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setNotifications({ ...notifications, emailReceipts: !notifications.emailReceipts })}
                    className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${notifications.emailReceipts ? 'bg-rose-600' : 'bg-slate-800'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications.emailReceipts ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-955 border border-white/5">
                  <div>
                    <p className="font-bold text-white">SMS / WhatsApp Live Tracking</p>
                    <p className="text-[10px] text-slate-400">Real-time driver updates on mobile</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setNotifications({ ...notifications, orderUpdatesSms: !notifications.orderUpdatesSms })}
                    className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${notifications.orderUpdatesSms ? 'bg-rose-600' : 'bg-slate-800'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications.orderUpdatesSms ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 5: ACCOUNT SECURITY TIPS */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 text-xs text-slate-400 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Account Security Tips
              </p>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-400 font-medium">
                <li>Never share your account OTP or password with anyone.</li>
                <li>Keep delivery address pincode accurate for fastest dispatch.</li>
                <li>Use a strong password with at least 6 characters.</li>
              </ul>
            </div>

            {/* CARD 6: DANGER ZONE - DELETE ACCOUNT */}
            <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-rose-400">
                <Trash2 className="h-4 w-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">Account Danger Zone</h3>
              </div>
              <p className="text-xs text-slate-400">Permanently remove your customer account and order history.</p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white py-2.5 text-xs font-extrabold transition"
              >
                Delete My Customer Account
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* CONFIRM DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-955/80 backdrop-blur-md"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative z-50 w-full max-w-sm rounded-3xl border border-rose-500/40 bg-slate-955 p-6 shadow-2xl text-white space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Delete Account?</h3>
              <p className="mt-1 text-xs text-slate-400">This action is permanent and cannot be undone.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-2xl bg-slate-900 border border-white/10 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={submittingDelete}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-xs font-extrabold transition shadow-lg shadow-rose-600/30 disabled:opacity-60"
              >
                {submittingDelete ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
