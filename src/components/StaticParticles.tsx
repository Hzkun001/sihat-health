// src/components/StaticParticles.tsx
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;   // 0..100 (viewBox)
  y: number;   // 0..100 (viewBox)
  size: number; // px-ish, nanti diskalakan
  color: string;
  opacity: number;
  blur: boolean;
}

type Groups = {
  normal: Particle[];
  blurred: Particle[];
};

export function StaticParticles() {
  const [groups, setGroups] = useState<Groups>({ normal: [], blurred: [] });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;

    // Reduced motion
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const updateReduced = () => setReduced(!!mql?.matches);
    updateReduced();
    mql?.addEventListener?.('change', updateReduced);

    const colors = ['#1BA351', '#5AC8FA', '#A7F3D0', '#DCFCE7'];

    const generateParticles = () => {
      const width = window.innerWidth;
      // Responsif + reduced motion:
      let count = width < 640 ? 12 : width < 1024 ? 22 : 40;
      if (reduced) count = Math.floor(count * 0.35); // kurangi banyak kalau reduced

      const normal: Particle[] = [];
      const blurred: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const p: Particle = {
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1.5,          // 1.5–4.5
          color: colors[(Math.random() * colors.length) | 0],
          opacity: Math.random() * 0.25 + 0.15,   // 0.15–0.4
          blur: i < count * 0.2 && Math.random() > 0.5,
        };
        (p.blur ? blurred : normal).push(p);
      }
      setGroups({ normal, blurred });
    };

    // Debounce resize tanpa NodeJS.Timeout
    let tid: number | null = null;
    const onResize = () => {
      if (tid) window.clearTimeout(tid);
      tid = window.setTimeout(generateParticles, 250);
    };

    // generate pertama kali (idle-ish)
    // pakai timeout kecil supaya paint hero duluan
    const first = window.setTimeout(generateParticles, 0);

    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (tid) window.clearTimeout(tid);
      window.clearTimeout(first);
      window.removeEventListener('resize', onResize);
      mql?.removeEventListener?.('change', updateReduced);
    };
  }, [reduced]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    >
      <defs>
        {/* Satu filter blur untuk seluruh grup blur */}
        <filter id="soft-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" />
        </filter>
      </defs>

      {/* Grup normal: tanpa filter */}
      <g>
        {groups.normal.map((p) => (
          <circle
            key={`n-${p.id}`}
            cx={p.x}
            cy={p.y}
            r={p.size / 20}           // skala ke viewBox 100
            fill={p.color}
            opacity={p.opacity}
          />
        ))}
      </g>

      {/* Grup blur: pakai satu filter saja */}
      <g filter="url(#soft-blur)">
        {groups.blurred.map((p) => (
          <circle
            key={`b-${p.id}`}
            cx={p.x}
            cy={p.y}
            r={p.size / 20}
            fill={p.color}
            opacity={p.opacity}
          >
            {/* animasi halus hanya untuk sebagian yang cukup besar */}
            {!reduced && p.size > 3.5 && (
              <animate
                attributeName="opacity"
                values={`${p.opacity};${(p.opacity * 1.3).toFixed(3)};${p.opacity}`}
                dur="7s"
                repeatCount="indefinite"
                begin={`${(p.id * 1.2).toFixed(1)}s`}
              />
            )}
          </circle>
        ))}
      </g>
    </svg>
  );
}
