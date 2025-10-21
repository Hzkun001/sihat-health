import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
  ready?: boolean;
  externalProgress?: number;
}

export function LoadingScreen({
  onComplete,
  ready = false,
  externalProgress = 0,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const lastValueRef = useRef(0);
  const startRef = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now());
  const completedRef = useRef(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

    if (media.addEventListener) {
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }

    media.addListener(handler);
    return () => media.removeListener(handler);
  }, []);

  useEffect(() => {
    const duration = prefersReducedMotion ? 1400 : 3400;
    let frame = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const start = performance.now();
    startRef.current = start;
    lastValueRef.current = 0;

    const animateProgress = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / duration);
      const nextValue = Math.round(ratio * 100);

      if (nextValue !== lastValueRef.current) {
        lastValueRef.current = nextValue;
        setProgress(nextValue);
      }

      if (ratio < 1) {
        frame = requestAnimationFrame(animateProgress);
      } else {
        timeoutId = setTimeout(onComplete, prefersReducedMotion ? 120 : 360);
      }
    };

    frame = requestAnimationFrame(animateProgress);

    return () => {
      cancelAnimationFrame(frame);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [onComplete, prefersReducedMotion]);

  useEffect(() => {
    setProgress((prev) => Math.max(prev, Math.min(100, Math.round(externalProgress))));
  }, [externalProgress]);

  useEffect(() => {
    if (completedRef.current) return;
    if (progress < 100 || !ready) return;

    completedRef.current = true;
    const minVisible = prefersReducedMotion ? 1600 : 3600;
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startRef.current;
    const baseDelay = prefersReducedMotion ? 200 : 420;
    const remaining = Math.max(baseDelay, minVisible - elapsed);
    exitTimeoutRef.current = setTimeout(() => {
      onComplete();
    }, remaining);

    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [progress, ready, onComplete, prefersReducedMotion]);

  useEffect(() => {
    const failSafe = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, prefersReducedMotion ? 3200 : 6800);
    return () => clearTimeout(failSafe);
  }, [onComplete, prefersReducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      exit={{ 
        y: '-100%',
        opacity: 0.8, // Slight fade for smoothness
      }}
      transition={{ 
        duration: 0.9, 
        ease: [0.25, 0.8, 0.25, 1], // Custom cubic-bezier for smooth swipe
        y: { duration: 0.9 },
        opacity: { duration: 0.6, delay: 0.1 },
      }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1BA351 0%, #5AC8FA 100%)',
        willChange: 'transform, opacity',
      }}
      aria-live="polite"
      role="status"
    >
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -right-24 w-[320px] h-[320px] rounded-full bg-white/10 blur-3xl"
          animate={{ scale: prefersReducedMotion ? 1 : [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-160px] left-[-120px] w-[360px] h-[360px] rounded-full bg-white/5 blur-3xl"
          animate={{ scale: prefersReducedMotion ? 1 : [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center text-white/90">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1,
          }}
          className="text-white tracking-tight"
          style={{ 
            fontSize: 'clamp(72px, 10vw, 128px)', 
            fontWeight: 700, 
            lineHeight: 1,
            willChange: 'opacity, transform',
          }}
        >
          SIHAT
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="px-6 text-white/85"
          style={{
            fontSize: 'clamp(18px, 2.5vw, 28px)',
            fontWeight: 400,
            letterSpacing: '0.015em',
            maxWidth: 'min(520px, 90vw)',
          }}
        >
          Masyarakat yang Lebih Sehat.
        </motion.p>

        <div className="flex flex-col items-center gap-4">
          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="relative h-[6px] w-[min(260px,70vw)] overflow-hidden rounded-full bg-white/15"
          >
            <motion.div
              className="absolute inset-0 origin-left rounded-full"
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.65) 100%)',
                transformOrigin: '0% 50%',
              }}
              animate={{ scaleX: progress / 100 }}
              transition={{ type: 'spring', stiffness: 120, damping: 24 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.45 }}
            className="flex items-center gap-3 text-sm tracking-wide text-white/80"
          >
            <span>Menyiapkan data spasial…</span>
            <motion.span
              key={progress}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-full border border-white/30 px-3 py-1 font-semibold text-white"
            >
              {progress}%
            </motion.span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
