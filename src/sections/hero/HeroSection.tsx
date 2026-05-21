// src/components/HeroSection.tsx
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { StaticParticles } from '@/components/effects/StaticParticles';
import Waves from '@/components/effects/Waves';

const HeroVisual3D = lazy(() => import('./HeroVisual3D'));

function HeroVisual3DFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm">
        <span className="animate-pulse text-xs text-white/50">Memuat visual...</span>
      </div>
    </div>
  );
}

// Rotating words for the headline
const rotatingWords = ['Sehat', 'Hijau', 'Inklusif', 'Berkelanjutan'];
// Widest word used as invisible spacer to prevent layout shift
const widestWord = 'Berkelanjutan';

// Marquee data items
const marqueeItems = [
  '47 Puskesmas',
  '200K+ Warga',
  '15 Indikator SDG',
  '5 Rumah Sakit',
  '32 Apotek',
  '12 Klinik',
  'Real-time Data',
  'AI Chatbot',
];

interface HeroSectionProps {
  onModelReady?: () => void;
  onModelProgress?: (progress: number) => void;
}

export function HeroSection({ onModelReady, onModelProgress }: HeroSectionProps = {}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [showWaves, setShowWaves] = useState(false);
  const [allowWaves, setAllowWaves] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Rotate words every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowWaves(entry.isIntersecting && entry.intersectionRatio >= 0.2),
      { threshold: [0, 0.2, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const prefersReduced = useMemo(
    () => (typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      : false),
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia?.('(min-width: 768px)');
    if (!mql) return;
    const update = (event?: MediaQueryListEvent) => setAllowWaves(event?.matches ?? mql.matches);
    update();
    mql.addEventListener?.('change', update);
    return () => mql.removeEventListener?.('change', update);
  }, []);

  const wavesProps = useMemo(
    () => ({
      lineColor: 'rgba(255,255,255,0.08)',
      backgroundColor: 'rgba(255,255,255,0.03)',
      waveSpeedX: 0.008,
      waveSpeedY: 0.004,
      waveAmpX: 12,
      waveAmpY: 16,
      xGap: 12,
      yGap: 24,
      friction: 0.75,
      tension: 0.015,
      maxCursorMove: 35,
    }),
    []
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100svh] flex flex-col overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 20% 80%, rgba(5, 150, 105, 0.12), transparent),
          radial-gradient(ellipse 60% 50% at 80% 20%, rgba(59, 130, 246, 0.06), transparent),
          radial-gradient(ellipse 90% 80% at 50% 50%, rgba(5, 150, 105, 0.08), transparent),
          linear-gradient(180deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)
        `,
      }}
    >
      {/* Grain noise overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Layer 1: Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <StaticParticles />
      </div>

      {/* Layer 2: Waves */}
      {(showWaves && allowWaves && !prefersReduced) && (
        <div className="absolute inset-0 z-[2] pointer-events-none">
          <Waves {...wavesProps} />
        </div>
      )}

      {/* Meta strip */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36"
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-white/50" style={{ fontSize: '12px', letterSpacing: '0.05em', fontWeight: 500 }}>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="uppercase">Live</span>
          </span>
          <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span className="hidden sm:inline uppercase">Banjarbaru, Kalsel</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span className="uppercase">SDG 11</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span className="uppercase">Est 2024</span>
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-8 sm:py-12 lg:py-0">
        
        {/* Text block — 7 columns */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
          className="lg:col-span-7 order-2 lg:order-1"
        >
          {/* Display headline */}
          <div
            className="text-white mb-5 sm:mb-6 lg:mb-8"
            style={{
              fontSize: 'clamp(40px, 7vw, 88px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
            }}
          >
            {/* Line 1 — static */}
            <div>Banjarbaru</div>

            {/* Line 2 — "Kota" static + animated word on same visual line */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.22em' }}>
              <span>Kota</span>

              {/*
                Rotating word container.
                - Width locked to widestWord via invisible spacer → no layout shift
                - overflow:hidden clips the slide-in/out animation
                - paddingBottom gives room for descenders (j in "Hijau")
                - The animated word is NOT position:absolute to avoid
                  gradient-clip rendering bugs in WebKit
              */}
              <span
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  overflow: 'hidden',
                  /* height = 1 line + descender room */
                  lineHeight: 1.15,
                  paddingBottom: '0.1em',
                  /* pull down so bottom-aligns with "Kota" */
                  marginBottom: '-0.05em',
                }}
              >
                {/* Invisible width spacer — widest word, never shown */}
                <span
                  aria-hidden
                  style={{ display: 'block', visibility: 'hidden', whiteSpace: 'nowrap', lineHeight: 'inherit' }}
                >
                  {widestWord}
                </span>

                {/* Animated words — slide over the spacer */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={currentWordIndex}
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-110%' }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      /* cover the spacer exactly */
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      whiteSpace: 'nowrap',
                      lineHeight: 'inherit',
                      /* gradient text — on its own layer, not clipped */
                      background: 'linear-gradient(135deg, #34d399 0%, #22d3ee 55%, #818cf8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {rotatingWords[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mb-8 sm:mb-10 max-w-[540px]"
            style={{
              fontSize: 'clamp(16px, 1.5vw, 20px)',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
              letterSpacing: '-0.01em',
            }}
          >
            Platform geospasial berbasis SDG 11 untuk perencanaan kota yang inklusif, aman, dan berkelanjutan bagi seluruh masyarakat Banjarbaru.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            {/* Primary CTA — magnetic style */}
            <motion.a
              href="#laporan"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-4 rounded-full transition-all duration-300"
              style={{
                fontSize: '15px',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                color: 'var(--hero-bg-start, #0f172a)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              Laporkan Masalah
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>

            {/* Secondary CTA */}
            <motion.a
              href="#peta"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-4 rounded-full transition-all duration-300"
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }}
            >
              Jelajahi Peta
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* 3D Visual block — 5 columns */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
          className="lg:col-span-5 order-1 lg:order-2 relative"
        >
          <div
            className="relative w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[500px] rounded-3xl overflow-hidden flex items-center justify-center"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(5,150,105,0.08), transparent 70%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 80px rgba(5,150,105,0.1), inset 0 0 40px rgba(255,255,255,0.02)',
            }}
          >
            {/* Glow ring */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(52,211,153,0.06), transparent 60%)',
              }}
            />
            <Suspense fallback={<HeroVisual3DFallback />}>
              <HeroVisual3D onReady={onModelReady} onProgress={onModelProgress} />
            </Suspense>
          </div>
        </motion.div>
      </div>

      {/* Marquee data ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="relative z-20 w-full border-t border-white/[0.06] overflow-hidden"
        style={{ backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)' }}
      >
        <div className="flex animate-marquee whitespace-nowrap py-3 sm:py-4">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="mx-4 sm:mx-6 lg:mx-8 flex items-center gap-2"
              style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.03em' }}
            >
              <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
              {item.toUpperCase()}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-8 h-12 rounded-full border border-white/20 flex items-start justify-center pt-2"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-white/60"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
