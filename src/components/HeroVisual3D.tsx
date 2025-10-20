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
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMedia = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const connection = (navigator as any)?.connection;

    const checkConditions = () => {
      const reducedMotion = reducedMedia?.matches ?? false;
      const slowNetwork = Boolean(connection && ['slow-2g', '2g'].includes(connection.effectiveType));
      setPreferStatic(reducedMotion || slowNetwork);
    };

    checkConditions();

    reducedMedia?.addEventListener?.('change', checkConditions);
    connection?.addEventListener?.('change', checkConditions);

    return () => {
      reducedMedia?.removeEventListener?.('change', checkConditions);
      connection?.removeEventListener?.('change', checkConditions);
    };
  }, []);

  const effectiveStatic = preferStatic && !forceRender;

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
          <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6 text-center">
            <img
              src="/assets/3d/stethoscope.png"
              alt="Visual kesehatan"
              className="h-auto w-full max-w-[360px] object-contain drop-shadow-xl"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => {
                loadTriggeredRef.current = true;
                setForceRender(true);
                setShouldRender(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-5 py-3 text-sm font-semibold text-brand-green shadow-md transition hover:bg-white"
            >
              Lihat model 3D
            </button>
          </div>
        ) : shouldRender ? (
          <Suspense fallback={placeholder}>
            <ModelViewer
              ref={mvRef as any}
              src="/assets/3d/fresh.glb"
              poster="/assets/3d/stethoscope.png"
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
