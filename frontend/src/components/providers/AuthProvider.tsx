'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then((res) => setUser(res.data.data))
      .catch(() => {
        Cookies.remove('token');
        setUser(null);
      });
  }, []);

  return <>{children}</>;
}
