'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RestaurantDashboard from './restaurant-dashboard';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
      } catch {
        window.localStorage.removeItem('authToken');
        router.replace('/welcome');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <RestaurantDashboard initialUser={user} />;
}
