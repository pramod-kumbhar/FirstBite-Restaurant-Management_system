'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, MapPin, Home, Save, ShieldCheck } from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine: '',
    district: '',
    state: '',
    pincode: '',
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
          addressLine: result.user.addressLine || '',
          district: result.user.district || '',
          state: result.user.state || '',
          pincode: result.user.pincode || '',
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    setSubmitting(true);
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
        setSuccess(result.message || 'Profile saved successfully.');
        setUser((prev: any) => ({ ...prev, ...form }));
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while saving profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading account settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </button>
            <h1 className="mt-4 text-3xl font-extrabold sm:mt-6">Account Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Update your profile, contact details, and delivery address for future orders.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:w-80">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white text-lg font-black">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-rose-500">Signed in as</p>
                <p className="font-semibold text-slate-900">{user?.email || 'Unknown'}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Customer'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{user?.isEmailVerified ? 'Email verified' : 'Email verification pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{user?.phone || 'Phone not set'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-900">Profile details</h2>
            <p className="mt-2 text-sm text-slate-600">Modify your customer name, phone, and structured delivery address.</p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Name
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-500"
                    placeholder="Full name"
                  />
                </label>
                <label className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Email address
                  <input
                    value={form.email}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Phone
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-500"
                    placeholder="Mobile number"
                  />
                </label>
                <label className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Pincode
                  <input
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-500"
                    placeholder="Postal code"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <label className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Address line
                  <input
                    value={form.addressLine}
                    onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-500"
                    placeholder="Street, apartment, landmark"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    District
                    <input
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-500"
                      placeholder="District"
                    />
                  </label>
                  <label className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    State
                    <input
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-500"
                      placeholder="State"
                    />
                  </label>
                </div>
              </div>

              {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
              {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> Save changes
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-900">
                <Home className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="text-sm font-semibold">Saved Delivery Address</p>
                  <p className="mt-1 text-sm text-slate-600">This address will be used for delivery orders and order confirmations.</p>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm text-slate-700">
                <p>{form.addressLine || 'No address line set'}</p>
                <p>{form.district || 'No district set'}, {form.state || 'No state set'} - {form.pincode || 'No pincode set'}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500">Account tips</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-rose-500 mt-1" /> Keep address fields accurate for faster delivery.</li>
                <li className="flex items-start gap-2"><Phone className="h-4 w-4 text-rose-500 mt-1" /> Add your phone number so the rider can contact you if needed.</li>
                <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-rose-500 mt-1" /> Your email is used for order receipts and OTP verification.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
