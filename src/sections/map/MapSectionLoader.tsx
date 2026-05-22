// src/sections/map/MapSectionLoader.tsx
import { useState, useEffect, useRef, lazy, Suspense } from 'react';

const MapSection = lazy(() =>
  import('./MapSection').then((m) => ({ default: m.MapSection }))
);

/**
 * Wrapper for MapSection that defers loading until the user scrolls near it.
 * Renders a lightweight placeholder with a "load now" button as fallback.
 */
export function MapSectionLoader() {
  const [shouldRenderMap, setShouldRenderMap] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!triggerRef.current || shouldRenderMap) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRenderMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );
    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [shouldRenderMap]);

  const loadManually = () => setShouldRenderMap(true);

  return (
    <div ref={triggerRef} id="peta" className="relative">
      {shouldRenderMap ? (
        <Suspense fallback={<div className="min-h-[420px] rounded-3xl bg-surface-100/60" />}>
          <MapSection sectionId={null} />
        </Suspense>
      ) : (
        <MapPlaceholder onLoadClick={loadManually} />
      )}
    </div>
  );
}

function MapPlaceholder({ onLoadClick }: { onLoadClick: () => void }) {
  return (
    <section className="relative pt-2 pb-10 sm:pt-16 sm:pb-12 lg:pt-24 lg:pb-20 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #f1f0ea 0%, #fbfaf5 100%)' }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-brand-mint rounded-full mb-4">
            <span className="text-brand-green text-[14px] font-semibold">Peta Kesehatan</span>
          </div>
          <h2
            className="text-ink-900 tracking-tight mb-4"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}
          >
            Peta Interaktif Kesehatan
          </h2>
          <p className="text-ink-700 max-w-3xl mx-auto text-[18px]">
            Visualisasi akan dimuat ketika Anda menjelajah area ini untuk menghemat data.
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadClick}
          className="
            group w-full min-h-[420px]
            rounded-3xl border border-white/30 bg-white/10
            flex flex-col items-center justify-center gap-3 px-6
            text-brand-green transition-all duration-300
            hover:bg-white/20 hover:text-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/40
          "
        >
          <span className="text-lg font-semibold tracking-wide">Muat peta kesehatan</span>
          <span className="text-sm text-ink-600">
            Klik atau lanjut scroll — peta akan dimuat otomatis dan mungkin membutuhkan beberapa detik.
          </span>
        </button>
      </div>
    </section>
  );
}
