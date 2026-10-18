'use client';

import { useEffect, useState } from 'react';

export default function AmbientEffects() {
  const [visible, setVisible] = useState(false);
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
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      cancelAnimationFrame(frame);
    };
    setVisible(true);
    const move = (event: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--cursor-x', event.clientX + 'px');
        document.documentElement.style.setProperty('--cursor-y', event.clientY + 'px');
      });
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <><div className="ambient-orbs" aria-hidden="true"><span/><span/><span/></div>{visible && <div className="custom-cursor" aria-hidden="true"><span/></div>}<div className="scroll-progress" aria-hidden="true"/></>;
}
