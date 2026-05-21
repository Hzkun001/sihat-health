import { memo, useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";

interface HeroVisual3DProps {
  onReady?: () => void;
  onProgress?: (p: number) => void;
}

export default memo(function HeroVisual3D({ onReady, onProgress }: HeroVisual3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [animData, setAnimData] = useState<any>(null);
  const [shouldRender, setShouldRender] = useState(false);

  // ===== TILT PARAMS =====
  const MAX_TILT = 12;
  const DEAD_ZONE = 0.16;
  const LERP = 0.12;
  const MAX_SCALE = 1.12;

  const target = useRef({ rx: 0, ry: 0, s: 1 });
  const current = useRef({ rx: 0, ry: 0, s: 1 });
  const rafId = useRef<number | null>(null);

  // Lazy render
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldRender(true);
        io.disconnect();
      }
    }, { rootMargin: "200px", threshold: [0, 0.25] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Fetch & bersihkan background layer dari Lottie JSON
  useEffect(() => {
    if (!shouldRender || animData) return;
    onProgress?.(5);

    fetch("/assets/3d/environment.json")
      .then(r => r.json())
      .then((data) => {
        try {
          // hapus layer background dengan nama umum (tanpa merusak layer lain)
          const badNames = new Set(["BG", "Bg", "bg", "Background", "background", "Rect", "Rectangle", "Backdrop"]);
          const cleaned = {
            ...data,
            layers: Array.isArray(data.layers)
              ? data.layers.filter((ly: any) => typeof ly?.nm === "string" ? !badNames.has(ly.nm) : true)
              : data.layers
          };
          setAnimData(cleaned);
        } catch {
          setAnimData(data);
        } finally {
          onProgress?.(100);
          onReady?.();
        }
      })
      .catch(() => { onProgress?.(100); onReady?.(); });
  }, [shouldRender, animData, onProgress, onReady]);

  // RAF tilt
  useEffect(() => {
    const tick = () => {
      const el = cardRef.current;
      if (el) {
        current.current.rx += (target.current.rx - current.current.rx) * LERP;
        current.current.ry += (target.current.ry - current.current.ry) * LERP;
        current.current.s  += (target.current.s  - current.current.s)  * LERP;

        el.style.transform =
          `perspective(900px) rotateX(${current.current.rx.toFixed(3)}deg) ` +
          `rotateY(${current.current.ry.toFixed(3)}deg) scale(${current.current.s.toFixed(3)})`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, []);

  // Hitung tilt dari posisi pointer relatif ke elemen yang diputar (cardRef)
  const handlePointerMove = (e: React.PointerEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();

    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;

    let dx = (nx - 0.5) * 2;
    let dy = (ny - 0.5) * 2;

    const dist = Math.hypot(dx, dy);
    if (dist < DEAD_ZONE) {
      const k = dist / DEAD_ZONE;
      dx *= k; dy *= k;
    }
    dx = Math.max(-1, Math.min(1, dx));
    dy = Math.max(-1, Math.min(1, dy));

    const ry = dx * MAX_TILT;
    const rx = -dy * MAX_TILT;
    const s  = 1 + (1 - Math.min(dist, 1)) * (MAX_SCALE - 1);

    target.current = { rx, ry, s };
  };

  const handlePointerLeave = () => { target.current = { rx: 0, ry: 0, s: 1 }; };

  return (
    <div
      ref={hostRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div className="flex h-full w-full items-center justify-center">
        {!shouldRender ? (
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-black/10">
            <span className="animate-pulse text-xs text-black/50">Loading…</span>
          </div>
        ) : (
          <div
            ref={cardRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="
              will-change-transform relative
              aspect-[16/9] w-full max-w-[1400px]
              flex items-center justify-center
              bg-transparent shadow-none rounded-none
            "
          >
            {/* Lottie render transparan, tanpa panel */}
            {animData && (
              <Lottie
                animationData={animData}
                loop
                autoplay
                className="w-[90%] max-w-[1000px] h-auto"
                rendererSettings={{
                  preserveAspectRatio: "xMidYMid meet",
                  progressiveLoad: true,
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});
