'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { toast } from 'sonner';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await response.json();
        
        if (isMounted) {
          if (!data.user && pathname !== '/') {
            toast.error('No session found. Please login.');
            router.push('/');
          } else if (data.user && pathname === '/') {
            router.push('/dashboard');
          }
          setSessionChecked(true);
        }
      } catch (err) {
        if (isMounted) {
          if (pathname !== '/') {
            router.push('/');
          }
          setSessionChecked(true);
        }
      }
    };

    checkSession();
    
    const channel = new BroadcastChannel('auth_channel');
    channel.onmessage = (event) => {
      if (event.data === 'login') {
        if (pathname === '/') {
           router.push('/dashboard');
        } else {
           window.location.reload();
        }
      } else if (event.data === 'logout') {
        if (pathname !== '/') {
          toast.error('Session expired or logged out from another tab.');
          router.push('/');
        }
      }
    };
    
    return () => {
      isMounted = false;
      channel.close();
    };
  }, [pathname, router]);

  if (!sessionChecked) {
    return null;
  }

  if (pathname === '/') {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}