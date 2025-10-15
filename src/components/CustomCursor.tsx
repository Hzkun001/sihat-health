import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile/tablet or touch device - disable custom cursor
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.matchMedia('(max-width: 1024px)').matches; // Include tablets
    
    if (isTouchDevice || isSmallScreen) {
      setIsMobile(true);
      return;
    }

    // Optimized mousemove with requestAnimationFrame
    let rafId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: lastX, y: lastY });
        rafId = null;
      });
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  if (isMobile) return null;

  // Calculate cursor size and offset
  const baseSize = 16;
  const hoverSize = 24;
  const pressSize = 12;
  
  const size = isPressed ? pressSize : isHovering ? hoverSize : baseSize;
  const offset = size / 2;

  return (
    <>
      {/* Main cursor dot with gradient */}
      <div
        className="custom-cursor"
        style={{
          transform: `translate3d(${mousePosition.x - offset}px, ${mousePosition.y - offset}px, 0)`,
          width: `${size}px`,
          height: `${size}px`,
          background: isHovering 
            ? 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)'
            : '#1BA351',
          borderRadius: '50%',
          opacity: isPressed ? 0.9 : 0.8,
          transition: 'width 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), height 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.15s ease-out, background 0.25s ease-out',
          willChange: 'transform',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
