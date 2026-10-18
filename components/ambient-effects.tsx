'use client';

import { useEffect, useState } from 'react';

export default function AmbientEffects() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;
    setVisible(true);
    let frame = 0;
    const move = (event: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
      });
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(frame); };
  }, []);
  return <><div className="ambient-orbs" aria-hidden="true"><span/><span/><span/></div>{visible && <div className="custom-cursor" aria-hidden="true"><span/></div>}<div className="scroll-progress" aria-hidden="true"/></>;
}
