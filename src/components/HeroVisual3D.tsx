// src/components/HeroVisual3D.tsx
import { useEffect, useMemo, useRef, useState } from 'react';

const SCENE_URL =
  import.meta.env.VITE_SPLINE_SCENE_URL ||
  'https://prod.spline.design/juR-bsaLXa8fNZCF/scene.splinecode';

export function HeroVisual3D() {
  const url = useMemo(() => String(SCENE_URL ?? ''), []);
  const ref = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // pastikan custom element sudah terdaftar
    if (customElements.get('spline-viewer')) setReady(true);
    else {
      // kalau masih belum, tunggu sebentar (shouldn't happen kalau import di main.tsx)
      const t = setInterval(() => {
        if (customElements.get('spline-viewer')) {
          clearInterval(t);
          setReady(true);
        }
      }, 50);
      return () => clearInterval(t);
    }
  }, []);

  useEffect(() => {
    // tulis atribut url secara eksplisit setelah elemen ada
    if (ready && ref.current && url) {
      ref.current.setAttribute('url', url);
    }
  }, [ready, url]);

  if (!url) {
    return (
      <div className="relative w-full h-[600px] rounded-2xl grid place-items-center border border-dashed border-zinc-300/60 bg-zinc-50/40">
        <p className="text-sm text-zinc-600">VITE_SPLINE_SCENE_URL belum disetel.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-2xl overflow-hidden">
      {!ready && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200" />
      )}

      {/* @ts-expect-error custom element */}
      <spline-viewer
        ref={ref}
        // pakai self-closing & gunakan 'class' agar attribute benar-benar tertulis
        class="absolute inset-0 w-full h-full block"
        loading="lazy"
        ar
      />
    </div>
  );
}
