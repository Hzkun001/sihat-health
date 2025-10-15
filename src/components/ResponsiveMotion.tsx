import { useEffect, useState } from 'react';

/**
 * Hook untuk mendapatkan nilai motion yang responsif
 * Desktop: nilai penuh, Tablet: 30% berkurang, Mobile: ringkas
 */
export function useResponsiveMotion() {
  const [motionScale, setMotionScale] = useState(1);

  useEffect(() => {
    const updateMotionScale = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile: motion ringkas (Y max 12px)
        setMotionScale(0.3);
      } else if (width < 1024) {
        // Tablet: kurangi motion 30% (Y max 24px)
        setMotionScale(0.6);
      } else {
        // Desktop: motion penuh (Y max 32px) - reduced from 40px
        setMotionScale(1);
      }
    };

    updateMotionScale();
    // Debounce resize event for better performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateMotionScale, 150);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    y: 32 * motionScale, // Y offset untuk reveal - reduced from 40
    parallax: 10 * motionScale, // Parallax offset - reduced from 12
  };
}

/**
 * Konstanta token gerak global untuk konsistensi
 */
export const MOTION_TOKENS = {
  // Easing default - Optimized for smoother performance
  ease: [0.25, 0.8, 0.25, 1] as [number, number, number, number],
  
  // Durasi - Slightly reduced for snappier feel
  duration: {
    reveal: 0.7, // Reduced from 0.8
    fast: 0.25, // Reduced from 0.3
    normal: 0.45, // Reduced from 0.5
    slow: 0.9, // Reduced from 1
  },
  
  // Stagger - Optimized timing
  stagger: {
    children: 0.07, // Reduced from 0.08
    delayChildren: 0.05, // Reduced from 0.06
  },
  
  // Viewport
  viewport: {
    once: true,
    amount: 0.25, // Reduced from 0.3 for earlier trigger
  },
  
  // Reduced motion fallback
  reducedMotion: {
    duration: 0.3,
  },
} as const;
