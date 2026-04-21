'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => setUser(user))
      .catch(() => setLoading(false));
  }, [setUser, setLoading]);

  return <>{children}</>;
}
