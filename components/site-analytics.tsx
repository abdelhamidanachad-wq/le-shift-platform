'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/telemetry';

export default function SiteAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    const path = pathname || '/';
    const started = Date.now();
    let sent = false;
    void trackEvent('page_view', path);
    const sendExit = () => {
      if (sent) return;
      sent = true;
      void trackEvent('page_exit', path, (Date.now() - started) / 1000);
    };
    const onVisibility = () => { if (document.visibilityState === 'hidden') sendExit(); };
    window.addEventListener('pagehide', sendExit);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      sendExit();
      window.removeEventListener('pagehide', sendExit);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pathname]);
  return null;
}
