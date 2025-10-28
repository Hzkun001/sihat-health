import { memo, useEffect, useMemo, useRef, lazy, Suspense, useState } from 'react';
const ModelViewer = lazy(() => import('./ModelViewer'));

interface HeroVisual3DProps {
  onReady?: () => void;
  onProgress?: (p: number) => void;
}

export default memo(function HeroVisual3D({ onReady, onProgress }: HeroVisual3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mvRef = useRef<HTMLElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const loadTriggeredRef = useRef(false);
  const [preferStatic, setPreferStatic] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMedia = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const mobileMedia = window.matchMedia?.('(max-width: 768px)');
    const connection = (navigator as any)?.connection;

    const checkConditions = () => {
      const reducedMotion = reducedMedia?.matches ?? false;
      const slowNetwork = Boolean(connection && ['slow-2g', '2g'].includes(connection.effectiveType));
      const isMobileViewport = mobileMedia?.matches ?? false;
      setPreferStatic(reducedMotion || slowNetwork || isMobileViewport);
    };

    checkConditions();

    reducedMedia?.addEventListener?.('change', checkConditions);
    mobileMedia?.addEventListener?.('change', checkConditions);
    connection?.addEventListener?.('change', checkConditions);

    return () => {
      reducedMedia?.removeEventListener?.('change', checkConditions);
      mobileMedia?.removeEventListener?.('change', checkConditions);
      connection?.removeEventListener?.('change', checkConditions);
    };
  }, []);

  const effectiveStatic = preferStatic;

  useEffect(() => {
    if (effectiveStatic) {
      onProgress?.(100);
      onReady?.();
      return;
    }

    if (typeof window === 'undefined') return;
    const host = hostRef.current;
    if (!host) {
      setShouldRender(true);
      return;
    }
    if (loadTriggeredRef.current) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          loadTriggeredRef.current = true;
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: [0, 0.25] }
    );

    observer.observe(host);

    return () => observer.disconnect();
  }, [effectiveStatic]);

  useEffect(() => {
    if (shouldRender) {
      onProgress?.(5);
    }
  }, [shouldRender, onProgress]);

  useEffect(() => {
    const el = mvRef.current;
    if (!el || effectiveStatic) return;

    onProgress?.(5);

    const handleProgress = (event: any) => {
      const total = Math.max(0, Math.min(1, event?.detail?.totalProgress ?? 0));
      onProgress?.(Math.round(total * 100));
    };

    const handleLoad = () => {
      onProgress?.(100);
      setTimeout(() => (mvRef.current as any)?.dismissPoster?.(), 250);
      onReady?.();
    };

    const handleError = () => {
      onProgress?.(100);
      onReady?.();
    };

    el.addEventListener('progress', handleProgress as EventListener);
    el.addEventListener('load', handleLoad as EventListener);
    el.addEventListener('error', handleError as EventListener);
    return () => {
      el.removeEventListener('progress', handleProgress as EventListener);
      el.removeEventListener('load', handleLoad as EventListener);
      el.removeEventListener('error', handleError as EventListener);
    };
  }, [onProgress, onReady, effectiveStatic]);

  const containerStyle = useMemo(() => ({ borderRadius: 16 }), []);
  const modelStyle = useMemo(
    () => ({
      width: '90%',
      height: '90%',
      borderRadius: 20,
      background:
        'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.39) 100%)',
    }),
    []
  );

  const placeholder = (
    <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-black/10">
      <span className="animate-pulse text-xs text-black/50">Loading 3D…</span>
    </div>
  );

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden" style={containerStyle}>
      <div className="relative z-[50] flex h-full w-full items-center justify-center">
        {effectiveStatic ? (
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 px-5 py-8 text-center sm:gap-6 sm:px-6 sm:py-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-[-14%] rounded-[48px] bg-gradient-to-br from-emerald-400/10 via-transparent to-cyan-400/10 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-[40px] bg-white/6 shadow-[0_0_120px_0_rgba(59,230,150,0.35)]" />
              <span
                className="absolute left-[22%] top-[26%] h-2.5 w-2.5 rounded-full bg-white/80 blur-[1.5px] animate-pulse"
                style={{ animationDuration: '6s', animationDelay: '1s' }}
              />
              <span
                className="absolute right-[18%] bottom-[28%] h-2 w-2 rounded-full bg-white/70 blur-[1px] animate-pulse"
                style={{ animationDuration: '7.5s', animationDelay: '2.6s' }}
              />
              <span
                className="absolute left-1/2 top-[18%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/75 blur-[1px] animate-pulse"
                style={{ animationDuration: '8s', animationDelay: '3.8s' }}
              />
            </div>
            <img
              src="/assets/logo.png"
              alt="Logo SIHAT Health"
              className="relative z-10 h-auto w-full max-w-[220px] object-contain drop-shadow-[0_0_35px_rgba(34,197,94,0.55)] sm:max-w-[320px]"
              loading="lazy"
            />
            <span className="relative z-10 text-xs font-medium text-white/85 sm:text-sm">
              Eksplorasi model interaktif tersedia di layar yang lebih besar.
            </span>
          </div>
        ) : shouldRender ? (
          <Suspense fallback={placeholder}>
            <ModelViewer
              ref={mvRef as any}
              src="/assets/3d/fresh.glb"
              alt="Model"
              loading="lazy"
              environment-image="neutral"
              camera-controls
              auto-rotate
              rotation-per-second="10deg"
              style={modelStyle}
            />
          </Suspense>
        ) : (
          placeholder
        )}
      </div>
    </div>
  );
});
