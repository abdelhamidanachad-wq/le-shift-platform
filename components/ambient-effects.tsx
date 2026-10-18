'use client';

import { useEffect } from 'react';

export default function AmbientEffects() {
  useEffect(() => {
    let scrollFrame = 0;
    let pointerFrame = 0;
    const root = document.documentElement;
    const updateScroll = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty('--scroll-progress', max > 0 ? String(window.scrollY / max) : '0');
      });
    };
    const updatePointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        root.style.setProperty('--cursor-x', `${event.clientX}px`);
        root.style.setProperty('--cursor-y', `${event.clientY}px`);
      });
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    window.addEventListener('pointermove', updatePointer, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      window.removeEventListener('pointermove', updatePointer);
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(pointerFrame);
    };
  }, []);

  return (
    <>
      <div className="ambient-orbs" aria-hidden="true"><span /><span /><span /></div>
      <div className="scroll-progress" aria-hidden="true" />
    </>
  );
}
