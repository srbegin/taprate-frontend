'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user?.is_staff) {
      router.replace('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading' || !session?.user?.is_staff) {
    return null;
  }

  return <>{children}</>;
}