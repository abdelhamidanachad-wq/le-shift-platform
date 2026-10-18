'use client';

import { useEffect } from 'react';

export default function AmbientEffects() {
  useEffect(() => {
    let frame = 0;
    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const root = document.documentElement;
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty('--scroll-progress', max > 0 ? String(window.scrollY / max) : '0');
      });
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <><div className="ambient-orbs" aria-hidden="true"><span/><span/><span/></div><div className="scroll-progress" aria-hidden="true"/></>;
}
