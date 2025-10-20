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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (shouldRender) {
      onProgress?.(5);
    }
  }, [shouldRender, onProgress]);

  useEffect(() => {
    const el = mvRef.current;
    if (!el) return;

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
  }, [onProgress, onReady]);

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
        {shouldRender ? (
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
