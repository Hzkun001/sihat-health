// src/hooks/useRevealOnce.ts
import { useEffect, useRef, useState } from 'react';

export function useRevealOnce(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        setVisible(true);
        obs.unobserve(e.target); // <- kunci: sekali jalan
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2, ...(options || {}) });

    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible, options]);

  return { ref, visible };
}
