import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  layer: number; // For parallax effect (1-3)
}

const COLORS = [
  'rgba(27, 163, 81, 0.3)',      // brand-green - softer for background
  'rgba(90, 200, 250, 0.3)',     // brand-blue - softer for background
  'rgba(168, 230, 207, 0.3)',    // cyan-mint - softer for background
  'rgba(255, 255, 255, 0.2)',    // white - softer for background
];

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const [particleCount, setParticleCount] = useState(300);

  // Responsive particle count - Optimized
  useEffect(() => {
    const updateParticleCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setParticleCount(40); // Mobile - reduced from 80
      } else if (width < 1024) {
        setParticleCount(80); // Tablet - reduced from 150
      } else {
        setParticleCount(150); // Desktop - reduced from 300
      }
    };

    updateParticleCount();
    const handleResize = () => updateParticleCount();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Initialize particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4, // Speed 0.2-0.6 px/s
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2.5 + 1.5, // Size 1.5-4px
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          opacity: Math.random() * 0.3 + 0.2, // Opacity 0.2-0.5
          layer: Math.floor(Math.random() * 3) + 1, // 1-3 for parallax
        });
      }
      particlesRef.current = newParticles;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [particleCount]);

  // Animation loop - Optimized
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use willReadFrequently for better performance
    const ctxOptimized = canvas.getContext('2d', { 
      alpha: true, 
      desynchronized: true 
    });
    if (!ctxOptimized) return;

    const animate = () => {
      ctxOptimized.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Repel from mouse
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 120;

        if (distance < repelRadius && distance > 0) {
          const force = (repelRadius - distance) / repelRadius;
          const angle = Math.atan2(dy, dx);
          particle.vx += Math.cos(angle) * force * 0.15;
          particle.vy += Math.sin(angle) * force * 0.15;
        }

        // Apply parallax based on layer (slower for far layers)
        const layerSpeed = particle.layer === 1 ? 0.5 : particle.layer === 2 ? 0.75 : 1;
        particle.x += particle.vx * layerSpeed;
        particle.y += particle.vy * layerSpeed;

        // Friction
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Add slight random movement
        particle.vx += (Math.random() - 0.5) * 0.02;
        particle.vy += (Math.random() - 0.5) * 0.02;

        // Keep within bounds (wrap around)
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Update opacity based on distance to mouse
        let targetOpacity = particle.opacity;
        if (distance < repelRadius) {
          targetOpacity = Math.min(particle.opacity * 1.5, 0.8);
        }

        // Draw particle
        const currentOpacity = parseFloat(particle.color.match(/[\d.]+\)$/)?.[0].replace(')', '') || '0.4');
        const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.1;
        const colorWithOpacity = particle.color.replace(/[\d.]+\)$/, `${newOpacity})`);

        ctxOptimized.beginPath();
        ctxOptimized.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctxOptimized.fillStyle = colorWithOpacity;
        ctxOptimized.fill();

        // Draw connection lines to nearby particles - Optimized (max 2 connections per particle)
        let connectionCount = 0;
        const maxConnections = 2;
        
        particles.slice(i + 1).forEach((otherParticle) => {
          if (connectionCount >= maxConnections) return;
          
          const dx2 = particle.x - otherParticle.x;
          const dy2 = particle.y - otherParticle.y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          const maxConnectionDist = 70; // Reduced from 80

          if (dist < maxConnectionDist) {
            const lineOpacity = (1 - dist / maxConnectionDist) * 0.15; // Reduced from 0.2
            ctxOptimized.beginPath();
            ctxOptimized.moveTo(particle.x, particle.y);
            ctxOptimized.lineTo(otherParticle.x, otherParticle.y);
            ctxOptimized.strokeStyle = `rgba(90, 200, 250, ${lineOpacity})`;
            ctxOptimized.lineWidth = 0.8;
            ctxOptimized.stroke();
            connectionCount++;
          }
        });
      });

      // Draw some larger glow particles for depth - Optimized (reduced from 10 to 5)
      particles
        .filter((p) => p.size > 3)
        .slice(0, 5)
        .forEach((particle) => {
          const gradient = ctxOptimized.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 2.5 // Reduced from 3
          );
          gradient.addColorStop(0, particle.color.replace(/[\d.]+\)$/, '0.25)')); // Reduced from 0.3
          gradient.addColorStop(1, particle.color.replace(/[\d.]+\)$/, '0)'));

          ctxOptimized.beginPath();
          ctxOptimized.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
          ctxOptimized.fillStyle = gradient;
          ctxOptimized.fill();
        });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Track mouse position - Throttled for performance
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!animationFrameRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -9999, y: -9999 };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{
        mixBlendMode: 'normal',
        opacity: 0.5,
      }}
    />
  );
}
