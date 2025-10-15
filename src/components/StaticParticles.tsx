import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  blur: boolean;
}

export function StaticParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const width = window.innerWidth;
      let count = 40; // Desktop default
      
      // Responsive particle count
      if (width < 640) {
        count = 12; // Mobile
      } else if (width < 1024) {
        count = 22; // Tablet
      }

      const colors = [
        '#1BA351', // brand-green
        '#5AC8FA', // brand-blue
        '#A7F3D0', // light mint
        '#DCFCE7', // very light mint
      ];

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100, // percentage
          y: Math.random() * 100, // percentage
          size: Math.random() * 3 + 1.5, // 1.5-4.5px
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.25 + 0.15, // 0.15-0.4
          blur: i < count * 0.2 && Math.random() > 0.5, // 20% chance for blur
        });
      }
      setParticles(newParticles);
    };

    generateParticles();

    // Regenerate on resize
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(generateParticles, 300);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.6 }}
    >
      <defs>
        {/* Soft blur filter for depth particles */}
        <filter id="soft-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
        </filter>
      </defs>

      {/* Static particles */}
      {particles.map((particle) => (
        <circle
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          r={particle.size / 20} // Scale to viewBox
          fill={particle.color}
          opacity={particle.opacity}
          filter={particle.blur ? 'url(#soft-blur)' : undefined}
        >
          {/* Optional: Very subtle opacity animation for 2-3 large particles */}
          {particle.blur && particle.size > 3.5 && (
            <animate
              attributeName="opacity"
              values={`${particle.opacity};${particle.opacity * 1.3};${particle.opacity}`}
              dur="7s"
              repeatCount="indefinite"
              begin={`${particle.id * 1.2}s`}
            />
          )}
        </circle>
      ))}
    </svg>
  );
}
